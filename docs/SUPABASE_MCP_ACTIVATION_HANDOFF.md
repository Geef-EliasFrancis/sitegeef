# Handoff — ativação completa do MCP Supabase GEEF

## Objetivo da próxima sessão

Ativar e comprovar o MCP isolado `supabase-geef` para o projeto Supabase `nycgpokqlmrfzegjlrwa`, mantendo leitura, diagnóstico e alterações de schema sob gates seguros. A sessão só estará pronta quando uma ferramenta MCP do Supabase fizer uma leitura real no projeto correto.

## Estado verificado em 2026-08-01

- `.mcp.json` aponta para `https://mcp.supabase.com/mcp?project_ref=nycgpokqlmrfzegjlrwa`.
- `.claude/settings.json` habilita `supabase-geef`.
- `codex mcp get supabase-geef` informa `enabled: true` e OAuth.
- A Supabase CLI está autenticada e lista o projeto `sitegeef` com o ref correto.
- O checkout ainda não está vinculado pela CLI (`supabase/.temp/project-ref` ausente).
- Esta sessão não recebeu ferramentas MCP do Supabase; após OAuth é obrigatório reiniciar o Codex.
- Há credencial de service role em arquivo local ignorado pelo Git. Como ela apareceu durante diagnóstico, deve ser rotacionada antes de qualquer uso administrativo.
- Uma service role também estava hardcoded no histórico de `deploy.sh`; o arquivo atual foi saneado, mas a rotação continua obrigatória e o histórico remoto deve ser tratado como comprometido.

## Regra de segurança obrigatória

1. Usar somente `supabase-geef`. Não usar MCP genérico e não usar `supabase-vale-das-frutas`.
2. Confirmar o project ref `nycgpokqlmrfzegjlrwa` antes de toda ação remota.
3. Nunca imprimir, colar em chat, commitar ou passar por argumento de shell chaves, tokens ou URLs de banco com senha.
4. Service role somente no servidor. Navegador usa exclusivamente `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Não aplicar migration, SQL de escrita ou ajuste de RLS antes dos gates de leitura e histórico.

## Início rápido — próxima sessão

Na raiz `C:\Projetos\site-geef`:

```powershell
npm run mcp:supabase:gate
codex mcp login supabase-geef
```

Concluir o OAuth no navegador. Em seguida, **encerrar e reabrir o Codex no mesmo diretório**. A descoberta das ferramentas ocorre na inicialização da sessão; continuar na sessão antiga pode manter o MCP invisível.

Na sessão nova:

```powershell
npm run mcp:supabase:gate
```

Depois pedir ao agente:

> Use somente o MCP `supabase-geef`. Confirme o project ref `nycgpokqlmrfzegjlrwa`, faça uma leitura sem mutação das tabelas/migrations e execute os gates do handoff. Não aplique alterações.

## Fase 0 — rotação e configuração de segredos

Esta fase exige uma única interação no Dashboard Supabase.

1. Abrir o projeto `sitegeef` e rotacionar a chave de service role que estava salva localmente.
2. Atualizar o secret manager/ambiente de deploy.
3. Atualizar apenas `.env.local` no computador, nunca `.env.supabase` como fonte permanente.
4. Confirmar estes nomes, sem exibir valores:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
```

5. Apagar a credencial antiga dos locais externos onde tiver sido copiada.
6. Provisionar `.env.local` diretamente no servidor/secret manager; `deploy.sh` não cria mais segredos.
7. Avaliar a limpeza do histórico Git em uma janela coordenada. A rotação é obrigatória mesmo que o histórico seja limpo.
8. Rodar `npm run mcp:supabase:gate:strict` depois da rotação e do vínculo da CLI.

## Fase 1 — gates locais de configuração

Comando:

```powershell
npm run mcp:supabase:gate
```

O gate verifica sem revelar segredos:

- `.mcp.json` válido e URL exata;
- permissão local do servidor;
- registro, habilitação e OAuth no Codex;
- autenticação da CLI na conta que contém o projeto;
- vínculo local da CLI;
- presença dos nomes de variáveis necessários.
- arquivos de segredo ignorados e ausência de JWT versionado.

Avisos permitem continuar no modo normal; `:strict` transforma avisos em bloqueios.

## Fase 2 — vínculo da CLI

O vínculo não ativa o MCP, mas é necessário para `db status`, diff, pull e push controlados.

```powershell
npx supabase link --project-ref nycgpokqlmrfzegjlrwa
npx supabase migration list --linked
npm run mcp:supabase:gate:strict
```

Para executar o gate estrito junto com TypeScript e testes:

```powershell
npm run mcp:supabase:ready
```

Se pedir senha do banco, informar interativamente. Nunca salvá-la no repositório ou histórico do terminal.

Antes de qualquer `db push`, comparar a lista remota com `docs/SUPABASE_MIGRATION_MAP.md`. Divergência de histórico é bloqueio; não usar `migration repair` automaticamente.

## Fase 3 — prova real do MCP após reinício

O gate local não comprova que as ferramentas foram injetadas na conversa. A sessão nova deve executar via MCP, em modo somente leitura:

1. Listar as ferramentas/recursos disponíveis e localizar as provenientes de `supabase-geef`.
2. Consultar metadados do projeto e confirmar o ref `nycgpokqlmrfzegjlrwa`.
3. Listar tabelas do schema `public`.
4. Listar migrations ou executar uma consulta de metadados sem mutação.
5. Registrar o resultado sem copiar dados pessoais ou segredos.

Critério de aprovação:

- ferramenta MCP realmente chamada;
- resposta válida do projeto correto;
- nenhuma mutação;
- nenhuma credencial exibida;
- CLI e MCP convergem para o mesmo project ref.

## Fase 4 — gates antes de escrita

Antes de migration, RLS ou dados administrativos:

```powershell
git status --short
npm run type-check
npm test
npx supabase migration list --linked
```

Além disso:

1. Ler a documentação do módulo e a migration proposta.
2. Confirmar que o worktree não mistura alterações de outra tarefa.
3. Fazer leitura MCP do estado remoto afetado.
4. Preparar migration idempotente e reversível quando possível.
5. Aplicar uma única migration por vez.
6. Para queries novas, revisar índices, plano de execução e volume esperado.
7. Para RLS, testar usuário permitido, usuário negado e service role separadamente.
8. Para conexões diretas, preferir pooler no runtime serverless e evitar abrir conexão por requisição.
9. Repetir leitura remota e testes funcionais.
10. Só então criar commit lógico. Não fazer push sem solicitação.

## Matriz de diagnóstico

| Sintoma | Camada provável | Diagnóstico | Correção |
|---|---|---|---|
| `supabase-geef` não aparece em `codex mcp list` | configuração Codex | conferir `.mcp.json` e `codex mcp get` | registrar novamente a URL exata e reabrir o Codex |
| aparece, mas não há ferramenta na sessão | descoberta da sessão | OAuth pode estar válido, mas sessão é antiga | `codex mcp login supabase-geef`, fechar e reabrir Codex |
| `OAuth token refresh failed` | OAuth | token expirado/revogado | refazer login; não alterar URL nem repo |
| `Failed to parse server response` | transporte/auth | testar novamente após login e reinício | confirmar endpoint e versão do Codex; preservar project ref |
| CLI não lista o projeto | conta/token CLI | `npx supabase projects list` | `npx supabase login` com a conta correta |
| `Cannot find project ref` | link local | verificar `supabase/.temp/project-ref` | `npx supabase link --project-ref nycgpokqlmrfzegjlrwa` |
| leitura retorna `permission denied` | escopo/RLS | comparar usuário, policy e tipo de cliente | usar server client com sessão; service role apenas se autorizado |
| leitura retorna zero linhas | RLS ou filtro | confirmar `auth.getUser()` e policies | testar metadados e usuário correto antes de mudar RLS |
| conexão direta ao DB falha | rede/DNS/IPv6/pooler | não presumir falha do MCP | preferir MCP/Management API; diagnosticar host separadamente |
| migration local diverge do remoto | histórico | `migration list --linked` + mapa local | parar; reconciliar manualmente, sem repair cego |
| chave rejeitada após rotação | ambiente stale | conferir apenas nomes e processo carregado | atualizar secret manager e reiniciar runtime |

## Ordem de recuperação precisa

1. Identidade: confirmar nome do servidor e project ref.
2. Configuração: `.mcp.json`, settings e `codex mcp get`.
3. Autenticação MCP: login OAuth.
4. Descoberta: reiniciar Codex.
5. Transporte: leitura MCP sem mutação.
6. CLI: login, lista de projetos e link local.
7. Runtime: variáveis públicas e server-only.
8. Banco: schema, migrations e RLS.

Não pular diretamente para alterar migrations ou policies quando a falha estiver nas camadas 1–5.

## Funcionalidades esperadas após ativação

- inspeção de schemas, tabelas, colunas, índices e policies;
- leitura segura para diagnóstico;
- auditoria de migrations e divergências;
- execução controlada de SQL/migrations quando explicitamente autorizada;
- validação de RLS e recomendações de segurança;
- geração/atualização de tipos após schema confirmado;
- diagnóstico de logs e configuração do projeto quando exposto pelo MCP.

As ferramentas concretas dependem do conjunto publicado pelo servidor e dos escopos OAuth. A sessão deve descobrir e registrar o que realmente está disponível; não presumir capacidade de escrita.

## Registro de ativação — 2026-08-25

- O OAuth do servidor isolado `supabase-geef` foi concluído com sucesso.
- `codex mcp list` confirmou o servidor como `enabled` com autenticação `OAuth` e o project ref `nycgpokqlmrfzegjlrwa`.
- `npm run mcp:supabase:gate` passou com `0 erro(s), 0 aviso(s)`; a CLI está autenticada e o checkout está vinculado ao projeto GEEF.
- Esta conversa foi iniciada antes da renovação OAuth e ainda não recebeu as ferramentas MCP do Supabase. É necessário fechar e reabrir o Codex na raiz do projeto antes de continuar.
- A ativação permanece **parcial** até que a nova sessão execute uma leitura MCP sem mutação e confirme o project ref e o schema. Nenhuma leitura MCP real ou escrita remota foi feita neste registro.

## Encerramento da ativação

Marcar o MCP como totalmente ativo somente quando:

- `npm run mcp:supabase:gate:strict` passar;
- o Codex reiniciado expuser ferramentas de `supabase-geef`;
- uma leitura MCP real confirmar o project ref e o schema;
- migrations locais/remotas forem comparadas;
- a chave exposta tiver sido rotacionada;
- nenhum segredo tiver sido impresso ou versionado.

Handoff final esperado da próxima sessão:

```text
MCP supabase-geef: ativo/inativo
Project ref confirmado: sim/não
OAuth: válido/inválido
Ferramentas descobertas: <lista curta>
Leitura remota: aprovada/reprovada
CLI vinculada: sim/não
Histórico de migrations: alinhado/divergente
Rotação de service role: confirmada/pendente
Bloqueios restantes: <nenhum ou lista objetiva>
```
