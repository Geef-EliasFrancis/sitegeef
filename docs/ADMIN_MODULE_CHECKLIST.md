# Checklist Padrão - Novo Módulo Admin

Use este checklist antes de considerar um módulo admin pronto.

## Estrutura

- [ ] Existe `app/admin/<modulo>/page.tsx` para listagem
- [ ] Existe `app/admin/<modulo>/novo/page.tsx` para criação
- [ ] Existe `app/admin/<modulo>/[id]/page.tsx` para edição/detalhe
- [ ] Existe `app/admin/<modulo>/actions.ts` para server actions
- [ ] O `metadata.title` está consistente nas páginas

## Dados e ações

- [ ] As queries usam o cliente Supabase correto
- [ ] Leituras retornam `[]` ou `null` em falha esperada
- [ ] Actions de mutação não lançam exception em erro esperado do Supabase
- [ ] Mutations retornam `success: false` quando não completam
- [ ] Há invalidação de cache/revalidatePath após salvar
- [ ] O contrato de retorno bate com a página que consome a action

## Segurança e acesso

- [ ] O módulo respeita permissões do admin
- [ ] O acesso direto por URL não derruba a aplicação
- [ ] O layout do módulo lida com ausência de dados sem overlay
- [ ] O menu mostra/oculta o módulo conforme a permissão esperada

## UX e layout

- [ ] Views de listagem com criação usam o padrão documentado em `docs/ADMIN_TITULO_ADICAO.md`
- [ ] Desktop não fica travado em largura fixa
- [ ] Mobile mantém formulário navegável
- [ ] Botões de ação ficam visíveis sem scroll excessivo
- [ ] Em telas com abas, `Salvar` e `Cancelar` ficam no cabeçalho e acionam o form da aba ativa
- [ ] Não existem CTAs duplicados no rodapé de cada aba/painel quando o cabeçalho já resolve a ação
- [ ] Após salvar, a tela mostra aviso curto de sucesso ou erro
- [ ] Feedback de sucesso, erro, validação e sessão segue a skill `notificacoes-timers-avisos`
- [ ] Relatórios e painéis seguem a skill `relatorios-geef` quando a tela for analítica
- [ ] Estados vazios e erro têm copy curta e funcional

## Validação

- [ ] `npm run build` passou
- [ ] `npm run test:admin-smoke` passou
- [ ] `npm run skills:health` respondeu OK, se o Autoreflex estiver rodando
- [ ] A rota principal do módulo abriu sem overlay no browser

## Ordem de referência

1. `skills/padrao-modulo-admin.md`
2. `skills/padrao-actions-ts.md`
3. `skills/supabase-patterns.md`
4. `skills/auth-permissions.md`
5. `skills/notificacoes-timers-avisos.md` quando a tela precisar de feedback, validação ou aviso de sessão
6. `skills/relatorios-geef.md` quando o módulo for analítico, de KPI, dashboard ou exportação
7. `skills/livraria-biblioteca-hibrida.md` quando o módulo for de catálogo, exemplares, venda ou empréstimo de livros
8. `skills/migrations-workflow.md` quando houver schema
9. `skills/roteamento-operacional-autoreflex.md` para decidir a skill certa antes de criar nova tela
