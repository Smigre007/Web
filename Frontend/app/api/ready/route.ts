import { NextResponse } from "next/server";
import { getReadinessState, isReady } from "@/lib/readiness";

/**
 * Readiness probe: DB + env obrigatórios. Use em orquestração / alertas.
 * Liveness leve: GET /api/health
 */
export async function GET() {
  const checks = await getReadinessState();
  const ok = isReady(checks);
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.npm_package_version ??
    "dev";

  return NextResponse.json(
    {
      status: ok ? "ready" : "not_ready",
      checks: {
        ...checks,
        version,
      },
      missingEnv: checks.missingEnv.length > 0 ? checks.missingEnv : undefined,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 }
  );
}
