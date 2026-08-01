# Catálogo visual GEEF

Este catálogo é a referência para criar telas administrativas com a mesma hierarquia, espaçamento e comportamento responsivo.

## Composição padrão de uma tela

1. `AdminHeader`: contexto global e navegação da área.
2. `AdminPageHeader`: título, descrição curta e ação principal.
3. `AdminPanel`: agrupamento de conteúdo com uma responsabilidade.
4. `AdminMetricCard`: resumo numérico ou sinal operacional.
5. Lista/tabela/formulário específico do domínio.

Uma tela deve ter uma ação primária clara. Ações secundárias ficam próximas do conteúdo que afetam; ações destrutivas exigem estado visual próprio e confirmação.

## Catálogo de telas por contexto

| Contexto | Dashboard | Cadastros e operações principais |
| --- | --- | --- |
| Painel | `/admin/painel` | atalhos e indicadores gerais |
| GEEF | `/admin/geef` | instituição, dados, endereço, agenda, departamentos e contas |
| Tarefeiros | `/admin/pessoas/inicio` | pessoas, funções e vínculos |
| Reunião pública | `/admin/reuniao-publica` | avisos, música, leitura, palestra e prece |
| Operação | `/admin/operacao` | escalas, atendimento, biblioteca, livraria, comunicação, estudos, financeiro e relatórios |
| Sistema | `/admin/sistema` | observabilidade, migrações, idiomas e manutenção |

Rotas novas devem pertencer a um contexto existente ou justificar formalmente um novo contexto. Não criar atalhos concorrentes no corpo do dashboard quando a rota já possui submenu.

## Catálogo de componentes

| Componente | Responsabilidade | Local |
| --- | --- | --- |
| `AdminHeader` | shell, contexto e navegação | `components/admin/admin-header.tsx` |
| `AdminSidebar` | navegação lateral e permissões | `components/admin/admin-sidebar.tsx` |
| `AdminPageHeader` | título, descrição e ação principal | `components/admin/ui/admin-page-header.tsx` |
| `AdminPanel` | superfície e agrupamento semântico | `components/admin/ui/admin-panel.tsx` |
| `AdminMetricCard` | indicador compacto | `components/admin/ui/admin-metric-card.tsx` |
| `AdminUserMenu` | identidade e ações da sessão | `components/admin/admin-user-menu.tsx` |
| `AdminModuleGate` | acesso e fallback de módulo | `components/admin/admin-module-gate.tsx` |
| `ConfirmModal` | confirmação de ações destrutivas | `components/ui/confirm-modal.tsx` |

## Regras visuais

- Usar tokens de `styles/identity-system.css`; não introduzir cores locais sem necessidade.
- Manter uma superfície, uma borda e um nível de sombra por grupo.
- Usar `admin-btn-primary` para uma ação principal e `admin-btn-secondary` para alternativas.
- Em telas estreitas, preservar leitura e reduzir ações para ícones com `aria-label` e `title`.
- Não usar tabelas sem estratégia de leitura móvel: colunas prioritárias, ações compactas ou cartões responsivos.
- Validar `npm run gate:responsive-admin` e `npm run gate:comp` antes de concluir uma tela.

## Critério de adoção

Uma tela só entra como padronizada quando usa o shell do contexto, o cabeçalho compartilhado, tokens semânticos, estados de foco/ativo e uma validação responsiva documentada.
