# sitegeef
Site do GEEF

## Documentacao de manutencao

Se for continuar o projeto, comece por:

1. `README_HANDOFF.md`
2. `CONTINUATION_GUIDE.md`
3. `AGENT_GUIDE.md`
4. `QUICK_REFERENCE.md`

Guias de apoio:
- `HANDOFF.md`
- `docs/AGENT_PLAYBOOK.md`
- `docs/MODULE_MAP.md`
- `agente.md`

## Execucao local

```powershell
npm install
npm run dev
```

Depois, abra `http://localhost:3500`.

## Producao

Este projeto usa `output: "standalone"` no Next.js. Depois do build, suba com:

```powershell
npm run build
npm run start
```

O comando `npm run start` executa o servidor standalone gerado em `.next/standalone/server.js`.

## 🚀 Deploy Automático

O site está configurado para deploy automático ao fazer `git push origin main`.

**Workflow de 3 estágios**:

1. **Validação** — Build e lint
2. **Pré-Deploy** — Verificação de artefatos com retry automático
3. **Deploy** — Deploy ao VPS com retry automático (até 3 tentativas por estágio)

Veja `docs/operations/deployment/DEPLOY.md` e `docs/operations/deployment/WORKFLOW_STAGES.md` para mais detalhes.
# Deploy test - Sat May 16 19:23:53     2026
