# Autenticação e segurança

## Clerk

- **Login/registo** nas rotas catch-all do Clerk em `(auth)/`.
- **Servidor**: `auth()` de `@clerk/nextjs/server` em layouts e rotas API.
- **Webhook** `POST /api/webhooks/clerk`: mantém `public.users` alinhado com Clerk (requer `CLERK_WEBHOOK_SECRET` em produção para verificar assinatura).

## Middleware (edge)

A lógica de **`clerkMiddleware`** e a lista de **rotas públicas** estão em **`Frontend/proxy.ts`** (Next.js 16+ — convenção `proxy` no lugar de `middleware`). Rotas não públicas exigem sessão (`auth.protect()`).

Rotas públicas incluem (entre outras): home, sign-in/up, webhooks, contact, sitemap, cron, stats públicos, callback GitHub, pricing, about, contact, privacy, terms.

Para **testes E2E**, `PLAYWRIGHT_E2E=1` faz bypass do Clerk no middleware (apenas ambientes de teste).

## Headers HTTP

`next.config.ts` define:

- **CSP** (Content-Security-Policy) com domínios Clerk, Sentry, Supabase, Anthropic, Google Fonts, etc.; `'unsafe-eval'` apenas em desenvolvimento (webpack/HMR).
- **HSTS**, **X-Frame-Options: DENY**, **X-Content-Type-Options**, **Referrer-Policy**, **Permissions-Policy**.

`vercel.json` reforça headers em `/api/*` e HSTS global.

## Segredos

- Nunca expor **`SUPABASE_SERVICE_ROLE_KEY`**, **`CLERK_SECRET_KEY`**, **`ANTHROPIC_API_KEY`**, **`STRIPE_SECRET_KEY`**, **`GITHUB_CLIENT_SECRET`** ou **`GITHUB_TOKEN_ENCRYPTION_KEY`** no cliente.
- Webhooks Stripe e Clerk devem validar assinatura em produção.

## Rate limiting

A tabela `public.rate_limits` e funções associadas suportam limitação persistente (ver `lib/rate-limit.ts`).
