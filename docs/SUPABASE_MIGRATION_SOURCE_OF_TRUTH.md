# Fonte da verdade de migrations Supabase GEEF

## Escopo

O único projeto remoto autorizado é o GEEF:

- project ref: `nycgpokqlmrfzegjlrwa`
- servidor MCP: `supabase-geef`
- diretório local: `supabase/migrations/`
- manifesto versionado: `supabase/MIGRATION_MANIFEST.json`

O manifesto registra todos os arquivos locais, checkpoints remotos conhecidos,
aliases históricos e anomalias que precisam de reconciliação.

## Gate obrigatório

Antes de qualquer escrita, execute:

```powershell
npm run migration:gate
```

O gate valida:

- project ref e diretório canônicos;
- cobertura do manifesto sobre os arquivos locais;
- nomes com versão numérica;
- versões locais duplicadas;
- sintaxe básica do `.env`;
- configuração aceita pela Supabase CLI;
- leitura real do histórico remoto via `supabase migration list --linked`;
- checkpoints remotos não registrados ou sem fonte local.

Se houver falha, nenhuma aplicação deve ser feita. O comando existente
`npm run apply-migration -- <arquivo.sql>` executa o mesmo gate antes de abrir
qualquer conexão ou chamar a API.

## Fluxo aprovado

1. Atualizar ou revisar o manifesto.
2. Rodar `npm run migration:gate`.
3. Confirmar que a migration selecionada está em `state: "pending"`.
4. Aplicar uma única migration pelo comando gated.
5. Rodar novamente `npm run db:status` e `npm run migration:gate`.
6. Validar schema, RLS e fluxo funcional.
7. Criar um commit lógico da etapa.

Não usar `supabase db push`, `supabase migration repair` ou SQL Editor para
contornar o gate. Em especial, `migration repair` não deve ser usado para
resolver divergência sem uma reconciliação manual documentada.

## Auditoria remota de 2026-08-05

A leitura foi feita com a CLI linkada ao projeto correto. O histórico remoto
retornou 11 checkpoints sem arquivo local correspondente:

```text
20260527024607
20260527024618
20260527031129
20260527031336
20260801142100
20260802033054
20260803001952
20260803005230
20260803032928
20260804011252
20260804011253
```

Também existem quatro grupos de arquivos locais com versões duplicadas:

```text
20260515: auth_profiles, geef_erp, rls_sensitive_modules
20260518: admin_user_jwt_fallback, debug_rls_usuarios, lgpd_modulo,
          lgpd_retention_policy, lgpd_solicitacoes_titular
20260527: musica_autores_normalizacao, musica_media
20260802010000: musica_passes, reuniao_publica_avisos
```

O último grupo, por exemplo, contém dois arquivos:

```text
20260802010000_musica_passes.sql
20260802010000_reuniao_publica_avisos.sql
```

Esses pontos bloqueiam a aplicação da migration de disponibilidade dos
tarefeiros até que o histórico seja reconciliado. O gate foi criado para
falhar exatamente nesse cenário.

## Reconciliação necessária

Para cada checkpoint remoto sem fonte local, a equipe deve identificar a
alteração real no projeto Supabase, criar ou localizar o arquivo SQL
correspondente e registrar o vínculo no manifesto. Para a versão duplicada,
deve-se escolher um timestamp único sem renomear cegamente um arquivo já
aplicado no remoto.

Depois da reconciliação, atualizar este documento e o manifesto no mesmo
commit da etapa. Só então o gate poderá liberar a aplicação de novas migrations.
