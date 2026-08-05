/* Adamante — dados de jogo. Portados 1:1 do documento de design. */
(function (global) {
  'use strict';

  var CATS = {
    corpo: { label: 'CORPO', color: '#d9a544' },
    mente: { label: 'MENTE', color: '#6fc8ee' },
    oficio: { label: 'OFÍCIO', color: '#4fcbb4' },
  };
  var DIFFS = { facil: 'Fácil', media: 'Média', dificil: 'Difícil' };
  var RAR = { comum: '#68768a', incomum: '#4fcbb4', rara: '#6fc8ee', epica: '#d9a544' };
  var RARL = { comum: 'Comum', incomum: 'Incomum', rara: 'Rara', epica: 'Épica' };

  var CLASSES = [
    { id: 'guerreiro', nome: 'Guerreiro', prim: 'FOR', passiva: '+15% de PV máximo', deck: 'Dano direto, custo baixo', cor: '#d9a544' },
    { id: 'ladino', nome: 'Ladino', prim: 'DES', passiva: '+10% de chance de crítico', deck: 'Velocidade, esquiva, acúmulo', cor: '#4fcbb4' },
    { id: 'mago', nome: 'Mago', prim: 'INT', passiva: '+1 de energia máxima', deck: 'Efeitos, controle, área', cor: '#6fc8ee' },
    { id: 'clerigo', nome: 'Clérigo', prim: 'SAB', passiva: 'Cura 5% do PV máx. por turno', deck: 'Sustentação, resistência, buffs', cor: '#e8c46a' },
  ];

  var ATTRS = [
    { key: 'FOR', label: 'Força', fonte: 'Massa muscular medida', base: 8 },
    { key: 'CON', label: 'Constituição', fonte: 'Água corporal e massa magra', base: 9 },
    { key: 'DES', label: 'Destreza', fonte: 'Cardio, mobilidade, alongamento', base: 7 },
    { key: 'INT', label: 'Inteligência', fonte: 'Horas de estudo validadas', base: 8 },
    { key: 'SAB', label: 'Sabedoria', fonte: 'Constância sem falha', base: 6 },
    { key: 'CAR', label: 'Carisma', fonte: 'Batalhas, convites, guilda', base: 7 },
  ];

  var CARDS = [
    { id: 'c1', nome: 'Golpe Firme', tipo: 'ataque', rar: 'comum', custo: 1, dano: 6, esc: 'FOR', src: 'Treino de força · 45 min', txt: 'Dano direto. Sempre acerta; a defesa apenas reduz.', copies: 3 },
    { id: 'c2', nome: 'Investida', tipo: 'ataque', rar: 'comum', custo: 2, dano: 10, esc: 'FOR', src: 'Treino de força · agachamento', txt: 'Dano direto maior, sem efeito secundário.', copies: 3 },
    { id: 'c3', nome: 'Passo Lateral', tipo: 'defesa', rar: 'comum', custo: 1, def: 4, esc: 'DES', src: 'Cardio · 8.000 passos', txt: '+4 de Defesa até o fim do próximo turno.', copies: 2 },
    { id: 'c4', nome: 'Respiração', tipo: 'cura', rar: 'comum', custo: 1, cura: 6, esc: 'SAB', src: 'Sono dentro da meta', txt: 'Recupera PV. Escala com Sabedoria.', copies: 2 },
    { id: 'c5', nome: 'Foco Analítico', tipo: 'efeito', rar: 'incomum', custo: 2, esc: 'INT', src: 'Estudo validado · 2 blocos', txt: 'Concede vantagem na próxima rolagem de crítico.', copies: 2 },
    { id: 'c6', nome: 'Segundo Fôlego', tipo: 'cura', rar: 'incomum', custo: 3, cura: 14, esc: 'SAB', src: 'Sono · 7 noites na meta', txt: 'Cura alta. Uma vez por combate rende mais.', copies: 2 },
    { id: 'c7', nome: 'Sopro de Cinzas', tipo: 'efeito', rar: 'rara', custo: 4, dano: 8, esc: 'INT', src: 'Missão semanal concluída', txt: 'Dano em área e veneno de 2 por 3 turnos.', copies: 2 },
    { id: 'c8', nome: 'Lâmina Adamante', tipo: 'ataque', rar: 'epica', custo: 5, dano: 22, esc: 'FOR', src: 'Missão épica · 40 treinos', txt: 'Dano devastador. Máximo de 2 cópias no deck.', copies: 1 },
  ];

  var ENEMY_DECK = [
    { nome: 'Golpe de Escória', tipo: 'ataque', dano: 7, txt: 'Golpe direto de matéria fundida.' },
    { nome: 'Carapaça Endurecida', tipo: 'defesa', def: 5, txt: 'Endurece a casca e absorve o impacto.' },
    { nome: 'Investida Pesada', tipo: 'ataque', dano: 11, txt: 'Avança com todo o peso do corpo.' },
    { nome: 'Bile Corrosiva', tipo: 'ataque', dano: 9, txt: 'Corrói a guarda antes de atingir.' },
  ];

  var ENEMY_SCRIPT = [
    { dmg: 7, intent: 'Prepara um golpe de escória · 7 de dano' },
    { dmg: 0, intent: 'Endurece a carapaça · +3 de Defesa' },
    { dmg: 11, intent: 'Investida pesada · 11 de dano' },
    { dmg: 9, intent: 'Golpe corrosivo · 9 de dano' },
  ];

  var DAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  var GUILD_SIZE = 6, MAJORITY = 4;

  var GUILD = [
    { nome: 'Kaio', nivel: 7, missao: 'Treino de força · 45 min', cat: 'corpo', xp: 40, feitas: 4, src: 'Health Connect', ok: true, seed: ['Bru', 'Tê'], msg: 'Fechei o treino de pernas. Foto do app de academia.' },
    { nome: 'Bru', nivel: 5, missao: 'Estudo focado · 4 blocos', cat: 'mente', xp: 25, feitas: 5, src: 'Cronômetro', ok: true, seed: ['Kaio', 'Duda', 'Tê'], msg: 'Duas horas de cronômetro rodando, sem sair do app.' },
    { nome: 'Tê', nivel: 6, missao: 'Corrida de 8 km', cat: 'corpo', xp: 40, feitas: 3, src: 'Health Connect', ok: true, seed: ['Kaio'], msg: 'Print do relógio com o traçado e o tempo.' },
    { nome: 'Rafa', nivel: 9, missao: 'Treino de 3 horas', cat: 'corpo', xp: 40, feitas: 2, src: 'Autodeclarado', ok: false, seed: [], msg: 'Três horas hoje, sem foto. Confia.' },
    { nome: 'Duda', nivel: 8, missao: 'Fechar 6 tarefas do dia', cat: 'oficio', xp: 15, feitas: 3, src: 'Autodeclarado', ok: true, seed: ['Bru', 'Nina'], msg: 'Captura do quadro de tarefas com tudo em concluído.' },
  ];

  var GEAR = [
    { nome: 'Bracelete Rúnico', tipo: 'Bracelete', meta: '+2 Defesa', rar: 'incomum' },
    { nome: 'Elmo de Escória', tipo: 'Elmo', meta: '+3 Defesa', rar: 'rara' },
    { nome: 'Talismã de Cinzas', tipo: 'Talismã', meta: '+1 Defesa · +5% crítico', rar: 'rara' },
  ];

  var TRADES = [
    { de: 'Kaio', offer: { k: 'carta', id: 'c7' }, want: { k: 'carta', id: 'c2' }, nota: 'Preciso de dano barato pro deck.' },
    { de: 'Bru', offer: { k: 'gear', id: 0 }, want: { k: 'carta', id: 'c5' }, nota: 'Troco o bracelete pelo Foco Analítico.' },
    { de: 'Duda', offer: { k: 'carta', id: 'c6' }, want: { k: 'carta', id: 'c3' }, nota: 'Cura por esquiva, fecha?' },
  ];

  // ── cronômetro de estudo (§18.2 · validação de camada 2) ────────────────────
  // pomodoro de 2 blocos de 25 min. O protótipo acelera o relógio para caber
  // numa demonstração; a mecânica de detecção de segundo plano é a real.
  var STUDY = { blocks: 2, blockSec: 25 * 60, breakSec: 5 * 60 };

  // ── missão épica (§11.4) ────────────────────────────────────────────────────
  var EPIC_PRESETS = [
    { title: 'Estudar 60 horas', target: 60, unit: 'horas', cat: 'mente' },
    { title: 'Completar 40 treinos', target: 40, unit: 'treinos', cat: 'corpo' },
    { title: 'Fechar 30 metas de trabalho', target: 30, unit: 'metas', cat: 'oficio' },
  ];
  var EPIC = { minDays: 15, maxDays: 90, gold: 500, points: 3 };

  // ── Descanso Sagrado (§12.3): até 4 folgas/mês, com 12 h de antecedência ────
  var REST = { cap: 4, antecedenceHours: 12 };
  var WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  // ── reforja de cartas (§17): 5 repetidas viram 1 de raridade superior ───────
  var RAR_ORDER = ['comum', 'incomum', 'rara', 'epica'];
  var REFORGE = { need: 5, cost: { comum: 120, incomum: 260, rara: 500 } };

  // ── seletor de aparência: variações de personagem por classe (tiles DCSS) ───
  // índice 0 = assets/art/cls_<classe>.png; índice N = cls_<classe>_N.png
  var PORTRAITS = {
    guerreiro: ['Comandante', 'Mercenária', 'Montanhês', 'Bruto'],
    ladino: ['Assassina', 'Trapaceiro', 'Goblin', 'Espectro'],
    mago: ['Arquimago', 'Feiticeira', 'Eremita', 'Eletromante'],
    clerigo: ['Anjo', 'Devoto', 'Querubim', 'Sacerdote'],
  };
  function portraitArt(classeId, idx) {
    return idx ? 'assets/art/cls_' + classeId + '_' + idx + '.png' : 'assets/art/cls_' + classeId + '.png';
  }

  // ── guilda: convite por link e primeira meta coletiva (§15, §24 v3) ──────────
  var GUILD_INVITE = 'adamante.app/entrar/7F3QK9';
  var GUILD_GOALS = [
    { title: '40 missões concluídas pela guilda', target: 40, cat: 'oficio' },
    { title: '15 treinos somados nesta semana', target: 15, cat: 'corpo' },
    { title: '100 horas de estudo no mês', target: 100, cat: 'mente' },
  ];

  global.AdmData = {
    CATS: CATS, DIFFS: DIFFS, RAR: RAR, RARL: RARL, CLASSES: CLASSES, ATTRS: ATTRS,
    CARDS: CARDS, ENEMY_DECK: ENEMY_DECK, ENEMY_SCRIPT: ENEMY_SCRIPT, DAYS: DAYS,
    GUILD_SIZE: GUILD_SIZE, MAJORITY: MAJORITY, GUILD: GUILD, GEAR: GEAR, TRADES: TRADES,
    STUDY: STUDY, EPIC_PRESETS: EPIC_PRESETS, EPIC: EPIC,
    GUILD_INVITE: GUILD_INVITE, GUILD_GOALS: GUILD_GOALS,
    REST: REST, WEEKDAYS: WEEKDAYS, RAR_ORDER: RAR_ORDER, REFORGE: REFORGE,
    PORTRAITS: PORTRAITS, portraitArt: portraitArt,
    mod: function (v) { return Math.floor((v - 10) / 2); },
    xpNeed: function (n) { return Math.round(80 * Math.pow(n, 1.5) / 10) * 10; },
  };
})(window);
