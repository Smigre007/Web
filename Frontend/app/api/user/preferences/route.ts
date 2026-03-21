import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { mergePreferencesFromRow } from "@/lib/user-preferences-merge";
import { logger } from "@/lib/logger";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isMissingTableOrSchemaError,
  SUPABASE_SETUP_REQUIRED_PT,
} from "@/lib/supabase-errors";
import { PROJECT_TYPE_IDS } from "@/lib/project-types";

const PROJECT_TYPE_ENUM = PROJECT_TYPE_IDS as unknown as [string, ...string[]];

// ── Schema completo de preferências + perfil ──────────────────────────────────
const PrefsSchema = z.object({
  language: z.string().optional(),
  uiTheme: z.enum(["light", "dark", "monokai", "dracula"]).optional(),
  codeTheme: z.enum(["dark", "light", "monokai", "dracula"]).optional(),
  defaultProjectType: z.enum(PROJECT_TYPE_ENUM).optional(),
  emailNotifications: z.boolean().optional(),
  generationAlerts: z.boolean().optional(),
  marketing: z.boolean().optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  role: z.string().max(100).optional(),
  timezone: z.string().max(60).optional(),
  bio: z.string().max(500).optional(),
});

function isPreferencesColumnError(message: string | undefined): boolean {
  if (!message) return false;
  return /column.*preferences|preferences.*does not exist/i.test(message);
}

/**
 * Muitos ambientes não recebem o webhook Clerk; o utilizador existe no Clerk mas não em `public.users`.
 * Sem esta linha, GET devolve vazio e PATCH devolve 404 — "nada funciona".
 */
async function ensureUserRowForClerkId(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<{ ok: true } | { ok: false; message: string; code?: string }> {
  const { data: row, error: selErr } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkUserId)
    .maybeSingle();

  if (row?.id) return { ok: true };
  if (selErr && selErr.code !== "PGRST116") {
    if (isMissingTableOrSchemaError(selErr.message)) {
      logger.error("ensureUserRowForClerkId: tabela users em falta no Supabase", {
        message: selErr.message,
      });
      return {
        ok: false,
        message: SUPABASE_SETUP_REQUIRED_PT,
        code: "SUPABASE_TABLE_MISSING",
      };
    }
    logger.warn("ensureUserRowForClerkId: select failed", { message: selErr.message });
    return { ok: false, message: selErr.message };
  }

  try {
    const clerk = await clerkClient();
    const u = await clerk.users.getUser(clerkUserId);
    const primaryId = u.primaryEmailAddressId;
    const email =
      u.emailAddresses.find((e) => e.id === primaryId)?.emailAddress ??
      u.emailAddresses[0]?.emailAddress ??
      "";

    const basePayload = {
      clerk_id: clerkUserId,
      email: email || null,
      first_name: u.firstName ?? "",
      last_name: u.lastName ?? "",
      avatar_url: u.imageUrl ?? "",
      plan: "free" as const,
      generations_used: 0,
      generations_limit: 3,
    };

    let { error: upErr } = await supabase
      .from("users")
      .upsert(
        { ...basePayload, preferences: {} as Record<string, unknown> },
        { onConflict: "clerk_id" }
      );

    if (upErr && isPreferencesColumnError(upErr.message)) {
      ({ error: upErr } = await supabase
        .from("users")
        .upsert(basePayload, { onConflict: "clerk_id" }));
    }

    if (upErr) {
      if (isMissingTableOrSchemaError(upErr.message)) {
        logger.error("ensureUserRowForClerkId: tabela users em falta (upsert)", {
          message: upErr.message,
        });
        return {
          ok: false,
          message: SUPABASE_SETUP_REQUIRED_PT,
          code: "SUPABASE_TABLE_MISSING",
        };
      }
      logger.error("ensureUserRowForClerkId: upsert failed", { message: upErr.message });
      return { ok: false, message: upErr.message };
    }
    return { ok: true };
  } catch (e) {
    logger.error("ensureUserRowForClerkId: clerk or db error", { error: String(e) });
    return { ok: false, message: "Não foi possível criar o registo do utilizador." };
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    let supabase: ReturnType<typeof getSupabaseAdmin>;
    try {
      supabase = getSupabaseAdmin();
    } catch (e) {
      logger.error("GET preferences: Supabase not configured", { error: String(e) });
      return Response.json(
        { error: "Base de dados não configurada no servidor.", preferences: {}, email: null },
        { status: 503 }
      );
    }

    const ensured = await ensureUserRowForClerkId(supabase, userId);
    if (!ensured.ok) {
      return Response.json(
        {
          error: ensured.message,
          code: ensured.code,
          preferences: {},
          email: null,
        },
        { status: 503 }
      );
    }

    let result = await supabase
      .from("users")
      .select("preferences, email, first_name, last_name")
      .eq("clerk_id", userId)
      .single();

    if (result.error && isPreferencesColumnError(result.error.message)) {
      result = await supabase
        .from("users")
        .select("email, first_name, last_name")
        .eq("clerk_id", userId)
        .single();
    }

    if (result.error?.code === "PGRST116" || !result.data) {
      return Response.json({ preferences: {}, email: null });
    }

    if (result.error || !result.data) {
      return Response.json({ preferences: {}, email: null });
    }

    const { preferences, email } = mergePreferencesFromRow(
      result.data as Parameters<typeof mergePreferencesFromRow>[0]
    );

    return Response.json({ preferences, email });
  } catch (e) {
    logger.error("GET /api/user/preferences", { error: String(e) });
    return Response.json({ error: "Erro ao carregar preferências" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PrefsSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    let supabase: ReturnType<typeof getSupabaseAdmin>;
    try {
      supabase = getSupabaseAdmin();
    } catch (e) {
      logger.error("PATCH preferences: Supabase not configured", { error: String(e) });
      return Response.json(
        { ok: false, code: "SUPABASE_CONFIG", error: "Base de dados não configurada no servidor." },
        { status: 503 }
      );
    }

    const ensured = await ensureUserRowForClerkId(supabase, userId);
    if (!ensured.ok) {
      return Response.json(
        { ok: false, error: ensured.message, code: ensured.code },
        { status: 503 }
      );
    }

    const { data: existing, error: fetchErr } = await supabase
      .from("users")
      .select("preferences")
      .eq("clerk_id", userId)
      .single();

    if (fetchErr && isPreferencesColumnError(fetchErr.message)) {
      return Response.json(
        {
          ok: false,
          code: "PREFERENCES_COLUMN_MISSING",
          error:
            "A coluna preferences não existe na base. Execute a migração SQL indicada na documentação.",
        },
        { status: 503 }
      );
    }

    if (fetchErr && fetchErr.code === "PGRST116") {
      return Response.json(
        { ok: false, error: "Utilizador não encontrado na base." },
        { status: 404 }
      );
    }

    const merged = { ...(existing?.preferences ?? {}), ...parsed.data };

    const updateRow: Record<string, unknown> = { preferences: merged };
    if (parsed.data.firstName !== undefined) {
      updateRow.first_name = parsed.data.firstName;
    }
    if (parsed.data.lastName !== undefined) {
      updateRow.last_name = parsed.data.lastName;
    }

    const { error } = await supabase
      .from("users")
      .update(updateRow)
      .eq("clerk_id", userId);

    if (error) {
      if (isPreferencesColumnError(error.message)) {
        return Response.json(
          {
            ok: false,
            code: "PREFERENCES_COLUMN_MISSING",
            error:
              "A coluna preferences não existe na base. Execute a migração SQL indicada na documentação.",
          },
          { status: 503 }
        );
      }
      return Response.json(
        { ok: false, error: error.message ?? "Erro ao atualizar utilizador" },
        { status: 503 }
      );
    }

    return Response.json({ ok: true, preferences: merged });
  } catch (e) {
    logger.error("PATCH /api/user/preferences", { error: String(e) });
    return Response.json({ error: "Erro ao salvar preferências" }, { status: 500 });
  }
}
