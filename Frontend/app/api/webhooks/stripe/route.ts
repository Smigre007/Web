import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { sendPaymentFailedEmail, sendUpgradeConfirmationEmail } from "@/lib/email";

// Maps base plan slug to monthly generation limits
const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 20,
  pro: 100,
  enterprise: 9999,
};

// Extract base plan from planId like "starter_monthly" → "starter"
function basePlan(planId: string): string {
  const slug = planId.split("_")[0]?.toLowerCase() ?? "free";
  return slug in PLAN_LIMITS ? slug : "free";
}

async function getUserByClerkId(userId: string): Promise<{ email: string; first_name: string } | null> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("users")
      .select("email, first_name")
      .eq("clerk_id", userId)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

async function getUserByCustomerId(customerId: string): Promise<{ email: string; first_name: string } | null> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("users")
      .select("email, first_name")
      .eq("stripe_customer_id", customerId)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

async function upgradePlan(userId: string, plan: string, customerId: string, subscriptionId: string) {
  const db = getSupabaseAdmin();
  await db
    .from("users")
    .update({
      plan,
      generations_limit: PLAN_LIMITS[plan] ?? 3,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    })
    .eq("clerk_id", userId);
}

async function downgradePlan(userId: string) {
  const db = getSupabaseAdmin();
  await db
    .from("users")
    .update({
      plan: "free",
      generations_limit: PLAN_LIMITS.free,
      stripe_subscription_id: null,
    })
    .eq("clerk_id", userId);
}

/**
 * Verify that the userId from Stripe metadata actually exists in our DB.
 * Returns the verified userId or null if not found.
 * Prevents forged metadata from affecting arbitrary accounts.
 */
async function verifyUserExists(userId: string): Promise<boolean> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("users")
      .select("clerk_id")
      .eq("clerk_id", userId)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

async function downgradeByCustomerId(customerId: string) {
  const db = getSupabaseAdmin();
  await db
    .from("users")
    .update({
      plan: "free",
      generations_limit: PLAN_LIMITS.free,
      stripe_subscription_id: null,
    })
    .eq("stripe_customer_id", customerId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    const allowUnverified =
      process.env.ALLOW_UNVERIFIED_STRIPE_WEBHOOK === "true" && process.env.NODE_ENV !== "production";
    if (!allowUnverified) {
      logger.warn("Stripe webhook: secrets not configured — rejecting");
      return NextResponse.json({ error: "Webhook não configurado" }, { status: 503 });
    }
    logger.warn("Stripe webhook: unverified accept (dev + ALLOW_UNVERIFIED_STRIPE_WEBHOOK only)");
    return NextResponse.json({ received: true });
  }

  if (!sig) {
    logger.error("Stripe webhook missing stripe-signature header");
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error("Stripe webhook signature error", { error: err });
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── Checkout completed → activate subscription ──────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId ?? "starter_monthly";

        if (!userId) {
          logger.error("checkout.session.completed: missing userId in metadata");
          break;
        }

        // Verify userId from metadata exists in our DB to prevent forged metadata
        if (!(await verifyUserExists(userId))) {
          logger.error("checkout.session.completed: userId not found in DB", { userId });
          break;
        }

        const plan = basePlan(planId);
        const customerId = typeof session.customer === "string" ? session.customer : "";
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : "";

        await upgradePlan(userId, plan, customerId, subscriptionId);
        logger.info("User upgraded plan", { userId, plan });

        // Send upgrade confirmation email (fire-and-forget)
        getUserByClerkId(userId)
          .then((user) => {
            if (user?.email) sendUpgradeConfirmationEmail(user.email, user.first_name, plan);
          })
          .catch((err) => logger.error("Failed to send upgrade email", { error: err }));
        break;
      }

      // ── Subscription updated (e.g., plan change, renewal) ────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;

        if (!userId) break;

        // Only process active or trialing subscriptions
        if (sub.status !== "active" && sub.status !== "trialing") {
          logger.info("Subscription event ignored — non-active status", { status: sub.status, userId, event: event.type });
          break;
        }

        // Verify userId exists in DB
        if (!(await verifyUserExists(userId))) {
          logger.error("subscription event: userId not found in DB", { userId, event: event.type });
          break;
        }

        // Determine plan from the price ID of the first item
        const priceId = sub.items.data[0]?.price?.id;
        let plan = "starter"; // default if we can't map

        // Map known price env vars back to plan names
        const priceMap: Record<string, string> = {
          [process.env.STRIPE_PRICE_STARTER_MONTHLY ?? ""]: "starter",
          [process.env.STRIPE_PRICE_STARTER_YEARLY ?? ""]: "starter",
          [process.env.STRIPE_PRICE_PRO_MONTHLY ?? ""]: "pro",
          [process.env.STRIPE_PRICE_PRO_YEARLY ?? ""]: "pro",
          [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? ""]: "enterprise",
          [process.env.STRIPE_PRICE_ENTERPRISE_YEARLY ?? ""]: "enterprise",
        };
        if (priceId && priceMap[priceId]) plan = priceMap[priceId];

        const customerId = typeof sub.customer === "string" ? sub.customer : "";
        await upgradePlan(userId, plan, customerId, sub.id);
        logger.info("Subscription event", { status: sub.status, userId, plan });
        break;
      }

      // ── Subscription cancelled → downgrade to free ───────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;

        if (userId) {
          await downgradePlan(userId);
          logger.info("Subscription deleted, user downgraded", { userId });
        } else {
          // Fall back to customer ID lookup
          const customerId = typeof sub.customer === "string" ? sub.customer : null;
          if (customerId) await downgradeByCustomerId(customerId);
        }
        break;
      }

      // ── Payment failed → log and flag user ───────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
        if (customerId) {
          logger.warn("Payment failed", { customerId });
          // Flag user so they can see a warning in billing UI
          const db = getSupabaseAdmin();
          await db
            .from("users")
            .update({ payment_failed: true })
            .eq("stripe_customer_id", customerId);

          // Send payment failed email (fire-and-forget)
          getUserByCustomerId(customerId)
            .then((user) => {
              if (user?.email) sendPaymentFailedEmail(user.email, user.first_name);
            })
            .catch((err) => logger.error("Failed to send payment failed email", { error: err }));
        }
        break;
      }

      // ── Invoice paid → reset monthly generations counter on renewal ───
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
        if (customerId) {
          const db = getSupabaseAdmin();
          // Clear any payment failure flag
          await db
            .from("users")
            .update({ payment_failed: false })
            .eq("stripe_customer_id", customerId);

          // Only reset generation counter on subscription renewals
          if (invoice.billing_reason === "subscription_cycle") {
            await db
              .from("users")
              .update({ generations_used: 0 })
              .eq("stripe_customer_id", customerId);
            logger.info("Monthly generation reset", { customerId });
          }
        }
        break;
      }

      // ── Refund issued → log (no plan change required) ────────────────
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const customerId = typeof charge.customer === "string" ? charge.customer : null;
        logger.info("Charge refunded", { customerId, amountRefunded: charge.amount_refunded });
        // Refunds don't automatically cancel the subscription — Stripe handles that separately
        break;
      }

      // ── Dispute/chargeback created → flag user ────────────────────────
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = typeof dispute.charge === "string" ? dispute.charge : null;
        logger.warn("Dispute created", { chargeId, reason: dispute.reason });
        // In production, notify admin and suspend account if needed
        break;
      }

      // ── Customer deleted in Stripe → downgrade user ───────────────────
      case "customer.deleted": {
        const customer = event.data.object as Stripe.Customer;
        const db = getSupabaseAdmin();
        await db
          .from("users")
          .update({
            plan: "free",
            generations_limit: PLAN_LIMITS.free,
            stripe_subscription_id: null,
            stripe_customer_id: null,
          })
          .eq("stripe_customer_id", customer.id);
        logger.info("Customer deleted, downgraded to free", { customerId: customer.id });
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }
  } catch (err) {
    logger.error("Stripe webhook handler error", { error: err });
    // Return 500 so Stripe retries the event — the error was on our side
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
