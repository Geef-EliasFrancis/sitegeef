begin;

-- Capacidades operacionais explicitas do tarefeiro.
-- A linha permanece mesmo quando habilitado=false para representar o Sim/Nao
-- escolhido no cadastro e evitar que a ausencia de linha tenha significado
-- ambiguo.
create table if not exists public.tarefeiro_funcoes (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  funcao_id uuid not null references public.funcoes(id) on delete cascade,
  habilitado boolean not null default false,
  prioridade smallint not null default 0,
  desde date,
  ate date,
  observacao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (pessoa_id, funcao_id),
  check (ate is null or desde is null or desde <= ate)
);

create index if not exists idx_tarefeiro_funcoes_pessoa
  on public.tarefeiro_funcoes (pessoa_id, habilitado);

create index if not exists idx_tarefeiro_funcoes_funcao
  on public.tarefeiro_funcoes (funcao_id, habilitado);

alter table public.tarefeiro_funcoes enable row level security;

drop policy if exists tarefeiro_funcoes_select on public.tarefeiro_funcoes;
create policy tarefeiro_funcoes_select
  on public.tarefeiro_funcoes for select
  using (public.is_admin_user());

drop policy if exists tarefeiro_funcoes_insert on public.tarefeiro_funcoes;
create policy tarefeiro_funcoes_insert
  on public.tarefeiro_funcoes for insert
  with check (public.is_admin_user());

drop policy if exists tarefeiro_funcoes_update on public.tarefeiro_funcoes;
create policy tarefeiro_funcoes_update
  on public.tarefeiro_funcoes for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists tarefeiro_funcoes_delete on public.tarefeiro_funcoes;
create policy tarefeiro_funcoes_delete
  on public.tarefeiro_funcoes for delete
  using (public.is_admin_user());

insert into public.funcoes (nome, descricao, ativo)
values
  ('Recepção', 'Acolhimento e organização da entrada da reunião.', true),
  ('Apoio', 'Apoio operacional à realização da reunião.', true),
  ('Paginista', 'Apoio à leitura e ao acompanhamento da reunião.', true),
  ('Prece inicial', 'Responsável pela prece inicial da reunião.', true),
  ('Prece final', 'Responsável pela prece final da reunião.', true),
  ('Aplicador de passe', 'Aplicação de passe na escala específica de passe.', true)
on conflict (nome) do update
set descricao = excluded.descricao,
    ativo = true;

commit;
