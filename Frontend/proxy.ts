import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import type { NextMiddleware } from "next/server";

/**
 * Rotas acessíveis sem sessão Clerk. Tudo o resto passa por auth.protect().
 * Manter alinhado com as páginas em app/ (landing, IA, partilha pública) e rotas de sistema.
 * Se faltar uma rota pública aqui, o utilizador é redirecionado para /sign-in (comportamento errado no site público).
 */
const publicRoutes = [
  "/",
  "/about",
  "/changelog(.*)",
  "/chat-ia(.*)",
  "/contact",
  "/criar(.*)",
  "/docs(.*)",
  "/gerar(.*)",
  "/icon(.*)",
  "/opengraph-image(.*)",
  "/p/(.*)",
  "/pricing",
  "/privacy",
  "/proposta(.*)",
  "/roadmap(.*)",
  "/robots.txt",
  "/showcase(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sitemap.xml",
  "/terms",
  "/api/contact",
  "/api/cron(.*)",
  "/api/github/callback",
  "/api/health",
  "/api/public(.*)",
  "/api/sitemap",
  "/api/webhooks(.*)",
];

let cachedClerk: NextMiddleware | null = null;

async function getClerkHandler(): Promise<NextMiddleware> {
  if (cachedClerk) return cachedClerk;
  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  const isPublicRoute = createRouteMatcher(publicRoutes);
  cachedClerk = clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  });
  return cachedClerk;
}

/**
 * Smoke E2E/Lighthouse: npm run start:e2e define PLAYWRIGHT_E2E=1 — não carrega o SDK Clerk no edge.
 * Não definir PLAYWRIGHT_E2E em produção.
 */
export default async function proxy(req: NextRequest, evt: NextFetchEvent) {
  if (process.env.PLAYWRIGHT_E2E === "1") {
    return NextResponse.next();
  }
  const handler = await getClerkHandler();
  return handler(req, evt);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
