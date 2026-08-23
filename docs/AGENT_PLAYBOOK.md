# Agent Playbook - Site GEEF

## Objetivo

Padronizar como o agente encontra o que alterar, como aplica mudancas e como evita retrabalho.

## Principios de engenharia

- Seguir SOLID de forma pragmatica: responsabilidades pequenas, contratos estaveis e dependencias invertidas quando fizer sentido.
- Documentar sempre que a mudanca alterar regra, contrato, schema, UX ou fluxo operacional.
- Preferir composicao a duplicacao.
- Separar leitura, mutacao, validacao e apresentacao.
- Manter a fonte de verdade no banco quando o dado for compartilhado.
- Validar build e fluxo afetado antes de encerrar.

## Leitura recomendada

1. `agente.md`
2. `HANDOFF.md`
3. `docs/MODULE_MAP.md`
4. `docs/MCP_SUPABASE_GEEF.md` quando a tarefa envolver MCP do Supabase
5. `docs/HYBRID_CODEX_WORKER.md` quando a tarefa envolver testes/builds na
   homelab ou a futura ponte MCP híbrida
6. O arquivo do modulo alvo

## Procedimento padrao para mudancas visuais

1. Identificar o tipo de pagina: publica, auth, dashboard ou modulo interno.
2. Localizar o layout compartilhado antes da tela individual.
3. Reusar tokens e classes existentes.
4. Ajustar em ordem: header, hero, cards, tabela, formulario, footer.
5. Nao criar um segundo sistema visual concorrente.
6. Validar contraste, densidade e mobile.
7. Confirmar com `npm run build`.

## Procedimento padrao para Supabase

1. Definir se a leitura depende de sessao.
2. Se depender de sessao, usar `lib/supabase/server.ts`.
3. Se for leitura pesada de admin ou publico derivado, usar `lib/supabase/service-role.ts` com cache curto.
4. Invalida por tag e path no modulo que escreve.
5. Nao invalidar em getters.
6. Nao usar `service-role` em client components.
7. Se o MCP do projeto falhar, verificar `codex mcp list` e reautenticar `supabase-geef` antes de alterar o repo.

## Procedimento padrao para cache

- Criar helper em `lib/` para dado compartilhado.
- Usar `unstable_cache` com `revalidate` curto.
- Definir uma tag por dominio.
- Expor funcoes de invalida em `lib/admin/cache.ts` ou no dominio certo.
- Se uma rota de admin precisar variar muito, marcar o segmento como `force-dynamic`.

## Regras de visual do GEEF

- Um hero forte por pagina.
- Um CTA principal e um secundario.
- Cards claros, com uma familia de cor.
- Menus desktop devem ficar visiveis.
- Logo precisa ser legivel como marca, nao como icone.
- Roxo e verde sao acentos, nao fundos aleatorios.
- Em tema claro, evitar branco puro em blocos grandes.

## Onde cada coisa vive

### Shell publico

- `components/site-shell.tsx`
- `components/site-header.tsx`
- `components/content-page.tsx`
- `components/user-menu.tsx`

### ERP

- `app/admin/layout.tsx`
- `components/admin/admin-header.tsx`
- `components/admin/admin-sidebar.tsx`
- `styles/admin.css`
- `styles/admin-sidebar.css`

### Cache e invalida

- `lib/admin/cache.ts`
- `lib/escalas/public-escalas.ts`
- `lib/areas/user-area.ts`
- `lib/areas/invalidate-user-area.ts`

### Supabase

- `lib/supabase/server.ts`
- `lib/supabase/service-role.ts`
- `lib/supabase/client.ts`

## Modulos com dono claro

| Modulo | Entrada principal | Leitura cacheada | Escrita invalida |
| --- | --- | --- | --- |
| Dashboard | `app/admin/page.tsx` | `lib/admin/dashboard.ts` | `pessoas`, `funcoes`, `escalas` |
| Biblioteca | `app/admin/biblioteca/page.tsx` | `app/admin/biblioteca/actions.ts` | obras, emprestimos, reservas |
| Documentos | `app/admin/documentos/page.tsx` | `app/admin/documentos/actions.ts` | modelos, termos, consentimentos, voluntariado |
| Area do usuario | `app/minha-area/page.tsx` | `lib/areas/user-area.ts` | login, pessoas, biblioteca, documentos, escalas |
| Escalas publicas | `app/escalas/page.tsx` | `lib/escalas/public-escalas.ts` | `app/admin/escalas/actions.ts` |

## Regra de segurança

- Nunca expor `service_role` no browser.
- Nunca cachear dado que precise de sessao para autorizar.
- Se o dado for sensivel, preferir runtime dinamico e leitura server-side.
