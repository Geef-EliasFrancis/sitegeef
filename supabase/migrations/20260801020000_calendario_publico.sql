-- Calendário público baseado nas escalas publicadas.
-- A agenda não deve expor rascunhos nem dados de reuniões virtuais.

create index if not exists idx_escalas_mensais_publicadas
  on public.escalas_mensais (status, ano, mes);

create index if not exists idx_reunioes_data
  on public.reunioes (data);

alter table public.escalas_mensais enable row level security;
alter table public.reunioes enable row level security;

drop policy if exists "calendario_publico_escalas_select" on public.escalas_mensais;
create policy "calendario_publico_escalas_select"
  on public.escalas_mensais
  for select
  to anon, authenticated
  using (status = 'publicada');

drop policy if exists "calendario_publico_reunioes_select" on public.reunioes;
create policy "calendario_publico_reunioes_select"
  on public.reunioes
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.escalas_mensais escala
      where escala.id = reunioes.escala_id
        and escala.status = 'publicada'
    )
  );

comment on table public.escalas_mensais is
  'Escalas mensais; somente registros publicada ficam disponíveis no calendário público.';

comment on table public.reunioes is
  'Reuniões vinculadas a escalas; a leitura pública depende da escala estar publicada.';
