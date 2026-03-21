import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Pagamentos não configurados" },
        { status: 503 }
      );
    }

    const db = getSupabaseAdmin();
    const { data: user } = await db
      .from("users")
      .select("stripe_subscription_id, plan")
      .eq("clerk_id", userId)
      .single();

    if (!user?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "Nenhuma assinatura encontrada" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Remove the cancellation schedule
    await stripe.subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    // Clear the flag in DB
    await db
      .from("users")
      .update({ subscription_cancel_at_period_end: false })
      .eq("clerk_id", userId);

    return NextResponse.json({
      success: true,
      message: "Assinatura reativada com sucesso!",
    });
  } catch (err) {
    logger.error("Reactivate subscription error", { error: err });
    return NextResponse.json(
      { error: "Erro ao reativar assinatura" },
      { status: 500 }
    );
  }
}
