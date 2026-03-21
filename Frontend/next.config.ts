import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { withSentryConfig } from "@sentry/nextjs";

/** Diretório deste pacote (Frontend), para não usar o lockfile da raiz do repositório como raiz do projeto. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// CSP allows Clerk, Sentry, Google Fonts, and Framer Motion inline styles
// 'unsafe-eval' is required by Next.js webpack in dev (source maps / HMR);
// in production it is omitted for tighter security.
const isDev = process.env.NODE_ENV !== "production";
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://*.clerk.com https://*.clerk.accounts.dev https://cdn.jsdelivr.net`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' https: data: blob:",
  "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.sentry.io https://*.supabase.co https://api.anthropic.com wss://*.supabase.co",
  "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  allowedDevOrigins:
    process.env.NODE_ENV !== "production"
      ? ["http://172.18.208.1:3000", "http://localhost:3000"]
      : [],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? "",
  project: process.env.SENTRY_PROJECT ?? "",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  },
});
