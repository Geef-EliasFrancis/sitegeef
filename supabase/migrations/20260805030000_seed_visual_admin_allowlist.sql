begin;

insert into public.pessoas_allowlist (nome, email, observacoes, ativo)
select
  'Administrador visual de testes',
  'teste@geef.local',
  'Conta exclusiva para testes visuais controlados; sem dados reais.',
  true
where not exists (
  select 1
  from public.pessoas_allowlist existing
  where lower(btrim(existing.email)) = 'teste@geef.local'
);

update public.pessoas_allowlist
set
  nome = 'Administrador visual de testes',
  observacoes = 'Conta exclusiva para testes visuais controlados; sem dados reais.',
  ativo = true
where lower(btrim(email)) = 'teste@geef.local';

commit;
