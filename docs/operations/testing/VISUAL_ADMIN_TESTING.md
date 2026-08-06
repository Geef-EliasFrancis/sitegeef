# Conta administrativa para testes visuais controlados

## Objetivo

Manter uma conta isolada para validar visualmente as telas protegidas do GEEF
em desktop, tablet e mobile, incluindo o fluxo de tarefeiros. A conta não deve
ser usada com dados reais, operação de produção ou compartilhamento externo.

## Identidade autorizada

- E-mail reservado: `teste@geef.local`
- Nome da allowlist: `Administrador visual de testes`
- Estado esperado: autorização ativa em `public.pessoas_allowlist`
- Perfil esperado depois da criação da conta: `administrador` em
  `public.usuarios_sistema`

A migration `20260805030000_seed_visual_admin_allowlist.sql` registra a
autorização de forma idempotente. Allowlist autoriza o e-mail a entrar no
fluxo de autenticação; ela não cria usuário Auth, senha ou privilégio
administrativo sozinha.

## Preparação controlada

1. Criar `teste@geef.local` em Supabase Auth com uma senha temporária fora do
   repositório.
2. Criar a conta pelo cadastro do GEEF, se ela ainda não existir. O cadastro
   cria o registro inicial em `usuarios_sistema` com perfil público.
3. Em `/admin/usuarios`, alterar somente essa conta para o perfil
   `administrador`. O perfil administrador libera os módulos para a sessão
   visual; não habilite essa conta para usuários reais.
4. Fazer login em `http://localhost:3500/login` e confirmar `/admin`.
5. Criar um storage state local para os gates visuais. O arquivo não deve ser
   commitado, enviado para terceiros ou colocado em documentação.

## Validação visual

Com o servidor local em `http://localhost:3500` e uma sessão autenticada:

```powershell
$env:COMP_GATE_REQUIRE_LIVE = '1'
$env:COMP_GATE_STORAGE_STATE = 'tests/.auth/visual-admin.json'
npm run gate:comp
```

Validar pelo menos os breakpoints de 1440, 1024, 900, 768 e 390 pixels,
incluindo `/admin/pessoas`, `/admin/pessoas/allowlist`, `/admin/pessoas/nova`,
`/admin/pessoas/relatorio` e `/admin/escalas`.

## Encerramento e segurança

- Remover ou desativar a entrada da allowlist ao terminar a janela de testes.
- Revogar o registro administrativo e a conta Auth quando não forem mais
  necessários.
- Apagar o storage state local de forma segura e nunca registrar a senha em
  logs, commits ou screenshots.
- Registrar no relatório de teste a data, os breakpoints e as telas validadas.
