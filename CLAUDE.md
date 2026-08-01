# CLAUDE.md — Documentação do Projeto GEEF ERP

Guia técnico essencial para trabalhar com Claude Code no projeto GEEF ERP.

---

## ⚠️ AVISO CRÍTICO: Regra de Refatoração

**PROIBIDO reduzir funcionalidades, campos de dados ou opções sem autorização explícita.**

Exemplos de ações proibidas:
- ❌ Remover upload de logos porque "parece redundante"
- ❌ Simplificar 8 opções de seleção em 3 sem justificativa
- ❌ Consolidar formulários sem plano de migração
- ❌ Remover features e deixar como "placeholder"

**Leia:** `docs/reference/REFACTORING_RULES.md` antes de fazer qualquer mudança estrutural.

Resumo rápido:
1. **Sempre documente** o estado atual antes de refatorar
2. **Sempre obtenha aprovação** antes de simplificar
3. **Sempre migre dados** existentes com segurança
4. **Sempre atualize documentação** após mudanças

Se tiver dúvida se uma refatoração é permitida: **pergunte antes de fazer.**

---

## O Projeto

**GEEF ERP** é um sistema completo de gestão para organizações espíritas (GEEF = Grupo de Estudos Espíritas de Franquia). Implementado em **Next.js 15** + **Supabase** + **PostgreSQL**, com 27+ módulos admin cobrindo todas as áreas operacionais.

**Stack:**
- Frontend: Next.js 15 (App Router), React 19, TypeScript
- Backend: Next.js Server Actions, Supabase Auth
- Database: PostgreSQL (Supabase)
- Email: Resend API
- Deployment: Standalone next build

**Repositório:** https://github.com/JeanMRocha/site-geef
**Autor:** @JeanMRocha

---

## Memória Operacional — Autoreflex

O projeto usa **Autoreflex local** como servidor de skills (memória persistente). Consulte `agents.md` e `docs/AUTOREFLEX_LOCAL.md` para a ordem de decisão, endpoints e fluxo com Ollama.

Por padrão, o Autoreflex assume que o Ollama já está disponível localmente e **não inicia** o daemon sozinho. Se for necessário permitir esse auto-start, usar `AUTOREFLEX_START_OLLAMA=1` de forma explícita antes de `npm run autoreflex:serve`.

**Quick start:**
```bash
npm run autoreflex:serve
npm run skills:search "padrão admin"
npm run skills:index
npm run skills:list
```

---

## MCP do Projeto — Supabase GEEF

Para acessar o Supabase remoto deste repositório, use o MCP isolado `supabase-geef`.

**Leitura obrigatória:**
- `docs/MCP_SUPABASE_GEEF.md`

**Arquivos de configuração:**
- `.mcp.json` declara `supabase-geef` com o `project_ref` deste projeto
- `.claude/settings.json` habilita `supabase-geef` nesta sessão

**Verificação rápida:**
```bash
codex mcp list
codex mcp get supabase-geef
codex mcp login supabase-geef
```

**Regra:**
- Não usar o MCP genérico `supabase`
- Não misturar este projeto com outras contas ou outros projetos
- Antes de qualquer ação remota, confirmar que `supabase-geef` está `enabled` e autenticado

---

## Claude Code Skills

O projeto integra **Claude Code Skills** para automação avançada e otimização de UX/design:

### ui-ux-pro-max-skill

**Propósito:** Automação e otimização de UI/UX, design system consistency, e geração de componentes inteligentes.

**Quando usar:**
- Auditar acessibilidade e WCAG compliance
- Revisar consistency do design system (cores, spacing, tipografia)
- Gerar novos componentes mantendo padrões visuais
- Otimizar layouts e responsividade
- Sugerir melhorias de UX baseadas em boas práticas

**Como usar:**
```bash
# Invocar a skill
/ui-ux-pro-max-skill

# Contexto importante
- Projeto usa design system em styles/globals.css
- Componentes admin em components/admin/
- Componentes públicos em components/
- CSS variables: --uva-*, --text, --muted, --line, etc.
```

**Design System Base:**
- **Cores principais:** `--uva-700` (principal), `--text`, `--muted`, `--line`
- **Spacing:** clamp() com vw/rem híbrido para responsividade
- **Tipografia:** Heading com `var(--font-heading)`, body com inherit
- **Componentes base:** buttons, cards, forms em .content-card, .admin-btn, .profile-form-*
- **Dark mode:** `:root.dark` override de cores

**Próximas integrações:**
- Automação de refatorações visuais maiores
- Auditoria de WCAG em escala
- Geração semi-automática de variantes de componentes

---

## Estrutura do projeto

### Diretórios principais

```
site-geef/
  app/
    admin/              # 27+ módulos CRUD (pessoas, financeiro, escalas, etc)
    api/                # API routes (auth, webhooks)
    auth/               # Fluxos de autenticação
    escalas/            # Escala pública de agendamentos
    institucional/      # Páginas institucionais
    minha-area/         # Área do usuário autenticado
    [slug]/             # Páginas dinâmicas públicas
  
  lib/
    supabase/           # Clientes (server, browser, service-role)
    auth/               # Permissões e RBAC
    admin/              # Cache, dashboard, helpers
    notificacoes/       # Email (Resend), SMS
    escalas/            # Lógica de agendamento
    relatorios/         # PDF, gráficos
    theme/              # Sistema de tema
  
  scripts/              # Utilidades (migrações, seeds)
  skills/               # Skills do Autoreflex
  supabase/
    migrations/         # SQL migrations
    types/              # Tipos gerados
  
  .claude/              # Configuração de Claude Code
  mcp/                  # MCP servers
```

### Módulos admin principais

| Módulo | Descrição |
|--------|-----------|
| `pessoas` | Cadastro central de pessoas (núcleo) |
| `usuarios` | Gerenciamento de usuários do sistema |
| `departamentos` | Departamentos e estrutura organizacional |
| `escalas` | Escalas/agendamentos de serviços |
| `estudos` | Cursos e grupos de estudo |
| `biblioteca` | Acervo de livros, empréstimos |
| `financeiro` | Contas, lançamentos, relatórios (DRE) |
| `apse` | Assistência social, campanhas, atendimentos |
| `atendimento` | Acolhimento, irradiação, lar evangélico |
| `documentos` | Termos, consentimentos, voluntariado |
| `evangelizacao` | Evangelização infantil e grupos |
| `governanca` | Conselhos, assembleias, mandatos |
| `relatorios` | Geração de relatórios e exports |

---

## Padrões de código

### 1. Módulo Admin (CRUD)

**Arquitetura:**
```
app/admin/<modulo>/
  page.tsx              # Lista com paginação + busca
  novo/page.tsx         # Form de criação
  [id]/page.tsx         # Detail + edit
  actions.ts            # Server actions (get, create, update, delete)
```

**Cada módulo é idêntico estruturalmente** — copiar `app/admin/pessoas/` como template.

Consulte `skills/padrao-modulo-admin.md` para detalhes.

### 2. Server Actions

**Arquivo:** `actions.ts`

```typescript
"use server";

export async function getData(page = 1, search = "") {
  const supabase = await createClient();
  // Sempre: createClient() é async
  // Sempre: revalidatePath() após mutação
}

export async function createRecord(formData: FormData) {
  await requirePermission("pode_modulo");
  const supabase = await createClient();
  // Implementar, depois invalidar cache
  invalidateAdminDashboardCache();
  revalidatePath("/admin/modulo");
}
```

Consulte `skills/padrao-actions-ts.md` para padrões completos.

### 3. Supabase

**3 clientes:**
- `createClient()` — server actions (com cookies de auth)
- `createBrowserClient()` — client components (token no localStorage)
- `createServiceRoleClient()` — admin operations (bypassa RLS)

**RLS:** Habilitado em tabelas sensíveis. Filtra automaticamente por `user_id = auth.uid()`.

Consulte `skills/supabase-patterns.md` para padrões.

### 4. Permissões

**Flags de permissão:**
```typescript
type PermissionFlag =
  | 'pode_escalas'
  | 'pode_biblioteca'
  | 'pode_financeiro'
  // ... 9 permissões total
```

**Uso em server actions:**
```typescript
await requirePermission("pode_pessoas");
// Lança erro se não tem permissão
```

Consulte `skills/auth-permissions.md` para detalhes.

### 5. Cache invalidation

Após qualquer mutação (create, update, delete):

```typescript
import { invalidateAdminDashboardCache } from "@/lib/admin/cache";

invalidateAdminDashboardCache();
revalidatePath("/admin/modulo");
revalidatePath(`/admin/modulo/${id}`);
```

### 6. Migrações

**Arquivo:** `supabase/migrations/YYYYMMDD_descricao.sql`

```bash
npm run apply-migration      # Aplicar uma migração
npm run check-migration      # Verificar se foi aplicada
npm run geef:migrations      # Listar pendentes
npm run db:push              # Empurrar para produção
```

Consulte `skills/migrations-workflow.md` para detalhes.

---

## Desenvolvimento

### Setup local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Aplicar migrações do banco
npm run apply-migration

# Iniciar dev server
npm run dev

# Acessar em http://localhost:3500
```

### Scripts úteis

```bash
npm run dev                 # Dev server
npm run build              # Build Next.js
npm run agent:lint         # Lint agent map
npm run db:migrate         # Aplicar migrações
npm run skills:search      # Buscar skills
npm run skills:index       # Indexar skills
npm run geef:migrations    # Listar migrações
```

### Variáveis de ambiente

`.env.local` deve conter:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
```

---

## Convenções

### Nomes de arquivos

- Kebab-case para arquivos: `pessoas.ts`, `nova-pessoa.tsx`
- PascalCase para componentes: `PessoaForm.tsx`
- Lowercase com underscore para SQL: `20250517_create_pessoas.sql`

### Estrutura de componentes

```typescript
// Page com Server Component
export default async function Page({ params }: Props) {
  const data = await fetchData();
  return <MyComponent data={data} />;
}

// Componente Client com form
"use client";
export function MyForm({ initialData }: Props) {
  const [state, dispatch] = useReducer(...);
  return <form action={myAction}>{...}</form>;
}
```

### Imports

```typescript
// Supabase
import { createClient } from '@/lib/supabase/server';

// Auth
import { requirePermission } from '@/lib/auth/permissions';

// Cache
import { invalidateAdminDashboardCache } from '@/lib/admin/cache';

// Next.js
import { revalidatePath } from 'next/cache';
```

---

## Decisões arquiteturais

**Por que Server Actions e não API routes?**
- Simples: uma função = uma action
- Seguro: type-safe, sem CORS
- Cache-friendly: revalidatePath automático

**Por que Supabase?**
- Gerenciado: sem infraestrutura
- Auth integrado: OAuth, Supabase Auth
- RLS nativo: segurança por padrão

**Por que sem GraphQL/Redux?**
- Complexidade desnecessária para CRUD simples
- Server actions são mais simples e seguros
- Dados sempre frescos via revalidatePath

---

## Troubleshooting

### "Access denied: pode_pessoas required"
Usuário não tem permissão. Atribuir em Supabase Dashboard (usuarios_sistema).

### "RLS returning 0 results"
- Usuário desautenticado? Verificar auth.getUser()
- Tabela sem RLS? Adicionar policies
- RLS muito restritivo? Ajustar WHERE clause

### "Autoreflex not found"
Subir o serviço local: `npm run autoreflex:serve`.

---

## UI/UX Corrections (2026-05-31)

**Status:** ✅ Implementado  
**Commit:** `63ade2c`

Refatoração do módulo de catálogo de músicas para melhorar conformidade com design system, acessibilidade (WCAG) e manutenibilidade do código.

### Mudanças Implementadas


1. **`styles/utilities.css` (novo)**
   - 4 classes de flex utilities reutilizáveis: `.flex-center`, `.flex-center-gap`, `.flex-space-between`, `.flex-end-gap`
   - Resolve 27+ instâncias de inline styles hardcoded

2. **`styles/admin.css` (adições)**
   - Classes `.inline-status--ativa`, `.inline-status--rascunho`, `.inline-status--inativa`
   - Variantes dark mode incluídas
   - Substitui triple-ternary em status badges

3. **`lib/musicas.ts` (nova função)**
   - `export function getStatusLabel(status: string): string`
   - Single source of truth para labels de status

4. **`components/admin/musicas/musicas-catalog-table.tsx` (refatorado)**
   - Sucesso alert: inline styles → `.admin-save-banner.success` (WCAG dark mode compliant)
   - Status badges: ternary → CSS classes + `getStatusLabel()`
   - Layout: 5 inline flex styles → 3 utility classes

### Impacto

| Aspecto | Antes | Depois |
| --- | --- | --- |
| Dark mode acessibilidade | ❌ WCAG fail | ✅ WCAG AA |
| Design system compliance | Parcial | 100% |
| Inline styles (página) | 5 | 0 |
| Ternary triplo em status | 20 linhas | 0 |
| DRY (flex utilities) | 27+ duplicatas | 4 classes |

### Para Mais Detalhes

Consulte `docs/UI_UX_CORRECTIONS.md` para:
- Explicação detalhada de cada problema
- Before/after code examples
- Testing checklist
- Maintenance benefits

---

## Dark Mode Remediation (2026-05-31)

**Status:** ✅ 100% COMPLETO  
**Commits:** 5 (phases 1-3 + fixes + docs)

Migração completa de cores hardcoded para `identity-system.css` variáveis CSS. Todos os 16 problemas críticos/moderados/baixos resolvidos. Veja `docs/DARK_MODE_REMEDIATION_PLAN.md`.

---

## UI/UX Audit & Critical Fixes (2026-05-31)

**Status:** 🔄 FASE 1 (66% completa)

**Phase 1 (Críticos - 2.5h):**
- ✅ Fix 2: Focus visible violations (WCAG 2.4.7) — 20 `outline:none` → fallback outline
- ✅ Fix 3: Alt text violations (WCAG 1.1.1) — Logo alt atualizado
- ⏳ Fix 1: Inline styles refactoring (2h) — 6 componentes, padrão documentado

**Phase 2 (Moderados - 6h):** NOT STARTED
- Fix 4: Media query breakpoints (3h)
- Fix 5: Spacing variables (2h)
- Fix 6: Backdrop-filter fallback (1h)

**Phase 3 (Baixos - 3.5h):** NOT STARTED
- Fix 7: Focus contrast validation (1h)
- Fix 8: Form spacing cleanup (30m)
- Fix 9: Emoji icon labels (1h)

**Veja:** `HANDOFF.md` para planos Phase 2-3

---

## Roadmap conhecido

- ✅ 29/29 módulos core implementados
- ✅ RLS em módulos sensíveis
- ✅ Email notifications (Resend)
- ✅ Relatórios avançados
- ✅ Dark Mode Remediation — 100% identity-system compliance
- ✅ UI/UX Critical Fixes — Phase 1 (66%) + WCAG compliance
- 🔄 UI/UX Phase 2-3 — Design system consolidation + polish (9.5h restantes)
- 🔄 Mobile responsiveness

---

## Contatos

- Repositório: https://github.com/JeanMRocha/site-geef
- Issues: https://github.com/JeanMRocha/site-geef/issues
- Autor: @JeanMRocha

---

## Veja também

- `agents.md` — Memória operacional do Autoreflex
- `docs/archive/status/STATUS.md` — Status histórico do projeto
- `HANDOFF.md` — Notas de handoff entre sessões
- `skills/` — Conhecimento indexado (skills)
