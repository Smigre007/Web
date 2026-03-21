import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const GITHUB_OAUTH_COOKIE = "nc_github_oauth";

function getOauthSigningSecret(): string {
  const s = process.env.CLERK_SECRET_KEY;
  if (!s) {
    throw new Error("CLERK_SECRET_KEY is required to sign GitHub OAuth state");
  }
  return s;
}

/**
 * Opaque OAuth `state` for GitHub + signed cookie binding the state to the Clerk user.
 * Prevents CSRF: an attacker cannot complete the callback without the victim's cookie.
 */
export function createGithubOAuthStateCookie(clerkUserId: string): { state: string; cookieValue: string } {
  const state = randomBytes(32).toString("hex");
  const payload = Buffer.from(JSON.stringify({ st: state, uid: clerkUserId }), "utf8").toString("base64url");
  const sig = createHmac("sha256", getOauthSigningSecret()).update(payload).digest("base64url");
  return { state, cookieValue: `${payload}.${sig}` };
}

/** Returns Clerk user id if state and cookie match; otherwise null. */
export function verifyGithubOAuthState(stateFromQuery: string, cookieValue: string | undefined): string | null {
  if (!cookieValue || !stateFromQuery) return null;
  const dot = cookieValue.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  let expectedSig: string;
  try {
    expectedSig = createHmac("sha256", getOauthSigningSecret()).update(payload).digest("base64url");
  } catch {
    return null;
  }
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { st?: string; uid?: string };
    if (parsed.st !== stateFromQuery || typeof parsed.uid !== "string" || parsed.uid.length === 0) return null;
    return parsed.uid;
  } catch {
    return null;
  }
}

export function githubOAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  };
}
