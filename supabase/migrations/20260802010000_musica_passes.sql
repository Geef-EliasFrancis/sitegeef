-- Playlist de passes: áudios independentes do catálogo de músicas.
create table if not exists public.musica_passes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  audio_url text not null,
  ordem integer not null default 0 check (ordem >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_musica_passes_ativos_ordem
  on public.musica_passes (ativo, ordem, criado_em);

alter table public.musica_passes enable row level security;
comment on table public.musica_passes is 'Playlist de áudios para passe, administrada no contexto de músicas.';
