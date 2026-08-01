# 💾 Persistência Automática de Dados

A aplicação agora persiste automaticamente dados do usuário em **localStorage** para melhor experiência.

## O que é persistido?

### 🎨 Tema (Light/Dark)
- **Chave:** `geef-theme`
- **Valores:** `light` | `dark`
- **Persistido:** Sim, mesmo após logout
- **Sincronização:** Automática ao mudar tema

### 👤 Dados do Usuário
- **Chave:** `geef-user-data`
- **Conteúdo:** Email, nome completo, avatar URL, último login
- **Persistido:** Enquanto autenticado
- **Limpeza:** Automática ao fazer logout

### 📍 Página Visitada
- **Chave:** `geef-last-visited`
- **Conteúdo:** Última rota acessada
- **Uso:** Possibilita restaurar contexto
- **Exclusões:** `/admin`, `/login`

### 🔢 Contagem de Logins
- **Chave:** `geef-login-count-{user-id}`
- **Uso:** Analytics e detecção de padrões
- **Sincronização:** Incrementa a cada login

## Como funciona?

```typescript
// Layout principal executa automaticamente:
<UserPersistenceWrapper user={user}>
  <SiteShell user={user}>{children}</SiteShell>
</UserPersistenceWrapper>

// Isso ativa:
1. useUserPersistence(user) - Salva dados do user
2. usePageTracking() - Rastreia página atual
```

## Hooks Disponíveis

### `useUserPersistence(user)`
Sincroniza automaticamente os dados do usuário com localStorage.

```typescript
import { useUserPersistence } from "@/hooks/useUserPersistence";

export function MyComponent() {
  const { user } = useAuth();
  useUserPersistence(user); // Ativa automaticamente

  return <div>...</div>;
}
```

### `usePageTracking()`
Rastreia a página visitada para restaurar contexto.

```typescript
import { usePageTracking } from "@/hooks/usePageTracking";

export function MyComponent() {
  usePageTracking(); // Salva última página em localStorage

  return <div>...</div>;
}
```

### Funções Utilitárias

```typescript
import { 
  getCachedUserData,
  getUserPreferences,
  saveUserPreference,
  clearUserData
} from "@/hooks/useUserPersistence";

// Obter dados do usuário do cache
const userData = getCachedUserData();
console.log(userData.nome_completo); // "Jean Rocha"

// Obter preferências
const prefs = getUserPreferences();
console.log(prefs.theme); // "dark"

// Salvar preferência
saveUserPreference("language", "en");

// Limpar dados ao fazer logout
clearUserData();
```

## localStorage Keys Reference

| Chave | Tipo | Exemplo |
|-------|------|---------|
| `geef-theme` | string | `"dark"` |
| `geef-user-data` | JSON | `{id, email, nome_completo, avatar_url, lastLogin}` |
| `geef-user-id` | string | `"uuid-do-usuario"` |
| `geef-last-visited` | string | `"/perfil"` |
| `geef-language` | string | `"pt-BR"` |
| `geef-login-count-{id}` | number | `5` |

## Limpeza de Dados

Dados são automaticamente limpos quando:

- ✅ Usuário faz logout → Remove todos os dados de perfil
- ✅ LocalStorage completo → Limpar via DevTools ou `localStorage.clear()`
- ✅ Tema é preservado mesmo após logout (preferência global)

## Segurança

⚠️ **localStorage é client-side, não é criptografado**

Por isso, **NUNCA** armazene em localStorage:
- ❌ Tokens de autenticação
- ❌ Senhas
- ❌ Informações sensíveis

**O que é seguro armazenar:**
- ✅ Nome do usuário
- ✅ Avatar URL
- ✅ Preferências (tema, idioma)
- ✅ Histórico de navegação

## Exemplo de Fluxo Completo

```typescript
// 1. Usuário faz login
// → useUserPersistence salva dados em localStorage

// 2. Usuário navega pela app
// → usePageTracking registra cada página

// 3. Usuário muda tema para "dark"
// → ThemeProvider salva em "geef-theme"

// 4. Usuário fecha o navegador e volta depois
// → localStorage carrega tema "dark" automaticamente
// → Dados do usuário estão disponíveis em getCachedUserData()

// 5. Usuário faz logout
// → clearUserData() remove todos os dados de perfil
// → Tema "dark" é mantido (preferência global)
```

## Performance

localStorage é síncrono e rápido:
- ✅ Reads: ~0.1ms
- ✅ Writes: ~0.5ms
- ✅ Storage limit: ~5-10MB por domínio

Para dados maiores, considere indexedDB (não implementado ainda).

