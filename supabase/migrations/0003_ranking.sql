-- Adamante — ranking, conforme §16 e §22 do GDD.
--
-- "A leitura pública de ranking deve passar por uma view que expõe somente
-- nível, sequência e vitórias." Aqui a view expõe também missões concluídas,
-- que o §16 lista, e o nome do personagem — e mais nada.
--
-- O que está deliberadamente FORA: qualquer coisa de composição corporal, peso,
-- gordura, altura, sexo, nascimento e e-mail. Não é só omissão na consulta: a
-- view não tem junção com body_compositions nem com users, então não existe
-- caminho para esse dado chegar aqui por engano depois.

create or replace view public.ranking as
  select
    c.id                as character_id,
    c.name              as nome,
    c.class             as classe,
    c.level             as nivel,
    c.streak_days       as sequencia,
    c.wins              as vitorias,
    coalesce(m.feitas, 0) as missoes
  from public.characters c
  left join (
    select character_id, count(*) as feitas
    from public.missions
    where status = 'concluida'
      -- §18: missão só autodeclarada não conta para o ranking global
      and validation_source <> 'self'
    group by character_id
  ) m on m.character_id = c.id
  where exists (
    -- §16 e privacidade: aparece só quem deixou aparecer
    select 1 from public.characters cc
    where cc.id = c.id
      and coalesce((cc.appearance -> 'privacidade' ->> 'ranking')::boolean, true)
  );

comment on view public.ranking is
  'Leitura pública. Nunca expõe dado de composição corporal (§16, §20).';

-- a view roda com os privilégios de quem a criou, então o RLS de characters não
-- esconde os outros jogadores; é o único ponto de leitura cruzada do sistema
alter view public.ranking set (security_invoker = false);

revoke all on public.ranking from public;
grant select on public.ranking to authenticated;

-- ── ranking da guilda ────────────────────────────────────────────────────────
create or replace function public.ranking_da_guilda()
returns setof public.ranking
language sql stable security definer set search_path = public as $$
  select r.* from public.ranking r
  join public.guild_members gm on gm.character_id = r.character_id
  where gm.guild_id = public.minha_guilda();
$$;

-- ── minha posição no global, sem baixar a tabela inteira ─────────────────────
create or replace function public.minha_posicao()
returns integer language sql stable security definer set search_path = public as $$
  select posicao from (
    select character_id, row_number() over (order by nivel desc, missoes desc, sequencia desc) as posicao
    from public.ranking
  ) t where character_id = public.meu_personagem();
$$;
