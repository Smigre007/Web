/** Página dedicada ao gerador de projetos (área autenticada). */
export const DASHBOARD_GENERATE_HREF = "/gerar" as const;

/** Página dedicada ao chat com IA (área autenticada). */
export const CHAT_IA_HREF = "/chat-ia" as const;

/** Registo com redirecionamento explícito para o gerador após signup. */
export const SIGN_UP_FOR_IA_HREF =
  `/sign-up?redirect_url=${encodeURIComponent(DASHBOARD_GENERATE_HREF)}` as const;

/** Valida `redirect_url` vindo da query (apenas paths relativos internos). */
export function safeInternalRedirectPath(
  raw: string | string[] | undefined
): string | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (typeof v !== "string" || v.length === 0) return null;
  if (!v.startsWith("/") || v.startsWith("//")) return null;
  if (v.includes("://")) return null;
  return v;
}
