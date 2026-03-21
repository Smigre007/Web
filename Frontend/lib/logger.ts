/**
 * Structured logger that sanitizes sensitive values before logging.
 * Replaces raw console.log/error calls in API routes.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

// Exact field names that should always be redacted
const SENSITIVE_FIELD_NAMES = new Set(["password", "secret", "token", "key", "auth", "authorization", "apikey", "api_key", "privatekey", "private_key", "accesstoken", "access_token", "refreshtoken", "refresh_token"]);

// Patterns for sensitive values to redact
const SENSITIVE_PATTERNS = [
  /sk_[a-zA-Z0-9_-]+/g,           // Stripe secret keys
  /whsec_[a-zA-Z0-9_-]+/g,        // Stripe webhook secrets
  /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,  // JWTs
  /Bearer\s+[a-zA-Z0-9_.-]+/gi,   // Bearer tokens
];

function sanitize(value: unknown): unknown {
  if (typeof value === "string") {
    let sanitized = value;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    }
    return sanitized;
  }
  if (value instanceof Error) {
    return { message: sanitize(value.message), name: value.name };
  }
  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const lk = k.toLowerCase();
      if (SENSITIVE_FIELD_NAMES.has(lk) || lk.endsWith("_secret") || lk.endsWith("_token") || lk.endsWith("_key") || lk.endsWith("_password")) {
        sanitized[k] = "[REDACTED]";
      } else {
        sanitized[k] = sanitize(v);
      }
    }
    return sanitized;
  }
  return value;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context: sanitize(context) as Record<string, unknown> } : {}),
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => log("error", message, context),
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") {
      log("debug", message, context);
    }
  },
};
