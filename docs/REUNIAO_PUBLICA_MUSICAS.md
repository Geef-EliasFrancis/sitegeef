# Reuniao publica - Musicas

Este documento descreve o modulo de musicas e a navegacao da area de reuniao publica para o proximo agente.

## Objetivo

- Permitir cadastro e edicao de musicas na area interna.
- Permitir busca por autor, titulo e trecho de letra.
- Permitir exibir uma musica em tela publica 16:9.
- Permitir troca da musica exibida por pareamento de tela, sem depender de abrir dois navegadores autenticados.

## Rotas principais

### Publico

- `/musicas` - catalogo publico com busca.
- `/musicas/[slug]` - leitura completa de uma musica ativa.
- `/musicas/exibir` - tela publica ao vivo controlada pelo admin.

### Admin

- `/admin/reuniao-publica` - pagina-resumo do modulo.
- `/admin/reuniao-publica/musica` - cadastro, edicao e pareamento.
- `/admin/instituicao/musicas` - alias legado que redireciona para `/admin/reuniao-publica/musica`.

## Navegacao do admin

- A aba superior nova chama-se `Reuniao publica`.
- O menu lateral mostra `Reuniao publica` com o submenu `Musicas`.
- O item foi movido para fora de `Instituicao` para evitar duplicacao com outras areas.
- O shell do admin deriva a area atual pelo pathname em `components/admin/use-admin-shell-area.ts`.

## Schema aplicado no Supabase

Migration:

- `supabase/migrations/20260526011410_musicas_institucionais.sql`
- `supabase/migrations/20260527030702_musica_creditos_unificados.sql`

Objetos criados:

- `public.musicas`
- `public.musica_partes`
- `public.musica_sessoes`
- enums:
  - `public.musica_parte_tipo`
  - `public.musica_sessao_modo`

Regras do schema:

- `musicas.status` aceita `ativa`, `rascunho` e `inativa`.
- `musica_partes` guarda ordem, tipo, titulo, conteudo, cifra e destaque.
- `musica_sessoes` guarda o codigo de pareamento, a musica vinculada, o modo de exibicao e o ultimo acesso.
- RLS esta habilitado nas tres tabelas.
- Apenas `service_role` possui policy de gerenciamento.
- `anon` e `authenticated` foram revogados.

## Arquitetura dos dados

Arquivo principal:

- `lib/musicas.ts`

Responsabilidades:

- `slugifyMusica()`
- `generatePairingCode()`
- `normalizePartes()`
- `musicaMatchesSearch()`
- leitura:
  - `listMusicas()`
  - `listPublicMusicas()`
  - `getMusicaBySlug()`
  - `getMusicaById()`
  - `getMusicasResumo()`
- `getMusicaSessaoByCodigo()`
- `getMusicaSessaoComMusica()`
- `listMusicaSessoes()`
- `getMusicaExibicaoPublicaAtual()`
- escrita:
  - `saveMusica()`
  - `deleteMusica()`
  - `saveMusicaSessao()`
  - `saveMusicaExibicaoPublica()`
  - `createMusicaSessao()`
  - `patchMusicaSessao()`
- `touchMusicaSessao()`

Regras de exibicao:

- a rota `/musicas/exibir` le a musica marcada como exibição pública no admin;
- a musica marcada como exibição pública usa uma sessao unica reservada;
- a tela publica escuta a troca da sessão publicizada e atualiza sem refresh manual;
- a tela `/musicas/exibir` usa o mesmo leitor visual de `/musicas/[slug]`, só trocando o conteúdo em tempo real;
- músicas muito longas podem cair automaticamente no layout compacto de exibição para caber sem scroll;
- se uma sessao ficar sem acesso por mais de 1 hora, ela e encerrada como inativa na proxima leitura do estado;
- enquanto a apresentacao estiver aberta, o polling da tela publica renova `ultimo_acesso_em`;
- quando a abertura precisar ser manual, o atalho do admin deve apontar para `/admin/reuniao-publica/musica/sessoes`.

Observacoes:

- O helper usa `createServiceRoleClient()`.
- O catalogo e a tela publica leem a mesma fonte de verdade.
- A busca compara titulo, autor, tom, versao, observacoes, titulo das partes, conteudo e cifra.
- O link do catalogo publico aponta para `/musicas/[slug]`; a exibição ao vivo fica em `/musicas/exibir`.

## Fluxo do admin

Arquivo:

- `app/admin/reuniao-publica/musica/page.tsx`

O que essa pagina faz:

- carrega musicas cadastradas
- carrega resumo de musicas e sessoes
- permite buscar por termo
- mostra qual musica esta marcada como exibição pública
- permite marcar uma unica musica como ao vivo para a tela pública
- permite editar uma musica existente
- permite criar uma nova musica
- permite criar e salvar sessao de pareamento
- lista sessoes com atalho para abrir a tela publica, encerrar ou reativar
- permite encerrar todas as sessoes ativas em lote
- o encerramento em lote pede confirmacao antes de enviar

Formularios e actions:

- `app/admin/instituicao/musicas/actions.ts`

Mesmo estando em `app/admin/instituicao`, este arquivo agora serve a rota nova e redireciona para:

- `/admin/reuniao-publica/musica`

Mudancas de estado:

- salvar musica invalida cache
- excluir musica invalida cache
- salvar pareamento invalida cache
- criar sessao invalida cache
- encerrar/reativar sessao invalida cache
- encerrar todas as sessoes ativas invalida cache

Cache:

- `lib/admin/cache.ts`
- `invalidateMusicasCache()` agora revalida:
  - `/musicas`
  - `/musicas/[slug]`
  - `/musicas/exibir`
  - `/admin/instituicao/musicas`
  - `/admin/reuniao-publica`
  - `/admin/reuniao-publica/musica`

## Fluxo da tela publica

Arquivo:

- `components/musicas/musica-display-live.tsx`

Comportamento:

- recebe a sessao e a musica iniciais do servidor
- faz refresh por `fetch('/api/musicas/sessoes/[codigo]')`
- atualiza a cada 5 segundos
- se a sessao estiver inativa, mostra tela de espera
- se o modo estiver em `catalogo`, mostra mensagem de catalogo aguardando selecao
- se houver musica e modo `exibicao`, delega para `MusicaReader`

Endpoint de sincronizacao:

- `app/api/musicas/sessoes/[codigo]/route.ts`

Comportamento:

- responde com a sessao e a musica vinculada
- tenta atualizar `ultimo_acesso_em`
- se o touch falhar, a leitura continua

## Fluxo do catalogo publico

Arquivo:

- `app/musicas/page.tsx`

Comportamento:

- lista apenas musicas ativas
- oferece busca por autor, titulo e trecho
- mostra cards com autor, tom, versao e resumo inicial
- cada musica leva para `/musicas/[slug]`

Arquivo:

- `components/musicas/musica-reader.tsx`

Comportamento:

- usa o logo institucional
- exibe titulo, autor, tom e versao
- organiza partes em blocos
- destaca refrao/ponte/intro/cifra quando marcado
- renderiza cifra em bloco separado abaixo da parte quando houver conteudo

## Layout e estilo

Arquivos:

- `styles/globals.css`
- `styles/admin.css`

Observacoes:

- a leitura publica foi desenhada para caber bem em 16:9
- o modulo tenta manter logo, cores e divisao por partes
- o admin recebeu estilos de editor de musica e pareamento
- a lista do admin nao exibe mais a contagem de partes; esse espaco virou o controle de exibição pública

## Permissoes

Arquivo:

- `app/admin/instituicao/layout.tsx`

O modulo de musicas usa o mesmo gate de publicacao do admin e aceita:

- perfil `diretoria`
- perfil `secretaria`
- perfil `comunicacao`
- permissao `pode_publicar`

## Status de validacao

Valido no momento em que este doc foi escrito:

- `npm run build` passou
  - a migration remota do catálogo unificado foi aplicada no projeto GEEF
- `/musicas` responde
- `/musicas/exibir` responde
- `/admin/reuniao-publica` responde
- `/admin/reuniao-publica/musica` responde

## Cuidados para o proximo agente

- Nao voltar a apontar o menu de musicas para `Instituicao`.
- Nao remover o redirect legado de `/admin/instituicao/musicas` sem atualizar links e caches.
- Se mexer em `next dev` e `next build` no mesmo checkout, reiniciar o dev server antes de confiar em CSS/chunks.
- Se aparecer erro de MIME tipo `text/plain` para CSS/JS, limpar `.next` e subir o dev server de novo antes de culpar o componente.
- A rota `/musicas/exibir` e apenas orientativa, entao nao deve gerar sessao por conta propria.

## Proximo passo natural

- criar 1 ou 2 musicas de exemplo no admin
- testar a troca de musica na tela publica por telefone
- decidir se o modo `catalogo` continua sendo uma opcao visivel ou se a UI deve simplificar para apenas `exibicao`
