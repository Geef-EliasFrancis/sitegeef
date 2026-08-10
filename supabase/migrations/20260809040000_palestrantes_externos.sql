create table if not exists public.palestrantes (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid references public.pessoas(id) on delete set null,
  nome text not null,
  cidade text,
  instituicao text,
  contato text,
  observacoes text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists palestrantes_nome_idx on public.palestrantes (nome);
create index if not exists palestrantes_pessoa_idx on public.palestrantes (pessoa_id);

alter table public.escala_palestras
  add column if not exists palestrante_id uuid references public.palestrantes(id) on delete set null;

create index if not exists escala_palestras_palestrante_idx
  on public.escala_palestras (palestrante_id);

alter table public.palestrantes enable row level security;

drop policy if exists palestrantes_admin_all on public.palestrantes;
create policy palestrantes_admin_all on public.palestrantes
  for all using (public.is_admin_user()) with check (public.is_admin_user());
