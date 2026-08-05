# Fluxo vertical de tarefeiros

## Objetivo

Fechar o fluxo operacional:

`allowlist → cadastro do tarefeiro → vínculo com função → disponibilidade/escala → relatório`

## Fases

1. Allowlist e cadastro base de pessoas: existente; precisa de validação autenticada.
2. Disponibilidade recorrente: tabela `tarefeiro_disponibilidades`, formulário semanal e leitura no cadastro.
3. Escala: restringir candidatos a pessoas ativas com vínculo `tarefeiro` e sinalizar disponibilidade para a data da reunião.
4. Relatório: listar tarefeiros ativos, funções, disponibilidade configurada e quantidade de escalas.

## Decisões

- A disponibilidade é semanal, por dia da semana (`0` domingo até `6` sábado).
- Ausência de registros significa “não informado”, não indisponibilidade automática.
- A tabela mantém horários opcionais e uma observação por dia.
- O vínculo `tarefeiro` continua em `pessoa_vinculos`; não será criada uma entidade duplicada.

## Bloqueios conhecidos

- A nova migration ainda precisa ser comparada e aplicada no Supabase GEEF antes da validação remota.
- O fluxo autenticado de criação precisa ser exercitado com uma autorização ativa da allowlist.
