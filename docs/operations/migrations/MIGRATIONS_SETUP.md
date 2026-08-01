# Configuração de Migrations - Supabase

## Setup Automático para Tabela de Perfil e Storage de Avatares

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse seu projeto no Supabase: https://app.supabase.com
2. Vá para **SQL Editor**
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo:
   ```
   supabase/combined-migrations.sql
   ```
5. Cole no SQL Editor
6. Clique em **Run** ou pressione `Ctrl+Enter`

**Resultado esperado:** Sem erros na execução

### O que será criado:

✅ **Tabela `public.profiles`**
   - Armazena: nome_completo, avatar_url, email
   - RLS habilitado para privacidade

✅ **Função `handle_new_user()`**
   - Cria automaticamente um perfil quando novo usuário se registra
   - Trigger: `on_auth_user_created`

✅ **Bucket `avatares` (Storage)**
   - Público, para armazenar fotos de perfil
   - Políticas de segurança configuradas

✅ **Políticas RLS**
   - Usuários só podem ver/editar seu próprio perfil
   - Upload restrito à própria pasta do usuário

---

## Opção 2: Via Script Node.js (Requer acesso SSH ao banco)

Se você tiver acesso SSH direto ao PostgreSQL:

```bash
npm run migrations:apply
```

---

## Verificar se está tudo certo

Execute esta query no Supabase SQL Editor:

```sql
-- Check if profiles table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'profiles'
) as profiles_exists;

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatares';

-- Check trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'users' AND event_object_schema = 'auth';
```

---

## Troubleshooting

### Erro: "relation \"public.profiles\" already exists"
- Normal! Significa que já foi criado. Você pode rodar novamente sem problemas (usa IF NOT EXISTS)

### Erro de política RLS
- Certifique-se de que está usando a conta de Service Role do Supabase
- Vai em **Settings → API Keys** e use a chave de Service Role

### Avatar upload não funciona
- Verifique se o bucket "avatares" foi criado (vai em Storage → Buckets)
- Confirme que as políticas de insert estão ativas

---

## Próximos passos após migrations

1. Teste criando novo usuário (register)
2. Vá para `/perfil` e mude o nome
3. Faça upload de um avatar
4. Saia e faça login novamente
5. Verifique se o avatar aparece no header

