-- Avisos próprios da reunião pública, separados de comunicação e notificações internas.
create table if not exists public.reuniao_publica_avisos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  conteudo text,
  quando text,
  status text not null default 'rascunho' check (status in ('rascunho', 'publicado')),
  ordem integer not null default 0,
  publicado_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists reuniao_publica_avisos_status_ordem_idx
  on public.reuniao_publica_avisos (status, ordem, criado_em desc);

alter table public.reuniao_publica_avisos enable row level security;

drop policy if exists "service_role can manage reuniao_publica_avisos" on public.reuniao_publica_avisos;
create policy "service_role can manage reuniao_publica_avisos"
  on public.reuniao_publica_avisos
  for all
  to service_role
  using (true)
  with check (true);

revoke all on table public.reuniao_publica_avisos from anon, authenticated;
grant select, insert, update, delete on table public.reuniao_publica_avisos to service_role;

comment on table public.reuniao_publica_avisos is 'Avisos da reunião pública; separado de publicacoes e notificacoes do sistema.';
