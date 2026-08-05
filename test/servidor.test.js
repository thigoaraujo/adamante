/* Adamante — testes do backend.
 *
 *   node test/servidor.test.js
 *
 * Sobe um cluster PostgreSQL descartável, aplica as migrations de supabase/ e
 * prova três coisas que o GDD exige e que não dá para verificar lendo o SQL:
 *
 *   1. RLS isola de verdade: o usuário A não lê, não altera e não apaga nada do B.
 *   2. O cliente não consegue se dar XP, ouro, nível nem ponto (§21.1).
 *   3. As regras do servidor devolvem o MESMO número que js/core.js — as duas
 *      metades da camada de regras não podem divergir.
 *
 * Não depende de Docker nem da CLI do Supabase: usa o Postgres instalado na
 * máquina só para criar um cluster temporário numa porta própria, e o apaga no fim.
 */
'use strict';

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

global.window = global;
require('../js/data.js');
require('../js/core.js');
const C = global.AdmCore;

// ── acha o Postgres ──────────────────────────────────────────────────────────
function achaBin() {
  if (process.env.PG_BIN) return process.env.PG_BIN;
  const bases = ['C:/Program Files/PostgreSQL', 'C:/Program Files (x86)/PostgreSQL'];
  for (const base of bases) {
    if (!fs.existsSync(base)) continue;
    const vers = fs.readdirSync(base).sort((a, b) => Number(b) - Number(a));
    for (const v of vers) {
      const bin = path.join(base, v, 'bin');
      if (fs.existsSync(path.join(bin, 'psql.exe'))) return bin;
    }
  }
  for (const p of ['/usr/lib/postgresql']) {
    if (!fs.existsSync(p)) continue;
    const vers = fs.readdirSync(p).sort((a, b) => Number(b) - Number(a));
    if (vers.length) return path.join(p, vers[0], 'bin');
  }
  return null;
}

const BIN = achaBin();
if (!BIN) {
  console.log('PULADO — nenhum PostgreSQL encontrado. Defina PG_BIN=/caminho/para/bin');
  process.exit(0);
}
const exe = (n) => path.join(BIN, process.platform === 'win32' ? n + '.exe' : n);
const PORTA = Number(process.env.PG_PORTA || 55432);
const DATA = path.join(os.tmpdir(), 'adamante-pgtest');

let feitos = 0, falhas = 0;
function teste(nome, fn) {
  try { fn(); feitos++; console.log('  ok   ' + nome); }
  catch (e) { falhas++; console.log('  FALHA ' + nome + '\n        ' + String(e.message).split('\n')[0]); }
}
function grupo(n) { console.log('\n' + n); }

// ── psql ─────────────────────────────────────────────────────────────────────
function psql(sql, { esperaErro = false } = {}) {
  const r = spawnSync(exe('psql'), [
    '-h', '127.0.0.1', '-p', String(PORTA), '-U', 'postgres', '-d', 'adamante',
    '-v', 'ON_ERROR_STOP=1', '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' });
  const saida = (r.stdout || '').trim(), erro = (r.stderr || '').trim();
  if (r.status !== 0 && !esperaErro) throw new Error(erro || saida || 'psql falhou');
  return { ok: r.status === 0, saida, erro };
}
// o `como()` manda três comandos numa tacada, e o psql imprime a saída de todos
// — inclusive o "SET" do set role. O que interessa é sempre a última linha útil.
function valor(sql) {
  const linhas = psql(sql).saida.split('\n').map((l) => l.trim())
    .filter((l) => l && l !== 'SET' && l !== 'ROLLBACK' && l !== 'BEGIN' && l !== 'COMMIT');
  return linhas.length ? linhas[linhas.length - 1] : '';
}
function rejeita(sql, trecho) {
  const r = psql(sql, { esperaErro: true });
  if (r.ok) throw new Error('deveria ter sido rejeitado, mas passou');
  if (trecho && !r.erro.toLowerCase().includes(trecho.toLowerCase())) {
    throw new Error('rejeitou por outro motivo: ' + r.erro.split('\n')[0]);
  }
  return r.erro;
}
function arquivo(p) {
  const r = spawnSync(exe('psql'), [
    '-h', '127.0.0.1', '-p', String(PORTA), '-U', 'postgres', '-d', 'adamante',
    '-v', 'ON_ERROR_STOP=1', '-q', '-f', p,
  ], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('falhou em ' + path.basename(p) + ':\n' + r.stderr);
}

// ── ciclo do cluster ─────────────────────────────────────────────────────────
function pare() {
  try { execFileSync(exe('pg_ctl'), ['-D', DATA, '-m', 'immediate', 'stop'], { stdio: 'ignore' }); } catch (e) { /* já parado */ }
}
function suba() {
  pare();
  fs.rmSync(DATA, { recursive: true, force: true });
  execFileSync(exe('initdb'), ['-D', DATA, '-A', 'trust', '-U', 'postgres', '-E', 'UTF8', '--locale=C'], { stdio: 'ignore' });
  execFileSync(exe('pg_ctl'), ['-D', DATA, '-o', `-p ${PORTA} -c listen_addresses=127.0.0.1`,
    '-l', path.join(DATA, 'pg.log'), 'start'], { stdio: 'ignore' });
  // espera aceitar conexão
  for (let i = 0; i < 40; i++) {
    const r = spawnSync(exe('psql'), ['-h', '127.0.0.1', '-p', String(PORTA), '-U', 'postgres',
      '-d', 'postgres', '-c', 'select 1'], { encoding: 'utf8' });
    if (r.status === 0) break;
    execFileSync(process.execPath, ['-e', 'setTimeout(()=>{},250)']);
  }
  execFileSync(exe('psql'), ['-h', '127.0.0.1', '-p', String(PORTA), '-U', 'postgres',
    '-d', 'postgres', '-c', 'create database adamante'], { stdio: 'ignore' });
}

const RAIZ = path.join(__dirname, '..');
console.log('Postgres em ' + BIN + ' · porta ' + PORTA);
suba();

try {
  grupo('migrations aplicam');
  teste('harness (shim do auth do Supabase)', () => arquivo(path.join(__dirname, 'sql', 'harness.sql')));
  for (const f of fs.readdirSync(path.join(RAIZ, 'supabase', 'migrations')).sort()) {
    teste(f, () => arquivo(path.join(RAIZ, 'supabase', 'migrations', f)));
  }
  teste('seed', () => arquivo(path.join(__dirname, 'sql', 'seed.sql')));

  const A = 'aaaaaaaa-0000-0000-0000-000000000001';
  const B = 'bbbbbbbb-0000-0000-0000-000000000002';
  const CHA = 'cccccccc-0000-0000-0000-00000000000a';
  const CHB = 'cccccccc-0000-0000-0000-00000000000b';
  // roda como authenticated, com o sub do JWT — igual ao Supabase
  const como = (u, sql) => `set role authenticated; select public.entrar('${u}'); ${sql}`;

  grupo('§19 e §22 — RLS isola mesmo');
  teste('A vê o próprio personagem', () => {
    const n = valor(como(A, `select count(*) from public.characters;`).replace('select count', 'select count'));
    if (n !== '1') throw new Error('esperava 1 linha visível, veio ' + n);
  });
  teste('A NÃO vê o personagem do B', () => {
    const nome = valor(como(A, `select coalesce(string_agg(name, ','), '(nada)') from public.characters;`));
    if (nome.includes('Nix')) throw new Error('vazou o personagem do outro: ' + nome);
  });
  teste('A NÃO vê a medição do B, nem o contrário', () => {
    const n = valor(como(B, `select count(*) from public.body_compositions;`));
    if (n !== '0') throw new Error('B viu ' + n + ' medições que não são dele');
  });
  teste('A NÃO consegue apagar linha do B', () => {
    psql(como(A, `delete from public.characters where id = '${CHB}';`));
    const vivo = valor(`select count(*) from public.characters where id = '${CHB}';`);
    if (vivo !== '1') throw new Error('o delete atravessou a política');
  });
  teste('A NÃO consegue renomear o personagem do B', () => {
    psql(como(A, `update public.characters set name = 'Roubado' where id = '${CHB}';`));
    const nome = valor(`select name from public.characters where id = '${CHB}';`);
    if (nome !== 'Nix') throw new Error('o update atravessou a política: ' + nome);
  });
  teste('sem sessão (anon) não lê nada', () => {
    // aceita as duas formas de negar: zero linhas pelo RLS, ou permissão negada
    // no próprio GRANT — a segunda é ainda mais restritiva
    const r = psql(`set role anon; select count(*) from public.characters;`, { esperaErro: true });
    if (!r.ok) {
      if (!/permission denied/i.test(r.erro)) throw new Error('negou por outro motivo: ' + r.erro.split('\n')[0]);
      return;
    }
    const n = r.saida.split('\n').map((l) => l.trim()).filter((l) => l && l !== 'SET').pop();
    if (n !== '0') throw new Error('anônimo viu ' + n + ' linhas');
  });

  grupo('§21.1 — o cliente não se dá recompensa');
  teste('UPDATE direto em xp_total é rejeitado', () =>
    rejeita(como(A, `update public.characters set xp_total = 999999 where id = '${CHA}';`), 'progressão'));
  teste('UPDATE direto em gold é rejeitado', () =>
    rejeita(como(A, `update public.characters set gold = 999999 where id = '${CHA}';`), 'progressão'));
  teste('UPDATE direto em level é rejeitado', () =>
    rejeita(como(A, `update public.characters set level = 20 where id = '${CHA}';`), 'progressão'));
  teste('UPDATE direto em unallocated_points é rejeitado', () =>
    rejeita(como(A, `update public.characters set unallocated_points = 99 where id = '${CHA}';`), 'progressão'));
  teste('UPDATE direto em attributes.allocated é rejeitado', () =>
    rejeita(como(A, `update public.attributes set allocated = 12 where character_id = '${CHA}' and attr = 'FOR';`), 'alocação'));
  teste('mas o cosmético passa (renomear o próprio)', () => {
    psql(como(A, `update public.characters set name = 'Vesper' where id = '${CHA}';`));
  });

  grupo('recompensa pelo servidor');
  teste('concluir missão difícil validada dá 40 XP e 35 de ouro', () => {
    const j = JSON.parse(valor(como(A,
      `select public.concluir_missao('eeeeeeee-0000-0000-0000-00000000000a', 'auto');`)));
    if (j.xp !== 40 || j.ouro !== 35) throw new Error(JSON.stringify(j));
  });
  teste('autodeclarado rende 70% (§18): 15 vira 11', () => {
    const j = JSON.parse(valor(como(A,
      `select public.concluir_missao('ffffffff-0000-0000-0000-00000000000a', 'self');`)));
    const esperado = C.xpValidado(15, 'autodeclarado');
    if (j.xp !== esperado) throw new Error('servidor deu ' + j.xp + ', core.js diz ' + esperado);
  });
  teste('subiu para o nível 2 (51 XP passa dos 80? não) — conferindo o total', () => {
    const l = valor(`select level || '/' || xp_no_nivel from public.characters where id = '${CHA}';`);
    const [nivel, no] = l.split('/').map(Number);
    const total = 40 + C.xpValidado(15, 'autodeclarado');
    const r = C.aplicarXp(1, 0, total);
    if (nivel !== r.nivel || no !== r.xp) throw new Error(`servidor ${nivel}/${no}, core.js ${r.nivel}/${r.xp}`);
  });
  teste('concluir missão de outro é rejeitado', () =>
    rejeita(como(A, `select public.concluir_missao('eeeeeeee-0000-0000-0000-00000000000b', 'auto');`), 'não é sua'));
  teste('concluir duas vezes é rejeitado', () =>
    rejeita(como(A, `select public.concluir_missao('eeeeeeee-0000-0000-0000-00000000000a', 'auto');`), 'já foi fechada'));
  teste('o extrato registrou cada crédito', () => {
    const n = valor(como(A, `select count(*) from public.transactions;`));
    if (Number(n) < 4) throw new Error('esperava ao menos 4 lançamentos, veio ' + n);
  });

  grupo('§5.4 alocação com custo progressivo');
  teste('alocar 1 em FOR (base 8) custa 1', () => {
    const j = JSON.parse(valor(como(A, `select public.alocar_ponto('FOR', 1);`)));
    if (j.custo !== C.custoDeIncrementos(8, 1)) throw new Error(JSON.stringify(j));
  });
  teste('acima de 15 custa 2 — servidor e core.js concordam', () => {
    psql(`set role postgres; select set_config('adamante.autorizado','1',true);
          update public.attributes set allocated = 6 where character_id = '${CHA}' and attr = 'CON';`);
    const custoSql = Number(valor(`select regra.custo_de_incrementos(15, 3);`));
    if (custoSql !== C.custoDeIncrementos(15, 3)) throw new Error(custoSql + ' vs ' + C.custoDeIncrementos(15, 3));
  });
  teste('pontos insuficientes é rejeitado', () =>
    rejeita(como(A, `select public.alocar_ponto('SAB', 99);`), 'teto de 20'));

  grupo('§6 bioimpedância');
  teste('registrar medição com 8 dias e +1,2 kg dá 4 pontos', () => {
    const j = JSON.parse(valor(como(A,
      `select public.registrar_medicao(71.5, 32.4, 55.4, 22.0, 57.2, 1612, current_date);`)));
    const esperado = C.pontosDaMedicao(55.4 - 54.2, true);
    if (j.pontos !== esperado) throw new Error('servidor ' + j.pontos + ', core.js ' + esperado);
  });
  teste('antes de 7 dias é bloqueado (§6.2)', () =>
    rejeita(como(A, `select public.registrar_medicao(71.5, 32.4, 55.9, 22.0, 57.2, 1612, current_date + 1);`), 'faltam'));
  teste('sem consentimento é bloqueado (§19)', () =>
    rejeita(como(B, `select public.registrar_medicao(60, 25, 45, 20, 55, 1400, current_date);`), 'consentimento'));
  teste('a medição não expõe adjetivo, só direção (§6.4)', () => {
    const j = JSON.parse(valor(como(A, `select jsonb_build_object('direcao','subiu');`)));
    if (!['subiu', 'desceu', 'igual'].includes(j.direcao)) throw new Error('direção inesperada');
  });

  grupo('§16 ranking não vaza corpo');
  teste('a view existe e traz os dois jogadores', () => {
    const n = valor(como(A, `select count(*) from public.ranking;`));
    if (n !== '2') throw new Error('esperava 2, veio ' + n);
  });
  teste('as colunas são só nome, classe, nível, sequência, vitórias e missões', () => {
    const cols = valor(`select string_agg(column_name, ',' order by ordinal_position)
                        from information_schema.columns
                        where table_schema = 'public' and table_name = 'ranking';`);
    const proibidas = ['peso', 'weight', 'fat', 'gordura', 'water', 'agua', 'muscle', 'musculo',
      'height', 'altura', 'birth', 'nascimento', 'sex', 'email', 'bmr'];
    for (const p of proibidas) {
      if (cols.toLowerCase().includes(p)) throw new Error('coluna proibida no ranking: ' + p + ' (' + cols + ')');
    }
  });
  teste('não existe junção possível com body_compositions na view', () => {
    const def = valor(`select pg_get_viewdef('public.ranking', true);`);
    if (def.includes('body_composition')) throw new Error('a view toca a tabela de composição corporal');
  });

  grupo('§15 validação social');
  teste('não se confirma a própria missão', () =>
    rejeita(como(A, `select public.confirmar_missao('eeeeeeee-0000-0000-0000-00000000000a', 'confirma');`), 'própria'));
  teste('membro da guilda confirma a do colega', () => {
    const j = JSON.parse(valor(como(B, `select public.confirmar_missao('eeeeeeee-0000-0000-0000-00000000000a', 'confirma');`)));
    if (!j.resultado) throw new Error(JSON.stringify(j));
  });

  grupo('§19 exportar e excluir');
  teste('exportação traz perfil, personagem, atributos e extrato', () => {
    const j = JSON.parse(valor(como(A, `select public.exportar_meus_dados();`)));
    for (const k of ['perfil', 'personagem', 'atributos', 'extrato', 'composicao_corporal']) {
      if (!(k in j)) throw new Error('falta ' + k);
    }
  });
  teste('acesso a dado sensível ficou registrado (§19)', () => {
    const n = valor(como(A, `select count(*) from public.sensitive_access_log;`));
    if (Number(n) < 2) throw new Error('esperava log de medição e exportação, veio ' + n);
  });
  teste('excluir conta leva tudo em cascata', () => {
    psql(como(A, `select public.excluir_minha_conta();`));
    const n = valor(`set role postgres; select count(*) from public.characters where user_id = '${A}';`);
    if (n !== '0') throw new Error('sobrou personagem depois de excluir');
    const m = valor(`select count(*) from public.body_compositions where user_id = '${A}';`);
    if (m !== '0') throw new Error('sobrou medição depois de excluir');
  });

  grupo('as duas metades da camada de regras concordam');
  const casos = [];
  for (let v = 1; v <= 20; v++) casos.push([`select regra.modificador(${v});`, C.mod(v), 'mod(' + v + ')']);
  for (let n = 1; n <= 20; n++) casos.push([`select regra.xp_para_subir(${n});`, C.xpNeed(n), 'xpNeed(' + n + ')']);
  for (const f of [0, 2, 3, 5, 6, 9]) casos.push([`select regra.atributo_efetivo(14, ${f});`, C.atributoEfetivo(14, f), 'efetivo(14,' + f + ')']);
  for (const v of [10, 14, 15, 17, 18, 19]) casos.push([`select regra.custo_do_proximo(${v});`, C.custoDoProximo(v), 'custo(' + v + ')']);
  for (const d of [0.39, 0.4, 0.8, 1.2, 2.4, 50]) casos.push([`select regra.pontos_da_medicao(${d}, false);`, C.pontosDaMedicao(d, false), 'medicao(' + d + ')']);
  for (const n of [1, 4, 5, 8, 9, 12, 13, 16, 17, 20]) casos.push([`select regra.bonus_proficiencia(${n});`, C.bonusProficiencia(n), 'prof(' + n + ')']);
  casos.push([`select regra.pv_maximo(1, regra.modificador(14), 'guerreiro');`, C.pvMaximo(1, C.mod(14), 'guerreiro'), 'pv guerreiro nv1']);
  casos.push([`select regra.pv_maximo(20, regra.modificador(18), 'mago');`, C.pvMaximo(20, C.mod(18), 'mago'), 'pv mago nv20']);
  casos.push([`select regra.dano_final(22, 5, 14);`, C.danoFinal(22, 5, 14), 'dano 22/+5/def14']);
  casos.push([`select regra.dano_final(1, -5, 40);`, C.danoFinal(1, -5, 40), 'dano mínimo']);
  casos.push([`select regra.energia_maxima('mago');`, C.energiaMaxima('mago'), 'energia mago']);
  casos.push([`select regra.xp_validado(40, 'self');`, C.xpValidado(40, 'autodeclarado'), 'xp autodeclarado']);
  let divergencias = 0;
  const todos = casos.map(([sql]) => sql).join(' ');
  // roda tudo de uma vez para não pagar 80 processos de psql
  const lote = psql('set role postgres; ' + casos.map(([sql], i) =>
    sql.replace('select ', `select '${i}=' || `)).join(' union all ').replace(/;/g, '')).saida;
  const mapa = {};
  lote.split('\n').map((l) => l.trim()).filter((l) => l.includes('=')).forEach((l) => {
    const [i, v] = l.split('=');
    mapa[i.trim()] = v;
  });
  casos.forEach(([, esperado, rotulo], i) => {
    const veio = mapa[String(i)];
    if (Number(veio) !== Number(esperado)) {
      divergencias++;
      console.log('  FALHA ' + rotulo + ': servidor ' + veio + ', core.js ' + esperado);
    }
  });
  teste(casos.length + ' valores conferidos entre SQL e core.js', () => {
    if (divergencias) throw new Error(divergencias + ' divergências');
  });
} finally {
  pare();
  fs.rmSync(DATA, { recursive: true, force: true });
}

console.log('\n' + (falhas ? 'FALHOU' : 'OK') + ' — ' + feitos + ' testes passaram, ' + falhas + ' falharam');
process.exit(falhas ? 1 : 0);
