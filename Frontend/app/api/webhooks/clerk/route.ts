import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

async function verifyClerkWebhook(req: NextRequest): Promise<{
  type: string;
  data: Record<string, unknown>;
} | null> {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    logger.error("CLERK_WEBHOOK_SECRET not configured — rejecting webhook");
    return null;
  }

  try {
    const { Webhook } = await import("svix");
    const headersList = await headers();
    const svixId = headersList.get("svix-id");
    const svixTimestamp = headersList.get("svix-timestamp");
    const svixSignature = headersList.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) return null;

    const body = await req.text();
    const wh = new Webhook(WEBHOOK_SECRET);
    return wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const payload = await verifyClerkWebhook(req);

  if (!payload) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  const { type, data } = payload;
  const db = getSupabaseAdmin();

  try {
    switch (type) {
      case "user.created": {
        const emails = (data.email_addresses as Array<{ email_address: string; id: string }>) ?? [];
        const primaryEmail = emails.find(
          (e) => e.id === data.primary_email_address_id
        )?.email_address ?? emails[0]?.email_address ?? "";

        if (!primaryEmail) {
          logger.warn("user.created webhook received without email — skipping upsert", { id: data.id });
          break;
        }

        await db.from("users").upsert({
          clerk_id: data.id,
          email: primaryEmail,
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          avatar_url: data.image_url ?? "",
          plan: "free",
          generations_used: 0,
          generations_limit: 3,
        }, { onConflict: "clerk_id" });

        // Send welcome email (fire-and-forget)
        if (primaryEmail) {
          sendWelcomeEmail(primaryEmail, String(data.first_name ?? ""));
        }
        break;
      }

      case "user.updated": {
        const emails = (data.email_addresses as Array<{ email_address: string; id: string }>) ?? [];
        const primaryEmail = emails.find(
          (e) => e.id === data.primary_email_address_id
        )?.email_address ?? emails[0]?.email_address ?? "";

        await db.from("users").update({
          email: primaryEmail,
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          avatar_url: data.image_url ?? "",
        }).eq("clerk_id", data.id);
        break;
      }

      case "user.deleted": {
        await db.from("users").delete().eq("clerk_id", data.id);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("Clerk webhook error", { error: err });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
