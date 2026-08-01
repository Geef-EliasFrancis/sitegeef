# 🎨 Sistema de Tema GEEF

## Visão Geral

O GEEF possui um sistema de tema completo com **identidade visual forte** baseada na filosofia da instituição:

- **Roxo (Uva)** 🍇 — Meditação, espiritualidade, sabedoria
- **Verde (Videira)** 🌿 — Crescimento, vida, renovação
- **Bege/Luz** ✨ — Pureza, clareza, abertura

## Arquitetura

### 1. **Paleta de Cores** (`lib/theme/colors.ts`)

Define todas as cores em escalas de 950 a 100:

```typescript
// Cores primárias
colors.uva[700]      // #8a005a — roxo principal
colors.videira[600]  // #63c984 — verde principal

// Neutros
colors.light[600]    // #6b7580 — tons cinzentos
```

### 2. **Provedor de Tema** (`lib/theme/theme-provider.tsx`)

- Gerencia state do tema (light/dark)
- Persiste preferência em localStorage
- Respeita `prefers-color-scheme` do sistema
- Aplica classe `.dark` ao HTML

```typescript
// Uso em componentes
const { theme, setTheme, toggleTheme } = useTheme();
```

### 3. **Variáveis CSS** (`styles/theme.css`)

Define variáveis para cada tema:

```css
:root {
  --bg: #f8f4ec;           /* Fundo light */
  --text: #1c201f;         /* Texto light */
  --shadow: ...            /* Sombra light */
}

:root.dark {
  --bg: #1a1818;           /* Fundo dark */
  --text: #f5f5f0;         /* Texto dark */
  --shadow: ...            /* Sombra dark */
}
```

### 4. **Componentes**

#### ThemeToggle
Botão flutuante (canto inferior direito) para trocar tema:

```tsx
<ThemeToggle />  // Adiciona 🌙/☀️ flutuante
```

## Como Usar

### Em Componentes React

```tsx
"use client";
import { useTheme } from "@/hooks/useTheme";

export function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return <button onClick={toggleTheme}>Tema: {theme}</button>;
}
```

### Em Estilos CSS

Use as variáveis definidas automaticamente:

```css
.meu-elemento {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

/* Para cores específicas */
.titulo {
  background: var(--gradient-uva);
  color: white;
}

.destaque {
  background: var(--gradient-videira);
  color: white;
}
```

## Cores Disponíveis

### Primárias (Uva - Roxo)
```
--uva-950 a --uva-100
Uso: Elementos principais, highlights, CTAs
```

### Secundárias (Videira - Verde)
```
--videira-950 a --videira-100
Uso: Elementos secundários, successo, vida
```

### Neutros (Luz - Cinza)
```
--light-950 a --light-50
Uso: Textos, borders, backgrounds neutros
```

### Estados
```
--success: #63c984
--warning: #f59e0b
--error:   #ef4444
--info:    #3b82f6
```

## Gradientes

Dois gradientes prontos:

```css
.gradient-uva {
  background: var(--gradient-uva);    /* roxo → roxo mais claro */
  color: white;
}

.gradient-videira {
  background: var(--gradient-videira); /* verde escuro → verde claro */
  color: white;
}
```

## Exemplo: Página de Perfil

A página de perfil demonstra o sistema completo:

1. **Header** — Gradiente roxo com título
2. **Avatar** — Placeholder com gradiente verde
3. **Botões** — Cores primárias e secundárias
4. **Navegação** — Cards com cores de identificação visual
5. **Dark Mode** — Todos os elementos se adaptam

## Transições de Tema

Transições suaves ao mudar tema:

```css
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

## Boas Práticas

### ✅ Fazer
- Use `var(--bg)`, `var(--text)`, `var(--border)` para elementos genéricos
- Use `var(--uva-700)` para elementos principais
- Use `var(--videira-600)` para elementos secundários
- Use gradientes para seções importantes

### ❌ Evitar
- Colors hardcoded (`#fff`, `#000`)
- Esquecer dark mode
- Transições muito rápidas (<160ms)
- Combinar muitas cores (máx 3-4 por seção)

## Estrutura de Arquivos

```
lib/theme/
├── colors.ts              — Definição da paleta
└── theme-provider.tsx     — Provedor React

hooks/
└── useTheme.ts            — Hook de acesso

styles/
├── theme.css              — Variáveis CSS
└── profile.css            — Exemplo (página de perfil)

components/
└── theme-toggle.tsx       — Botão de tema
```

## Próximas Melhorias

- [ ] Seletor de tema no menu de usuário
- [ ] Temas customizados (usuário escolhe cores)
- [ ] Modo contraste alto
- [ ] Animações por tema
- [ ] Exportar palette para Figma/design tools

## Padrão De Construção

Para criar ou alterar páginas, siga o documento canônico:

- [Padrão de tema, contraste e identidade](./docs/PADRAO_TEMA_CONTRASTE_IDENTIDADE.md)

Use esse documento como referência para botões, headers, estados ativos, superfícies e regras de contraste.

---

**Desenvolvido para:** GEEF — Grupo Espírita Elias Francis  
**Data:** 16 de maio de 2026  
**Status:** ✅ Produção
