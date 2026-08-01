# Guia de Aplicação da Migration - Profiles Table

## 📅 Migration: 20260515_auth_profiles.sql

Checkpoint remoto correspondente: `auth_profiles`

Esta migration cria o sistema de autenticação completo com tabela de perfis, RLS policies, triggers e storage.

---

## ✅ Passo 1: Acesse o Supabase Dashboard

1. Abra [Supabase Dashboard](https://app.supabase.com/project/nycgpokqlmrfzegjlrwa/sql/editor)
2. Acesse o projeto: **GEEF** (nycgpokqlmrfzegjlrwa)
3. Vá para a aba **SQL Editor**

---

## ✅ Passo 2: Copie o SQL da Migration

Abra o arquivo de migration:
```
supabase/migrations/20260515_auth_profiles.sql
```

Mapa de correspondência e histórico remoto: `docs/SUPABASE_MIGRATION_MAP.md`

Ou copie o SQL abaixo:

```sql
-- Create profiles table for user profile data
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nome_completo text,
  avatar_url text,
  email text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Usuário pode ver seu perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Usuário pode atualizar seu perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Policy: Users can insert their own profile (for trigger)
create policy "Usuário pode criar seu perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nome_completo, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger to call function on new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatares', 'avatares', true)
on conflict do nothing;

-- Storage policy: authenticated users can upload to their own folder
create policy "Usuários autenticados podem fazer upload de avatar"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: everyone can view avatars
create policy "Avatares são públicos"
  on storage.objects for select
  using (bucket_id = 'avatares');

-- Storage policy: users can update/delete their own avatar
create policy "Usuários podem atualizar seu avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatares' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Usuários podem deletar seu avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatares' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## ✅ Passo 3: Cole no SQL Editor

1. No **SQL Editor**, cole o SQL completo
2. Você verá a preview com as operações:
   - ✓ Create table `public.profiles`
   - ✓ Enable RLS
   - ✓ 3 RLS Policies
   - ✓ 1 Trigger Function
   - ✓ Create Storage Bucket
   - ✓ 4 Storage Policies

---

## ✅ Passo 4: Execute

1. Clique no botão **"Run"** (ícone de play ▶️)
2. Aguarde a execução (normalmente 2-5 segundos)
3. Você verá a mensagem: **"✓ Done (X ms)"`**

---

## ✅ Verificação

Para verificar se a migration foi aplicada com sucesso:

1. Vá para **Tables** (no sidebar esquerdo)
2. Procure por **`public.profiles`** — deve estar listada
3. Clique nela e verifique as colunas:
   - `id` (uuid)
   - `nome_completo` (text)
   - `avatar_url` (text)
   - `email` (text)
   - `updated_at` (timestamptz)

4. Vá para **Storage** e verifique o bucket **`avatares`**

---

## 🔧 O que a Migration Cria

### Tabela `profiles`
```
id          UUID (Primary Key, FK → auth.users)
nome_completo  TEXT (nullable)
avatar_url    TEXT (nullable)
email        TEXT (nullable)
updated_at    TIMESTAMPTZ (default: now())
```

### RLS Policies (3)
- ✓ SELECT: usuário vê seu próprio perfil
- ✓ UPDATE: usuário edita seu próprio perfil
- ✓ INSERT: usuário cria seu próprio perfil (via trigger)

### Trigger
- **Função**: `handle_new_user()`
  - Executa automaticamente quando novo usuário é criado em `auth.users`
  - Cria entrada em `profiles` com dados do usuário
  
### Storage
- **Bucket**: `avatares` (público)
- **Policies**: 
  - Upload: usuários autenticados em sua pasta
  - View: público (todos podem ver)
  - Delete: proprietário do arquivo

---

## ❌ Se der erro...

**Erro: `relation "auth.users" does not exist`**
- Supabase cria a tabela `auth.users` automaticamente, mas pode não estar disponível em alguns projetos novos
- Solução: Aguarde alguns minutos e tente novamente, ou contate suporte Supabase

**Erro: `permission denied`**
- Você não tem permissão para executar DDL neste projeto
- Solução: Use uma conta com role `admin` ou `superuser`

**Erro: `storage.buckets already exists`**
- O bucket `avatares` já foi criado
- Solução: Remova a linha `insert into storage.buckets...` e execute novamente

---

## ✨ Próximos passos após a migration

1. **Configurar Google OAuth**:
   - Vá para **Authentication** → **Providers** → **Google**
   - Configure suas credenciais OAuth

2. **Testar o fluxo**:
   - Acesse `http://localhost:3500/login`
   - Teste cadastro com email
   - Teste login
   - Teste Google OAuth
   - Teste upload de avatar

3. **Verificar dados**:
   - Vá para **Tables** → **profiles**
   - Após criar um usuário, você verá uma nova linha criada automaticamente

---

## 📝 Notas

- A migration é **idempotente** — se executar 2x, não dará erro na segunda execução
- As policies RLS garantem que usuários só acessem seus próprios dados
- O trigger garante que todo novo usuário tem um perfil automaticamente
- O bucket permite upload seguro de avatares por usuário

---

**Data**: 2026-05-15  
**Status**: Pronto para aplicação
