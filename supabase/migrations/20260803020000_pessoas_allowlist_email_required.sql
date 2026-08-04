begin;

update public.pessoas_allowlist
set email = lower(btrim(email))
where email is not null;

alter table public.pessoas_allowlist
  alter column nome drop not null;

alter table public.pessoas_allowlist
  drop constraint if exists pessoas_allowlist_email_required;

alter table public.pessoas_allowlist
  add constraint pessoas_allowlist_email_required
  check (email is not null and btrim(email) <> '') not valid;

create index if not exists idx_pessoas_allowlist_email_ativo
  on public.pessoas_allowlist (lower(email))
  where ativo = true and email is not null;

commit;
