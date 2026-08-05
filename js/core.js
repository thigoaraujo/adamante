/* Adamante — camada de regras (`core`).
 *
 * Funções puras: entram números, saem números. Não conhece DOM, não conhece
 * estado, não conhece tela. É a separação exigida pela seção 21.1 do GDD; a
 * versão real deste app compartilha esta camada entre cliente e servidor.
 */
(function (global) {
  'use strict';

  var D = global.AdmData;

  // ── §5.1 modificador de atributo ──────────────────────────────────────────
  function mod(valor) { return Math.floor((valor - 10) / 2); }

  // ── §5.3 base normalizada (6 a 10) a partir do percentil do próprio perfil
  function baseNormalizada(percentil) {
    if (percentil === null || percentil === undefined) return 8; // mediana, registrada como estimativa
    return 6 + Math.round(Math.max(0, Math.min(1, percentil)) * 4);
  }

  // ── §5.4 custo progressivo de ponto de atributo ───────────────────────────
  function custoDoProximo(valorAtual) {
    return valorAtual >= 18 ? 3 : valorAtual >= 15 ? 2 : 1;
  }
  function custoDeIncrementos(valorAtual, n) {
    var cur = valorAtual, c = 0;
    for (var i = 0; i < n; i++) { c += custoDoProximo(cur); cur++; }
    return c;
  }

  // ── §10 curva de experiência ──────────────────────────────────────────────
  function xpNeed(nivel) { return Math.round(80 * Math.pow(nivel, 1.5) / 10) * 10; }

  // ── §12.2 efeito da Fadiga sobre o atributo, só para cálculo de combate ───
  function atributoEfetivo(valorReal, fadiga) {
    if (fadiga >= 6) return Math.max(1, Math.round(valorReal * 0.6));
    if (fadiga >= 3) return Math.max(1, Math.round(valorReal * 0.8));
    return valorReal;
  }
  function fadigaBloqueiaPvp(fadiga) { return fadiga >= 6; }
  function fadigaBloqueiaRaras(fadiga) { return fadiga >= 3; }
  function fadigaAposDia(fadiga, diariasPendentes, descansoSagrado) {
    if (descansoSagrado) return fadiga;                       // §12.3
    if (diariasPendentes === 0) return Math.max(0, fadiga - 2); // recuperação
    return Math.min(9, fadiga + Math.min(3, diariasPendentes)); // teto de 3/dia, 9 total
  }

  // ── §8 pontos de vida, defesa e dano ──────────────────────────────────────
  function pvMaximo(nivel, modCon, classeId) {
    var b = 40 + nivel * 6 + modCon * 5;
    return classeId === 'guerreiro' ? Math.round(b * 1.15) : b;
  }
  function defesa(modDes, bonusEquipamento) { return 10 + modDes + (bonusEquipamento || 0); }
  function mitigacao(defesaDoAlvo) { return Math.floor(defesaDoAlvo / 3); }
  function danoFinal(danoBase, modPrimario, defesaDoAlvo) {
    return Math.max(1, danoBase + modPrimario * 2 - mitigacao(defesaDoAlvo));
  }
  function energiaMaxima(classeId) { return classeId === 'mago' ? 11 : 10; }

  // ── §8.4 crítico: 19-20, ou 17-20 para o Ladino ───────────────────────────
  function limiarCritico(classeId) { return classeId === 'ladino' ? 17 : 19; }
  function ehCritico(rolagemD20, classeId) { return rolagemD20 >= limiarCritico(classeId); }

  // ── §9 teste de resistência ───────────────────────────────────────────────
  function bonusProficiencia(nivel) { return Math.min(6, 2 + Math.floor((nivel - 1) / 4)); }
  function testeResistencia(rolagemD20, modAtributo, nivel, cd) {
    return rolagemD20 + modAtributo + bonusProficiencia(nivel) >= cd;
  }

  // ── §6.3 bioimpedância vira ponto pelo delta, nunca pelo valor absoluto ───
  function pontosDaMedicao(deltaMassaMagraKg, subiuAguaAoMenos1pp) {
    if (!(deltaMassaMagraKg > 0)) return 0;                 // pior nunca é negativo
    var bonus = subiuAguaAoMenos1pp ? 1 : 0;
    return Math.min(5, Math.floor(deltaMassaMagraKg / 0.4) + bonus);
  }
  function podeMedir(diasDesdeUltima) { return diasDesdeUltima >= 7; }

  // ── §18 autodeclaração rende 70% e não conta para o ranking global ────────
  function xpValidado(xpBase, origem) {
    return origem === 'autodeclarado' ? Math.round(xpBase * 0.7) : xpBase;
  }

  // ── §11.4 recompensa da missão épica: XP escala com o prazo, 800 a 2.000 ──
  function xpEpica(dias) {
    var d = Math.max(15, Math.min(90, dias));
    return Math.round((800 + (d - 15) / 75 * 1200) / 10) * 10;
  }
  // §11.4 prazo válido: entre 15 e 90 dias
  function prazoEpicaValido(dias) { return dias >= 15 && dias <= 90; }

  // ── §10 aplica XP e devolve nível/pontos resultantes ──────────────────────
  function aplicarXp(nivel, xp, ganho) {
    var l = nivel, x = xp + ganho, pontos = 0;
    while (x >= xpNeed(l) && l < 20) { x -= xpNeed(l); l++; pontos += 2; }
    return { nivel: l, xp: x, pontosGanhos: pontos, subiu: l > nivel };
  }

  global.AdmCore = {
    mod: mod, baseNormalizada: baseNormalizada,
    custoDoProximo: custoDoProximo, custoDeIncrementos: custoDeIncrementos,
    xpNeed: xpNeed, aplicarXp: aplicarXp,
    atributoEfetivo: atributoEfetivo, fadigaBloqueiaPvp: fadigaBloqueiaPvp,
    fadigaBloqueiaRaras: fadigaBloqueiaRaras, fadigaAposDia: fadigaAposDia,
    pvMaximo: pvMaximo, defesa: defesa, mitigacao: mitigacao, danoFinal: danoFinal,
    energiaMaxima: energiaMaxima, limiarCritico: limiarCritico, ehCritico: ehCritico,
    bonusProficiencia: bonusProficiencia, testeResistencia: testeResistencia,
    pontosDaMedicao: pontosDaMedicao, podeMedir: podeMedir, xpValidado: xpValidado,
    xpEpica: xpEpica, prazoEpicaValido: prazoEpicaValido,
  };
  // o data.js expõe os mesmos dois helpers; mantém a fonte única aqui
  if (D) { D.mod = mod; D.xpNeed = xpNeed; }
})(window);
