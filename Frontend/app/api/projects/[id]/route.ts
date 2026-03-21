import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { PROJECT_TYPE_IDS } from "@/lib/project-types";
import { snapshotProjectVersionBeforeCodeUpdate } from "@/lib/project-version-snapshot";

const MAX_GENERATED_CODE_JSON_CHARS = 5_000_000;

const PROJECT_TYPES = PROJECT_TYPE_IDS;
const PROJECT_STATUSES = ["draft", "generating", "completed", "error"] as const;

const PatchProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  type: z.enum(PROJECT_TYPES).optional(),
  prompt: z.string().max(10000).optional(),
  generated_code: z.any().optional(),
  tech_stack: z.array(z.string().max(100)).max(20).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: "Nenhum campo válido para atualizar" });

export async function GET(
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
    const { data, error } = await db
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_clerk_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    logger.error("GET /projects/[id] error", { error: err });
    return NextResponse.json({ error: "Erro ao buscar projeto" }, { status: 500 });
  }
}

export async function DELETE(
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
    const { error } = await db
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_clerk_id", userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("DELETE /projects/[id] error", { error: err });
    return NextResponse.json({ error: "Erro ao excluir projeto" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const parsed = PatchProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const update = parsed.data;
    const db = getSupabaseAdmin();

    if (update.generated_code !== undefined) {
      const json = JSON.stringify(update.generated_code);
      if (json.length > MAX_GENERATED_CODE_JSON_CHARS) {
        return NextResponse.json(
          { error: "Conteúdo gerado excede o tamanho máximo permitido." },
          { status: 413 }
        );
      }

      const { data: existing, error: selErr } = await db
        .from("projects")
        .select("generated_code, prompt")
        .eq("id", id)
        .eq("user_clerk_id", userId)
        .single();

      if (selErr) throw selErr;

      if (existing && (existing.generated_code != null || (existing.prompt && existing.prompt.length > 0))) {
        try {
          await snapshotProjectVersionBeforeCodeUpdate(
            db,
            id,
            existing.generated_code,
            existing.prompt
          );
        } catch (snapErr) {
          logger.warn("project_versions snapshot failed (table missing or error)", { snapErr });
        }
      }
    }

    const { data, error } = await db
      .from("projects")
      .update(update)
      .eq("id", id)
      .eq("user_clerk_id", userId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    logger.error("PATCH /projects/[id] error", { error: err });
    return NextResponse.json({ error: "Erro ao atualizar projeto" }, { status: 500 });
  }
}
