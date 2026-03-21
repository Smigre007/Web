# Backend

O backend desta aplicação é composto por:

- **API Routes (Next.js)** — em `../Frontend/app/api/`
  - Rotas de API REST (checkout, webhooks, AI, projetos, usuário, etc.)
- **Lógica de servidor** — em `../Frontend/lib/`
  - Supabase (cliente servidor), Stripe, Resend, rate-limit, logger, etc.

As rotas de API e a lógica de servidor ficam no projeto Next.js (Frontend) porque o Next.js App Router unifica frontend e API no mesmo repositório. Para rodar o servidor, use na **raiz do projeto**:

```bash
npm run dev
```

Ou, a partir da pasta Frontend:

```bash
cd Frontend && npm run dev
```
