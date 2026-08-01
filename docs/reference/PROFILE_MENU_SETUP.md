# 👤 Menu de Perfil - Setup Completo

## O que foi implementado

✅ **Menu de Perfil Funcional**
- Mostra avatar inicial com primeira letra do nome (ex: "J" para Jean)
- Exibe email e nome do usuário
- Botões: Perfil, Minha Área, Tema, Logout

✅ **Funcionalidades**
- Trocar nome completo
- Fazer upload de foto (quando bucket criado)
- Toggle tema claro/escuro
- Logout com redirecionamento seguro

✅ **Supabase Migrations Automáticas**
- Migrations detectadas automaticamente via GitHub
- Aplicadas ao fazer push para `main`
- Migration consolidada da instituição: `supabase/migrations/20260523_instituicao_modelagem_total.sql`
- Mapa local -> checkpoint remoto: `docs/SUPABASE_MIGRATION_MAP.md`

---

## Setup Final - O que falta fazer

### ⚙️ No Supabase Dashboard

1. Abra: https://supabase.com/dashboard/project/nycgpokqlmrfzegjlrwa/sql/new
2. Cole o SQL do arquivo: `supabase/migrations/20260523_instituicao_modelagem_total.sql`
3. Clique em **Run**

**Isso vai criar:**
- ✅ Tabela `public.profiles` com RLS
- ✅ Função `handle_new_user()` (auto-criar perfil ao registrar)
- ✅ Bucket `avatares` para fotos
- ✅ Políticas de segurança para upload/download

### ✨ Pronto!

Após aplicar as migrations:

1. **Registre um novo usuário** na aplicação
2. **Vá para `/perfil`** e mude o nome
3. **Faça upload de avatar** (opcional, requer bucket criado)
4. **Saia e faça login novamente**
5. **Verifique o header** - avatar inicial + nome devem aparecer ✓

---

## Scripts Disponíveis

```bash
# Ver status das migrations
npm run db:status

# Aplicar migrations (requer conexão direta - para desenvolvimento local)
npm run geef:migrations

# Setup simplificado com instruções
npm run geef:sql
```

---

## Arquivos Criados

```
supabase/
├── combined-migrations.sql          ← SQL para aplicar tudo
├── config.toml                      ← Config Supabase CLI
└── migrations/
    ├── 20260510_create_ops_events.sql
    ├── 20260515_auth_profiles.sql
    ├── 20260515_geef_erp.sql
    ├── 20260515_rls_sensitive_modules.sql
    ├── 20260516_fix_profiles_and_storage.sql
    ├── 20260517_pessoas_usuarios_policies.sql
    └── 20260523_instituicao_modelagem_total.sql

scripts/
├── geef-migrations.mjs              ← Runner de migrations
├── setup-migrations.mjs             ← Setup interativo
└── ...outros scripts de suporte
```

---

## Fluxo Automático (GitHub Integration)

1. Você faz `git push origin main`
2. GitHub Actions executa
3. Se Supabase está linkado com GitHub:
   - Detecta mudanças em `supabase/migrations/`
   - Aplica automaticamente no banco de produção

---

## Troubleshooting

### Avatar não mostra
- [ ] Tabela `profiles` foi criada? (cheque Supabase SQL)
- [ ] Função `handle_new_user()` existe?
- [ ] Usuário tem registro em `auth.users`?

### Nome não atualiza no header
- [ ] Fez logout e login de novo?
- [ ] `revalidatePath("/", "layout")` foi chamado?
- [ ] User metadata foi atualizado? (cheque Supabase Auth → Users)

### Upload de avatar não funciona
- [ ] Bucket `avatares` foi criado?
- [ ] Políticas de storage estão ativas?
- [ ] Você está logado?

---

## Próximos Passos (Opcional)

- [ ] Adicionar crop de imagem antes de upload
- [ ] Adicionar mudança de email
- [ ] Adicionar autenticação via Google/GitHub
- [ ] Adicionar 2FA (autenticação de dois fatores)
