import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { logger } from "@/lib/logger";

const CheckoutBodySchema = z.object({
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

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const parsed = CheckoutBodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Plano inválido" }, { status: 400 });
    }
    const { planId } = parsed.data;
    const priceId = PRICE_IDS[planId];
    if (!priceId) {
      return NextResponse.json({ error: "Configuração de preço ausente para este plano" }, { status: 503 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: "Pagamentos não configurados" },
        { status: 503 }
      );
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

    const stripe = new Stripe(stripeKey);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: "Configuração de URL ausente" }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings/billing?success=1`,
      cancel_url: `${appUrl}/settings/billing?cancelled=1`,
      metadata: { userId, planId },
      subscription_data: {
        metadata: { userId, planId },
      },
      locale: "pt-BR",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error("Checkout error", { error: err });
    return NextResponse.json(
      { error: "Erro ao criar sessão de pagamento" },
      { status: 500 }
    );
  }
}
