# Codex no Coder e worker híbrido da homelab

## Objetivo

O desenvolvimento do GEEF ocorre no workspace persistente `site-geef` do
Coder, hospedado na VPS. O Codex que atua nesse workspace edita, revisa e
valida o projeto. A homelab é um executor opcional e isolado para testes e
builds mais pesados; ela não é a fonte de contexto do projeto.

Este documento é o contrato de continuidade para agentes que trabalhem no
GEEF. Ele descreve o comportamento já disponível e o que ainda depende de
implementação.

## Estado atual

- Codex CLI está funcional no Coder e deve ser usado pelo Terminal do
  workspace; a extensão do editor não é a interface suportada neste ambiente.
- O coordenador externo responde em `https://worker.aiveca.com.br/healthz`.
- O worker isolado da homelab aceita somente os tipos `npm_test` e
  `npm_build` para repositórios GitHub permitidos.
- Um job de `npm_test` deste repositório foi validado na homelab com 74 testes
  aprovados.
- A ponte MCP local `hybrid_geef` foi implementada em
  `mcp/hybrid-worker.mjs` e declarada em `.codex/config.toml`. Ela expõe apenas
  `hybrid_test`, `hybrid_build` e `hybrid_job_status`.
- A ponte está ativada no workspace `site-geef` do Coder. A versão do template
  publicada monta o arquivo secreto de submissão como leitura exclusiva.
- Validação fim a fim em `2026-08-23`: o `job-7` executou `npm_test` para o
  commit `c6b3dd1979c6837f6272d32d899b44c5fd5441d2` na
  `homelab-dev-worker` e concluiu 77 testes com sucesso.

## Fluxo pretendido

```text
Codex no Coder (VPS)
  -> altera e valida localmente
  -> commit imutável enviado ao GitHub
  -> ponte MCP restrita envia npm_test ou npm_build
  -> coordenador autenticado
  -> worker da homelab clona o commit e executa isoladamente
  -> resultado e logs retornam ao Codex
```

O worker recebe um clone temporário do Git. Alterações não salvas, arquivos
locais e segredos do workspace nunca são transferidos à homelab.

## Regras obrigatórias

1. Antes de uma execução híbrida, registrar ou confirmar o commit SHA exato.
   Não enviar uma referência mutável como `main` quando a intenção é validar
   uma alteração específica.
2. Fazer a validação rápida local primeiro quando ela for suficiente.
3. Usar o worker somente para `npm_test` ou `npm_build`. Não criar ferramentas
   de shell remoto, upload arbitrário, SSH, Docker, Coolify ou deploy.
4. A credencial de submissão deve ficar em arquivo de segredo montado no
   workspace. Nunca registrar seu valor em `.mcp.json`, `.env`, Git, logs,
   prompts, documentação ou saída de terminal.
5. O token do worker e o token de submissão são distintos. O Codex recebe, no
   máximo, a credencial de submissão restrita; jamais a identidade do worker.
6. Se a homelab estiver indisponível, informar o fato e executar a validação
   equivalente no VPS somente quando a futura ponte declarar fallback `auto`.
   Um pedido explícito para `homelab` deve falhar de forma visível, sem desvio
   silencioso.
7. Resultado de teste ou build não autoriza deploy. Deploy continua sendo uma
   etapa separada e deliberada.

## Ativação concluída

1. O template `vps-dev` monta, apenas no workspace `site-geef`, o arquivo
   `/run/secrets/hybrid_site_geef_submitter_token` como leitura exclusiva.
2. O segredo permanece fora do Git, com permissão `0600`, e a credencial é
   limitada pelo coordenador ao repositório GEEF.
3. O workspace foi atualizado e `codex mcp get hybrid_geef` confirmou o
   transporte STDIO e a allowlist das três ferramentas.
4. O `job-7` confirmou a execução isolada do commit imutável na homelab.

## Ferramentas disponíveis após ativação

- `hybrid_test` — submete `npm_test` para um SHA permitido;
- `hybrid_build` — submete `npm_build` para um SHA permitido;
- `hybrid_job_status` — lê estado e logs sanitizados de um job existente.

A ponte monta a credencial por caminho de arquivo, aceita apenas o repositório
`JeanMRocha/sitegeef`, valida SHA/ref e não disponibiliza um executor genérico.
A seleção `auto` e o fallback VPS só devem ser expostos após validação fim a
fim dessa ponte.

## Retomada por outro agente

1. Ler este documento, `AGENTS.md`, `docs/AGENT_PLAYBOOK.md` e o handoff
   vigente antes de alterar a integração.
2. Conferir a saúde pública do coordenador sem enviar credenciais.
3. Confirmar que qualquer segredo está fora do repositório e montado como
   arquivo legível somente pelo processo da ponte.
4. Rodar `npm run mcp:hybrid:check` e `codex mcp get hybrid_geef` a partir da
   raiz do projeto; a saída deve mostrar somente as três ferramentas permitidas.
5. Validar a montagem do segredo sem imprimir seu conteúdo e submeter um
   commit de teste inofensivo.
6. Registrar evidência do job (SHA, tipo, executor, status e resumo dos logs)
   no handoff, sem registrar tokens.

## Observação técnica aberta

No `job-7`, o `npm ci --ignore-scripts` executado fora do contêiner emitiu
avisos de compatibilidade porque o Node assinado do LXC ainda é 18, enquanto o
teste ocorre no contêiner Node 22. Os 77 testes passaram, mas uma etapa futura
deve alinhar a instalação de dependências ao Node 22 sem remover os limites de
rede, privilégios e lifecycle scripts.
