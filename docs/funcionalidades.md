# Funcionalidades do produto (visão do utilizador)

Resumo do que o site oferece, alinhado com as rotas e APIs implementadas.

## Geração e IA

- **Gerar software** a partir de descrições (`/gerar`, API `/api/ai/generate`).
- **Chat com IA** para iterar e esclarecer (`/chat-ia`, `/api/ai/chat`).
- Projetos guardados em **Supabase** com código estruturado (ficheiros, preview, stack).

## Conta e planos

- **Registo e login** com Clerk; utilizador espelhado na tabela `users`.
- **Planos** (free, starter, pro, enterprise) com limites de **gerações mensais** e integração **Stripe** (checkout, faturação, cancelamento, upgrade).
- **Reset mensal** de gerações via cron (`/api/cron/reset-generations`).

## Dashboard

- Visão geral com estatísticas e utilização (`/dashboard`).
- **Projetos**: lista, edição, duplicação, export, histórico de versões.
- **Definições**: conta Clerk, billing, integrações (ex.: GitHub).
- **Referências**, tutoriais, admin (utilizadores listados em `ADMIN_USER_IDS`).

## Integrações

- **GitHub OAuth**: ligar repositório, estado e push de código (rotas `/api/github/*`).
- **E-mail** via Resend para contacto e notificações (quando configurado).

## Marketing e suporte

- Landing, preços, sobre, contacto, legal, roadmap com votação, showcase, changelog.
- Página **`/docs/operacao`** com orientação para operação comercial (agências).

## Dados pessoais

- Export e eliminação de conta (`/api/user/export`, `/api/user/delete`) alinhados a requisitos de privacidade.

Para detalhes técnicos, veja [api.md](api.md) e [rotas-paginas.md](rotas-paginas.md).
