# Plano de agenda recorrente e funções da reunião

## Objetivo

Transformar a agenda em uma fonte de compromissos da casa, com repetição semanal configurável, sem misturar:

- compromisso de agenda;
- aviso/comunicado;
- escala operacional;
- leitura pública ou catálogo de biblioteca.

O primeiro caso de uso é registrar a reunião pública e a evangelização como compromissos semanais. O compromisso deve aparecer na agenda com título, dia, horário e uma marca visual de repetição.

## Modelo de domínio

### Compromisso recorrente

Criar uma entidade própria `agenda_compromissos` para o modelo da atividade:

- `id`;
- `titulo`;
- `descricao`;
- `categoria` (`reuniao_publica`, `evangelizacao`, `estudo`, `atendimento`, `outro`);
- `recorrencia` (`unica`, `semanal`, futuramente `quinzenal` e `mensal`);
- `dia_semana`;
- `hora_inicio` e `hora_fim`;
- `data_inicio` e `data_fim` opcional;
- `ativo`;
- `publicado`;
- auditoria (`criado_por`, `criado_em`, `atualizado_em`).

A recorrência é um modelo, não uma cópia de cada semana. As ocorrências devem ser calculadas para o período visualizado e não persistidas em massa.

### Detalhes expansíveis

O cartão da agenda começa compacto. Ao clicar no compromisso, abre os detalhes da ocorrência ou do modelo:

- nome da palestra;
- palestrante/expositor;
- tema doutrinário;
- observações;
- links de apoio;
- situação da atividade.

Esses dados devem ficar em uma estrutura própria de detalhes ou em uma tabela de ocorrência, evitando um `jsonb` sem contrato para dados que serão pesquisados e escalados.

### Funções dos tarefeiros

Depois do cadastro recorrente, criar o planejamento operacional por ocorrência:

- `agenda_compromisso_funcoes` ou vínculo equivalente à ocorrência da escala;
- `funcao_id`;
- `pessoa_id`;
- data/ocorrência;
- situação (`previsto`, `confirmado`, `substituido`, `cancelado`);
- observação.

Funções iniciais da reunião pública:

- prece inicial;
- harmonização/oração inicial;
- dirigente;
- apoio;
- leitura;
- palestra;
- prece final;
- passe espiritual;
- acolhimento/recepção.

O vínculo deve reutilizar o cadastro de funções e pessoas existente, sem criar nomes livres duplicados. A escala mensal continua sendo a visão operacional publicada; a agenda recorrente é a origem do compromisso.

## Etapas de implementação

### Fase 1 — compromisso recorrente

1. Criar migração e tipos para `agenda_compromissos`.
2. Criar repository e actions autorizadas no contexto `GEEF > Agenda`.
3. Criar cadastro compacto com opção “Repetir semanalmente”.
4. Criar lista administrativa com ativar, editar e arquivar.
5. Adaptar a agenda pública para gerar ocorrências do intervalo visível.
6. Migrar os dados fixos atuais de reunião pública e evangelização sem duplicar eventos existentes.

Critério de aceite: marcar “repetir semanalmente” gera o compromisso em todas as quintas-feiras configuradas, com horário correto e sem criar 52 registros físicos.

### Fase 2 — detalhes da atividade

1. Adicionar expansão no cartão da agenda.
2. Permitir editar o tema e o expositor da ocorrência.
3. Separar dados do modelo semanal de exceções de uma data específica.
4. Exibir detalhes no site público somente quando publicados.

Critério de aceite: uma palestra pode ter tema e palestrante diferentes em uma data sem alterar todas as quintas-feiras.

### Fase 3 — tarefeiros e funções

1. Normalizar as funções da casa no cadastro de funções.
2. Criar alocação por ocorrência da reunião.
3. Permitir copiar a escala da semana anterior.
4. Permitir substituir pessoa sem apagar o histórico.
5. Exibir conflitos de uma pessoa em dois compromissos no mesmo horário.
6. Publicar apenas escala confirmada na área pública quando aplicável.

Critério de aceite: a coordenação consegue atribuir prece, palestra, dirigente e apoio para cada quinta-feira, visualizar faltas e registrar substituições.

## Regras de não duplicação

- Avisos da reunião continuam em `reuniao_publica_avisos` e não representam compromissos.
- A agenda não deve importar avisos como eventos recorrentes.
- `reunioes` e `escala_funcoes` existentes devem ser preservados durante a transição.
- Um compromisso recorrente não pode gerar uma segunda ocorrência para a mesma data, categoria e origem.
- Exceções de uma data devem sobrescrever o modelo apenas naquela data.

## Gates de entrega

### Dados e segurança

- migração local validada e aplicada somente após aprovação explícita;
- RLS e leitura pública limitada a compromissos publicados;
- actions protegidas por permissão do contexto;
- datas e horários tratados sem conversão UTC indevida;
- nenhuma duplicação entre agenda, avisos e escalas.

### Funcionalidade

- cadastro único e repetição semanal;
- edição e arquivamento;
- ocorrência visível na semana e no mês;
- expansão de detalhes;
- exceção de uma data;
- alocação de tarefeiros;
- substituição e conflito de horário.

### Visual e responsividade

- agenda desktop horizontal e legível;
- agenda móvel sem overflow horizontal;
- compromisso compacto no estado fechado;
- indicação clara de repetição e estado ativo;
- detalhe acessível por teclado e leitor de tela.

### Validação

- `npm run type-check`;
- `npm run gate:comp`;
- `npm run gate:agenda`;
- smoke da rota pública e da rota administrativa;
- validação visual em desktop, tablet e 390x844;
- commit lógico por fase.

## Decisão inicial

Implementar primeiro somente a Fase 1. A tela de funções dos tarefeiros deve entrar depois que o modelo de ocorrência estiver estável; assim a escala não fica amarrada apenas ao modelo semanal e permite exceções reais por data.
