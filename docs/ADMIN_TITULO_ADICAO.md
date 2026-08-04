# Padrão de título e adição no Admin

## Regra

Toda view de listagem, catálogo ou índice que ofereça criação deve usar um cabeçalho compacto com:

- título principal em uma única linha;
- botão de adicionar somente com o ícone `+`;
- título à esquerda e ação à direita, na mesma linha;
- `aria-label` e `title` descritivos no botão;
- ação apontando para a rota de criação da própria área.

O componente compartilhado é `components/admin/admin-page-title-add.tsx`, usando a classe `admin-page-header--title-add`.

## Aplicação em views antigas e novas

- Ao criar uma nova listagem, use `AdminPageTitleAdd` antes da tabela ou dos cards.
- Ao revisar uma listagem antiga, remova kicker, subtítulo operacional e botão textual do cabeçalho quando eles duplicarem a função da tela.
- Estados vazios podem manter uma ação textual contextual dentro do conteúdo, mas o cabeçalho continua usando apenas o ícone.
- Telas de criação, edição e detalhe mantêm `Salvar`, `Cancelar` e ações de estado próprias; esta regra não transforma essas ações em “Adicionar”.
- Não usar a classe em dashboards, filtros, relatórios ou telas sem criação primária.

## Contrato visual

- Não permitir quebra do título: `white-space: nowrap`, com reticências quando necessário.
- Não empilhar o botão no breakpoint responsivo; o cabeçalho continua em duas colunas.
- Preservar foco visível, contraste e área mínima de toque.
