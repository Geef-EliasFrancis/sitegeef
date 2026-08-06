begin;

do $$
begin
  create type public.tipo_vinculo as enum (
    'frequentador', 'tarefeiro', 'voluntario', 'evangelizador', 'crianca',
    'jovem', 'responsavel_legal', 'leitor', 'comprador', 'doador',
    'assistido', 'palestrante', 'dirigente', 'membro_departamento', 'visitante'
  );
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.pessoa_vinculos (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  vinculo public.tipo_vinculo not null,
  desde date,
  unique (pessoa_id, vinculo)
);

create index if not exists idx_pessoa_vinculos_pessoa
  on public.pessoa_vinculos (pessoa_id, vinculo);

alter table public.pessoa_vinculos enable row level security;

drop policy if exists pessoa_vinculos_select on public.pessoa_vinculos;
create policy pessoa_vinculos_select
  on public.pessoa_vinculos for select
  using (public.is_admin_user());

drop policy if exists pessoa_vinculos_insert on public.pessoa_vinculos;
create policy pessoa_vinculos_insert
  on public.pessoa_vinculos for insert
  with check (public.is_admin_user());

drop policy if exists pessoa_vinculos_update on public.pessoa_vinculos;
create policy pessoa_vinculos_update
  on public.pessoa_vinculos for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists pessoa_vinculos_delete on public.pessoa_vinculos;
create policy pessoa_vinculos_delete
  on public.pessoa_vinculos for delete
  using (public.is_admin_user());

commit;
