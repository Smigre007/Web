import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { getAnthropicClient, buildSystemPrompt, buildGenerationPrompt } from "@/lib/anthropic";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isProduction, validateEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { PROJECT_TYPE_IDS, DEFAULT_PROJECT_TYPE } from "@/lib/project-types";

export const maxDuration = 300; // 5 minutes

const PROJECT_TYPES = PROJECT_TYPE_IDS;

const GenerateBodySchema = z.object({
  prompt: z.string().min(10, "Descreva seu projeto com pelo menos 10 caracteres").max(5000, "Prompt muito longo (máx 5000 caracteres)"),
  projectType: z.enum(PROJECT_TYPES).optional().default(DEFAULT_PROJECT_TYPE),
  language: z.enum(["pt", "en", "es", "fr"]).optional().default("pt"),
});

export async function POST(req: NextRequest) {
  try {
    validateEnv();
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const startedAt = Date.now();

    // Check usage limits and store user data for later increment
    let userRow: { generations_used: number; generations_limit: number; plan: string } | null = null;
    try {
      const db = getSupabaseAdmin();
      const { data: user } = await db
        .from("users")
        .select("generations_used, generations_limit, plan")
        .eq("clerk_id", userId)
        .single();

      if (
        user &&
        typeof user.generations_limit === "number" &&
        user.generations_limit > 0 &&
        user.generations_used >= user.generations_limit
      ) {
        return new Response(
          JSON.stringify({
            error: "Limite de gerações atingido. Faça upgrade do seu plano para continuar.",
            limitReached: true,
            plan: user.plan ?? "free",
            used: user.generations_used,
            limit: user.generations_limit,
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      userRow = user;
    } catch (err) {
      const allowSkip =
        !isProduction() ||
        process.env.DANGEROUS_ALLOW_GENERATE_WITHOUT_DB_CHECK === "true";
      if (!allowSkip) {
        logger.error("Generate: falha ao carregar limites do utilizador", { error: err });
        return new Response(
          JSON.stringify({
            error: "Serviço temporariamente indisponível. Tente novamente em instantes.",
          }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const body = await req.json();
    const parsed = GenerateBodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { prompt, projectType, language } = parsed.data;

    const stream = getAnthropicClient().messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 32000,
      thinking: { type: "adaptive" },
      system: buildSystemPrompt(undefined, language),
      messages: [
        {
          role: "user",
          content: buildGenerationPrompt(prompt, projectType, undefined, language),
        },
      ],
    });

    const encoder = new TextEncoder();

    // Sentinel prefix written into the stream to signal errors to the client
    // without triggering a browser NetworkError (controller.error aborts the
    // fetch and appears as "NetworkError when attempting to fetch resource").
    const STREAM_ERROR_PREFIX = "\x00__ERR__:";

    const readableStream = new ReadableStream({
      async start(controller) {
        let counted = false;
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              // Increment usage only on first successful byte (avoids charging for failed generations).
              // Uses an optimistic lock (.eq on current count) to prevent concurrent requests
              // from bypassing the limit — without it, two simultaneous requests could both
              // read count=2 with limit=3, both pass the check, and both generate.
              if (!counted && userRow) {
                counted = true;
                try {
                  const db = getSupabaseAdmin();
                  const { data: updated } = await db
                    .from("users")
                    .update({ generations_used: (userRow.generations_used ?? 0) + 1 })
                    .eq("clerk_id", userId)
                    .eq("generations_used", userRow.generations_used) // optimistic lock
                    .select("generations_used, generations_limit")
                    .single();

                  // If no row matched or post-update limit exceeded, signal error in-band
                  if (!updated || updated.generations_used > updated.generations_limit) {
                    controller.enqueue(encoder.encode(`${STREAM_ERROR_PREFIX}Limite de gerações atingido`));
                    controller.close();
                    return;
                  }
                } catch {
                  // Non-fatal: generation continues even if counter update fails
                }
              }
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          logger.info("ai.generate.stream_complete", {
            userId,
            durationMs: Date.now() - startedAt,
          });
          controller.close();
        } catch (error) {
          // Send error as in-band sentinel so the browser doesn't log NetworkError
          try {
            const msg = (error as Error).message ?? "Erro ao gerar projeto";
            controller.enqueue(encoder.encode(`${STREAM_ERROR_PREFIX}${msg}`));
          } finally {
            controller.close();
          }
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    logger.error("Generation error", { error });
    return new Response(
      JSON.stringify({ error: "Erro interno ao gerar projeto. Tente novamente." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
