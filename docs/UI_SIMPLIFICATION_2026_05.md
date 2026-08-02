# Simplificação de UI — Maio 2026

## Contexto

Consolidação visual do site público e menu administrativo para reduzir poluição informativa, melhorar legibilidade e manter o foco no conteúdo essencial.

## Mudanças

### 1. Home Pública (`app/page.tsx`)

**Remoção de textos de apoio:**

- ❌ Removido: "As páginas abaixo levam direto para o conteúdo real que já pode ser consultado pelo visitante."
  - Localização anterior: Seção "Acesso rápido"
  - Motivo: Redundância; os cards já comunicam seu propósito

- ❌ Removido: "Endereço, telefone e redes principais ficam visíveis já na página inicial."
  - Localização anterior: Seção "Contato"
  - Motivo: Informação já confirmada pelo rodapé que segue

**Impacto visual:**
- Redução de 2 linhas descritivas
- Seções mantêm títulos principais e cards/conteúdo sem prefácio
- Fluxo visual mais direto do título para a ação

### 2. Rodapé do Site (`components/site-shell.tsx`)

**Consolidação em linha única:**

**Antes:**
```
Grupo Espírita Elias Francis · Rua Gwyer de Azevedo, 35... · contato@geef...
LGPD · Privacidade · Cookies · Credibilidade e Filiações
[FEB] [REUNIR] [45 CEU]
```

**Depois:**
```
Grupo Espírita Elias Francis · Rua Gwyer de Azevedo, 35... · contato@geef... · LGPD · Privacidade · Cookies · Credibilidade e Filiações
```

**Removido:**
- ❌ Bloco `site-footer-badges` com links/badges para FEB, REUNIR, 45 CEU
- Motivo: Afiliações acessíveis em `/institucional`; rodapé deve ser funcional, não decorativo

**Impacto:**
- Rodapé mais compacto (de 3 seções visuais para 1)
- Redução vertical ~50px
- Links de política continuam acessíveis

### 3. Menu Admin — Reunião Pública (`components/admin/admin-sidebar.tsx`)

**Adição de link Autores:**

```tsx
// Novo:
<Link
  href="/admin/reuniao-publica/musica/autores"
  className={`admin-nav-item ${isActive('/admin/reuniao-publica/musica/autores') ? 'active' : ''}`}
>
  Autores
</Link>
```

**Localização:** Menu "Reunião Pública" → após "Sessões"

**Fluxo CRUD completo:**
- Músicas (listagem)
- Sessões (pareamento)
- **Autores** ← novo link direto

**Motivo:** Consolidar acesso ao CRUD de autores sem precisar sair do menu lateral; suporta fluxo de criação de música → autores → sessões

## Arquivos Afetados

| Arquivo | Mudança | Tipo |
|---------|---------|------|
| `app/page.tsx` | Remove 2 `<p>` com textos descritivos | Conteúdo |
| `components/site-shell.tsx` | Remove `site-footer-badges` div | Layout |
| `components/admin/admin-sidebar.tsx` | Adiciona link "Autores" | Navegação |

## Validação

### Build
```bash
npm run build
# ✓ Compiled successfully
```

### Rotas Afetadas
- `/` — home pública (textos removidos)
- `/admin/reuniao-publica/musica/autores` — acessível via menu
- Todas as páginas com site-shell — rodapé reduzido

### Regressão
- Nenhuma quebra de funcionalidade
- Links de política continuam no rodapé
- Afiliações acessíveis via `/institucional`

## Commits

```
3c88228 feat(admin-sidebar): add autores link to reunião pública menu
012d939 fix: stabilize supabase admin runtime
        → Inclui: UI simplification (home + footer)
```

## Próximos Passos

1. Se precisar reintroduzir informação descritiva:
   - Usar tooltips ou collapse em vez de texto fixo
   - Manter home limpa como padrão

2. Se precisar reintroduzir badges de afiliação:
   - Mover para página `/institucional/filiados`
   - Manter rodapé funcional

3. Monitorar métricas de engajamento:
   - Tempo médio na home
   - Taxa de clique nos cards

## Referências

- HANDOFF.md → seção "Última entrega" atualizada
- UI guideline: site público deve ser limpo, sem textos suportivos longos
- Admin sidebar deve ser um índice de navegação, não um painel informativo
