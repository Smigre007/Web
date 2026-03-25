# Migrations Supabase

Ordem cronológica por prefixo de data no nome do ficheiro.

- Aplicar no SQL Editor do Supabase (ou `supabase db push` se usar CLI ligado ao projeto).
- O schema completo de referência continua em [`../schema.sql`](../schema.sql) na raiz `Banco de dados/supabase/`.

| Ficheiro | Descrição |
|----------|-----------|
| `20250325120000_grant_upsert_rate_limit.sql` | Garante `GRANT EXECUTE` na função `upsert_rate_limit` para `service_role`. |

Novas alterações: adicionar ficheiros `YYYYMMDDHHMMSS_descricao.sql` e atualizar esta tabela.
