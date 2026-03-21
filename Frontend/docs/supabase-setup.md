# Configurar o Supabase (obrigatório para login, preferências e projetos)

Se vires erros como:

- `Could not find the table 'public.users' in the schema cache`
- Preferências ou dashboard a falhar

é porque o **projeto Supabase** ligado ao `.env.local` **ainda não tem as tabelas** criadas.

## Passos

1. Abre o [Supabase Dashboard](https://supabase.com/dashboard) do **mesmo projeto** cujo URL está em `NEXT_PUBLIC_SUPABASE_URL`.
2. Vai a **SQL Editor** → **New query**.
3. Copia **todo** o conteúdo de [`../Banco de dados/supabase/schema.sql`](../Banco%20de%20dados/supabase/schema.sql) (pasta `NeuroCode-AI/Banco de dados/supabase/` na raiz do repositório).
4. Clica **Run** (ou Ctrl+Enter).
5. Se já tinhas tabelas antigas e dá erro de “already exists”, executa só os blocos que faltam (por exemplo `CREATE TABLE` de `users` e `projects`) ou corrige à mão.
6. Confirma em **Table Editor** que existe a tabela **`public.users`** com coluna **`clerk_id`**.
7. Reinicia o servidor Next (`npm run dev`) e testa de novo.

## Variáveis necessárias no `.env.local` (Frontend)

- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto (Settings → API).
- `SUPABASE_SERVICE_ROLE_KEY` — chave **service_role** (Settings → API), **nunca** no cliente público.

## Opcional: coluna `preferences`

Se a API disser que falta a coluna `preferences`, executa também:

`NeuroCode-AI/Frontend/lib/supabase/migrations/002_user_preferences.sql`

---

Depois disto, o endpoint `/api/user/preferences` e `/api/projects` deixam de falhar por “tabela em falta”.
