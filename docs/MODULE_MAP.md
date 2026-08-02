# Module Map - Site GEEF

## Leituras principais

### Publico

- `app/page.tsx` - home publica
- `app/[slug]/page.tsx` - paginas de conteudo
- `components/site-shell.tsx` - header/footer publico
- `components/content-page.tsx` - template das paginas publicas
- `components/user-menu.tsx` - menu do usuario

### Auth

- `app/login/page.tsx` - login compacto
- `components/auth/login-form.tsx` - formulario de acesso
- `app/login/actions.ts` - sign in, sign up e google
- `app/auth/callback/route.ts` - callback OAuth

### Area do usuario

- `app/minha-area/page.tsx`
- `app/leitor/page.tsx`
- `lib/areas/user-area.ts`
- `lib/areas/invalidate-user-area.ts`

### Admin shell

- `app/admin/layout.tsx`
- `components/admin/admin-header.tsx`
- `components/admin/admin-sidebar.tsx`
- `styles/admin.css`
- `styles/admin-sidebar.css`

## Mapa Admin

### Shell e gates

- `app/admin/layout.tsx` - shell base, valida sessao e carrega permissoes
- `components/admin/admin-module-gate.tsx` - gate padrao por permissao e perfil
- `components/admin/admin-sidebar.tsx` - navegacao interna com visibilidade condicionada
- `styles/admin.css` - base visual do admin
- `styles/admin-sidebar.css` - sidebar e grupos colapsaveis

### Dashboard

- Entrada: `app/admin/page.tsx`
- Cache: `lib/admin/dashboard.ts`
- Invalida: `lib/admin/cache.ts`
- Guarda: `app/admin/layout.tsx`

### Pessoas e acesso

- `app/admin/pessoas/page.tsx` - cadastro central
- `app/admin/pessoas/nova/page.tsx`
- `app/admin/pessoas/[id]/page.tsx`
- `app/admin/usuarios/page.tsx` - usuarios e permissoes
- `app/admin/usuarios/novo/page.tsx`
- `app/admin/usuarios/[id]/page.tsx`
- `app/admin/instituicao/page.tsx`
- `app/admin/instituicao/contas/page.tsx`
- `app/admin/instituicao/contatos/page.tsx`
- `app/admin/instituicao/editar/page.tsx`
- `app/admin/governanca/page.tsx`
- `app/admin/governanca/assembleias/page.tsx`
- `app/admin/governanca/assembleias/nova/page.tsx`
- `app/admin/governanca/assembleias/[id]/page.tsx`
- `app/admin/governanca/cargos/page.tsx`
- `app/admin/governanca/cargos/novo/page.tsx`
- `app/admin/governanca/cargos/[id]/page.tsx`
- `app/admin/governanca/diretorias/page.tsx`
- `app/admin/governanca/diretorias/nova/page.tsx`
- `app/admin/governanca/diretorias/[id]/page.tsx`
- `app/admin/departamentos/page.tsx`
- `app/admin/departamentos/novo/page.tsx`
- `app/admin/departamentos/[id]/page.tsx`
- Guarda: `pode_pessoas` ou perfis `diretoria` / `secretaria`

### Escalas e funcoes

- `app/admin/escalas/page.tsx`
- `app/admin/escalas/nova/page.tsx`
- `app/admin/escalas/[id]/page.tsx`
- `app/admin/escalas/[id]/funcao/[funcao_id]/page.tsx`
- `app/admin/escalas/[id]/passe/[passe_id]/page.tsx`
- `app/admin/escalas/[id]/reuniao/[reuniao_id]/nova-funcao/page.tsx`
- `app/admin/escalas/[id]/reuniao/[reuniao_id]/novo-passe/page.tsx`
- `app/admin/funcoes/page.tsx`
- `app/admin/funcoes/nova/page.tsx`
- `app/admin/funcoes/[id]/page.tsx`
- `app/admin/funcoes/temas/page.tsx`
- `app/admin/funcoes/temas/novo/page.tsx`
- `app/admin/funcoes/temas/[id]/page.tsx`
- Publico: `app/escalas/page.tsx`
- Cache publico: `lib/escalas/public-escalas.ts`
- Guarda: `pode_escalas` ou perfil `coord_passe`

### Biblioteca

- `app/admin/biblioteca/page.tsx`
- `app/admin/biblioteca/nova-obra/page.tsx`
- `app/admin/biblioteca/[id]/page.tsx`
- `app/admin/biblioteca/[id]/novo-exemplar/page.tsx`
- `app/admin/biblioteca/[id]/exemplar/[exemplar_id]/page.tsx`
- `app/admin/biblioteca/emprestimos/page.tsx`
- `app/admin/biblioteca/emprestimos/novo/page.tsx`
- `app/admin/biblioteca/emprestimos/[id]/page.tsx`
- `app/admin/biblioteca/reservas/page.tsx`
- `app/admin/biblioteca/reservas/nova/page.tsx`
- `app/admin/biblioteca/reservas/[id]/page.tsx`
- Actions: `app/admin/biblioteca/actions.ts`, `app/admin/biblioteca/emprestimos/actions.ts`, `app/admin/biblioteca/reservas/actions.ts`
- Escritas invalidam cache da biblioteca e area do usuario
- Guarda: `pode_biblioteca` ou perfil `bibliotecario`

### Documentos e comunicacao

- `app/admin/documentos/page.tsx`
- `app/admin/documentos/novo/page.tsx`
- `app/admin/documentos/[id]/page.tsx`
- `app/admin/documentos/termos/page.tsx`
- `app/admin/documentos/termos/novo/page.tsx`
- `app/admin/documentos/termos/[id]/page.tsx`
- `app/admin/documentos/consentimentos/page.tsx`
- `app/admin/documentos/consentimentos/novo/page.tsx`
- `app/admin/documentos/consentimentos/[id]/page.tsx`
- `app/admin/documentos/voluntariado/page.tsx`
- `app/admin/documentos/voluntariado/novo/page.tsx`
- `app/admin/documentos/voluntariado/[id]/page.tsx`
- `app/admin/comunicacao/page.tsx`
- `app/admin/comunicacao/nova-publicacao/page.tsx`
- `app/admin/comunicacao/[id]/page.tsx`
- `app/admin/notificacoes/page.tsx`
- `app/admin/notificacoes/[id]/page.tsx`
- `app/admin/reunioes-virtuais/page.tsx`
- `app/admin/reunioes-virtuais/nova/page.tsx`
- `app/admin/reunioes-virtuais/[id]/page.tsx`
- Guarda: `pode_publicar` ou perfis `comunicacao` / `secretaria`

### Reuniao publica e musicas

- `app/admin/reuniao-publica/page.tsx`
- `app/admin/reuniao-publica/musica/page.tsx`
- `app/admin/instituicao/musicas/page.tsx` - alias legado para a nova area
- `app/admin/instituicao/musicas/actions.ts` - actions compartilhadas do editor
- `app/musicas/page.tsx`
- `app/musicas/[slug]/page.tsx`
- `app/musicas/exibir/page.tsx`
- `app/api/musicas/sessoes/[codigo]/route.ts`
- `components/admin/musicas/musica-editor-form.tsx`
- `components/musicas/musica-reader.tsx`
- `components/musicas/musica-display-live.tsx`
- `lib/musicas.ts`
- Guarda: `pode_publicar` ou perfis `comunicacao` / `secretaria` / `diretoria`

### Livraria

- `app/admin/livraria/page.tsx`
- `app/admin/livraria/novo-produto/page.tsx`
- `app/admin/livraria/[id]/page.tsx`
- `app/admin/livraria/[id]/editar/page.tsx`
- `app/admin/livraria/[id]/movimento/page.tsx`
- Actions: `app/admin/livraria/actions.ts`
- Guarda: `pode_livraria` ou perfil `livraria`

### Financeiro e patrimonio

- `app/admin/financeiro/page.tsx`
- `app/admin/financeiro/dre/page.tsx`
- `app/admin/financeiro/centros-custo/page.tsx`
- `app/admin/financeiro/centros-custo/novo/page.tsx`
- `app/admin/financeiro/centros-custo/[id]/page.tsx`
- `app/admin/financeiro/lancamentos/page.tsx`
- `app/admin/financeiro/lancamentos/novo/page.tsx`
- `app/admin/financeiro/lancamentos/[id]/page.tsx`
- `app/admin/financeiro/plano-contas/page.tsx`
- `app/admin/financeiro/plano-contas/nova/page.tsx`
- `app/admin/financeiro/plano-contas/[id]/page.tsx`
- `app/admin/patrimonio/page.tsx`
- `app/admin/patrimonio/novo-bem/page.tsx`
- `app/admin/patrimonio/[id]/page.tsx`
- Guarda: `pode_financeiro` ou perfil `financeiro` / `patrimonio`

### Atendimento e apse

- `app/admin/atendimento/page.tsx`
- `app/admin/atendimento/recepcao/page.tsx`
- `app/admin/atendimento/recepcao/novo/page.tsx`
- `app/admin/atendimento/recepcao/[id]/page.tsx`
- `app/admin/atendimento/fraterno/page.tsx`
- `app/admin/atendimento/fraterno/novo/page.tsx`
- `app/admin/atendimento/fraterno/[id]/page.tsx`
- `app/admin/atendimento/irradiacao/page.tsx`
- `app/admin/atendimento/irradiacao/nova/page.tsx`
- `app/admin/atendimento/irradiacao/[id]/page.tsx`
- `app/admin/atendimento/evangelhos-lar/page.tsx`
- `app/admin/atendimento/evangelhos-lar/novo/page.tsx`
- `app/admin/atendimento/evangelhos-lar/[id]/page.tsx`
- `app/admin/apse/page.tsx`
- `app/admin/apse/familias/page.tsx`
- `app/admin/apse/familias/nova/page.tsx`
- `app/admin/apse/familias/[id]/page.tsx`
- `app/admin/apse/campanhas/page.tsx`
- `app/admin/apse/campanhas/nova/page.tsx`
- `app/admin/apse/campanhas/[id]/page.tsx`
- `app/admin/apse/atendimentos/page.tsx`
- Guarda: `pode_atendimento` ou perfil `coord_atendimento` / `coord_passe`, e `pode_apse` ou perfil `coord_apse`

### Evangelizacao e estudos

- `app/admin/evangelizacao/page.tsx`
- `app/admin/evangelizacao/criancas/page.tsx`
- `app/admin/evangelizacao/criancas/nova/page.tsx`
- `app/admin/evangelizacao/criancas/[id]/page.tsx`
- `app/admin/evangelizacao/turmas/page.tsx`
- `app/admin/evangelizacao/turmas/nova/page.tsx`
- `app/admin/evangelizacao/turmas/[id]/page.tsx`
- `app/admin/juventude/page.tsx`
- `app/admin/juventude/novo/page.tsx`
- `app/admin/juventude/[id]/page.tsx`
- `app/admin/estudos/page.tsx`
- `app/admin/estudos/cursos/page.tsx`
- `app/admin/estudos/cursos/novo/page.tsx`
- `app/admin/estudos/cursos/[id]/page.tsx`
- `app/admin/estudos/turmas/page.tsx`
- `app/admin/estudos/turmas/nova/page.tsx`
- `app/admin/estudos/turmas/[id]/page.tsx`
- Guarda: `pode_publicar` ou perfis `evangelizador` / `coord_juventude` / `coord_estudos`

### Planejamento e relatorios

- `app/admin/planejamento/page.tsx`
- `app/admin/planejamento/nova-meta/page.tsx`
- `app/admin/planejamento/[id]/page.tsx`
- `app/admin/relatorios/page.tsx`
- Guarda: `pode_publicar` ou perfil `diretoria`

### Mediunidade

- `app/admin/mediunidade/page.tsx`
- `app/admin/mediunidade/novo-grupo/page.tsx`
- `app/admin/mediunidade/[id]/page.tsx`
- Guarda: `pode_mediunidade`

### Observabilidade e manutencao

- `app/admin/erros/page.tsx` - observabilidade e debug
- `app/admin/fix-usuarios/route.ts` - manutencao pontual de usuarios
- `app/admin/migrations/page.tsx` - operacao de migracoes
- Guarda: admin-only

### Outros módulos internos

- `app/admin/notificacoes/page.tsx` e `app/admin/reunioes-virtuais/page.tsx` seguem o mesmo bloco de publicacao
- `app/admin/departamentos`, `app/admin/instituicao` e `app/admin/governanca` seguem o bloco de pessoas e acesso
- `app/admin/patrimonio` segue o bloco financeiro e patrimonio
- `app/admin/usuarios` segue o bloco de pessoas e acesso

## Onde procurar antes de editar

1. Ver o `layout.tsx` do segmento.
2. Ver os `actions.ts` do mesmo dominio.
3. Ver `styles/globals.css`, `styles/admin.css` e `styles/admin-sidebar.css`.
4. Ver se existe helper em `lib/` antes de duplicar leitura.

## Regras de manutencao

- Um helper por responsabilidade.
- Um cache tag por dominio.
- Um ponto de invalidacao por dominio.
- Reads simples devem continuar simples.
- Views sensiveis nao devem ser cacheadas no build.
