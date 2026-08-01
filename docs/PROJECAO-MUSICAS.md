# Projeção de músicas

## Objetivo

A rota `/musicas/exibir` é uma tela de apresentação, não uma página comum. O conteúdo deve permanecer dentro da viewport, ocupar a área útil e manter leitura nítida em projetores e janelas com proporções diferentes.

## Decisões técnicas

- O quadro da projeção é fixo na viewport (`position: fixed`, `100vh`) para evitar mudanças de layout provocadas por barras de rolagem ou pela altura dinâmica do navegador.
- O cabeçalho não possui mensagem promocional. Ele contém apenas título, autor e logo, liberando altura para a letra.
- A letra usa CSS Grid com quantidade de colunas e linhas calculadas no componente. Isso evita o rebalanceamento imprevisível de `column-fill: balance`.
- O preenchimento da grade é vertical por coluna, mantendo a ordem dos blocos previsível.
- A escala é determinística e baseada somente na viewport e na densidade do conteúdo. O layout não mede o próprio conteúdo nem usa `ResizeObserver`, evitando ciclos de realimentação e tremores.
- A atualização da sessão ao vivo ocorre no máximo uma vez por minuto e só substitui o estado quando a música realmente mudou.
- A composição evita animações e transições na rota de projeção.

## Referências consultadas

- MDN, [CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries): dimensionar componentes pelo contêiner, em vez de depender apenas da viewport.
- MDN, [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit): princípio de preservar proporção ao ajustar conteúdo a uma área.
- MDN, [Aspect-ratio](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_sizing/Aspect_ratios): reservar e controlar proporções para evitar mudanças de layout.
- MDN, [Responsive Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design): tipografia fluida e adaptação ao espaço disponível.
- W3C, [CSS Grid Layout](https://www.w3.org/TR/css-grid/): grade explícita e previsível para organizar conteúdo em duas dimensões.

## Validação mínima

Validar a rota em 1920×1080, 1366×768, 1280×720, 1024×600, 844×390 e 390×844. Para cada viewport, verificar:

1. Não existe overflow horizontal ou vertical.
2. O último bloco permanece dentro da viewport.
3. A ordem dos blocos permanece previsível.
4. O texto não sofre alternância visual depois da abertura.
5. Os comandos continuam acessíveis sem ocupar a área principal da música.
