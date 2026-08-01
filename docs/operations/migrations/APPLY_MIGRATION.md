# 🚀 Aplicar Migration GEEF ERP

## Como obter a URL do banco

1. Vá para o **Supabase Dashboard**: https://app.supabase.com/
2. Selecione seu projeto `site-geef`
3. Clique em **Connect**
4. Copie a conexão Postgres direta ou a URL do Session Pooler

## Fluxo validado neste projeto

Quando a conexão direta não estiver disponível ou a CLI falhar ao ler o `.env`, use este fluxo:

1. Exporte `SUPABASE_ACCESS_TOKEN` com o token de acesso do projeto.
2. Faça `supabase link --project-ref nycgpokqlmrfzegjlrwa` em um workdir limpo ou temporário.
3. Aplique a migration pela CLI com `supabase db push`, ou use a Management API `POST /v1/projects/{ref}/database/migrations`.
4. Para consultas pontuais de diagnóstico, use `POST /v1/projects/{ref}/database/query`.

Esse fluxo evita depender do host direto `db.nycgpokqlmrfzegjlrwa.supabase.co` quando a máquina não resolve IPv6 ou quando o `.env` local está inconsistente para a CLI.

## Aplicar via script

```bash
# Na raiz do projeto:
export GEEF_SUPABASE_DB_URL="postgresql://postgres:[SUA-SENHA]@db.nycgpokqlmrfzegjlrwa.supabase.co:5432/postgres"
npm run apply-migration
```

Se `GEEF_SUPABASE_DB_URL` não estiver definido, o script usa `SUPABASE_DB_URL` ou `DATABASE_URL` automaticamente.

Se a variável do banco não existir, mas você tiver o token de acesso do projeto, prefira a CLI linkada ou a Management API descrita acima.

## Aplicar a migration RLS dos módulos sensíveis

```bash
export GEEF_SUPABASE_DB_URL="postgresql://postgres:[SUA-SENHA]@db.nycgpokqlmrfzegjlrwa.supabase.co:5432/postgres"
npm run apply-rls-sensitive-modules
```

## Aplicar manualmente

Se preferir fazer manualmente:

1. Vá para **SQL Editor**: https://app.supabase.com/project/nycgpokqlmrfzegjlrwa/sql/editor
2. Clique em **New Query**
3. Consulte `docs/SUPABASE_MIGRATION_MAP.md` e, se quiser replay manual do arquivo local, use `supabase/migrations/20260515_rls_sensitive_modules.sql`
4. Clique em **Run**

## Verificar se funcionou

```bash
npm run check-migration
```

## Verificar a RLS dos módulos sensíveis

```bash
export GEEF_SUPABASE_DB_URL="postgresql://postgres:[SUA-SENHA]@db.nycgpokqlmrfzegjlrwa.supabase.co:5432/postgres"
npm run check-rls-sensitive-modules
```

Esse verificador confirma se as tabelas-alvo têm RLS ativa e se há políticas registradas. Com `GEEF_SUPABASE_DB_URL`, `SUPABASE_DB_URL` ou `DATABASE_URL`, ele usa conexão direta automaticamente.

Deve listar as 52 tabelas criadas:
- pessoas
- usuario_sistema
- departamentos
- funcoes
- temas_doutrinarios
- escalas_mensais
- ... (47 mais)
