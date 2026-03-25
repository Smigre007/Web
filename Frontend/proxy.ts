import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

/**
 * Next.js 16+: ficheiro `proxy.ts` substitui `middleware.ts`.
 * Rotas que não exigem sessão Clerk. Tudo o resto chama auth.protect().
 * APIs com auth próprio (cron Bearer, webhooks) ficam aqui para não depender de cookie.
 *
 * Manutenção: ao adicionar novos `route.ts` em `app/api/` (subpastas), confirme se a rota deve ficar
 * pública aqui (ex.: contact, webhooks) ou protegida por padrão (checkout, projects,
 * ai/*, user/*, admin/*, github/connect, etc.).
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing(.*)",
  "/contact(.*)",
  "/about(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/roadmap(.*)",
  "/changelog(.*)",
  "/proposta(.*)",
  "/showcase(.*)",
  "/docs/operacao(.*)",
  "/p/(.*)",
  "/criar/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health(.*)",
  "/api/ready(.*)",
  "/api/public(.*)",
  "/api/contact(.*)",
  "/api/webhooks/(.*)",
  "/api/cron/(.*)",
  "/api/sitemap(.*)",
  "/api/github/callback(.*)",
  "/opengraph-image(.*)",
  "/icon(.*)",
  "/robots.txt",
  "/sitemap.xml",
]);

const clerk = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

/**
 * E2E/Lighthouse (`npm run start:e2e`): sem sessão Clerk no edge.
 * Não definir PLAYWRIGHT_E2E em produção.
 */
export default function proxy(req: NextRequest, evt: NextFetchEvent) {
  if (process.env.PLAYWRIGHT_E2E === "1") {
    return NextResponse.next();
  }
  return clerk(req, evt);
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
