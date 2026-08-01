# Plano de limpeza e organização do projeto

## Objetivo

Reduzir ruído no checkout, separar código-fonte de artefatos gerados, organizar a documentação e remover scripts realmente obsoletos sem quebrar migrações, gates, Autoreflex ou o runtime do admin.

## Regras de segurança

- Não remover arquivos por nome ou data sem verificar referências e finalidade.
- Preservar scripts de migração, diagnóstico, MCP, Autoreflex e gates até existir substituto documentado.
- Não apagar `.env`, `.secrets`, `node_modules` ou dados de usuário.
- Artefatos gerados devem ser ignorados e não versionados; evidências importantes devem ser resumidas em documentação.
- Cada fase deve ter validação e commit próprio.

## Fases

1. **Inventário e plano**
   - Catalogar scripts, documentação, artefatos e referências.
   - Registrar este plano.

2. **Artefatos gerados**
   - Remover logs locais, `.next`, resultados temporários e screenshots gerados do controle de versão.
   - Atualizar `.gitignore` para evitar reincidência.

3. **Documentação**
   - Manter documentos operacionais referenciados.
   - Mover relatórios históricos para `docs/archive/` somente quando não forem entrada de runtime.
   - Corrigir links após a movimentação.

4. **Scripts**
   - Manter scripts usados por `package.json`, gates, MCP, Autoreflex e operações de banco.
   - Mover scripts manuais por domínio para subpastas quando isso não quebrar comandos documentados.
   - Remover apenas duplicatas ou scripts sem referência, sem uso operacional e sem valor de recuperação.

5. **Validação final**
   - `npm run type-check`
   - `npm test`
   - `npm run gate:comp`
   - `npm run gate:responsive-admin`
   - `git diff --check`
   - smoke do servidor local quando o artefato gerado estiver íntegro.

## Matriz inicial

### Preservar

- `scripts/geef-skills.mjs`, `scripts/autoreflex-*.mjs`: infraestrutura Autoreflex.
- `scripts/comp-gate.mjs`, `scripts/validate-*.mjs`, `scripts/visual-*.mjs`: gates e QA.
- Scripts `apply-*`, `run-*`, `setup-*`, `verify-*` ligados a Supabase, migrações ou recuperação operacional.
- Documentos referenciados por `CLAUDE.md`, `agents.md`, `README.md` e `docs/INDEX.md`.

### Candidatos a organização

- Logs locais e saídas de desenvolvimento na raiz: não são fonte do projeto.
- `test-artifacts/`, `test-results/`, `audit-results/` e `.tmp/visual`: saídas/evidências geradas.
- Documentos históricos na raiz: mover somente após atualizar os links de entrada.

### Bloqueados para remoção nesta fase

- Scripts manuais sem chamada em `package.json`: a ausência de referência textual não prova obsolescência.
- Migrações SQL, arquivos de configuração e documentos de operação Supabase.
- Qualquer arquivo cujo único uso seja uma instrução manual ou recuperação de incidente.

## Progresso

- Fase 1 concluída em `d12ae9a`: inventário e plano versionados.
- Fase 2 concluída em `61897ed`: screenshots/resultados gerados removidos do versionamento, auditorias históricas movidas para `docs/archive/audits/` e regras de ignore adicionadas.
- Validação da fase 2: type-check, 66 testes, comp gate, gate responsivo e `git diff --check` aprovados.
- Fase 3 concluída nesta etapa: guias ativos foram separados em `docs/operations/`, referências reutilizáveis em `docs/reference/`, integração OAuth em `docs/integrations/` e relatórios históricos em `docs/archive/status/`.
- Índices, lint de agentes, Autoreflex e `agent-map.json` foram atualizados para os novos caminhos.
- Revisão de scripts concluída nesta etapa: seis duplicatas/one-offs sem referência foram removidos; scripts de migração, MCP, Autoreflex e recuperação operacional foram preservados.
- Arquivos históricos `baseinicial.md`, `bootstrap.txt` e `migration-log.txt` foram movidos para `docs/archive/legacy/`.
