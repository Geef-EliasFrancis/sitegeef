create table if not exists public.escala_passe_historico (
  id uuid primary key default gen_random_uuid(),
  escala_passe_id uuid not null references public.escala_passe(id) on delete cascade,
  pessoa_anterior_id uuid references public.pessoas(id) on delete set null,
  pessoa_nova_id uuid references public.pessoas(id) on delete set null,
  posicao_anterior integer,
  posicao_nova integer,
  motivo text,
  alterado_por uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);

create index if not exists escala_passe_historico_passe_idx
  on public.escala_passe_historico (escala_passe_id, criado_em desc);

alter table public.escala_passe_historico enable row level security;

drop policy if exists escala_passe_historico_admin_all on public.escala_passe_historico;
create policy escala_passe_historico_admin_all
  on public.escala_passe_historico for all
  using (public.is_admin_user())
  with check (public.is_admin_user());
