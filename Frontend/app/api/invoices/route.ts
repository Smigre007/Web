import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ invoices: [] });
    }

    // Get the user's Stripe customer ID from Supabase
    const db = getSupabaseAdmin();
    const { data: user } = await db
      .from("users")
      .select("stripe_customer_id")
      .eq("clerk_id", userId)
      .single();

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] });
    }

    const stripe = new Stripe(stripeKey);
    const { data: invoices } = await stripe.invoices.list({
      customer: user.stripe_customer_id,
      limit: 12,
    });

    const simplified = invoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      amount: inv.amount_paid / 100,
      currency: inv.currency.toUpperCase(),
      status: inv.status,
      date: inv.created,
      pdf: inv.invoice_pdf,
      description: inv.lines.data[0]?.description ?? null,
    }));

    return NextResponse.json({ invoices: simplified });
  } catch (err) {
    logger.error("Invoices error", { error: err });
    return NextResponse.json({ invoices: [] });
  }
}
