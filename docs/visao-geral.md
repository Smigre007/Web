# Visão geral

## O que é

**NeuroCode AI** é uma plataforma web para **gerar software com inteligência artificial**: criação de projetos (sites, apps, SaaS, etc.), chat com IA, dashboard do utilizador, integração com GitHub, subscrições via Stripe e sincronização de utilizadores com Supabase (via Clerk).

## Stack principal

| Camada | Tecnologia |
|--------|------------|
| Framework | **Next.js 16** (App Router), **React 19** |
| Linguagem | **TypeScript** |
| Estilo | **Tailwind CSS 4** |
| Auth | **Clerk** (`@clerk/nextjs`) |
| Base de dados | **Supabase** (PostgreSQL), acesso servidor com `SUPABASE_SERVICE_ROLE_KEY` |
| IA | **Anthropic** (`@anthropic-ai/sdk`) |
| Pagamentos | **Stripe** |
| E-mail | **Resend** (opcional) |
| Monitorização | **Sentry** (opcional) |
| Testes | **Vitest**, **Playwright**, **Lighthouse CI** |

## Organização do repositório

| Pasta | Função |
|-------|--------|
| **`Frontend/`** | Aplicação Next.js: `app/` (páginas + API routes), `components/`, `lib/`, `public/`, `locales/` |
| **`Backend/`** | Apenas **README** — a API é implementada em `Frontend/app/api/` |
| **`Banco de dados/`** | `supabase/schema.sql` e notas de migração |

A **raiz** do projeto (`package.json`) delega scripts para `Frontend/` (`npm run dev`, `build`, `test`, etc.).

## Princípios de arquitetura

- **Monólito Next.js**: UI e API REST no mesmo deploy, partilhando `lib/` (Supabase admin, Stripe, validação, rate limit).
- **Utilizadores em PostgreSQL** sincronizados com Clerk através do webhook `/api/webhooks/clerk`.
- **RLS ativado** nas tabelas; as rotas usam a chave **service role** no servidor (não expor no cliente).
- **Internacionalização** via ficheiros JSON em `Frontend/locales/` (pt, en, es, fr) e contexto em `context/language-context.tsx`.

## Ficheiros de referência

- Variáveis validadas no servidor: `Frontend/lib/env.ts`
- Exemplo de envs: `Frontend/.env.example`
- Configuração Next (CSP, Sentry, headers): `Frontend/next.config.ts`
- Cron na Vercel: `Frontend/vercel.json` (`/api/cron/reset-generations`)
