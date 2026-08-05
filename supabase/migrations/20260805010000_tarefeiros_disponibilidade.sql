begin;

create table if not exists public.tarefeiro_disponibilidades (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  disponivel boolean not null default true,
  inicio time,
  fim time,
  observacao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (pessoa_id, dia_semana),
  check ((inicio is null and fim is null) or (inicio is not null and fim is not null and inicio < fim))
);

create index if not exists idx_tarefeiro_disponibilidades_pessoa
  on public.tarefeiro_disponibilidades (pessoa_id, dia_semana);

alter table public.tarefeiro_disponibilidades enable row level security;

drop policy if exists tarefeiro_disponibilidades_select on public.tarefeiro_disponibilidades;
create policy tarefeiro_disponibilidades_select
  on public.tarefeiro_disponibilidades for select
  using (public.is_admin_user());

drop policy if exists tarefeiro_disponibilidades_insert on public.tarefeiro_disponibilidades;
create policy tarefeiro_disponibilidades_insert
  on public.tarefeiro_disponibilidades for insert
  with check (public.is_admin_user());

drop policy if exists tarefeiro_disponibilidades_update on public.tarefeiro_disponibilidades;
create policy tarefeiro_disponibilidades_update
  on public.tarefeiro_disponibilidades for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists tarefeiro_disponibilidades_delete on public.tarefeiro_disponibilidades;
create policy tarefeiro_disponibilidades_delete
  on public.tarefeiro_disponibilidades for delete
  using (public.is_admin_user());

commit;
