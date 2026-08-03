-- Normaliza a playlist atual e impede ordens duplicadas entre áudios ativos.
with ordenados as (
  select id, row_number() over (order by ordem, criado_em, id) - 1 as nova_ordem
  from public.musica_passes
  where ativo = true
)
update public.musica_passes as passes
set ordem = ordenados.nova_ordem,
    atualizado_em = now()
from ordenados
where passes.id = ordenados.id;

create unique index if not exists idx_musica_passes_ordem_ativa_unica
  on public.musica_passes (ordem)
  where ativo = true;
