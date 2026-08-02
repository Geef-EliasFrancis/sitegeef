# Padrões de views administrativas

## Cabeçalho de tela

- Cada tela deve ter uma hierarquia única: contexto curto, título, descrição breve e uma ação principal.
- O cabeçalho deve usar `area-hero` e `area-hero-top` para manter espaçamento, borda e raio consistentes.
- A ação principal fica alinhada ao título e não deve competir com outras ações no primeiro bloco.

## Ações

- Criação de registros usa `admin-btn admin-btn-primary admin-icon-action` quando o contexto já deixa a ação evidente.
- Botões de ícone devem ter sempre `aria-label` e `title`; o ícone não substitui a acessibilidade textual.
- Use `IconPlus` para criação, mantendo o mesmo tamanho e área de toque em desktop e mobile.
- Ações secundárias ficam na listagem ou no formulário, não no hero.

## Conteúdo

- O hero não recebe cards de estatísticas misturados ao título.
- Resumos e indicadores ficam em uma seção posterior (`stat-grid`), quando forem necessários.
- Listas usam `table-surface`; estados vazios devem oferecer uma única ação clara.
- Antes de concluir uma view, validar desktop, tablet e mobile, incluindo foco, contraste, overflow e estado vazio.
