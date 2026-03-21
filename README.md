# NeuroCode AI

Projeto organizado em três pastas principais:

| Pasta | Conteúdo |
|-------|----------|
| **Frontend** | Aplicação Next.js (páginas, componentes, API routes, lib, public) |
| **Backend** | Documentação — a API e a lógica de servidor ficam em `Frontend/app/api` e `Frontend/lib` |
| **Banco de dados** | Schema e artefatos Supabase (`supabase/`) |

## Raiz

Na raiz ficam apenas os arquivos necessários para rodar o projeto:

- `package.json` — scripts que delegam para o Frontend
- `.env.local` — variáveis de ambiente (copie para `Frontend/.env.local` se rodar direto do Frontend)
- `.gitignore`, `README.md`

## Documentação

Índice completo: **[docs/README.md](docs/README.md)** (arquitetura, API, ambiente, Supabase, testes, deploy).

## Como rodar

Na **raiz** do projeto:

```bash
npm run dev
```

Isso executa o Next.js dentro de `Frontend/`. Acesse [http://localhost:3000](http://localhost:3000).

Para instalar dependências (primeira vez ou após clone):

```bash
cd Frontend && npm install
```

Build para produção:

```bash
npm run build
npm run start
```

## Supabase: tabelas em falta

Se aparecer **`Could not find the table 'public.users' in the schema cache`** (ou preferências/dashboard a falhar), o projeto Supabase **não tem o schema aplicado**. Siga o guia **[Frontend/docs/supabase-setup.md](Frontend/docs/supabase-setup.md)** e execute o SQL em **[Banco de dados/supabase/schema.sql](Banco%20de%20dados/supabase/schema.sql)** no SQL Editor do Supabase.

Variáveis de ambiente de referência (sem segredos): **`Frontend/.env.example`**. Lista comentada também em **[docs/variaveis-ambiente.md](docs/variaveis-ambiente.md)**.
