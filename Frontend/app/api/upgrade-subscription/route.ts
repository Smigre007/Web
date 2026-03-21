import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const UpgradeBodySchema = z.object({
  planId: z.enum(["starter_monthly", "starter_yearly", "pro_monthly", "pro_yearly", "enterprise_monthly", "enterprise_yearly"]),
});

const PRICE_IDS: Record<string, string> = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "",
  starter_yearly: process.env.STRIPE_PRICE_STARTER_YEARLY ?? "",
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? "",
  enterprise_yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY ?? "",
};

// Updates an existing Stripe subscription to a new price (mid-period upgrade/downgrade).
// Falls back to creating a new checkout session if the user has no active subscription.
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const parsed = UpgradeBodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Plano inválido" }, { status: 400 });
    }
    const { planId } = parsed.data;
    const newPriceId = PRICE_IDS[planId];
    if (!newPriceId) {
      return NextResponse.json({ error: "Configuração de preço ausente para este plano" }, { status: 503 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Pagamentos não configurados" }, { status: 503 });
    }

    // Fetch user's current subscription ID from Supabase
    const db = getSupabaseAdmin();
    const { data: user } = await db
      .from("users")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("clerk_id", userId)
      .single();

    const stripe = new Stripe(stripeKey);

    // If user has an active subscription, update it immediately
    if (user?.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);

      if (subscription.status === "active" || subscription.status === "trialing") {
        const subscriptionItemId = subscription.items.data[0]?.id;
        if (!subscriptionItemId) {
          return NextResponse.json({ error: "Item de assinatura não encontrado" }, { status: 400 });
        }

        // Update the subscription item to the new price, prorated immediately
        await stripe.subscriptions.update(user.stripe_subscription_id, {
          items: [{ id: subscriptionItemId, price: newPriceId }],
          proration_behavior: "create_prorations",
          cancel_at_period_end: false,
        });

        return NextResponse.json({ success: true, upgraded: true });
      }
    }

    // No active subscription — create a new checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: "Configuração de URL ausente" }, { status: 503 });
    }
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: newPriceId, quantity: 1 }],
      success_url: `${appUrl}/settings/billing?success=1`,
      cancel_url: `${appUrl}/settings/billing?cancelled=1`,
      metadata: { userId, planId },
      subscription_data: { metadata: { userId, planId } },
      locale: "pt-BR",
    };

    // Attach existing customer if available
    if (user?.stripe_customer_id) {
      sessionParams.customer = user.stripe_customer_id;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error("Upgrade subscription error", { error: err });
    return NextResponse.json({ error: "Erro ao atualizar assinatura" }, { status: 500 });
  }
}
