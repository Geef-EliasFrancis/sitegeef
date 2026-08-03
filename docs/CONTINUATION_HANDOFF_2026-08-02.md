# Handoff de continuidade — 2026-08-02

## Estado do MCP Supabase

- Servidor canônico: `supabase-geef`.
- Projeto: `nycgpokqlmrfzegjlrwa`.
- OAuth renovado nesta sessão com `codex mcp login supabase-geef`.
- Leitura remota confirmada depois da renovação:
  - `list_tables` respondeu sem erro.
- `public.musica_passes` foi criada nesta retomada e está vazia.
  - `list_migrations` respondeu sem erro e ainda não contém a migração da playlist de passes.
- Migração aplicada remotamente via `apply_migration` com o nome `musica_passes_playlist`.
- Migração `musica_passes_ordem_unica` aplicada remotamente: ordens ativas normalizadas e índice único criado.
- Não usar MCP Supabase genérico nem executar `db push` às cegas.

## Última entrega funcional

Commit: `106ad9c feat: criar playlist publica de passes`

Foi criada a playlist de passes com persistência própria e rotas separadas:

- Público: `/musicas/passes`.
- Admin: `/admin/reuniao-publica/musica/passes`.
- Migração local: `supabase/migrations/20260802010000_musica_passes.sql`.
- Repositório e domínio: `lib/musica-passes-repository.ts` e `lib/musica-passes.ts`.
- A ordem é automática no cadastro; a administração usa comandos subir/descer persistidos.
- Player público em loop: `components/musicas/musica-passes-player.tsx`.
- Navegação de músicas atualizada com o submenu `Passes`.

O admin possui cadastro por título, URL de áudio e ordem, além de exclusão. A tela pública lista os itens ativos e toca a sequência em loop.

## Validações já realizadas

- `npm run type-check`: aprovado na entrega da playlist.
- `npm run gate:comp`: aprovado para migração, player público e CRUD administrativo.
- Gate visual estrutural da navegação pública: aprovado.
- Gate ao vivo autenticado: ainda depende de `COMP_GATE_STORAGE_STATE` com uma sessão válida.

## Próxima retomada segura

1. Reabrir/recarregar o contexto se as ferramentas MCP não aparecerem atualizadas.
2. Executar smoke autenticado do admin em `/admin/reuniao-publica/musica/passes`.
3. Cadastrar um áudio de teste e confirmar a leitura pública em `/musicas/passes`.
4. Rerodar os gates visual e ao vivo com `COMP_GATE_STORAGE_STATE` antes de considerar a etapa concluída.

## Cuidados pendentes

- A tabela usa RLS e o fluxo atual acessa o banco no servidor via service role; revisar políticas se houver leitura direta pelo navegador no futuro.
- Não reutilizar credenciais históricas encontradas em scripts antigos; tratá-las como comprometidas e rotacioná-las fora do código.
- O arquivo `supabase/.temp/cli-latest` já estava modificado antes deste handoff e foi preservado sem alteração.
