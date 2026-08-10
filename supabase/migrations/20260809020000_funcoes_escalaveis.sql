begin;

alter table public.funcoes
  add column if not exists escalavel boolean not null default false;

update public.funcoes
set escalavel = true
where lower(nome) in (
  'dirigente',
  'recepção',
  'apoio',
  'paginista',
  'prece inicial',
  'prece final',
  'aplicador de passe'
);

comment on column public.funcoes.escalavel is
  'Indica se a funcao pode ser usada na montagem de escalas operacionais.';

commit;
