# Frontend

Aplicação Next.js 16 (App Router) do NeuroCode AI.

Documentação geral do repositório: **[../docs/README.md](../docs/README.md)**.

- **app/** — Páginas, layouts e rotas de API
- **components/** — Componentes React
- **lib/** — Utilitários e clientes (Supabase, Stripe, etc.)
- **public/** — Assets estáticos
- **types/** — Tipos TypeScript

## Desenvolvimento

Na **raiz do projeto**:

```bash
npm run dev
```

Ou nesta pasta:

```bash
npm run dev
```

A aplicação sobe em http://localhost:3000.

## TypeScript e erros no IDE

- O ficheiro `next-env.d.ts` referencia **`.next/types/routes.d.ts`**, gerado pelo Next. Se ainda não correu **`npm run dev`** ou **`npm run build`**, o Cursor/VS Code pode mostrar **dezenas de erros** (ficheiro em falta). Corra um dos comandos acima e recarregue a janela do editor.
- Verificação manual: **`npm run typecheck`** (`tsc --noEmit`), igual ao usado no CI.
- Pipeline único: **`npm run verify`** (typecheck + lint + test). Na raiz do repo: `npm run verify`.
- Abra o repositório na raiz `Web` e use o **TypeScript do workspace** (definido em `.vscode/settings.json`): comando *TypeScript: Select TypeScript Version* → *Use Workspace Version*.

## Dashboard (QA)

- Checklist manual e notas de auditoria: [docs/dashboard-qa-checklist.md](docs/dashboard-qa-checklist.md)

## Variáveis de ambiente

- Copie **`.env.example`** para **`.env.local`** e preencha os valores (nunca commite `.env.local`).
- Lista centralizada de variáveis no código: `lib/env.ts`.

## Variáveis de ambiente (desenvolvimento)

- `ALLOW_UNVERIFIED_STRIPE_WEBHOOK=true` — apenas com `NODE_ENV` diferente de `production`: aceita POST no webhook Stripe sem verificar assinatura (testes locais). Em produção o webhook sem segredos responde **503**.
- `DANGEROUS_ALLOW_GENERATE_WITHOUT_DB_CHECK=true` — **só em emergência**: em produção, permite continuar a geração se a leitura de limites no Supabase falhar (não recomendado). Sem isto, em produção devolve **503** nesse caso. Em `development` o bypass é permitido sem esta variável.

## Operação comercial (agências)

- Guia curto de operação: `app/docs/operacao/page.tsx`
- Rota pública: `/docs/operacao`
- Inclui posicionamento, onboarding, métricas e política de suporte de 30 dias
