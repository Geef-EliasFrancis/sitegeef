-- Funções básicas para iniciar o cadastro operacional de escalas.
insert into public.funcoes (nome, descricao, ativo)
values
  ('Dirigente', 'Responsável pela condução da reunião.', true),
  ('Diretor Financeiro', 'Responsável pela gestão financeira da instituição.', true),
  ('Secretário', 'Responsável pelos registros e apoio administrativo.', true)
on conflict (nome) do update
set descricao = excluded.descricao,
    ativo = true;
