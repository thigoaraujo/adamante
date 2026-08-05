-- Adamante — recompensas, conforme §21.1 do GDD.
--
-- "Cálculos que geram recompensa rodam no servidor. O cliente exibe; ele não
-- decide. Cliente que calcula XP é cliente que é hackeado na primeira semana."
--
-- Como isso é garantido aqui:
--   1. Um trigger rejeita qualquer UPDATE em coluna de progressão de characters
--      (nível, XP, ouro, pontos, fadiga, sequência, vitórias) que não venha de
--      dentro de uma das funções abaixo. Nem o dono da linha consegue.
--   2. As funções são SECURITY DEFINER: elas ligam a flag de sessão, calculam
--      pela camada `regra` e desligam a flag.
--   3. Tudo que credita deixa rastro em transactions.

-- ── 1. a trava ───────────────────────────────────────────────────────────────
create or replace function public.bloqueia_progressao()
returns trigger language plpgsql as $$
begin
  if coalesce(current_setting('adamante.autorizado', true), '0') = '1' then
    return new;
  end if;
  if new.level        is distinct from old.level
  or new.xp_total     is distinct from old.xp_total
  or new.xp_no_nivel  is distinct from old.xp_no_nivel
  or new.gold         is distinct from old.gold
  or new.unallocated_points is distinct from old.unallocated_points
  or new.fatigue_points is distinct from old.fatigue_points
  or new.streak_days  is distinct from old.streak_days
  or new.streak_best  is distinct from old.streak_best
  or new.wins         is distinct from old.wins then
    raise exception 'progressão só muda pelas funções do servidor (§21.1)'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger characters_sem_autoatribuicao
  before update on public.characters
  for each row execute function public.bloqueia_progressao();

-- mesma ideia para atributos: alocar é função, não UPDATE
create or replace function public.bloqueia_alocacao()
returns trigger language plpgsql as $$
begin
  if coalesce(current_setting('adamante.autorizado', true), '0') = '1' then
    return new;
  end if;
  raise exception 'alocação de atributo só pela função alocar_ponto (§5.4)'
    using errcode = '42501';
end;
$$;

create trigger attributes_sem_autoatribuicao
  before update on public.attributes
  for each row execute function public.bloqueia_alocacao();

-- ── 2. concluir missão: o servidor decide quanto vale ────────────────────────
create or replace function public.concluir_missao(p_missao uuid, p_origem text default 'self')
returns jsonb language plpgsql security definer set search_path = public, regra as $$
declare
  v_char   public.characters;
  v_miss   public.missions;
  v_xp     integer;
  v_ouro   integer;
  v_nivel  integer;
  v_no_niv integer;
  v_pontos integer := 0;
  v_subiu  boolean := false;
  v_pend   integer;
begin
  if p_origem not in ('auto', 'timer', 'social', 'self') then
    raise exception 'origem de validação inválida: %', p_origem using errcode = '22023';
  end if;

  select * into v_miss from public.missions
   where id = p_missao and character_id = public.meu_personagem()
   for update;
  if not found then
    raise exception 'missão não é sua ou não existe' using errcode = '42501';
  end if;
  if v_miss.status <> 'aberta' then
    raise exception 'missão já foi fechada' using errcode = '22023';
  end if;

  select * into v_char from public.characters where id = v_miss.character_id for update;

  -- a recompensa vem do catálogo, nunca de parâmetro do cliente (§18)
  select regra.xp_validado(t.xp_reward, p_origem), t.gold_reward
    into v_xp, v_ouro
    from public.mission_templates t where t.id = v_miss.template_id;
  if v_xp is null then                       -- missão sem template: usa a tabela de §11.2
    v_xp := regra.xp_validado(case v_miss.difficulty
              when 'facil' then 15 when 'media' then 25 when 'dificil' then 40 else 150 end, p_origem);
    v_ouro := case v_miss.difficulty
              when 'facil' then 10 when 'media' then 20 when 'dificil' then 35 else 100 end;
  end if;

  -- §10: aplica XP e sobe de nível quantas vezes couber
  v_nivel := v_char.level; v_no_niv := v_char.xp_no_nivel + v_xp;
  while v_no_niv >= regra.xp_para_subir(v_nivel) and v_nivel < 20 loop
    v_no_niv := v_no_niv - regra.xp_para_subir(v_nivel);
    v_nivel := v_nivel + 1;
    v_pontos := v_pontos + 2;
    v_subiu := true;
  end loop;

  perform set_config('adamante.autorizado', '1', true);

  update public.missions
     set status = 'concluida', completed_at = now(),
         validation_source = p_origem, xp_awarded = v_xp, gold_awarded = v_ouro
   where id = p_missao;

  -- §12.2: dia com todas as diárias concluídas remove 2 pontos de fadiga
  select count(*) into v_pend from public.missions
   where character_id = v_char.id and due_at = v_miss.due_at and status = 'aberta';

  update public.characters
     set level = v_nivel,
         xp_no_nivel = v_no_niv,
         xp_total = xp_total + v_xp,
         gold = gold + v_ouro,
         unallocated_points = unallocated_points + v_pontos,
         fatigue_points = case when v_pend = 0 then greatest(0, fatigue_points - 2) else fatigue_points end,
         streak_days = case when v_pend = 0 then streak_days + 1 else streak_days end,
         streak_best = greatest(streak_best, case when v_pend = 0 then streak_days + 1 else streak_days end)
   where id = v_char.id;

  insert into public.transactions (character_id, kind, amount, reason)
       values (v_char.id, 'xp', v_xp, 'missão ' || v_miss.title),
              (v_char.id, 'ouro', v_ouro, 'missão ' || v_miss.title);

  perform set_config('adamante.autorizado', '0', true);

  return jsonb_build_object('xp', v_xp, 'ouro', v_ouro, 'nivel', v_nivel,
                            'subiu', v_subiu, 'pontos', v_pontos,
                            'diarias_pendentes', v_pend);
end;
$$;

-- ── 3. alocar ponto, com o custo progressivo do §5.4 ────────────────────────
create or replace function public.alocar_ponto(p_attr text, p_quantos integer default 1)
returns jsonb language plpgsql security definer set search_path = public, regra as $$
declare
  v_char public.characters;
  v_at   public.attributes;
  v_custo integer;
begin
  if p_quantos < 1 then
    raise exception 'quantidade inválida' using errcode = '22023';
  end if;
  select * into v_char from public.characters where id = public.meu_personagem() for update;
  if not found then raise exception 'sem personagem' using errcode = '42501'; end if;

  select * into v_at from public.attributes
   where character_id = v_char.id and attr = p_attr for update;
  if not found then raise exception 'atributo inválido: %', p_attr using errcode = '22023'; end if;

  if v_at.base + v_at.allocated + p_quantos > 20 then
    raise exception 'teto de 20 (§5.2)' using errcode = '22023';
  end if;

  v_custo := regra.custo_de_incrementos(v_at.base + v_at.allocated, p_quantos);
  if v_custo > v_char.unallocated_points then
    raise exception 'pontos insuficientes: custa %, você tem %', v_custo, v_char.unallocated_points
      using errcode = '22023';
  end if;

  perform set_config('adamante.autorizado', '1', true);
  update public.attributes set allocated = allocated + p_quantos
   where character_id = v_char.id and attr = p_attr;
  update public.characters set unallocated_points = unallocated_points - v_custo
   where id = v_char.id;
  perform set_config('adamante.autorizado', '0', true);

  return jsonb_build_object('atributo', p_attr, 'custo', v_custo,
                            'valor', v_at.base + v_at.allocated + p_quantos,
                            'pontos_restantes', v_char.unallocated_points - v_custo);
end;
$$;

-- ── 4. registrar medição: delta, teto de 5, nunca negativo ──────────────────
create or replace function public.registrar_medicao(
  p_peso numeric, p_musculo numeric, p_massa_magra numeric default null,
  p_gordura numeric default null, p_agua numeric default null, p_bmr integer default null,
  p_quando date default current_date)
returns jsonb language plpgsql security definer set search_path = public, regra as $$
declare
  v_ant public.body_compositions;
  v_pontos integer := 0;
  v_delta numeric := 0;
  v_subiu_agua boolean := false;
  v_dias integer;
begin
  -- §19: sem consentimento explícito, nem começa
  if not exists (select 1 from public.users
                  where id = auth.uid() and consent_health_data_at is not null) then
    raise exception 'sem consentimento registrado para dado de saúde (§19)' using errcode = '42501';
  end if;
  -- §20: menor de 18 não tem o módulo
  if exists (select 1 from public.users where id = auth.uid() and is_minor) then
    raise exception 'módulo de composição corporal desativado para menor de 18 (§20)' using errcode = '42501';
  end if;

  select * into v_ant from public.body_compositions
   where user_id = auth.uid() order by measured_at desc limit 1;

  -- §6.2: intervalo mínimo de 7 dias
  if v_ant.id is not null then
    v_dias := p_quando - v_ant.measured_at;
    if v_dias < 7 then
      raise exception 'faltam % dias para a próxima medição (§6.2)', 7 - v_dias using errcode = '22023';
    end if;
    v_delta := coalesce(p_massa_magra, p_musculo) - coalesce(v_ant.lean_mass_kg, v_ant.skeletal_muscle_kg);
    v_subiu_agua := coalesce(p_agua, 0) - coalesce(v_ant.body_water_pct, 0) >= 1;
    v_pontos := regra.pontos_da_medicao(v_delta, v_subiu_agua);
  end if;

  insert into public.body_compositions (user_id, measured_at, weight_kg, skeletal_muscle_kg,
                                        lean_mass_kg, body_fat_pct, body_water_pct, bmr_kcal, points_granted)
       values (auth.uid(), p_quando, p_peso, p_musculo, p_massa_magra, p_gordura, p_agua, p_bmr, v_pontos);

  insert into public.sensitive_access_log (user_id, action) values (auth.uid(), 'medicao_registrada');

  if v_pontos > 0 then
    perform set_config('adamante.autorizado', '1', true);
    update public.characters set unallocated_points = unallocated_points + v_pontos
     where id = public.meu_personagem();
    insert into public.transactions (character_id, kind, amount, reason)
         values (public.meu_personagem(), 'ponto', v_pontos, 'medição de bioimpedância');
    perform set_config('adamante.autorizado', '0', true);
  end if;

  -- devolve só a direção da mudança: §6.4 proíbe o app qualificar o valor
  return jsonb_build_object('pontos', v_pontos, 'direcao',
    case when v_delta > 0 then 'subiu' when v_delta < 0 then 'desceu' else 'igual' end);
end;
$$;

-- ── 5. comprar equipamento (§17) ─────────────────────────────────────────────
create or replace function public.comprar_equipamento(p_gear smallint)
returns jsonb language plpgsql security definer set search_path = public, regra as $$
declare v_char public.characters; v_gear public.gear;
begin
  select * into v_char from public.characters where id = public.meu_personagem() for update;
  select * into v_gear from public.gear where id = p_gear;
  if not found then raise exception 'equipamento inexistente' using errcode = '22023'; end if;
  if exists (select 1 from public.character_gear
              where character_id = v_char.id and gear_id = p_gear) then
    raise exception 'você já tem esse equipamento' using errcode = '22023';
  end if;
  if v_gear.cost_gold > v_char.gold then
    raise exception 'ouro insuficiente: custa %, você tem %', v_gear.cost_gold, v_char.gold
      using errcode = '22023';
  end if;

  perform set_config('adamante.autorizado', '1', true);
  update public.characters set gold = gold - v_gear.cost_gold where id = v_char.id;
  insert into public.character_gear (character_id, gear_id) values (v_char.id, p_gear);
  insert into public.transactions (character_id, kind, amount, reason)
       values (v_char.id, 'ouro', -v_gear.cost_gold, 'compra de ' || v_gear.name);
  perform set_config('adamante.autorizado', '0', true);

  return jsonb_build_object('equipamento', v_gear.name, 'ouro_restante', v_char.gold - v_gear.cost_gold);
end;
$$;

-- ── 6. validação social: maioria libera, 3 contestações invalidam (§15) ─────
create or replace function public.confirmar_missao(p_missao uuid, p_kind text default 'confirma')
returns jsonb language plpgsql security definer set search_path = public, regra as $$
declare
  v_miss public.missions;
  v_conf integer; v_cont integer; v_membros integer; v_maioria integer;
begin
  if p_kind not in ('confirma', 'contesta') then
    raise exception 'tipo inválido' using errcode = '22023';
  end if;
  select * into v_miss from public.missions where id = p_missao for update;
  if not found then raise exception 'missão inexistente' using errcode = '42501'; end if;
  if v_miss.character_id = public.meu_personagem() then
    raise exception 'não se confirma a própria missão (§15)' using errcode = '42501';
  end if;

  insert into public.mission_confirmations (mission_id, by_character, kind)
       values (p_missao, public.meu_personagem(), p_kind)
  on conflict (mission_id, by_character) do update set kind = excluded.kind;

  select count(*) filter (where kind = 'confirma'), count(*) filter (where kind = 'contesta')
    into v_conf, v_cont from public.mission_confirmations where mission_id = p_missao;
  select count(*) into v_membros from public.guild_members
   where guild_id = (select guild_id from public.guild_members
                      where character_id = v_miss.character_id);
  v_maioria := greatest(2, ceil(v_membros / 2.0)::integer + 1);

  -- §15: três contestações invalidam e devolvem as recompensas
  if v_cont >= 3 and v_miss.status = 'concluida' then
    perform set_config('adamante.autorizado', '1', true);
    update public.characters
       set xp_total = greatest(0, xp_total - v_miss.xp_awarded),
           gold = greatest(0, gold - v_miss.gold_awarded)
     where id = v_miss.character_id;
    update public.missions set status = 'invalidada' where id = p_missao;
    insert into public.transactions (character_id, kind, amount, reason)
         values (v_miss.character_id, 'xp', -v_miss.xp_awarded, 'missão invalidada pela guilda');
    perform set_config('adamante.autorizado', '0', true);
    return jsonb_build_object('resultado', 'invalidada', 'contestacoes', v_cont);
  end if;

  return jsonb_build_object('resultado', case when v_conf >= v_maioria then 'validada' else 'aguardando' end,
                            'confirmacoes', v_conf, 'maioria', v_maioria, 'contestacoes', v_cont);
end;
$$;

-- ── 7. §19: exportar e excluir, os dois em uma chamada ──────────────────────
create or replace function public.exportar_meus_dados()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  insert into public.sensitive_access_log (user_id, action) values (auth.uid(), 'exportacao');
  select jsonb_build_object(
    'exportado_em', now(),
    'perfil', (select to_jsonb(u) from public.users u where u.id = auth.uid()),
    'personagem', (select to_jsonb(c) from public.characters c where c.user_id = auth.uid()),
    'atributos', (select jsonb_agg(to_jsonb(a)) from public.attributes a where a.character_id = public.meu_personagem()),
    'composicao_corporal', (select jsonb_agg(to_jsonb(b)) from public.body_compositions b where b.user_id = auth.uid()),
    'missoes', (select jsonb_agg(to_jsonb(m)) from public.missions m where m.character_id = public.meu_personagem()),
    'extrato', (select jsonb_agg(to_jsonb(t)) from public.transactions t where t.character_id = public.meu_personagem())
  ) into v;
  return v;
end;
$$;

create or replace function public.excluir_minha_conta()
returns void language plpgsql security definer set search_path = public as $$
begin
  -- o cascade de users leva personagem, atributos, missões, medições e extrato
  delete from public.users where id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.concluir_missao(uuid, text)      to authenticated;
grant execute on function public.alocar_ponto(text, integer)       to authenticated;
grant execute on function public.registrar_medicao(numeric, numeric, numeric, numeric, numeric, integer, date) to authenticated;
grant execute on function public.comprar_equipamento(smallint)     to authenticated;
grant execute on function public.confirmar_missao(uuid, text)      to authenticated;
grant execute on function public.exportar_meus_dados()             to authenticated;
grant execute on function public.excluir_minha_conta()             to authenticated;
