# Instalação e desenvolvimento

## Pré-requisitos

- **Node.js 20** (alinhado com CI em `.github/workflows/ci.yml`)
- Conta e projeto **Supabase**
- Conta **Clerk** (chaves publishable + secret)
- Chave **Anthropic** para geração e chat de IA
- Opcional: **Stripe**, **Resend**, **GitHub OAuth**, **Sentry**

## Primeira instalação

```bash
cd NeuroCode-AI/Frontend
npm install
```

Copie `Frontend/.env.example` para **`Frontend/.env.local`** ou **`.env.local` na raiz `NeuroCode-AI/`** (conforme [README raiz](../README.md)) e preencha os valores. Nunca faça commit de ficheiros `.env` com segredos.

## Comandos

Na **raiz `NeuroCode-AI/`**:

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (http://localhost:3000) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor após build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unitário) |
| `npm run test:e2e` | Playwright |
| `npm run lighthouse:ci` | Lighthouse (homepage) |
| `npm run db:check` | Verifica tabelas core + RPC `upsert_rate_limit` (requer env Supabase; use `SKIP_DB_SCHEMA_CHECK=1` para ignorar no CI sem credenciais) |

Diretamente em `Frontend/` os mesmos scripts estão no `package.json` local.

## Base de dados

Antes de usar login, preferências ou projetos, aplique o SQL em **`Banco de dados/supabase/schema.sql`** no SQL Editor do Supabase. Migrações incrementais: pasta **`Banco de dados/supabase/migrations/`**. Detalhes: [Frontend/docs/supabase-setup.md](../Frontend/docs/supabase-setup.md) e [banco-de-dados.md](banco-de-dados.md).

## Verificação de saúde

- **`GET /api/health`** — liveness (processo a responder).
- **`GET /api/ready`** — readiness (env obrigatório + ligação à tabela `users`).

## E2E sem Clerk no edge

Para testes Playwright/Lighthouse com `next start`, existe o script `start:e2e` (porta 3001) que define `PLAYWRIGHT_E2E=1` para não carregar o SDK Clerk no middleware — **não usar em produção**.
