# Rotas e páginas (App Router)

Todas as rotas abaixo estão sob `Frontend/app/` (extensão `.tsx`).

## Marketing e conteúdo público

| Rota | Descrição |
|------|-----------|
| `/` | Landing principal |
| `/pricing` | Preços |
| `/about` | Sobre |
| `/contact` | Contacto |
| `/privacy`, `/terms` | Legal |
| `/changelog` | Changelog |
| `/roadmap` | Roadmap (votação via API) |
| `/showcase`, `/showcase/[slug]` | Showcase |
| `/proposta` | Proposta comercial (builder) |
| `/docs/operacao` | Documentação operacional para agências |
| `/p/[id]` | Partilha pública (projeto) |
| `/criar/[tipo]` | Fluxo de criação por tipo |

## Autenticação (Clerk)

| Rota | Descrição |
|------|-----------|
| `/sign-in/[[...sign-in]]` | Login |
| `/sign-up/[[...sign-up]]` | Registo (redirect pós-signup configurado para `/gerar` no `layout` raiz) |

## Área autenticada — dashboard

Grupo `(dashboard)/`: layout com sidebar, command palette, onboarding.

| Rota | Descrição |
|------|-----------|
| `/dashboard` | Painel principal (tabs via `?tab=`) |
| `/projects` | Lista de projetos |
| `/projects/[id]` | Detalhe / editor de projeto |
| `/settings` | Definições gerais |
| `/settings/account/[[...account]]` | Conta Clerk |
| `/settings/billing` | Faturação Stripe |
| `/settings/integrations` | Integrações (ex.: GitHub) |
| `/referrals` | Referências |
| `/tutorials` | Tutoriais |
| `/admin` | Admin (restrito) |

## Área IA

Grupo `(ai)/`:

| Rota | Descrição |
|------|-----------|
| `/gerar` | Geração de código / painel gerador |
| `/chat-ia` | Chat com IA |

## SEO e ficheiros especiais

- `robots.ts`, `sitemap.ts` — robots e sitemap
- `opengraph-image.tsx`, `icon.tsx` — metadados e ícone
- Rewrite Vercel: `/sitemap.xml` → `/api/sitemap` (`vercel.json`)

## Proteção de rotas

O **Clerk** protege rotas que não estão na lista de rotas públicas do proxy (edge). A lista atual está em **`Frontend/proxy.ts`** (rotas como `/`, `/sign-in`, `/api/webhooks`, `/pricing`, `/contact`, `/api/health`, `/api/ready`, etc.). Rotas de marketing adicionais podem precisar de ser incluídas em `isPublicRoute` para acesso sem login.
