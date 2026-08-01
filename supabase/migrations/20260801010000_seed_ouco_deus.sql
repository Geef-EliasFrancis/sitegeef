begin;

insert into public.musicas (id, slug, titulo, autor, tom, status)
values (
  '6d0c2bc8-9b1f-4a7c-9cf2-3f0b4dbf9f0b',
  'ouco-deus-jeronimo-mendonca',
  'Ouço Deus',
  'Jerônimo Mendonça',
  'C',
  'ativa'
)
on conflict (slug) do update set
  titulo = excluded.titulo,
  autor = excluded.autor,
  tom = excluded.tom,
  status = excluded.status;

delete from public.musica_partes
where musica_id = '6d0c2bc8-9b1f-4a7c-9cf2-3f0b4dbf9f0b';

insert into public.musica_partes (musica_id, ordem, tipo, conteudo, cifra, destaque)
values
(
  '6d0c2bc8-9b1f-4a7c-9cf2-3f0b4dbf9f0b', 1, 'estrofe',
  'Ouço Deus no murmúrio das águas dos rios
Ouço Deus no furor de ciclones bravios
Ouço Deus no cantar matinal dos pardais
Ouço Deus no lamento de pobres mortais',
  'C                                G
Ouço Deus   no murmúrio das águas dos rios
      G7                              C
Ouço Deus     no furor de ciclones bravios
                 C7                   F    Fm
Ouço Deus   no cantar matinal dos pardais
      C           G7                 C
Ouço Deus   no lamento de pobres mortais', false
),
(
  '6d0c2bc8-9b1f-4a7c-9cf2-3f0b4dbf9f0b', 2, 'estrofe',
  'Vejo Deus nas estrelas perenes de luz
Vejo Deus no esplendor que a alvorada traduz
Vejo Deus no suave perfume da flor
Vejo Deus no adeus, companheiro da dor',
  '                                    G
Vejo Deus  nas estrelas perenes de luz
      G7                                      C
Vejo Deus    no esplendor  que a alvorada traduz
      C        C7                F   Fm
Vejo Deus  no suave perfume da flor
      C          G7                   C
Vejo Deus   no adeus, companheiro da dor', false
),
(
  '6d0c2bc8-9b1f-4a7c-9cf2-3f0b4dbf9f0b', 3, 'estrofe',
  'Sinto Deus na saudade que evoca lembranças
Sinto Deus no morrer de febris esperanças
Sinto Deus na tristeza de ver-te partir
Sinto Deus na tua volta irmão a sorrir',
  '       C                               G
Sinto Deus   na saudade que evoca lembranças
       G7                             C
Sinto Deus   no morrer de febris esperanças
       C          C7                F    Fm
Sinto Deus na tristeza de ver-te partir
       C              G7               C
Sinto Deus    na tua volta irmão a sorrir', false
);

commit;
