# GUIAS DO PROJETO

## Comece aqui

1. [`README_HANDOFF.md`](README_HANDOFF.md) - porta de entrada com escolha de caminho
2. [`CONTINUATION_GUIDE.md`](CONTINUATION_GUIDE.md) - estado atual e próximos passos
3. [`QUICK_REFERENCE.md`](QUICK_REFERENCE.md) - resumo rápido
4. [`AGENT_GUIDE.md`](AGENT_GUIDE.md) - detalhes técnicos para agentes
5. [`CLAUDE.md`](CLAUDE.md) - regras e contexto geral do projeto

## Estado atual

- `npm run type-check` ✅
- `npm run build` ✅
- `npm run test` ✅
- `npm run lint` ✅ com warnings legados, sem erros

## O que ainda faz sentido fazer

### Opção A: Visual Testing

Use esta opção se quiser revisar o comportamento real no navegador:
- navegar nas telas principais
- testar light/dark mode
- validar responsividade em desktop e mobile
- confirmar menus, formulários e exibições públicas

### Opção B: Ship Ready

Use esta opção se quiser apenas confirmar que a base está pronta:
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm run test`

### Opção C: Encerrar

Se não houver nova mudança pendente, o projeto já está validado para seguir sem mais refatoração imediata.

## Documentos de apoio

- [`HANDOFF.md`](HANDOFF.md) - ponte curta para o estado atual
- [`CONTINUATION_GUIDE.md`](CONTINUATION_GUIDE.md) - guia atual de continuação
- [`docs/DARK_MODE_AUDIT_2026_05_31.md`](docs/DARK_MODE_AUDIT_2026_05_31.md) - auditoria registrada

## Observação

Os guias antigos de backlog devem ser tratados como histórico. Se aparecer divergência entre documentos, a referência atual é `CONTINUATION_GUIDE.md`.
