import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const db = getSupabaseAdmin();

    // Fetch original project (must belong to the user)
    const { data: original, error: fetchError } = await db
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_clerk_id", userId)
      .single();

    if (fetchError || !original) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    // Insert copy with "(cópia)" suffix
    const { data: copy, error: insertError } = await db
      .from("projects")
      .insert({
        user_clerk_id: userId,
        name: `${original.name} (cópia)`,
        description: original.description,
        type: original.type,
        prompt: original.prompt,
        generated_code: original.generated_code,
        tech_stack: original.tech_stack,
        status: original.status,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(copy);
  } catch (err) {
    logger.error("Duplicate project error", { error: err });
    return NextResponse.json({ error: "Erro ao duplicar projeto" }, { status: 500 });
  }
}
