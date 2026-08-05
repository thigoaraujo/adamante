-- Adamante — schema, conforme §22 do GDD.
--
-- Regras que o desenho do banco carrega:
--   · Todo dado pessoal fica atrás de RLS (0002). A leitura pública de ranking
--     passa por uma view que expõe só nível, sequência, missões e vitórias (0003).
--   · Composição corporal é dado sensível (§19) e mora numa tabela separada, para
--     a política dela poder ser a mais estrita de todas.
--   · Nada de coluna de recompensa gravável pelo cliente: XP, ouro e ponto só
--     mudam pelas funções de 0005, que rodam com os privilégios do dono (§21.1).

create extension if not exists pgcrypto;

-- ── perfil do usuário ────────────────────────────────────────────────────────
create table public.users (
  id                      uuid primary key references auth.users (id) on delete cascade,
  email                   text,
  birth_date              date,
  biological_sex          text check (biological_sex in ('f', 'm', 'n')),
  height_cm               smallint check (height_cm between 50 and 260),
  timezone                text not null default 'America/Sao_Paulo',
  is_minor                boolean not null default false,
  consent_health_data_at  timestamptz,
  created_at              timestamptz not null default now()
);
comment on column public.users.consent_health_data_at is
  '§19: sem esta data não se coleta nem se calcula nada de composição corporal.';

-- ── personagem ───────────────────────────────────────────────────────────────
create table public.characters (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users (id) on delete cascade,
  name                text not null check (length(btrim(name)) between 1 and 14),
  class               text not null check (class in ('guerreiro', 'ladino', 'mago', 'clerigo')),
  level               smallint not null default 1 check (level between 1 and 20),
  xp_total            integer not null default 0 check (xp_total >= 0),
  xp_no_nivel         integer not null default 0 check (xp_no_nivel >= 0),
  unallocated_points  smallint not null default 0 check (unallocated_points >= 0),
  gold                integer not null default 0 check (gold >= 0),
  fatigue_points      smallint not null default 0 check (fatigue_points between 0 and 9),
  streak_days         integer not null default 0 check (streak_days >= 0),
  streak_best         integer not null default 0 check (streak_best >= 0),
  wins                integer not null default 0 check (wins >= 0),
  appearance          jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  -- §7: a classe é irreversível até o reset de temporada, e o personagem é único
  unique (user_id)
);

-- ── atributos ────────────────────────────────────────────────────────────────
-- Uma linha por atributo em vez das 12 colunas do §22: a fórmula é a mesma para
-- os seis, e assim a restrição de faixa vale para todos sem repetir.
create table public.attributes (
  character_id  uuid not null references public.characters (id) on delete cascade,
  attr          text not null check (attr in ('FOR', 'CON', 'DES', 'INT', 'SAB', 'CAR')),
  base          smallint not null check (base between 6 and 10),
  allocated     smallint not null default 0 check (allocated >= 0),
  primary key (character_id, attr),
  -- §5.2: teto de 20
  constraint teto_20 check (base + allocated <= 20)
);

-- ── composição corporal (§6, dado sensível) ─────────────────────────────────
create table public.body_compositions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users (id) on delete cascade,
  measured_at         date not null,
  weight_kg           numeric(5,2) not null check (weight_kg > 0),
  skeletal_muscle_kg  numeric(5,2) not null check (skeletal_muscle_kg > 0),
  lean_mass_kg        numeric(5,2) check (lean_mass_kg > 0),
  body_fat_pct        numeric(4,1) check (body_fat_pct between 0 and 100),
  body_water_pct      numeric(4,1) check (body_water_pct between 0 and 100),
  bmr_kcal            integer check (bmr_kcal > 0),
  points_granted      smallint not null default 0 check (points_granted between 0 and 5),
  created_at          timestamptz not null default now(),
  -- §6.2: intervalo mínimo de 7 dias, garantido no banco e não só na tela
  unique (user_id, measured_at)
);

-- ── missões ──────────────────────────────────────────────────────────────────
create table public.mission_templates (
  id            uuid primary key default gen_random_uuid(),
  category      text not null check (category in ('corpo', 'mente', 'oficio')),
  difficulty    text not null check (difficulty in ('facil', 'media', 'dificil', 'semanal')),
  title         text not null,
  description   text,
  min_level     smallint not null default 1,
  max_level     smallint not null default 20,
  validation    text not null check (validation in ('auto', 'timer', 'social', 'self')),
  xp_reward     integer not null check (xp_reward > 0),
  gold_reward   integer not null check (gold_reward >= 0),
  forges_card   boolean not null default false
);

create table public.missions (
  id                 uuid primary key default gen_random_uuid(),
  character_id       uuid not null references public.characters (id) on delete cascade,
  template_id        uuid references public.mission_templates (id),
  category           text not null check (category in ('corpo', 'mente', 'oficio')),
  difficulty         text not null check (difficulty in ('facil', 'media', 'dificil', 'semanal')),
  title              text not null,
  due_at             date not null,
  status             text not null default 'aberta' check (status in ('aberta', 'concluida', 'expirada', 'invalidada')),
  completed_at       timestamptz,
  validation_source  text check (validation_source in ('auto', 'timer', 'social', 'self')),
  xp_awarded         integer not null default 0 check (xp_awarded >= 0),
  gold_awarded       integer not null default 0 check (gold_awarded >= 0),
  created_at         timestamptz not null default now()
);

create table public.epic_missions (
  id             uuid primary key default gen_random_uuid(),
  character_id   uuid not null references public.characters (id) on delete cascade,
  title          text not null,
  target_value   integer not null check (target_value > 0),
  current_value  integer not null default 0 check (current_value >= 0),
  unit           text not null,
  deadline       date not null,
  -- §11.4: vencer sem concluir expira, e não pune
  status         text not null default 'ativa' check (status in ('ativa', 'concluida', 'expirada')),
  created_at     timestamptz not null default now()
);

-- ── Descanso Sagrado (§12.3) ─────────────────────────────────────────────────
create table public.rest_days (
  character_id  uuid not null references public.characters (id) on delete cascade,
  day           date not null,
  declared_at   timestamptz not null default now(),
  primary key (character_id, day)
);

-- ── cartas e deck ────────────────────────────────────────────────────────────
create table public.cards (
  id            text primary key,
  name          text not null,
  type          text not null check (type in ('ataque', 'defesa', 'efeito', 'cura', 'recurso')),
  rarity        text not null check (rarity in ('comum', 'incomum', 'rara', 'epica')),
  energy_cost   smallint not null check (energy_cost between 1 and 11),
  base_damage   smallint,
  base_heal     smallint,
  base_defense  smallint,
  scaling_attr  text check (scaling_attr in ('FOR', 'CON', 'DES', 'INT', 'SAB', 'CAR')),
  class_only    text check (class_only in ('guerreiro', 'ladino', 'mago', 'clerigo'))
);

create table public.card_instances (
  id                uuid primary key default gen_random_uuid(),
  character_id      uuid not null references public.characters (id) on delete cascade,
  card_id           text not null references public.cards (id),
  obtained_at       timestamptz not null default now(),
  source_mission_id uuid references public.missions (id) on delete set null
);

create table public.decks (
  id            uuid primary key default gen_random_uuid(),
  character_id  uuid not null references public.characters (id) on delete cascade,
  name          text not null default 'Principal',
  is_active     boolean not null default true
);

create table public.deck_cards (
  deck_id           uuid not null references public.decks (id) on delete cascade,
  card_instance_id  uuid not null references public.card_instances (id) on delete cascade,
  primary key (deck_id, card_instance_id)
);

-- ── equipamento (§17) ────────────────────────────────────────────────────────
create table public.gear (
  id            smallint primary key,
  name          text not null,
  slot          text not null,
  rarity        text not null check (rarity in ('comum', 'incomum', 'rara', 'epica')),
  cost_gold     integer not null check (cost_gold >= 0),
  def_bonus     smallint not null default 0,
  dmg_bonus     smallint not null default 0,
  crit_bonus    smallint not null default 0
);

create table public.character_gear (
  character_id  uuid not null references public.characters (id) on delete cascade,
  gear_id       smallint not null references public.gear (id),
  equipped      boolean not null default false,
  bought_at     timestamptz not null default now(),
  primary key (character_id, gear_id)
);

-- ── social ───────────────────────────────────────────────────────────────────
create table public.guilds (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  -- set null, e não cascade: quem fundou pode excluir a conta (§19) sem levar a
  -- guilda e os outros membros junto. Sem isso o delete quebra na chave estrangeira.
  created_by  uuid references public.characters (id) on delete set null,
  invite_code text not null unique default encode(gen_random_bytes(6), 'hex'),
  created_at  timestamptz not null default now()
);

create table public.guild_members (
  guild_id      uuid not null references public.guilds (id) on delete cascade,
  character_id  uuid not null references public.characters (id) on delete cascade,
  role          text not null default 'membro' check (role in ('lider', 'membro')),
  joined_at     timestamptz not null default now(),
  primary key (guild_id, character_id),
  -- §15: até 10 membros, e ninguém em duas guildas
  unique (character_id)
);

create table public.mission_proofs (
  mission_id  uuid primary key references public.missions (id) on delete cascade,
  photo_path  text,
  note        text,
  sent_at     timestamptz not null default now()
);

create table public.mission_confirmations (
  mission_id  uuid not null references public.missions (id) on delete cascade,
  by_character uuid not null references public.characters (id) on delete cascade,
  kind        text not null check (kind in ('confirma', 'contesta')),
  created_at  timestamptz not null default now(),
  primary key (mission_id, by_character)
);

-- ── batalhas e transações ────────────────────────────────────────────────────
create table public.battles (
  id            uuid primary key default gen_random_uuid(),
  character_id  uuid not null references public.characters (id) on delete cascade,
  kind          text not null default 'pve' check (kind in ('pve', 'pvp')),
  monster       text,
  status        text not null default 'em_curso' check (status in ('em_curso', 'vitoria', 'derrota', 'abandonada')),
  state         jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create table public.transactions (
  id            uuid primary key default gen_random_uuid(),
  character_id  uuid not null references public.characters (id) on delete cascade,
  kind          text not null,
  amount        integer not null,
  reason        text,
  created_at    timestamptz not null default now()
);

-- ── log de acesso a dado sensível (§19) ──────────────────────────────────────
create table public.sensitive_access_log (
  id          bigserial primary key,
  user_id     uuid not null,
  action      text not null,
  at          timestamptz not null default now()
);

-- ── índices obrigatórios do §22 ──────────────────────────────────────────────
create index missions_character_due on public.missions (character_id, due_at);
create index battles_character_status on public.battles (character_id, status);
create index body_comp_user_measured on public.body_compositions (user_id, measured_at desc);
create index guild_members_guild on public.guild_members (guild_id);
create index card_instances_character on public.card_instances (character_id);
