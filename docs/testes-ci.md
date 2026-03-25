# Testes e CI

## Scripts locais (`Frontend/package.json`)

| Script | Ferramenta |
|--------|------------|
| `npm run test` | Vitest (unitário) |
| `npm run test:watch` | Vitest em modo watch |
| `npm run test:e2e` | Playwright (+ `@axe-core/playwright` para acessibilidade em smoke) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Verificação de tipos (usada no CI) |
| `npm run lighthouse:ci` | Lighthouse CI (config `lighthouserc.json` — homepage, pricing, contact) |
| `npm run db:check` | Verifica tabelas + RPC no Supabase (`SKIP_DB_SCHEMA_CHECK=1` no CI sem credenciais) |

Testes unitários vivem em `Frontend/__tests__/`. Smoke E2E cobre `GET /api/health` (liveness) e `GET /api/ready` (readiness; pode responder 503 sem base real).

## GitHub Actions

Ficheiro: **`.github/workflows/ci.yml`**

1. **Lint** — `npm ci`, `npm run lint`, `tsc --noEmit` (working directory: `Frontend`).
2. **Test** — Vitest com variáveis de ambiente placeholder (Supabase, Clerk, Anthropic).
3. **Build** — após lint e testes; `SKIP_ENV_VALIDATION=true` no build (validação real em runtime via `/api/ready` em deploy); opcional `SENTRY_AUTH_TOKEN` para upload de source maps; depois Playwright (Chromium) e Lighthouse em várias URLs.

Branches: `push`/`pull_request` em `main` e branches `claude/**`.

## E2E com servidor dedicado

Para subir o Next em porta fixa para E2E: `npm run start:e2e` (define `PLAYWRIGHT_E2E=1` e porta 3001).
