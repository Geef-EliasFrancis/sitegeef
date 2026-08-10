# Plano de cadastro de tarefeiros, funções e escalas

## Objetivo

Organizar o cadastro operacional do GEEF a partir de um cadastro único de
pessoas e evoluir, em etapas, até a geração assistida de escalas de reuniões,
aplicadores de passe e palestras.

O fluxo principal será:

`allowlist → pessoa → vínculo de tarefeiro → funções Sim/Não → disponibilidade → escala → revisão → publicação`

O cadastro de palestrantes externos será um fluxo complementar para registrar
palestras sem obrigar o convidado a possuir um cadastro completo no GEEF.

## Princípios de organização

- `pessoas` é o cadastro-base e não deve ser duplicado por função.
- `pessoa_vinculos` continua sendo a fonte do vínculo `tarefeiro`.
- Função operacional de escala não é perfil de acesso ao sistema.
- O catálogo de funções deve ser editável e não depender de nomes fixos no
  código.
- A permissão de exercer uma função deve ser explícita: `Sim` ou `Não`.
- Uma escala automática sempre gera uma sugestão para revisão; não publica
  diretamente.
- Escolhas manuais, substituições e exceções devem ser preservadas no
  histórico.
- A disponibilidade é uma informação para seleção e não substitui a decisão
  da coordenação.

## Escopo da primeira etapa: cadastro de tarefeiros

### 1. Cadastro-base da pessoa

Usar o cadastro existente de pessoas, com os dados necessários para a operação:

- nome completo e nome social;
- telefone, WhatsApp e e-mail;
- cidade e demais dados de contato;
- status da pessoa: ativa, afastada ou inativa;
- observações;
- autorização para notificações, quando aplicável.

O cadastro só poderá ser criado para pessoas autorizadas pela allowlist,
conforme as regras de acesso do projeto.

### 2. Ativação do vínculo de tarefeiro

Na ficha da pessoa, a coordenação poderá:

- ativar o vínculo `tarefeiro`;
- informar a data de início;
- suspender ou encerrar o vínculo;
- registrar observações da coordenação.

Pessoa inativa, afastada ou sem vínculo de tarefeiro não poderá ser sugerida
automaticamente para uma escala.

### 3. Matriz de funções

O cadastro do tarefeiro exibirá uma matriz editável de funções:

| Função inicial | Habilitado |
|---|---|
| Recepção | Sim/Não |
| Dirigente | Sim/Não |
| Apoio | Sim/Não |
| Paginista | Sim/Não |
| Prece inicial | Sim/Não |
| Prece final | Sim/Não |
| Aplicador de passe | Sim/Não |

Novas funções poderão ser cadastradas posteriormente sem alteração de código.
Cada habilitação poderá conter período de validade, prioridade e observação.

Modelo lógico recomendado:

```text
 tarefeiro_funcoes
 - pessoa_id
 - funcao_id
 - habilitado
 - prioridade
 - desde
 - ate
 - observacao
```

O valor `habilitado` será apresentado como Sim/Não na interface. A função
continua no catálogo mesmo quando estiver marcada como Não para determinada
pessoa.

### 4. Disponibilidade semanal

Manter a disponibilidade por dia da semana, com domingo igual a `0` e sábado
igual a `6`:

- disponível ou indisponível;
- horário inicial e final, quando necessário;
- observação.

Ausência de registro significa “não informado”. Não deve ser interpretada
automaticamente como indisponibilidade.

## Etapas posteriores de implementação

### Etapa 2 — Catálogo de funções

Organizar `/admin/funcoes` para permitir:

- cadastrar função;
- editar nome e descrição;
- ativar ou arquivar função;
- definir ordem de exibição;
- indicar se a função pode participar de escalas;
- evitar nomes duplicados.

Funções operacionais, cargos institucionais e perfis de acesso devem continuar
separados.

### Etapa 3 — Escala de reuniões

Evoluir a escala mensal para o formato operacional:

```text
Data | Dia | Recepção | Dirigente | Apoio | Paginista | Prece inicial | Prece final
```

Funcionalidades:

- selecionar mês e ano;
- criar as datas das reuniões;
- atribuir uma pessoa por função;
- filtrar pessoas habilitadas;
- destacar indisponibilidade;
- copiar a escala anterior;
- fixar escolhas manuais;
- registrar substituto;
- confirmar, publicar e imprimir.

### Etapa 4 — Geração automática de escala

O gerador deverá considerar, nesta ordem:

1. pessoa ativa e com vínculo de tarefeiro;
2. função habilitada como `Sim`;
3. disponibilidade para a data e horário;
4. ausência de conflito com outras escalas;
5. menor quantidade de participações no período;
6. ausência de repetição desnecessária em semanas consecutivas;
7. prioridades ou bloqueios configurados pela coordenação.

O resultado será uma sugestão com justificativa por função. Funções sem
candidatos serão apresentadas como pendências, sem preenchimento artificial.

A coordenação poderá alterar a sugestão, bloquear uma atribuição e gerar
novamente as demais posições sem perder as decisões manuais.

### Etapa 5 — Escala de aplicadores de passe

Criar uma escala própria, utilizando o mesmo cadastro de pessoas, funções,
disponibilidade e controle de conflitos.

Para cada data, a coordenação informará a quantidade necessária de aplicadores.
O sorteio controlado deverá:

- selecionar somente pessoas com `Aplicador de passe = Sim`;
- excluir pessoas indisponíveis ou já ocupadas no mesmo horário;
- priorizar quem participou menos no período;
- sortear entre candidatos empatados;
- permitir fixar ou excluir pessoas;
- permitir novo sorteio;
- registrar resultado, data, critérios e responsável.

O sorteio nunca deverá substituir uma atribuição manual sem confirmação.

### Etapa 6 — Conflitos entre escalas

Todas as escalas devem consultar os compromissos da pessoa no mesmo dia e
horário. O sistema deverá alertar, por exemplo, quando alguém estiver como
dirigente da reunião e aplicador de passe no mesmo horário.

Os conflitos devem considerar:

- reunião pública;
- aplicadores de passe;
- outras escalas operacionais futuras;
- indisponibilidade cadastrada;
- duplicidade da mesma função na mesma reunião.

Exceções autorizadas pela coordenação devem ficar registradas, sem serem
tratadas como ausência de conflito.

### Etapa 7 — Palestrantes externos e palestras

Criar um cadastro simplificado de palestrantes externos com:

- nome;
- cidade e estado;
- instituição ou centro espírita;
- telefone, WhatsApp e e-mail;
- observações;
- status ativo ou inativo.

Quando o expositor já for uma pessoa do GEEF, o cadastro simplificado poderá
ser vinculado a `pessoas`. Quando for externo, o registro usará diretamente
`palestrantes`, sem criar uma pessoa operacional.

O registro da palestra deverá conter:

- data;
- expositor;
- cidade e instituição;
- tema;
- tipo de palestra;
- observações no cadastro do palestrante.

## Modelo de domínio resumido

```text
pessoas
  └── pessoa_vinculos (tarefeiro)
        ├── tarefeiro_funcoes (Sim/Não por função)
        └── tarefeiro_disponibilidades (por dia da semana)

escalas_mensais
  └── reunioes
        ├── escala_funcoes
        └── escala_passe

pessoas ───────────────┐
                       ├── palestrantes ── escala_palestras
palestrantes externos ─┘
```

## Critérios de aceite do fluxo completo

- Uma pessoa é cadastrada uma única vez.
- O vínculo de tarefeiro pode ser ativado ou encerrado.
- Cada função aparece como Sim/Não no cadastro do tarefeiro.
- Novas funções podem ser incluídas pelo administrador.
- A disponibilidade é consultada na sugestão de escala.
- A escala automática não usa pessoa inativa ou função não habilitada.
- O sorteio de passe respeita a quantidade solicitada.
- O sorteio evita conflitos com outras escalas.
- A coordenação consegue revisar e alterar a sugestão.
- Substituições e exceções mantêm histórico.
- Palestrantes externos podem ser cadastrados e usados em palestras sem
  cadastro completo de pessoa.
- Uma palestra pode reutilizar o mesmo cadastro de palestrante em várias
  reuniões.
- Somente escalas confirmadas e publicadas aparecem em áreas públicas.

## Ordem de commits e validação

Cada etapa lógica deve ter seu próprio commit:

1. documentação e nomenclatura do fluxo;
2. catálogo editável de funções;
3. matriz de funções do tarefeiro;
4. disponibilidade e bloqueios;
5. escala mensal manual;
6. geração automática;
7. sorteio dos aplicadores de passe;
8. conflitos, substituições e histórico;
9. cadastro de palestrantes externos e palestras;
10. publicação, impressão e relatórios.

Antes de avançar para a etapa seguinte, validar:

- `npm run type-check`;
- testes ou gates relacionados ao módulo;
- permissões e RLS;
- fluxo autenticado de cadastro;
- responsividade desktop, tablet e celular;
- status do worktree e commit da etapa.

## Situação e próximos passos

Até aqui foram implementados e validados localmente o catálogo escalável, a
matriz Sim/Não de funções, os bloqueios de disponibilidade, a sugestão
automática, o sorteio de aplicadores de passe e o cadastro/registro de
palestrantes. As migrations dessas etapas de tarefeiros, funções, passe,
palestrantes e histórico já estão aplicadas no Supabase GEEF, com checkpoints
registrados no manifesto.

A tela de escala também passou a exibir alertas de conflito quando a mesma
pessoa aparece em mais de um compromisso na mesma data, inclusive em outra
escala mensal.

Também foi incluído o histórico de alterações das funções da escala: cada
troca de titular ou substituto registra os valores anterior e novo, o motivo,
o responsável autenticado e a data. A tela da escala exibe esse histórico para
a revisão da coordenação. A edição e remoção de palestras já estão disponíveis
na própria escala. Alterações de aplicadores de passe também registram pessoa,
posição, motivo, responsável e data.

O próximo bloco é validar o fluxo autenticado no navegador, incluindo a
edição/remoção de palestra, alertas de conflito e histórico de substituições.

As migrations de vínculos, disponibilidade e histórico de substituições foram
comparadas com o histórico do Supabase GEEF e aplicadas após a validação do
ambiente correto. A prova estrutural local, a prova no banco remoto e a
validação autenticada do formulário continuam registradas separadamente.
