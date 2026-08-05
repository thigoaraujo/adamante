-- Adamante — arnês local para validar o schema fora do Supabase.
--
-- Reproduz só o que as migrations dependem da plataforma: os papéis, o schema
-- `auth` e o auth.uid() lendo de request.jwt.claims — que é exatamente como o
-- Supabase avalia RLS. Este arquivo NÃO vai para produção; lá a plataforma já
-- fornece tudo isso.

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;

create schema if not exists auth;

create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text unique
);

-- igual ao do Supabase: sai do JWT da requisição, e é nulo quando não há sessão
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
$$;

grant usage on schema public, auth to anon, authenticated, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;

-- entra como um usuário: papel authenticated + o sub do JWT
create or replace function public.entrar(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
end $$;
