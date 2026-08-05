-- Adamante — Row Level Security, conforme §19 e §22 do GDD.
--
-- Política padrão: o usuário lê e escreve apenas linhas do próprio user_id.
-- As exceções são explícitas e mínimas:
--   · catálogos (cards, gear, mission_templates) são leitura pública;
--   · membro de guilda vê a missão do colega, para poder confirmar (§15);
--   · ranking sai por uma view separada (0003), nunca por estas tabelas.
--
-- E o mais importante: NENHUMA política concede UPDATE em coluna de recompensa.
-- O cliente não escreve xp, ouro, ponto nem nível — isso é privilégio das
-- funções de 0005 (§21.1: cálculo que gera recompensa roda no servidor).

alter table public.users                  enable row level security;
alter table public.characters             enable row level security;
alter table public.attributes             enable row level security;
alter table public.body_compositions      enable row level security;
alter table public.missions               enable row level security;
alter table public.epic_missions          enable row level security;
alter table public.rest_days              enable row level security;
alter table public.card_instances         enable row level security;
alter table public.decks                  enable row level security;
alter table public.deck_cards             enable row level security;
alter table public.character_gear         enable row level security;
alter table public.guilds                 enable row level security;
alter table public.guild_members          enable row level security;
alter table public.mission_proofs         enable row level security;
alter table public.mission_confirmations  enable row level security;
alter table public.battles                enable row level security;
alter table public.transactions           enable row level security;
alter table public.sensitive_access_log   enable row level security;
alter table public.mission_templates      enable row level security;
alter table public.cards                  enable row level security;
alter table public.gear                   enable row level security;

-- ── quem sou eu, e qual é o meu personagem ───────────────────────────────────
create or replace function public.meu_personagem()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.characters where user_id = auth.uid();
$$;

create or replace function public.minha_guilda()
returns uuid language sql stable security definer set search_path = public as $$
  select guild_id from public.guild_members where character_id = public.meu_personagem();
$$;

-- ── catálogos: leitura para qualquer autenticado, escrita para ninguém ───────
create policy catalogo_cards on public.cards
  for select to authenticated using (true);
create policy catalogo_gear on public.gear
  for select to authenticated using (true);
create policy catalogo_templates on public.mission_templates
  for select to authenticated using (true);

-- ── perfil ───────────────────────────────────────────────────────────────────
create policy users_le_proprio on public.users
  for select using (id = auth.uid());
create policy users_cria_proprio on public.users
  for insert with check (id = auth.uid());
-- o usuário edita o próprio cadastro, mas is_minor é derivado e fica de fora
create policy users_edita_proprio on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy users_apaga_proprio on public.users
  for delete using (id = auth.uid());

-- ── personagem: lê e cria o próprio; NÃO atualiza recompensa ────────────────
create policy chars_le_proprio on public.characters
  for select using (user_id = auth.uid());
create policy chars_cria_proprio on public.characters
  for insert with check (user_id = auth.uid());
-- update liberado só para o que é cosmético; as colunas de progressão são
-- protegidas pelo trigger de 0005, que rejeita alteração fora das funções
create policy chars_edita_proprio on public.characters
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy chars_apaga_proprio on public.characters
  for delete using (user_id = auth.uid());

-- ── atributos: lê os próprios; alocação só pela função ──────────────────────
create policy attrs_le_proprio on public.attributes
  for select using (character_id = public.meu_personagem());
create policy attrs_cria_proprio on public.attributes
  for insert with check (character_id = public.meu_personagem());
-- o UPDATE existe de propósito, mesmo sendo sempre negado pelo trigger de 0005:
-- sem política, a tentativa afetaria zero linhas em silêncio, e quem escreve o
-- cliente ficaria sem saber por que a alocação não pegou. Com ela, vem o erro
-- dizendo para usar alocar_ponto().
create policy attrs_edita_proprio on public.attributes
  for update using (character_id = public.meu_personagem())
  with check (character_id = public.meu_personagem());

-- ── composição corporal: a política mais estrita, e nada de update ──────────
-- §6.4 e §20: o histórico é do usuário, só ele lê, e não se reescreve medição
-- passada. Corrigir é apagar e registrar de novo.
create policy body_le_proprio on public.body_compositions
  for select using (user_id = auth.uid());
create policy body_cria_proprio on public.body_compositions
  for insert with check (
    user_id = auth.uid()
    -- §19: sem consentimento explícito registrado, não entra
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.consent_health_data_at is not null
    )
    -- §20: menor de 18 não tem módulo de composição corporal
    and not exists (select 1 from public.users u where u.id = auth.uid() and u.is_minor)
  );
create policy body_apaga_proprio on public.body_compositions
  for delete using (user_id = auth.uid());

-- ── missões: as próprias, mais as da guilda para poder validar ──────────────
create policy missions_le_proprio on public.missions
  for select using (character_id = public.meu_personagem());
create policy missions_le_guilda on public.missions
  for select using (
    public.minha_guilda() is not null
    and character_id in (
      select gm.character_id from public.guild_members gm
      where gm.guild_id = public.minha_guilda()
    )
    -- §15 e privacidade: só quem deixou a guilda ver
    and exists (
      select 1 from public.characters c
      join public.users u on u.id = c.user_id
      where c.id = public.missions.character_id
    )
  );
create policy missions_cria_proprio on public.missions
  for insert with check (character_id = public.meu_personagem());

create policy epic_le_proprio on public.epic_missions
  for all using (character_id = public.meu_personagem())
  with check (character_id = public.meu_personagem());

create policy rest_proprio on public.rest_days
  for all using (character_id = public.meu_personagem())
  with check (character_id = public.meu_personagem());

-- ── coleção e deck ───────────────────────────────────────────────────────────
create policy cards_le_proprio on public.card_instances
  for select using (character_id = public.meu_personagem());
create policy decks_proprio on public.decks
  for all using (character_id = public.meu_personagem())
  with check (character_id = public.meu_personagem());
create policy deck_cards_proprio on public.deck_cards
  for all using (deck_id in (select id from public.decks where character_id = public.meu_personagem()))
  with check (deck_id in (select id from public.decks where character_id = public.meu_personagem()));

-- ── equipamento: lê o próprio; comprar é função, equipar é update ───────────
create policy gear_le_proprio on public.character_gear
  for select using (character_id = public.meu_personagem());
create policy gear_equipa_proprio on public.character_gear
  for update using (character_id = public.meu_personagem())
  with check (character_id = public.meu_personagem());

-- ── guilda ───────────────────────────────────────────────────────────────────
create policy guilds_le_da_minha on public.guilds
  for select using (id = public.minha_guilda());
create policy guilds_cria on public.guilds
  for insert with check (created_by = public.meu_personagem());
create policy gmembers_le_da_minha on public.guild_members
  for select using (guild_id = public.minha_guilda());
create policy gmembers_entra on public.guild_members
  for insert with check (character_id = public.meu_personagem());
create policy gmembers_sai on public.guild_members
  for delete using (character_id = public.meu_personagem());

create policy proofs_le on public.mission_proofs
  for select using (
    mission_id in (select id from public.missions where character_id = public.meu_personagem())
    or mission_id in (
      select m.id from public.missions m
      join public.guild_members gm on gm.character_id = m.character_id
      where gm.guild_id = public.minha_guilda()
    )
  );
create policy proofs_cria_propria on public.mission_proofs
  for insert with check (
    mission_id in (select id from public.missions where character_id = public.meu_personagem())
  );

-- §15: qualquer membro confirma ou contesta, mas nunca a própria missão
create policy confirm_le on public.mission_confirmations
  for select using (
    mission_id in (
      select m.id from public.missions m
      join public.guild_members gm on gm.character_id = m.character_id
      where gm.guild_id = public.minha_guilda()
    )
  );
create policy confirm_cria on public.mission_confirmations
  for insert with check (
    by_character = public.meu_personagem()
    and mission_id in (
      select m.id from public.missions m
      join public.guild_members gm on gm.character_id = m.character_id
      where gm.guild_id = public.minha_guilda()
        and m.character_id <> public.meu_personagem()
    )
  );

-- ── batalha e extrato ────────────────────────────────────────────────────────
create policy battles_proprio on public.battles
  for all using (character_id = public.meu_personagem())
  with check (character_id = public.meu_personagem());
-- extrato é só leitura: quem credita é a função
create policy tx_le_proprio on public.transactions
  for select using (character_id = public.meu_personagem());
create policy log_le_proprio on public.sensitive_access_log
  for select using (user_id = auth.uid());
