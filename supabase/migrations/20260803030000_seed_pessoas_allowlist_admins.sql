begin;

insert into public.pessoas_allowlist (nome, email, ativo)
select null, seed.email, true
from (values
  ('contatogeef@gmail.com'),
  ('app.jmr@gmail.com')
) as seed(email)
where not exists (
  select 1
  from public.pessoas_allowlist existing
  where lower(btrim(existing.email)) = seed.email
);

commit;
