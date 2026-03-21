export async function register() {
  if (process.env.NODE_ENV === "production" && process.env.SKIP_ENV_VALIDATION !== "true") {
    const { getMissingRequiredEnvVarNames } = await import("./lib/env");
    const missing = getMissingRequiredEnvVarNames();
    if (missing.length > 0) {
      console.error(
        "[NeuroCode] Variáveis de ambiente em falta (adicione na Vercel → Settings → Environment Variables):",
        missing.join(", ")
      );
    }
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.server.config");
  }
}
