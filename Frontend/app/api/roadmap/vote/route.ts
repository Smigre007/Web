import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { roadmapFeatureKeySchema } from "@/lib/roadmap-data";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Faça login para votar" }, { status: 401 });
    }

    const raw = await req.json();
    const parsedKey = roadmapFeatureKeySchema.safeParse(raw?.featureKey);
    if (!parsedKey.success) {
      return NextResponse.json({ error: "featureKey inválido" }, { status: 400 });
    }
    const featureKey = parsedKey.data;

    const db = getSupabaseAdmin();
    const { error } = await db.from("roadmap_votes").insert({
      feature_key: featureKey,
      user_clerk_id: userId,
    });

    if (error?.code === "23505") {
      // Unique violation — already voted
      return NextResponse.json({ error: "Você já votou nessa funcionalidade" }, { status: 409 });
    }
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Error saving vote", { error: err });
    return NextResponse.json({ error: "Erro ao registrar voto" }, { status: 500 });
  }
}
