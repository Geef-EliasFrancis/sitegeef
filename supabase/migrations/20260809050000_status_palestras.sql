alter table public.escala_palestras
  add column if not exists status text not null default 'prevista';

alter table public.escala_palestras
  drop constraint if exists escala_palestras_status_check;

alter table public.escala_palestras
  add constraint escala_palestras_status_check
  check (status in ('prevista', 'confirmada', 'realizada', 'cancelada'));
