# Deploy e operação

## Vercel (recomendado)

O projeto inclui **`Frontend/vercel.json`** com:

- **Região** `gru1` (São Paulo).
- **Crons**: `GET /api/cron/reset-generations` — `0 6 1 * *` (dia 1 de cada mês às 06:00).
- **Timeouts** alargados para rotas pesadas: `ai/generate` (300s), `ai/chat` (120s), export de projetos, webhooks Stripe/Clerk.
- **Rewrite**: `/sitemap.xml` → `/api/sitemap`.

Configure na Vercel todas as variáveis de [variaveis-ambiente.md](variaveis-ambiente.md). Use o mesmo `NEXT_PUBLIC_APP_URL` que o domínio de produção.

## Checklist pós-deploy

1. Webhooks **Stripe** e **Clerk** apontando para URLs HTTPS do deploy.
2. **Supabase** com schema aplicado e URL/chaves corretas.
3. **Cron** na Vercel ativo e `CRON_SECRET` definido se a rota exigir Bearer.
4. Opcional: **Sentry** (`SENTRY_*`), **Resend** para e-mails transacionais.

## Monitorização

- `GET /api/health` para probes de disponibilidade.
- Sentry opcional via `@sentry/nextjs` e `next.config.ts` (`withSentryConfig`).

## Documentação comercial interna

Conteúdo para agências e operação: página **`/docs/operacao`** no próprio site (`Frontend/app/docs/operacao/page.tsx`).
