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

A leitura foi feita com a CLI linkada e confirmada por consulta somente leitura
ao projeto correto. O histórico remoto retornou estes checkpoints:

```text
20260527024607  -> 20260526_musica_versoes.sql
20260527024618  -> 20260527_musica_media.sql
20260527031129  -> 20260527030702_musica_creditos_unificados.sql
20260527031336  -> cleanup_musica_creditos_testes (sem SQL local)
20260801142100  -> 20260801020000_calendario_publico.sql
20260802033054  -> 20260802010000_reuniao_publica_avisos.sql
20260803001952  -> 20260802010000_musica_passes.sql
20260803005230  -> 20260802020000_musica_passes_ordem_unica.sql
20260803032928  -> 20260803010000_pessoas_allowlist.sql
20260804011252  -> 20260803020000_pessoas_allowlist_email_required.sql
20260804011253  -> 20260803030000_seed_pessoas_allowlist_admins.sql
```

O checkpoint `cleanup_musica_creditos_testes` é mantido como histórico remoto
documentado; seu SQL original não está disponível neste checkout e não deve ser
recriado por suposição.

A consulta de schema também encontrou uma divergência funcional: `pessoas` e
`pessoas_allowlist` existem remotamente, mas `pessoa_vinculos` e o tipo
`tipo_vinculo` não existem. A correção aditiva está em
`20260805020000_reconcile_pessoa_vinculos.sql`. A migration de disponibilidade
foi aplicada via Management API e registrada remotamente como
`20260806001407`.

A correção de `pessoa_vinculos` foi aplicada e registrada como
`20260806001500`. A leitura remota confirmou a tabela, o tipo
`public.tipo_vinculo` com os 15 valores esperados e as quatro policies RLS de
leitura, inserção, atualização e exclusão.

Também existem quatro grupos de arquivos locais com versões duplicadas
históricas:

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

As duplicidades são documentadas como bundles históricos e não podem ser
renomeadas cegamente. Migrations novas devem usar timestamps únicos.

## Reconciliação necessária

Para cada checkpoint remoto sem SQL local, a equipe deve manter a evidência no
manifesto e não inventar um arquivo. Para a versão duplicada, deve-se escolher
um timestamp único apenas para migrations novas, sem renomear cegamente um
arquivo já aplicado no remoto.

Depois da reconciliação, atualizar este documento e o manifesto no mesmo
commit da etapa. Só então o gate poderá liberar a aplicação de novas migrations.
