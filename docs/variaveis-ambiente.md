# Variáveis de ambiente

A fonte de verdade para nomes e descrições no código é **`Frontend/lib/env.ts`** (`validateEnv()`).

## Obrigatórias (servidor)

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (apenas servidor) |
| `ANTHROPIC_API_KEY` | API Anthropic (geração e chat) |
| `CLERK_SECRET_KEY` | Autenticação Clerk no servidor |

## Públicas (cliente)

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk no browser |
| `NEXT_PUBLIC_APP_URL` | URL base (OAuth, checkout, e-mails); em dev use `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Se usada no cliente para Supabase |

## Opcionais (funcionalidades)

| Variável | Uso |
|----------|-----|
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Pagamentos; ver `hasStripe()` em `env.ts` |
| `STRIPE_PRICE_*` | IDs de preços (starter/pro/enterprise, mensal/anual) — ver `.env.example` |
| `CLERK_WEBHOOK_SECRET` | Assinatura do webhook Clerk |
| `CRON_SECRET` | Bearer para `/api/cron/reset-generations` |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth GitHub |
| `GITHUB_TOKEN_ENCRYPTION_KEY` | Mínimo 32 caracteres — encriptação de tokens armazenados |
| `ADMIN_USER_IDS` | IDs Clerk separados por vírgula — acesso a `/api/admin/stats` |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_ADMIN_EMAIL` | E-mail transacional |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | Sentry |

## Apenas desenvolvimento

Documentadas no [Frontend/README.md](../Frontend/README.md):

- `ALLOW_UNVERIFIED_STRIPE_WEBHOOK=true` — com `NODE_ENV` ≠ `production`, aceita webhook Stripe sem verificar assinatura (testes locais).
- `ALLOW_GENERATE_WITHOUT_DB_CHECK=true` — em produção, permite continuar geração se a leitura de limites no Supabase falhar (não recomendado).

## CI

O workflow GitHub Actions define placeholders para lint/test/build e usa `SKIP_ENV_VALIDATION=true` no job de build quando aplicável (ver `.github/workflows/ci.yml`).

Copie sempre **`Frontend/.env.example`** como base.
