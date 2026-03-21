# Testes e CI

## Scripts locais (`Frontend/package.json`)

| Script | Ferramenta |
|--------|------------|
| `npm run test` | Vitest (unitário) |
| `npm run test:watch` | Vitest em modo watch |
| `npm run test:e2e` | Playwright (+ `@axe-core/playwright` para acessibilidade em smoke) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Verificação de tipos (usada no CI) |
| `npm run lighthouse:ci` | Lighthouse CI (config `lighthouserc.json`) |

Testes unitários vivem em `Frontend/__tests__/`.

## GitHub Actions

Ficheiro: **`.github/workflows/ci.yml`**

1. **Lint** — `npm ci`, `npm run lint`, `tsc --noEmit` (working directory: `Frontend`).
2. **Test** — Vitest com variáveis de ambiente placeholder (Supabase, Clerk, Anthropic).
3. **Build** — após lint e testes; `SKIP_ENV_VALIDATION=true`; opcional `SENTRY_AUTH_TOKEN` para upload de source maps; depois Playwright (Chromium) e Lighthouse na homepage.

Branches: `push`/`pull_request` em `main` e branches `claude/**`.

## E2E com servidor dedicado

Para subir o Next em porta fixa para E2E: `npm run start:e2e` (define `PLAYWRIGHT_E2E=1` e porta 3001).
