# Padrão responsivo do shell administrativo

## Contrato

O shell administrativo usa três faixas de comportamento:

| Faixa | Header | Menu lateral | Regra principal |
| --- | --- | --- | --- |
| `>= 1024px` | uma linha | rail visível | navegação e conteúdo lado a lado |
| `768–1023px` | uma linha compacta | rail visível | abas distribuídas, sem quebra de linha |
| `<= 767px` | blocos empilhados | drawer com botão acessível | abas em uma faixa horizontal rolável |

## Regras que não podem regredir

- `.admin-shell-tabs` nunca usa `flex-wrap: wrap`.
- Entre 768px e 1023px, o header usa duas colunas: navegação e usuário.
- Entre 768px e 1023px, `.admin-navigation` permanece visível e ocupa uma coluna real.
- O drawer só é permitido até 767px e precisa manter botão, `aria-expanded`, `aria-controls` e scrim.
- `.admin-main` mantém `min-width: 0`, evitando empurrar o rail ou criar overflow horizontal.
- Toda entrega deve validar pelo menos `1440x900`, `1024x768`, `900x900`, `768x1024` e `390x844`.

## Telas mínimas

O gate composto deve verificar o shell nas rotas `/admin/painel`, `/admin/reuniao-publica`, `/admin/escalas` e `/admin/financeiro`. Para rotas protegidas, forneça `COMP_GATE_STORAGE_STATE` com uma sessão de teste autenticada.
