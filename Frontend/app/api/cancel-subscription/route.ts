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
        { error: "Nenhuma assinatura ativa encontrada" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Cancel at period end — user keeps access until the billing period ends
    await stripe.subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Mark in DB that cancellation is pending
    await db
      .from("users")
      .update({ subscription_cancel_at_period_end: true })
      .eq("clerk_id", userId);

    return NextResponse.json({
      success: true,
      message: "Assinatura cancelada. Você mantém o acesso até o fim do período atual.",
    });
  } catch (err) {
    logger.error("Cancel subscription error", { error: err });
    return NextResponse.json(
      { error: "Erro ao cancelar assinatura" },
      { status: 500 }
    );
  }
}
