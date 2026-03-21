# Banco de dados

Aqui ficam os artefatos do banco de dados:

- **supabase/** — Schema e configuração Supabase
  - `schema.sql` — definições de tabelas e funções

As variáveis de conexão (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) ficam no `.env.local` do projeto **Frontend**.

### Migração: preferências do utilizador

Se a dashboard deixar de gravar preferências (erro 503 na API `/api/user/preferences`), execute no **SQL Editor** do Supabase o ficheiro equivalente em `NeuroCode-AI/Frontend/lib/supabase/migrations/002_user_preferences.sql` (adiciona a coluna `users.preferences` JSONB).
