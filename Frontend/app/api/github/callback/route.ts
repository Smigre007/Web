import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import {
  GITHUB_OAUTH_COOKIE,
  githubOAuthCookieOptions,
  verifyGithubOAuthState,
} from "@/lib/github-oauth-state";

function getEncryptionKey(): Buffer {
  const raw = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!raw || raw.length < 32) {
    throw new Error("GITHUB_TOKEN_ENCRYPTION_KEY must be set and at least 32 characters");
  }
  return Buffer.from(raw.slice(0, 32));
}

function encryptToken(token: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(encrypted: string): string {
  const key = getEncryptionKey();
  const [ivHex, encHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

function clearGithubOAuthCookie(res: NextResponse) {
  res.cookies.set(GITHUB_OAUTH_COOKIE, "", { ...githubOAuthCookieOptions(), maxAge: 0 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (!code || !stateParam) {
    const res = NextResponse.redirect(`${appUrl}/dashboard/settings/integrations?error=github_denied`);
    clearGithubOAuthCookie(res);
    return res;
  }

  const cookieVal = req.cookies.get(GITHUB_OAUTH_COOKIE)?.value;
  const clerkId = verifyGithubOAuthState(stateParam, cookieVal);
  if (!clerkId) {
    const res = NextResponse.redirect(`${appUrl}/dashboard/settings/integrations?error=github_state`);
    clearGithubOAuthCookie(res);
    return res;
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${appUrl}/api/github/callback`,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      const res = NextResponse.redirect(`${appUrl}/dashboard/settings/integrations?error=github_token`);
      clearGithubOAuthCookie(res);
      return res;
    }

    // Fetch GitHub username
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const ghUser = await userRes.json();

    // Encrypt and save token
    const db = getSupabaseAdmin();
    await db
      .from("users")
      .update({
        github_access_token: encryptToken(tokenData.access_token),
        github_username: ghUser.login ?? null,
      })
      .eq("clerk_id", clerkId);

    const res = NextResponse.redirect(`${appUrl}/dashboard/settings/integrations?github=connected`);
    clearGithubOAuthCookie(res);
    return res;
  } catch {
    const res = NextResponse.redirect(`${appUrl}/dashboard/settings/integrations?error=github_error`);
    clearGithubOAuthCookie(res);
    return res;
  }
}
