-- Adamante — dados mínimos para os testes de servidor.
-- Dois usuários com personagem, na mesma guilda, e o catálogo do necessário.

insert into public.cards (id, name, type, rarity, energy_cost, base_damage, scaling_attr) values
  ('c1', 'Golpe Firme', 'ataque', 'comum', 1, 6, 'FOR'),
  ('c2', 'Investida', 'ataque', 'comum', 2, 10, 'FOR');

insert into public.gear (id, name, slot, rarity, cost_gold, def_bonus, dmg_bonus, crit_bonus) values
  (0, 'Bracelete Rúnico', 'bracelete', 'incomum', 120, 2, 0, 0),
  (1, 'Elmo de Escória', 'elmo', 'rara', 900, 3, 0, 0);

insert into public.mission_templates (id, category, difficulty, title, validation, xp_reward, gold_reward) values
  ('11111111-1111-1111-1111-111111111111', 'corpo', 'dificil', 'Treino de força · 45 min', 'auto', 40, 35),
  ('22222222-2222-2222-2222-222222222222', 'corpo', 'facil', 'Beber 2 L de água', 'self', 15, 10);

-- ── usuário A ────────────────────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@exemplo.com'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'b@exemplo.com');

insert into public.users (id, email, birth_date, biological_sex, height_cm, is_minor, consent_health_data_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@exemplo.com', '1995-04-10', 'm', 174, false, now()),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'b@exemplo.com', '1998-09-02', 'f', 165, false, null);

insert into public.characters (id, user_id, name, class, level, xp_no_nivel, gold, unallocated_points, appearance) values
  ('cccccccc-0000-0000-0000-00000000000a', 'aaaaaaaa-0000-0000-0000-000000000001', 'Vesper', 'guerreiro', 1, 0, 200, 4,
   '{"privacidade": {"ranking": true}}'::jsonb),
  ('cccccccc-0000-0000-0000-00000000000b', 'bbbbbbbb-0000-0000-0000-000000000002', 'Nix', 'mago', 3, 10, 50, 0,
   '{"privacidade": {"ranking": true}}'::jsonb);

insert into public.attributes (character_id, attr, base, allocated)
select c.id, a.attr, a.base, 0
from public.characters c
cross join (values ('FOR', 8), ('CON', 9), ('DES', 7), ('INT', 8), ('SAB', 6), ('CAR', 7)) as a(attr, base);

-- guilda com os dois
insert into public.guilds (id, name, created_by) values
  ('dddddddd-0000-0000-0000-00000000000d', 'Forja Cinzenta', 'cccccccc-0000-0000-0000-00000000000a');
insert into public.guild_members (guild_id, character_id, role) values
  ('dddddddd-0000-0000-0000-00000000000d', 'cccccccc-0000-0000-0000-00000000000a', 'lider'),
  ('dddddddd-0000-0000-0000-00000000000d', 'cccccccc-0000-0000-0000-00000000000b', 'membro');

-- uma missão aberta para cada
insert into public.missions (id, character_id, template_id, category, difficulty, title, due_at) values
  ('eeeeeeee-0000-0000-0000-00000000000a', 'cccccccc-0000-0000-0000-00000000000a',
   '11111111-1111-1111-1111-111111111111', 'corpo', 'dificil', 'Treino de força · 45 min', current_date),
  ('ffffffff-0000-0000-0000-00000000000a', 'cccccccc-0000-0000-0000-00000000000a',
   '22222222-2222-2222-2222-222222222222', 'corpo', 'facil', 'Beber 2 L de água', current_date),
  ('eeeeeeee-0000-0000-0000-00000000000b', 'cccccccc-0000-0000-0000-00000000000b',
   '11111111-1111-1111-1111-111111111111', 'corpo', 'dificil', 'Treino de força · 45 min', current_date);

-- medição anterior do A, para o delta do §6.3 ter de onde sair
insert into public.body_compositions (user_id, measured_at, weight_kg, skeletal_muscle_kg, lean_mass_kg, body_water_pct)
values ('aaaaaaaa-0000-0000-0000-000000000001', current_date - 8, 71.2, 31.8, 54.2, 56.1);
