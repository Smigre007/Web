# Documentação NeuroCode AI

Índice da documentação técnica e operacional do projeto.

| Documento | Conteúdo |
|-----------|----------|
| [Visão geral](visao-geral.md) | O que é o produto, stack, estrutura de pastas |
| [Funcionalidades](funcionalidades.md) | O que o utilizador pode fazer (produto) |
| [Instalação e desenvolvimento](instalacao.md) | Pré-requisitos, comandos, URLs |
| [Variáveis de ambiente](variaveis-ambiente.md) | Lista de envs, obrigatoriedade, `lib/env.ts` |
| [Rotas e páginas](rotas-paginas.md) | Mapa do site (App Router), áreas públicas e autenticadas |
| [API REST](api.md) | Rotas em `app/api`, propósito de cada endpoint |
| [Banco de dados](banco-de-dados.md) | Supabase, schema, RLS, cron |
| [Autenticação e segurança](seguranca.md) | Clerk, middleware, CSP, webhooks |
| [Testes e CI](testes-ci.md) | Vitest, Playwright, Lighthouse, GitHub Actions |
| [Deploy e operação](deploy.md) | Vercel, crons, integrações externas |

Documentação já existente no repositório:

- [Frontend/README.md](../Frontend/README.md) — desenvolvimento e envs de dev
- [Frontend/docs/supabase-setup.md](../Frontend/docs/supabase-setup.md) — aplicar schema no Supabase
- [Frontend/docs/dashboard-qa-checklist.md](../Frontend/docs/dashboard-qa-checklist.md) — QA do dashboard
- [Banco de dados/README.md](../Banco%20de%20dados/README.md) — migração `preferences`

Página pública de operação comercial (agências): rota **`/docs/operacao`** (`Frontend/app/docs/operacao/page.tsx`).

**Internacionalização:** existem ficheiros em `Frontend/locales/`; parte da UI pode ainda estar em português hardcoded — alinhar gradualmente com chaves partilhadas.
