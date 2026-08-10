# Mapa de migrations Supabase GEEF

Este documento alinha os nomes dos arquivos locais de migration com os checkpoints registrados no remoto `supabase-geef`.

## Correspondências

| Arquivo local | Checkpoint remoto |
|---|---|
| `supabase/migrations/20260510_create_ops_events.sql` | `geef_erp_instituicao_bootstrap` |
| `supabase/migrations/20260515_auth_profiles.sql` | `auth_profiles` |
| `supabase/migrations/20260515_geef_erp.sql` | `geef_erp_remaining_tables` |
| `supabase/migrations/20260515_rls_sensitive_modules.sql` | `rls_sensitive_modules` |
| `supabase/migrations/20260516_fix_profiles_and_storage.sql` | `fix_profiles_and_storage` |
| `supabase/migrations/20260517_pessoas_usuarios_policies.sql` | `pessoas_usuarios_policies_exact` |
| `supabase/migrations/20260518_admin_user_jwt_fallback.sql` | `admin_user_jwt_fallback` |
| `supabase/migrations/20260523_instituicao_modelagem_total.sql` | `instituicao_modelagem_total` |
| `supabase/migrations/20260527_musica_autores_normalizacao.sql` | `20260527_musica_autores_normalizacao` |
| `supabase/migrations/20260527030702_musica_creditos_unificados.sql` | `20260527030702_musica_creditos_unificados` |
| `supabase/migrations/20260801020000_calendario_publico.sql` | `20260801020000_calendario_publico` |
| `supabase/migrations/20260809010000_tarefeiro_funcoes.sql` | `20260810015051` |
| `supabase/migrations/20260809020000_funcoes_escalaveis.sql` | `20260810015155` |
| `supabase/migrations/20260809030000_passe_quantidade_sorteio.sql` | `20260810015246` |
| `supabase/migrations/20260809040000_palestrantes_externos.sql` | pendente de aplicação |

## Observações

- O remoto registrou os blocos por checkpoints idempotentes, não por replay bruto dos nomes originais.
- As migrations antigas de instituição foram consolidadas em um único arquivo local.
- Os arquivos locais continuam como fonte de verdade para o repositório e para scripts existentes.
- A migration antiga de autores de música ficou como legado documental; o catálogo unificado atual é `20260527030702_musica_creditos_unificados`.
