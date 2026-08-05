/* Adamante — testes da camada de regras.
 *
 *   node test/core.test.js
 *
 * O GDD §21.1 exige teste unitário no /core cobrindo os extremos: usuário muito
 * leve, muito pesado, sem bioimpedância, nível 1, nível 20, atributo 1,
 * atributo 20 e fadiga máxima. É isso aqui.
 *
 * Sem framework: são funções puras, um assert basta.
 */
'use strict';

const assert = require('assert');

global.window = global;
require('../js/data.js');
require('../js/core.js');
const C = global.AdmCore;
const D = global.AdmData;

let feitos = 0, falhas = 0;
function teste(nome, fn) {
  try { fn(); feitos++; }
  catch (e) { falhas++; console.error('  FALHOU  ' + nome + '\n           ' + e.message); }
}
function grupo(nome) { console.log('\n' + nome); }

// ── §5.1 modificador ────────────────────────────────────────────────────────
grupo('§5.1 modificador de atributo');
teste('tabela inteira do SRD confere', () => {
  const esperado = { 1: -5, 2: -4, 3: -4, 4: -3, 5: -3, 6: -2, 7: -2, 8: -1, 9: -1, 10: 0, 11: 0, 12: 1, 13: 1, 14: 2, 15: 2, 16: 3, 17: 3, 18: 4, 19: 4, 20: 5 };
  for (const v of Object.keys(esperado)) {
    assert.strictEqual(C.mod(Number(v)), esperado[v], `mod(${v}) deveria ser ${esperado[v]}`);
  }
});
teste('extremos 1 e 20', () => {
  assert.strictEqual(C.mod(1), -5);
  assert.strictEqual(C.mod(20), 5);
});

// ── §5.3 base normalizada ───────────────────────────────────────────────────
grupo('§5.3 base normalizada (o pilar da justiça)');
teste('fica entre 6 e 10 em todo o intervalo', () => {
  for (let p = 0; p <= 1.0001; p += 0.01) {
    const b = C.baseNormalizada(p);
    assert.ok(b >= 6 && b <= 10, `percentil ${p.toFixed(2)} deu base ${b}`);
  }
});
teste('sem bioimpedância cai na mediana 8, nunca em 0', () => {
  assert.strictEqual(C.baseNormalizada(null), 8);
  assert.strictEqual(C.baseNormalizada(undefined), 8);
});
teste('percentil fora da faixa é contido, não estoura', () => {
  assert.strictEqual(C.baseNormalizada(-3), 6);
  assert.strictEqual(C.baseNormalizada(9), 10);
});
teste('dois corpos medianos para o próprio perfil começam iguais', () => {
  // a pessoa de 95 kg e a de 52 kg, ambas no percentil 50 do próprio perfil
  assert.strictEqual(C.baseNormalizada(0.5), C.baseNormalizada(0.5));
  assert.strictEqual(C.baseNormalizada(0.5), 8);
});

// ── §5.4 custo progressivo ──────────────────────────────────────────────────
grupo('§5.4 custo progressivo de ponto');
teste('1 ponto até 14, 2 de 15 a 17, 3 de 18 em diante', () => {
  assert.strictEqual(C.custoDoProximo(10), 1);
  assert.strictEqual(C.custoDoProximo(14), 1);
  assert.strictEqual(C.custoDoProximo(15), 2);
  assert.strictEqual(C.custoDoProximo(17), 2);
  assert.strictEqual(C.custoDoProximo(18), 3);
  assert.strictEqual(C.custoDoProximo(19), 3);
});
teste('soma de incrementos atravessa as faixas certo', () => {
  // de 14 para 17: 1 (14→15) + 2 (15→16) + 2 (16→17) = 5
  assert.strictEqual(C.custoDeIncrementos(14, 3), 5);
  // de 17 para 20: 2 + 3 + 3 = 8
  assert.strictEqual(C.custoDeIncrementos(17, 3), 8);
  assert.strictEqual(C.custoDeIncrementos(8, 0), 0);
});

// ── §10 curva de XP ─────────────────────────────────────────────────────────
grupo('§10 experiência e níveis');
teste('a tabela do documento confere', () => {
  // §10 do GDD. O nível 19 da tabela dizia 6620 por erro de digitação; a fórmula
  // do próprio documento — round(80 × n^1.5, dezena) — dá 6630 (80 × 19^1.5 =
  // 6625,53). Corrigido no docs/gdd.md; os outros 18 níveis já conferiam.
  const tabela = { 1: 80, 2: 230, 3: 420, 4: 640, 5: 890, 6: 1180, 7: 1480, 8: 1810, 9: 2160, 10: 2530, 11: 2920, 12: 3330, 13: 3750, 14: 4190, 15: 4650, 16: 5120, 17: 5610, 18: 6110, 19: 6630 };
  for (const n of Object.keys(tabela)) {
    assert.strictEqual(C.xpNeed(Number(n)), tabela[n], `nível ${n}`);
  }
});
teste('a curva segue a fórmula em todos os 20 níveis', () => {
  for (let n = 1; n <= 20; n++) {
    assert.strictEqual(C.xpNeed(n), Math.round(80 * Math.pow(n, 1.5) / 10) * 10, `nível ${n}`);
  }
});
teste('nível 1 sobe na primeira sessão com 80 XP', () => {
  const r = C.aplicarXp(1, 0, 80);
  assert.strictEqual(r.nivel, 2);
  assert.strictEqual(r.xp, 0);
  assert.strictEqual(r.pontosGanhos, 2);
  assert.ok(r.subiu);
});
teste('um ganho enorme sobe vários níveis de uma vez', () => {
  const r = C.aplicarXp(1, 0, 100000);
  assert.ok(r.nivel > 5 && r.nivel <= 20);
  assert.strictEqual(r.pontosGanhos, (r.nivel - 1) * 2);
});
teste('nível 20 é teto: não passa nem estoura', () => {
  const r = C.aplicarXp(20, 0, 999999);
  assert.strictEqual(r.nivel, 20);
  assert.strictEqual(r.subiu, false);
});

// ── §12 fadiga ──────────────────────────────────────────────────────────────
grupo('§12 fadiga');
teste('0 a 2 não mexe no atributo', () => {
  for (const f of [0, 1, 2]) assert.strictEqual(C.atributoEfetivo(10, f), 10);
});
teste('3 a 5 tira 20%, 6+ tira 40%', () => {
  assert.strictEqual(C.atributoEfetivo(10, 3), 8);
  assert.strictEqual(C.atributoEfetivo(10, 5), 8);
  assert.strictEqual(C.atributoEfetivo(10, 6), 6);
  assert.strictEqual(C.atributoEfetivo(20, 9), 12);
});
teste('nunca zera o atributo, mesmo com fadiga máxima', () => {
  for (let a = 1; a <= 20; a++) {
    assert.ok(C.atributoEfetivo(a, 9) >= 1, `atributo ${a} com fadiga 9`);
  }
});
teste('bloqueios: PvP em 6, raras em 3', () => {
  assert.strictEqual(C.fadigaBloqueiaPvp(5), false);
  assert.strictEqual(C.fadigaBloqueiaPvp(6), true);
  assert.strictEqual(C.fadigaBloqueiaRaras(2), false);
  assert.strictEqual(C.fadigaBloqueiaRaras(3), true);
});
teste('teto de 9, e no máximo 3 pontos por dia', () => {
  assert.strictEqual(C.fadigaAposDia(8, 5, false), 9);
  assert.strictEqual(C.fadigaAposDia(9, 5, false), 9);
  assert.strictEqual(C.fadigaAposDia(0, 5, false), 3);
});
teste('dia completo remove 2, e nunca fica negativo', () => {
  assert.strictEqual(C.fadigaAposDia(5, 0, false), 3);
  assert.strictEqual(C.fadigaAposDia(1, 0, false), 0);
  assert.strictEqual(C.fadigaAposDia(0, 0, false), 0);
});
teste('Descanso Sagrado não gera fadiga (§12.3)', () => {
  assert.strictEqual(C.fadigaAposDia(4, 5, true), 4);
});
teste('ausente 30 dias volta ao pleno em 5 dias de uso', () => {
  let f = 9, dias = 0;
  while (f > 0) { f = C.fadigaAposDia(f, 0, false); dias++; }
  assert.ok(dias <= 5, `levou ${dias} dias`);
});

// ── §8 PV, defesa e dano ────────────────────────────────────────────────────
grupo('§8 pontos de vida, defesa e dano');
teste('os exemplos do documento conferem', () => {
  // Guerreiro nível 1, CON 14 (mod +2): 40 + 6 + 10 = 56, +15% = 64
  assert.strictEqual(C.pvMaximo(1, C.mod(14), 'guerreiro'), 64);
  // Mago nível 20, CON 18 (mod +4): 40 + 120 + 20 = 180
  assert.strictEqual(C.pvMaximo(20, C.mod(18), 'mago'), 180);
});
teste('CON mínima não deixa PV negativo', () => {
  assert.ok(C.pvMaximo(1, C.mod(1), 'mago') > 0);
});
teste('cartas de ataque sempre tiram ao menos 1 (§8.3)', () => {
  for (let def = 0; def <= 40; def++) {
    for (const base of [1, 6, 22]) {
      assert.ok(C.danoFinal(base, -5, def) >= 1, `base ${base} contra defesa ${def}`);
    }
  }
});
teste('a defesa reduz, não anula', () => {
  const semDef = C.danoFinal(10, 0, 0), comDef = C.danoFinal(10, 0, 18);
  assert.ok(comDef < semDef && comDef >= 1);
});
teste('mitigação é defesa ÷ 3, arredondada para baixo', () => {
  assert.strictEqual(C.mitigacao(14), 4);
  assert.strictEqual(C.mitigacao(10), 3);
});
teste('energia máxima: 10, e 11 para o Mago (§14.1)', () => {
  assert.strictEqual(C.energiaMaxima('guerreiro'), 10);
  assert.strictEqual(C.energiaMaxima('mago'), 11);
});

// ── §8.4 crítico ────────────────────────────────────────────────────────────
grupo('§8.4 crítico');
teste('19 e 20 são crítico; o Ladino acerta de 17', () => {
  assert.strictEqual(C.ehCritico(18, 'guerreiro'), false);
  assert.strictEqual(C.ehCritico(19, 'guerreiro'), true);
  assert.strictEqual(C.ehCritico(20, 'guerreiro'), true);
  assert.strictEqual(C.ehCritico(16, 'ladino'), false);
  assert.strictEqual(C.ehCritico(17, 'ladino'), true);
});
teste('a chance sai 10%, e 20% no Ladino', () => {
  const faces = [];
  for (let d = 1; d <= 20; d++) faces.push(d);
  assert.strictEqual(faces.filter(d => C.ehCritico(d, 'mago')).length / 20, 0.10);
  assert.strictEqual(faces.filter(d => C.ehCritico(d, 'ladino')).length / 20, 0.20);
});

// ── §9 testes de resistência ────────────────────────────────────────────────
grupo('§9 testes de resistência');
teste('proficiência: +2 a +6, nas faixas do documento', () => {
  const faixas = { 1: 2, 4: 2, 5: 3, 8: 3, 9: 4, 12: 4, 13: 5, 16: 5, 17: 6, 20: 6 };
  for (const n of Object.keys(faixas)) {
    assert.strictEqual(C.bonusProficiencia(Number(n)), faixas[n], `nível ${n}`);
  }
});
teste('compara com a CD somando modificador e proficiência', () => {
  assert.strictEqual(C.testeResistencia(10, 2, 1, 15), false);  // 10+2+2 = 14, falta 1
  assert.strictEqual(C.testeResistencia(10, 3, 1, 15), true);   // 10+3+2 = 15, empate passa
  assert.strictEqual(C.testeResistencia(1, -5, 1, 20), false);
  assert.strictEqual(C.testeResistencia(20, 5, 20, 25), true);  // 20+5+6 = 31
});

// ── §6.3 bioimpedância ──────────────────────────────────────────────────────
grupo('§6.3 bioimpedância vira ponto');
teste('a fórmula do documento confere', () => {
  assert.strictEqual(C.pontosDaMedicao(0.8, false), 2);
  assert.strictEqual(C.pontosDaMedicao(0.8, true), 3);
  assert.strictEqual(C.pontosDaMedicao(1.2, true), 4);
});
teste('não perde degrau por ponto flutuante', () => {
  // 1.2/0.4 dá 2.9999999999999996 em binário: sem cuidado, o floor come um degrau
  assert.strictEqual(C.pontosDaMedicao(1.2, false), 3);
  assert.strictEqual(C.pontosDaMedicao(2.4, false), 5);   // 6 degraus, cortado pelo teto
  assert.strictEqual(C.pontosDaMedicao(0.4, false), 1);
  assert.strictEqual(C.pontosDaMedicao(0.39, false), 0);
});
teste('medição pior dá zero, nunca negativo (pilar 2)', () => {
  assert.strictEqual(C.pontosDaMedicao(-2.5, false), 0);
  assert.strictEqual(C.pontosDaMedicao(-2.5, true), 0);
  assert.strictEqual(C.pontosDaMedicao(0, true), 0);
});
teste('teto de 5 impede manipulação por desidratação', () => {
  assert.strictEqual(C.pontosDaMedicao(50, true), 5);
});
teste('intervalo mínimo de 7 dias', () => {
  assert.strictEqual(C.podeMedir(6), false);
  assert.strictEqual(C.podeMedir(7), true);
});

// ── §18 validação ───────────────────────────────────────────────────────────
grupo('§18 origem da validação');
teste('autodeclarado rende 70%', () => {
  assert.strictEqual(C.xpValidado(40, 'autodeclarado'), 28);
  assert.strictEqual(C.xpValidado(40, 'Health Connect'), 40);
  assert.strictEqual(C.xpValidado(25, 'cronômetro'), 25);
});

// ── coerência dos dados com a arte e com as regras ──────────────────────────
grupo('coerência dos dados');
teste('toda carta tem arte, e o custo cabe na energia inicial ou cresce', () => {
  const fs = require('fs'), path = require('path');
  for (const c of D.CARDS) {
    const arte = path.join(__dirname, '..', 'assets', 'art', 'card_' + c.id + '.png');
    assert.ok(fs.existsSync(arte), 'falta arte da carta ' + c.id);
    assert.ok(c.custo >= 1 && c.custo <= 11, 'custo fora da faixa em ' + c.id);
    assert.ok(D.RAR[c.rar], 'raridade desconhecida em ' + c.id);
  }
});
teste('todo equipamento tem arte', () => {
  const fs = require('fs'), path = require('path');
  D.GEAR.forEach((g, i) => {
    const arte = path.join(__dirname, '..', 'assets', 'art', 'gear_' + i + '.png');
    assert.ok(fs.existsSync(arte), 'falta arte do equipamento ' + i + ' (' + g.nome + ')');
  });
});
teste('as 4 classes têm atributo primário existente', () => {
  const siglas = D.ATTRS.map(a => a.key);
  for (const cl of D.CLASSES) assert.ok(siglas.includes(cl.prim), cl.nome);
});
teste('base de todo atributo está na faixa 6 a 10 do §5.3', () => {
  for (const a of D.ATTRS) assert.ok(a.base >= 6 && a.base <= 10, a.key + ' = ' + a.base);
});

// ── resultado ───────────────────────────────────────────────────────────────
console.log('\n' + (falhas ? 'FALHOU' : 'OK') + ' — ' + feitos + ' testes passaram, ' + falhas + ' falharam');
process.exit(falhas ? 1 : 0);
