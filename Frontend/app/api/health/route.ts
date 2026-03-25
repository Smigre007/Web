import { NextResponse } from "next/server";

/**
 * Liveness: processo a responder. Não falha se a base estiver indisponível
 * (use GET /api/ready para readiness completo).
 */
export async function GET() {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.npm_package_version ??
    "dev";

  return NextResponse.json({
    status: "ok",
    version,
    timestamp: new Date().toISOString(),
    readiness: "GET /api/ready",
  });
}
