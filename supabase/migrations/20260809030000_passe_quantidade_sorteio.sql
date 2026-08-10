begin;

alter table public.reunioes
  add column if not exists passe_quantidade smallint not null default 0;

alter table public.reunioes
  drop constraint if exists reunioes_passe_quantidade_check;

alter table public.reunioes
  add constraint reunioes_passe_quantidade_check check (passe_quantidade between 0 and 50);

comment on column public.reunioes.passe_quantidade is
  'Quantidade desejada de aplicadores de passe para a reunião.';

commit;
