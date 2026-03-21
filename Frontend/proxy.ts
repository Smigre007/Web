import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import type { NextMiddleware } from "next/server";

const publicRoutes = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/contact",
  "/api/sitemap",
  "/api/cron(.*)",
  "/api/public(.*)",
  "/api/github/callback",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
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
 * Smoke E2E/Lighthouse: `npm run start:e2e` define `PLAYWRIGHT_E2E=1` — não carrega o SDK Clerk no edge.
 * Não definir `PLAYWRIGHT_E2E` em produção.
 */
export default async function middleware(req: NextRequest, evt: NextFetchEvent) {
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
