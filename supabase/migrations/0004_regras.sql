-- Adamante — camada de regras no servidor, espelho de js/core.js.
--
-- O §21.1 do GDD exige que as regras sejam funções puras, compartilhadas entre
-- cliente e servidor. O cliente tem js/core.js; aqui está a outra metade, e as
-- duas precisam devolver o mesmo número para a mesma entrada — o teste em
-- test/servidor.test.js compara as duas, valor por valor.
--
-- Tudo aqui é IMMUTABLE: entram números, saem números, não se toca em tabela.

create schema if not exists regra;

-- ── §5.1 modificador ─────────────────────────────────────────────────────────
create or replace function regra.modificador(valor integer)
returns integer language sql immutable as $$
  select floor((valor - 10) / 2.0)::integer;
$$;

-- ── §5.3 base normalizada, entre 6 e 10 ──────────────────────────────────────
create or replace function regra.base_normalizada(percentil numeric)
returns integer language sql immutable as $$
  select case
    when percentil is null then 8            -- sem bioimpedância: mediana
    else 6 + round(least(greatest(percentil, 0), 1) * 4)::integer
  end;
$$;

-- ── §5.4 custo progressivo ───────────────────────────────────────────────────
create or replace function regra.custo_do_proximo(valor_atual integer)
returns integer language sql immutable as $$
  select case when valor_atual >= 18 then 3 when valor_atual >= 15 then 2 else 1 end;
$$;

create or replace function regra.custo_de_incrementos(valor_atual integer, n integer)
returns integer language plpgsql immutable as $$
declare cur integer := valor_atual; c integer := 0; i integer;
begin
  for i in 1..greatest(n, 0) loop
    c := c + regra.custo_do_proximo(cur);
    cur := cur + 1;
  end loop;
  return c;
end;
$$;

-- ── §10 curva de XP ──────────────────────────────────────────────────────────
-- round(80 × n^1.5, dezena mais próxima). Atenção: o round() do Postgres é
-- half-up e o do JavaScript também, então as duas metades batem.
create or replace function regra.xp_para_subir(nivel integer)
returns integer language sql immutable as $$
  select (round(80 * power(nivel, 1.5) / 10) * 10)::integer;
$$;

-- ── §12.2 fadiga sobre o atributo, só para combate ───────────────────────────
create or replace function regra.atributo_efetivo(valor_real integer, fadiga integer)
returns integer language sql immutable as $$
  select greatest(1, case
    when fadiga >= 6 then round(valor_real * 0.6)::integer
    when fadiga >= 3 then round(valor_real * 0.8)::integer
    else valor_real
  end);
$$;

create or replace function regra.fadiga_apos_dia(fadiga integer, pendentes integer, descanso boolean)
returns integer language sql immutable as $$
  select case
    when descanso then fadiga                                    -- §12.3
    when pendentes = 0 then greatest(0, fadiga - 2)               -- recuperação
    else least(9, fadiga + least(3, pendentes))                   -- teto de 3/dia e 9 total
  end;
$$;

-- ── §8 PV, defesa, dano ──────────────────────────────────────────────────────
create or replace function regra.pv_maximo(nivel integer, mod_con integer, classe text)
returns integer language sql immutable as $$
  select case when classe = 'guerreiro'
    then round((40 + nivel * 6 + mod_con * 5) * 1.15)::integer
    else (40 + nivel * 6 + mod_con * 5)
  end;
$$;

create or replace function regra.defesa(mod_des integer, bonus_equip integer default 0)
returns integer language sql immutable as $$
  select 10 + mod_des + coalesce(bonus_equip, 0);
$$;

create or replace function regra.mitigacao(defesa_do_alvo integer)
returns integer language sql immutable as $$
  select floor(defesa_do_alvo / 3.0)::integer;
$$;

-- §8.3: cartas de ataque sempre acertam, e o piso de 1 impede impasse
create or replace function regra.dano_final(dano_base integer, mod_primario integer, defesa_do_alvo integer)
returns integer language sql immutable as $$
  select greatest(1, dano_base + mod_primario * 2 - regra.mitigacao(defesa_do_alvo));
$$;

create or replace function regra.energia_maxima(classe text)
returns integer language sql immutable as $$
  select case when classe = 'mago' then 11 else 10 end;
$$;

-- ── §8.4 crítico ─────────────────────────────────────────────────────────────
create or replace function regra.limiar_critico(classe text)
returns integer language sql immutable as $$
  select case when classe = 'ladino' then 17 else 19 end;
$$;

-- ── §9 proficiência e resistência ────────────────────────────────────────────
create or replace function regra.bonus_proficiencia(nivel integer)
returns integer language sql immutable as $$
  select least(6, 2 + floor((nivel - 1) / 4.0)::integer);
$$;

-- ── §6.3 bioimpedância vira ponto ────────────────────────────────────────────
-- Conta em gramas de propósito: dividir 1.2 por 0.4 em ponto flutuante dá
-- 2,9999999999999996 e o floor engoliria um degrau. Foi bug real no cliente.
create or replace function regra.pontos_da_medicao(delta_massa_magra_kg numeric, subiu_agua boolean)
returns integer language sql immutable as $$
  select case
    when delta_massa_magra_kg is null or delta_massa_magra_kg <= 0 then 0   -- pior nunca é negativo
    else least(5, floor(round(delta_massa_magra_kg * 1000) / 400)::integer
                  + case when subiu_agua then 1 else 0 end)
  end;
$$;

-- ── §18 autodeclaração rende 70% ─────────────────────────────────────────────
create or replace function regra.xp_validado(xp_base integer, origem text)
returns integer language sql immutable as $$
  select case when origem = 'self' then round(xp_base * 0.7)::integer else xp_base end;
$$;

grant usage on schema regra to authenticated;
grant execute on all functions in schema regra to authenticated;
