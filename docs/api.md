# API REST (`Frontend/app/api`)

Convenção: cada pasta com **`route.ts`** exporta métodos HTTP. Resumo por área.

## Saúde e estatísticas

| Caminho | Função |
|---------|--------|
| `GET /api/health` | Liveness (processo a responder; sempre 200 se a rota existir) |
| `GET /api/ready` | Readiness (variáveis obrigatórias + ligação à tabela `users` no Supabase; **503** se degradado) |
| `GET /api/stats` | Estatísticas (autenticado / contexto app) |
| `GET /api/public/stats` | Estatísticas públicas |

## Inteligência artificial

| Caminho | Função |
|---------|--------|
| `POST /api/ai/generate` | Geração de código (Anthropic); timeout alargado na Vercel |
| `POST /api/ai/chat` | Chat com IA |

## Projetos

| Caminho | Função |
|---------|--------|
| `GET/POST /api/projects` | Listar / criar projetos |
| `GET/PATCH/DELETE /api/projects/[id]` | CRUD por ID |
| `POST /api/projects/[id]/duplicate` | Duplicar |
| `GET /api/projects/[id]/export` | Exportar (ex.: ZIP) |
| `GET/POST /api/projects/[id]/versions` | Versões |

## Utilizador

| Caminho | Função |
|---------|--------|
| `GET/PATCH /api/user/preferences` | Preferências (JSON/dashboard) |
| `GET /api/user/usage` | Utilização (gerações, limites) |
| `POST /api/user/delete` | Eliminação de conta |
| `GET /api/user/export` | Export RGPD / dados do utilizador |

## Pagamentos Stripe

| Caminho | Função |
|---------|--------|
| `POST /api/checkout` | Sessão de checkout |
| `POST /api/cancel-subscription` | Cancelar subscrição |
| `POST /api/reactivate-subscription` | Reativar |
| `POST /api/upgrade-subscription` | Upgrade |
| `GET /api/invoices` | Faturas |
| `POST /api/webhooks/stripe` | Webhook Stripe (assinatura verificada) |

## Clerk

| Caminho | Função |
|---------|--------|
| `POST /api/webhooks/clerk` | Sync de utilizadores para `public.users` |

## GitHub

| Caminho | Função |
|---------|--------|
| `GET /api/github/connect` | Iniciar OAuth |
| `GET /api/github/callback` | Callback OAuth (público no middleware) |
| `POST /api/github/disconnect` | Desligar |
| `GET /api/github/status` | Estado da ligação |
| `POST /api/github/push` | Push de código |

## Outros

| Caminho | Função |
|---------|--------|
| `POST /api/contact` | Formulário de contacto / enterprise |
| `GET /api/referrals` | Programa de referências |
| `POST /api/roadmap/vote` | Voto no roadmap |
| `GET /api/sitemap` | Sitemap XML (usado pelo rewrite) |
| `GET /api/admin/stats` | Métricas admin (`ADMIN_USER_IDS`) |
| `POST /api/cron/reset-generations` | Cron (Bearer `CRON_SECRET`); reset mensal de gerações |

Para detalhes de corpo das respostas e códigos HTTP, consulte o `route.ts` de cada pasta.
