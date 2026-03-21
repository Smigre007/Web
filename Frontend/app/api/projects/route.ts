import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  isMissingTableOrSchemaError,
  SUPABASE_SETUP_REQUIRED_PT,
} from "@/lib/supabase-errors";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { PROJECT_TYPE_IDS, DEFAULT_PROJECT_TYPE } from "@/lib/project-types";

const PROJECT_TYPES = PROJECT_TYPE_IDS;
const PROJECT_STATUSES = ["draft", "generating", "completed", "error"] as const;

const CreateProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(PROJECT_TYPES).optional().default(DEFAULT_PROJECT_TYPE),
  prompt: z.string().max(10000).optional(),
  generated_code: z.record(z.string(), z.unknown()).optional(),
  code_data: z.record(z.string(), z.unknown()).optional(),
  tech_stack: z.array(z.string().max(100)).max(20).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

const LimitQuerySchema = z.coerce.number().int().min(1).max(2000).optional();

function isMissingUserClerkIdColumn(message: string | undefined): boolean {
  if (!message) return false;
  return /user_clerk_id|column .* does not exist/i.test(message);
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limitParsed = LimitQuerySchema.safeParse(searchParams.get("limit") ?? undefined);
    const limit = limitParsed.success ? limitParsed.data : undefined;

    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from("projects")
      .select("*")
      .eq("user_clerk_id", userId)
      .order("created_at", { ascending: false });

    if (limit != null) {
      query = query.limit(limit);
    }

    let { data, error } = await query;

    // Schema antigo (lib/supabase/schema.sql): `projects.user_id` → `users.id`, sem `user_clerk_id`
    if (error && isMissingUserClerkIdColumn(error.message)) {
      const { data: userRow, error: userLookupErr } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .maybeSingle();

      if (userLookupErr && isMissingTableOrSchemaError(userLookupErr.message)) {
        return NextResponse.json(
          { error: SUPABASE_SETUP_REQUIRED_PT, code: "SUPABASE_TABLE_MISSING" },
          { status: 503 }
        );
      }

      if (userRow?.id) {
        let q2 = supabaseAdmin
          .from("projects")
          .select("*")
          .eq("user_id", userRow.id)
          .order("created_at", { ascending: false });
        if (limit != null) {
          q2 = q2.limit(limit);
        }
        ({ data, error } = await q2);
      } else {
        data = [];
        error = null;
      }
    }

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    const msg =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);
    if (isMissingTableOrSchemaError(msg)) {
      logger.error("Error fetching projects: schema/tabela em falta", { message: msg });
      return NextResponse.json(
        { error: SUPABASE_SETUP_REQUIRED_PT, code: "SUPABASE_TABLE_MISSING" },
        { status: 503 }
      );
    }
    logger.error("Error fetching projects", { error });
    return NextResponse.json({ error: "Erro ao buscar projetos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const { name, description, type, prompt, generated_code, code_data, tech_stack, status } = parsed.data;

    const db = getSupabaseAdmin();
    const statusFinal =
      status ?? (generated_code || code_data ? "completed" : "draft");
    const codePayload = generated_code ?? code_data;
    const tech = tech_stack ?? [];

    let { data, error } = await db
      .from("projects")
      .insert({
        user_clerk_id: userId,
        name,
        description,
        type,
        prompt,
        generated_code: codePayload,
        tech_stack: tech,
        status: statusFinal,
      })
      .select()
      .single();

    if (error && isMissingUserClerkIdColumn(error.message)) {
      const { data: userRow, error: userLookupErr } = await db
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .maybeSingle();
      if (userLookupErr && isMissingTableOrSchemaError(userLookupErr.message)) {
        return NextResponse.json(
          { error: SUPABASE_SETUP_REQUIRED_PT, code: "SUPABASE_TABLE_MISSING" },
          { status: 503 }
        );
      }
      if (!userRow?.id) throw new Error("Utilizador não encontrado na base.");
      ({ data, error } = await db
        .from("projects")
        .insert({
          user_id: userRow.id,
          name,
          description,
          type,
          prompt: prompt ?? "",
          generated_code: codePayload,
          tech_stack: tech,
          status: statusFinal,
        })
        .select()
        .single());
    }

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    const msg =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);
    if (isMissingTableOrSchemaError(msg)) {
      logger.error("Error creating project: schema/tabela em falta", { message: msg });
      return NextResponse.json(
        { error: SUPABASE_SETUP_REQUIRED_PT, code: "SUPABASE_TABLE_MISSING" },
        { status: 503 }
      );
    }
    logger.error("Error creating project", { error });
    return NextResponse.json({ error: "Erro ao criar projeto" }, { status: 500 });
  }
}
