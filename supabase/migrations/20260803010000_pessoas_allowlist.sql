begin;

create table if not exists public.pessoas_allowlist (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  cpf text,
  observacoes text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.pessoas
  add column if not exists allowlist_id uuid references public.pessoas_allowlist(id);

create index if not exists idx_pessoas_allowlist_ativo
  on public.pessoas_allowlist (ativo, nome);

alter table public.pessoas_allowlist enable row level security;

drop policy if exists pessoas_allowlist_select on public.pessoas_allowlist;
create policy pessoas_allowlist_select
  on public.pessoas_allowlist for select
  using (public.is_admin_user());

drop policy if exists pessoas_allowlist_insert on public.pessoas_allowlist;
create policy pessoas_allowlist_insert
  on public.pessoas_allowlist for insert
  with check (public.is_admin_user());

drop policy if exists pessoas_allowlist_update on public.pessoas_allowlist;
create policy pessoas_allowlist_update
  on public.pessoas_allowlist for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

create or replace function public.enforce_pessoa_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.allowlist_id is null then
    raise exception 'Pessoa precisa de uma autorização ativa na allowlist';
  end if;

  if not exists (
    select 1
    from public.pessoas_allowlist
    where id = new.allowlist_id and ativo = true
  ) then
    raise exception 'A autorização da allowlist está ausente ou inativa';
  end if;

  return new;
end;
$$;

drop trigger if exists pessoas_allowlist_required on public.pessoas;
create trigger pessoas_allowlist_required
  before insert on public.pessoas
  for each row execute function public.enforce_pessoa_allowlist();

commit;
