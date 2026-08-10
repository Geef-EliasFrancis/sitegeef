create table if not exists public.escala_funcoes_historico (
  id uuid primary key default gen_random_uuid(),
  escala_funcao_id uuid not null references public.escala_funcoes(id) on delete cascade,
  pessoa_anterior_id uuid references public.pessoas(id) on delete set null,
  substituto_anterior_id uuid references public.pessoas(id) on delete set null,
  pessoa_nova_id uuid references public.pessoas(id) on delete set null,
  substituto_novo_id uuid references public.pessoas(id) on delete set null,
  motivo text,
  alterado_por uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);

create index if not exists escala_funcoes_historico_funcao_idx
  on public.escala_funcoes_historico (escala_funcao_id, criado_em desc);

alter table public.escala_funcoes_historico enable row level security;

drop policy if exists escala_funcoes_historico_admin_all on public.escala_funcoes_historico;
create policy escala_funcoes_historico_admin_all
  on public.escala_funcoes_historico for all
  using (public.is_admin_user())
  with check (public.is_admin_user());
