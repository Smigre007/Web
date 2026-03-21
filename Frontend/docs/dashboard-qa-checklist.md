# Dashboard — auditoria e QA manual

Checklist pós-alterações (shell `(dashboard)` + rota `/dashboard`).

## Funcional

- [ ] `/dashboard` abre com abas: Visão geral, Analytics, Projetos, Criar, Chat IA.
- [ ] URL `?tab=generate` e `?tab=generate&type=website` (e outros tipos válidos) abre o gerador com tipo correto.
- [ ] Sidebar: cada link navega para a rota esperada; CTA "Novo projeto" → `?tab=generate`.
- [ ] Botão busca rápida na sidebar abre a command palette (CustomEvent).
- [ ] `Ctrl+K` / `⌘K` abre/fecha a palette; `Esc` fecha; setas e Enter executam comando.
- [ ] Tab dentro da palette mantém foco no diálogo (primeiro/último elemento).
- [ ] Após gerar projeto, a lista atualiza (evento `neurocode:dashboard-refresh`).
- [ ] Erro em `/api/projects` mostra alerta e botão de retry.

## Dados e performance

- [ ] `GET /api/projects?limit=500` usado pelo painel (limite no servidor).
- [ ] Secção Criar: barra de estatísticas usa os mesmos dados que o resto do painel (sem fetch duplicado no `StatsBar`).

## Acessibilidade e i18n

- [ ] Abas: `role="tablist"` / `role="tab"` / `role="tabpanel"` / `aria-controls` / `aria-labelledby`.
- [ ] Command palette: `role="dialog"` / `aria-modal="true"`.
- [ ] Atalho mostrado como `Ctrl+K` em Windows/Linux e `⌘K` em Apple (topbar e sidebar).

## Regressão visual

- [ ] Sidebar colapsável (desktop) e drawer (mobile).
- [ ] Dock de IA minimal (exceto na aba Chat a tempo inteiro).

## Testes automatizados

- `npm run lint` — ESLint.
- `npm run test` — Vitest (inclui `lib/dashboard-parse`, `dashboard-copy`).
- `npm run build` — Next.js produção.

## E2E (opcional)

Playwright não está no projeto por omissão. Para smoke E2E, adicionar `@playwright/test`, configurar `playwright.config.ts` e cenários mínimos em CI.

## Code review (resumo)

- Uma única implementação do painel principal: `DashboardClientV2` + parsers em `lib/dashboard-parse.ts`.
- Parsers testados; helpers de copy testados.
- Webhook/command palette: Enter usa refs para lista e índice selecionado (evita closure obsoleta).
