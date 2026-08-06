# Memória Operacional — GEEF ERP + Autoreflex

Documento que define a forma correta de trabalhar no projeto GEEF usando Claude Code com o Autoreflex.

---

## Autoreflex — Servidor local de skills

O Autoreflex agora é um serviço local do próprio projeto, em `http://127.0.0.1:8090`, com indexação semântica via Ollama e persistência leve em `.autoreflex/`.

**Skills são respostas estruturadas para problemas reutilizáveis:**
- Padrões de código (ex: como criar módulo admin)
- Fluxos de trabalho (ex: como fazer migração)
- Decisões arquiteturais (ex: quando usar service role)

**Objetivo:** Reduzir consumo de tokens em conversas longas consultando skills antes de explorar código.

---

## MCP do projeto — Supabase GEEF

Para acessar o banco remoto deste projeto, use somente o MCP isolado `supabase-geef`.

**Fonte de verdade local:**
- `.mcp.json` declara o servidor `supabase-geef`
- `docs/MCP_SUPABASE_GEEF.md` explica como validar e recuperar a conexão

**Comandos de verificação:**
```bash
codex mcp list
codex mcp get supabase-geef
codex mcp login supabase-geef
```

**Regra operacional:**
- Nunca trocar `supabase-geef` por um MCP genérico
- Nunca misturar este projeto com outras contas ou outros projetos Supabase
- Antes de qualquer leitura/escrita remota, confirmar que o MCP correto está `enabled` e autenticado por OAuth

**Autoreflex local:**
- Ao ser solicitado o início do localhost do GEEF, verificar primeiro se o
  Autoreflex responde em `http://127.0.0.1:8090/health`.
- Se não estiver ativo, iniciar automaticamente com `npm run autoreflex:serve`,
  aguardar a resposta `{"status":"ok"}` e só então iniciar o GEEF.
- O Ollama não é iniciado automaticamente por padrão; para permitir isso de forma explícita, usar `AUTOREFLEX_START_OLLAMA=1`.
- Se o Autoreflex não ficar disponível após a tentativa automática, parar e
  informar o usuário em vez de assumir que o índice existe.

---

## Ordem de decisão — Como trabalhar

**1. Memória da conversa**
   - Use contexto já discutido nesta conversa
   - Não precise re-explorar se já falou

**2. Buscar skills no Autoreflex** (SE AUTOREFLEX ESTIVER RODANDO)
   - Query semântica em `POST /agent/skills/search`
   - Exemplo: "padrão de módulo admin" → retorna skill sobre estrutura CRUD
   - Ler skill completa em `POST /agent/skills/get` se relevante
   - **Se a tentativa automática de inicialização falhar → PARAR, informar usuário**

**3. Explorar o código do projeto**
   - Usar Glob/Grep para encontrar padrões
   - Ler arquivos relacionados
   - Procurar exemplos de código similar

**4. Implementar e criar nova skill** (se resolveu problema reutilizável)
   - Salvar skill em `skills/<nome>.md`
   - Criar metadados em `skills/<nome>.meta.json`
   - Indexar em `POST /agent/skills/index`
   - Novo agente nesta sessão já pode consultar a skill

---

## Endpoints Autoreflex

### Health check
```
GET /health
Response: {"status": "ok"}
```

### Buscar skills
```
POST /agent/skills/search
Content-Type: application/json

{
  "query": "padrão de modulo admin",
  "limit": 5
}

Response:
{
  "results": [
    {
      "score": 0.87,
      "skill_path": "skills/padrao-modulo-admin.md",
      "skill_name": "Padrão de Módulo Admin GEEF",
      "summary": "Arquitetura e convenções para criar/modificar módulos admin..."
    }
  ]
}
```

### Ler skill completa
```
POST /agent/skills/get
Content-Type: application/json

{
  "skill_path": "skills/padrao-modulo-admin.md"
}

Response:
{
  "skill_path": "skills/padrao-modulo-admin.md",
  "content": "# Padrão de Módulo Admin GEEF\n\n## Objetivo\n..."
}
```

### Indexar/Reindexar skills
```
POST /agent/skills/index
Content-Type: application/json

{
  "skill_path": "skills/minha-nova-skill.md"  // opcional
}
// Ou {} para reindexar tudo

Response:
{
  "indexed_files": ["skills/minha-nova-skill.md"],
  "indexed_chunks": 3
}
```

---

## Scripts disponíveis

Use `node scripts/geef-skills.mjs` para interagir com Autoreflex sem curl:

```bash
# Buscar
node scripts/geef-skills.mjs search "padrão admin"

# Listar todas as skills
node scripts/geef-skills.mjs list

# Ler skill completa
node scripts/geef-skills.mjs read "skills/padrao-modulo-admin.md"

# Reindexar
node scripts/geef-skills.mjs index

# Verificar status
node scripts/geef-skills.mjs health
```

Ou via npm:
```bash
npm run skills:search "padrão admin"
npm run skills:index
npm run skills:list
```

---

## Skills iniciais (sempre consultáveis)

Documentam os padrões reais do projeto:

| Skill | Descrição |
|-------|-----------|
| `padrao-modulo-admin` | Estrutura page/novo/[id]/actions de módulos admin |
| `padrao-actions-ts` | Server actions: getters, create, update, delete, cache |
| `supabase-patterns` | Clientes Supabase (server/browser/service-role), RLS |
| `migrations-workflow` | Criar, testar, aplicar migrações SQL |
| `auth-permissions` | Verificar permissões, RBAC, permissões em actions |

---

## Criar nova skill

Se resolveu um problema reutilizável, criar skill:

**1. Criar arquivo Markdown**
```
Arquivo: skills/<nome-skill>.md

Estrutura:
# Título

## Objetivo
Por que existe? Quando usar?

## Quando usar
Contextos de uso

## Seções temáticas
...

## Considerações
Gotchas, edge cases, warnings
```

**2. Criar metadados JSON**
```
Arquivo: skills/<nome-skill>.meta.json

{
  "name": "nome-skill",
  "title": "Título Legível",
  "summary": "Uma linha resumindo",
  "tags": ["tag1", "tag2"],
  "language": "pt-BR",
  "source_skill_path": "skills/nome-skill.md",
  "created_at": "2025-05-17T12:00:00-03:00",
  "updated_at": "2025-05-17T12:00:00-03:00",
  "version": 1
}
```

**3. Indexar**
```
node scripts/geef-skills.mjs index skills/nome-skill.md
```

---

## Condições de bloqueio

⛔ **PARAR IMEDIATAMENTE se:**
- Curl para http://127.0.0.1:8090 falhar e o serviço local ainda não tiver sido subido com `npm run autoreflex:serve`
- Autoreflex não responde em < 5s (pode estar sobrecarregado)
- Sem confirmação do usuário, não execute ações subsequentes

💬 **Informar o usuário:**
- "Autoreflex local não respondeu. Suba com `npm run autoreflex:serve`."
- Documentação local: `docs/AUTOREFLEX_LOCAL.md`

---

## Idioma

- Sempre português brasileiro (pt-BR)
- Skills são em pt-BR
- Metadados em pt-BR
- Código tem comentários mínimos (já-code-style)

---

## Resumo rápido

| Ação | Endpoint | Exemplo |
|------|----------|---------|
| Buscar | POST /search | query: "padrão admin" |
| Ler | POST /get | skill_path: "skills/padrao-modulo-admin.md" |
| Indexar | POST /index | skill_path: "skills/novo.md" ou {} |
| Health | GET /health | — |

**Comandos quick:**
```bash
# Tudo integrado no projeto:
npm run skills:search "palavra-chave"
npm run skills:list
npm run skills:index
```
