# Banco de dados (Supabase / PostgreSQL)

## Schema principal

O ficheiro **`Banco de dados/supabase/schema.sql`** define:

- **`public.users`** — utilizadores sincronizados com Clerk (`clerk_id` único), plano, limites de gerações, Stripe, preferências JSONB, etc.
- **`public.projects`** — projetos gerados (`user_clerk_id` → `users.clerk_id`), código em JSONB, tipo, estado, etc.
- **`public.contact_requests`** — pedidos do formulário enterprise/contacto
- **`public.rate_limits`** — rate limiting persistente (função `upsert_rate_limit`)
- **View `plan_limits`** — limites por plano (free, starter, pro, enterprise)
- **Função `reset_monthly_generations()`** — repor contadores (usada por cron ou pg_cron)

**RLS** está ativado; o backend usa **`SUPABASE_SERVICE_ROLE_KEY`**, que contorna RLS no servidor.

## Aplicação inicial

1. Abrir o SQL Editor no dashboard Supabase do projeto cuja URL está em `NEXT_PUBLIC_SUPABASE_URL`.
2. Colar e executar o conteúdo completo de `schema.sql`.
3. Confirmar tabelas em **Table Editor** (especialmente `public.users` com `clerk_id`).

Guia passo a passo: [Frontend/docs/supabase-setup.md](../Frontend/docs/supabase-setup.md).

## Migrações adicionais

- Se faltar a coluna **`preferences`** em `users`, executar  
  `Frontend/lib/supabase/migrations/002_user_preferences.sql`  
  (referência em [Banco de dados/README.md](../Banco%20de%20dados/README.md)).

## Cron e reset de gerações

- A API **`POST /api/cron/reset-generations`** pode ser chamada com o header **`Authorization: Bearer <CRON_SECRET>`** (variável `CRON_SECRET`).
- Na **Vercel**, `vercel.json` agenda este path no dia 1 de cada mês (`0 6 1 * *` em `gru1`).
- Alternativa no Supabase: comentário no schema sobre `pg_cron` e `reset_monthly_generations()`.

## Planos e limites

Limites de gerações por plano estão na view `plan_limits` e alinhados com a lógica da aplicação (valores por defeito em `users`, ex.: tier free com limite inicial de gerações).
