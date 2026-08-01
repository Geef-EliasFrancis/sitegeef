# MCP Supabase GEEF

> Runbook completo para a próxima sessão: `docs/SUPABASE_MCP_ACTIVATION_HANDOFF.md`.

Guia rapido para manter e recuperar o MCP do Supabase deste projeto.

## Objetivo

Garantir que o proximo agente consiga localizar, validar e reativar o MCP `supabase-geef` sem misturar com outras contas ou projetos.

## Configuracao esperada

Arquivo local do projeto:

```json
{
  "mcpServers": {
    "supabase-geef": {
      "url": "https://mcp.supabase.com/mcp?project_ref=nycgpokqlmrfzegjlrwa"
    }
  }
}
```

Estado atual no Codex:

- `codex mcp list` mostra `supabase-geef` como `enabled` com `Auth: OAuth`
- `codex mcp get supabase-geef` aponta para `https://mcp.supabase.com/mcp?project_ref=nycgpokqlmrfzegjlrwa`
- a sessao foi reautenticada com `codex mcp login supabase-geef`

Arquivo local do Codex:

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["supabase-geef"]
}
```

Arquivo local do projeto:

- `.mcp.json` deve conter o servidor `supabase-geef`
- `.claude/settings.json` deve permitir o servidor `supabase-geef`

## Como validar

1. Rodar `codex mcp list`.
2. Confirmar que existe uma entrada `supabase-geef`.
3. Confirmar que o status esta `enabled` e que a autenticacao esta por OAuth.
4. Se necessario, testar leitura do servidor via MCP.

## Quando o MCP nao basta

Se o servidor MCP estiver habilitado, mas a sessão não expuser uma ferramenta de escrita, pare e confirme se a tarefa realmente exige mutação. A Management API é fallback explícito, nunca automático:

1. Reautentique o MCP com `codex mcp login supabase-geef`.
2. Exporte `SUPABASE_ACCESS_TOKEN` a partir do token de acesso do projeto.
3. Use a CLI em workdir temporario ou a API `POST /v1/projects/{ref}/database/migrations` para aplicar schema.
4. Use `POST /v1/projects/{ref}/database/query` para leitura/diagnóstico pontual quando a rota direta do banco falhar.

Esse fluxo foi o que funcionou quando o `db.nycgpokqlmrfzegjlrwa.supabase.co` nao respondeu por acesso direto neste ambiente.

## Sintoma de problema

Quando a entrada aparece no `codex mcp list`, mas a leitura falha com algo como:

- `OAuth token refresh failed`
- `Failed to parse server response`

isso normalmente indica problema de autenticacao da sessao MCP, nao erro de URL do projeto.

## Recuperacao

1. Reabrir a autenticacao do MCP Supabase no Codex.
2. Refazer o login/OAuth para `supabase-geef`.
3. Confirmar de novo com `codex mcp list`.
4. Tentar acessar recursos do servidor outra vez.

Comando direto para reativar a sessao:

```bash
codex mcp login supabase-geef
```

## Regras

- Nao trocar `supabase-geef` por um MCP generico.
- Nao misturar este projeto com outras contas Supabase.
- Se a sessao do MCP quebrar, tratar primeiro como problema de auth antes de alterar o repo.
