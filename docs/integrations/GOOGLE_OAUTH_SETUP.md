# Google OAuth Setup Guide

## 🎯 Objetivo
Configurar autenticação via Google OAuth para permitir que usuários façam login com suas contas Google.

---

## 📋 Opção 1: Configurar via Script (Recomendado)

### Pré-requisitos
1. Credenciais do Google (Client ID e Secret)
2. (Opcional) Token de acesso do Supabase

### Passos

#### 1.1 Obter credenciais do Google

1. Abra [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative a **Google+ API**:
   - Vá para `APIs & Services` → `Library`
   - Procure por "Google+ API"
   - Clique `Enable`

4. Crie **OAuth 2.0 Client ID**:
   - Vá para `APIs & Services` → `Credentials`
   - Clique `Create Credentials` → `OAuth Client ID`
   - Selecione `Web Application`
   - Configure os URIs:

   **Authorized JavaScript origins:**
   ```
   https://nycgpokqlmrfzegjlrwa.supabase.co
   http://localhost:3500
   ```

   **Authorized redirect URIs:**
   ```
   https://nycgpokqlmrfzegjlrwa.supabase.co/auth/v1/callback?provider=google
   ```

5. Copie o **Client ID** e **Client Secret**

#### 1.2 Executar script de configuração

```bash
# Definir variáveis de ambiente
export GOOGLE_CLIENT_ID="seu-client-id-aqui"
export GOOGLE_CLIENT_SECRET="seu-client-secret-aqui"

# Opcional: adicionar token Supabase para usar Management API
export SUPABASE_ACCESS_TOKEN="seu-token-aqui"

# Executar script
node scripts/setup-google-oauth.js
```

O script vai:
- ✅ Validar as credenciais
- ✅ Tentar configurar via Management API (se tiver token)
- ✅ Mostrar instruções do Dashboard se necessário

---

## 📋 Opção 2: Configurar via Dashboard (Manual)

### Passos

1. **Abra Supabase Dashboard**
   - [https://app.supabase.com/project/nycgpokqlmrfzegjlrwa](https://app.supabase.com/project/nycgpokqlmrfzegjlrwa)

2. **Vá para Authentication → Providers**
   - No sidebar, clique `Authentication`
   - Procure por `Providers` ou `Social`

3. **Clique em Google**
   - Ativa a chave toggle (se não estiver ativa)
   - Você verá campos para **Client ID** e **Client Secret**

4. **Cole as credenciais**
   ```
   Client ID: [copie do Google Cloud Console]
   Client Secret: [copie do Google Cloud Console]
   ```

5. **Clique Save**
   - Aguarde a confirmação (normalmente "Provider updated successfully")

---

## 🔑 Obter Supabase Access Token (Opcional)

Para usar o script com Management API:

1. Acesse [https://app.supabase.com/account/tokens](https://app.supabase.com/account/tokens)
2. Clique `Create New Token`
3. Nomeie: `claude-oauth-setup`
4. Escopo: Selecione `admin`
5. Clique `Create Token`
6. Copie o token

Então:
```bash
export SUPABASE_ACCESS_TOKEN="seu-token-copiado"
```

---

## ✅ Verificar Configuração

### 1. No Dashboard
- Vá para `Authentication` → `Providers`
- Google deve estar marcado como `Enabled`
- Client ID deve estar preenchido

### 2. Testando no Site
1. Abra [http://localhost:3500/login](http://localhost:3500/login)
2. Clique **"Entrar com Google"**
3. Você será redirecionado para o login do Google
4. Autorize o acesso
5. Deve redirecionar para `/perfil` (se autenticado)

### 3. Verificar no Banco
```sql
-- Acesse Supabase SQL Editor
SELECT * FROM auth.users WHERE email LIKE '%@gmail.com';
```

Você deve ver os usuários que criaram via Google.

---

## 🔧 Configuração Avançada

### Personalizar redirecionamento após login

No arquivo `app/login/actions.ts`, você pode customizar:

```typescript
export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      // Ou para dev:
      // redirectTo: "http://localhost:3500/auth/callback",
    },
  });
  // ...
}
```

### Escopos do Google

Se precisar de permissões extras do Google (calendário, drive, etc):

```typescript
options: {
  redirectTo: "...",
  scopes: ["email", "profile", "https://www.googleapis.com/auth/calendar"],
}
```

---

## ❌ Troubleshooting

### Erro: "redirect_uri_mismatch"
**Solução:**
- Verifique se a URL exata está em `Authorized redirect URIs` no Google Console
- Deve ser: `https://nycgpokqlmrfzegjlrwa.supabase.co/auth/v1/callback?provider=google`

### Erro: "invalid_client"
**Solução:**
- Client ID ou Secret estão incorretos
- Copie novamente do Google Console
- Certifique-se de não ter espaços extras

### Erro: "Client ID is not set"
**Solução:**
- Google OAuth não foi habilitado no Supabase
- Vá para `Authentication → Providers → Google` e habilite

### Login redireciona para `/login?error=auth_error`
**Solução:**
- Verifique logs no Supabase: `Authentication → Logs`
- Verifique se as credenciais estão corretas
- Tente logout completo (`rm -rf .next/cache`) e refresh

---

## 📚 Referências

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/oauth2)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## ✨ Próximos Passos

1. ✅ Configurar Google OAuth (este guia)
2. ✅ Testar fluxo de login: http://localhost:3500/login
3. ✅ Aplicar migration de profiles (se não aplicado ainda)
4. ⏭️ Implementar email de confirmação
5. ⏭️ Implementar reset de senha
6. ⏭️ Adicionar 2FA (futuro)

---

**Data**: 2026-05-15  
**Status**: Pronto para configuração
