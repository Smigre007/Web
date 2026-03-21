import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, buildSystemPrompt } from "@/lib/anthropic";
import { validateEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const maxDuration = 120;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(20000),
});

const ChatBodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(100),
  mode: z.string().optional(),
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

    // Rate limit: 30 chat requests per minute per user
    const rl = await checkRateLimit(`chat:${userId}`, 30, 60_000);
    if (rl.limited) {
      return new Response(
        JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const parsed = ChatBodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Dados inválidos", details: parsed.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages, mode, language } = parsed.data;

    type StreamParams = Parameters<Anthropic["messages"]["stream"]>[0];

    const tools: StreamParams["tools"] =
      mode === "research" ? ([{ type: "web_search_20250305", name: "web_search" }] as StreamParams["tools"]) : undefined;

    const streamBody = {
      model: "claude-opus-4-6",
      max_tokens: 8000,
      thinking: { type: "adaptive" as const },
      system: buildSystemPrompt(mode, language),
      messages,
      ...(tools ? { tools } : {}),
    } satisfies StreamParams;

    const stream = getAnthropicClient().messages.stream(streamBody);

    const encoder = new TextEncoder();
    const STREAM_ERROR_PREFIX = "\x00__ERR__:";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          // Send error as in-band sentinel so the browser doesn't log NetworkError
          try {
            const msg = (error as Error).message ?? "Erro ao processar mensagem";
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
      },
    });
  } catch (error) {
    logger.error("Chat error", { error });
    return new Response(
      JSON.stringify({ error: "Erro ao processar mensagem" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
