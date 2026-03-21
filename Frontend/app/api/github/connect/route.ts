import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  createGithubOAuthStateCookie,
  GITHUB_OAUTH_COOKIE,
  githubOAuthCookieOptions,
} from "@/lib/github-oauth-state";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GitHub OAuth não configurado" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL não configurada" }, { status: 503 });
  }

  const { state, cookieValue } = createGithubOAuthStateCookie(userId);
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "repo,user:email",
    state,
    redirect_uri: `${appUrl}/api/github/callback`,
  });

  const res = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`);
  res.cookies.set(GITHUB_OAUTH_COOKIE, cookieValue, githubOAuthCookieOptions());
  return res;
}
