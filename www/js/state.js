/* Adamante — estado e ações.
 * Porte da classe Component (DCLogic) do documento de design para JS puro.
 */
(function (global) {
  'use strict';

  var D = global.AdmData, C = global.AdmCore;
  var ATTRS = D.ATTRS, CLASSES = D.CLASSES, CARDS = D.CARDS;
  var ENEMY_DECK = D.ENEMY_DECK, ENEMY_SCRIPT = D.ENEMY_SCRIPT;
  var GUILD = D.GUILD, TRADES = D.TRADES, MAJORITY = D.MAJORITY, GEAR = D.GEAR;
  var STUDY = D.STUDY, EPIC = D.EPIC, EPIC_PRESETS = D.EPIC_PRESETS, GUILD_GOALS = D.GUILD_GOALS, REST = D.REST;
  var RAR = D.RAR, RARL = D.RARL, RAR_ORDER = D.RAR_ORDER, REFORGE = D.REFORGE;
  var LOOK_UNLOCK = D.LOOK_UNLOCK;
  var mod = C.mod, xpNeed = C.xpNeed;

  // relógio do cronômetro: o protótipo comprime os 25 min num tempo de demonstração
  var TICK_MS = 120, TICK_DEC = 13;

  function App(props) {
    this.props = props || {};
    var alloc = {}; ATTRS.forEach(function (a) { alloc[a.key] = 0; });
    this.state = {
      screen: this.props.startScreen || 'splash',
      obStep: 0, consent: false, clsIdx: 0,
      trainDays: [true, false, true, false, true, true, false],
      level: 1, xp: 0, points: 0, gold: 0, streak: 0,
      fatigue: this.props.returningUser ? 5 : 0,
      alloc: alloc, draft: {},
      missions: [
        { id: 'm1', cat: 'corpo', diff: 'facil', title: 'Beber 2 L de água', xp: 15, gold: 10, src: 'autodeclarado', done: false },
        { id: 'm2', cat: 'oficio', diff: 'facil', title: 'Fechar 3 tarefas do dia', xp: 15, gold: 10, src: 'autodeclarado', done: false },
        { id: 'm3', cat: 'mente', diff: 'media', title: 'Estudo focado · 2 blocos de 25 min', xp: 25, gold: 20, src: 'cronômetro', done: false },
        { id: 'm4', cat: 'corpo', diff: 'media', title: '8.000 passos', xp: 25, gold: 20, src: 'Health Connect', done: false },
        { id: 'm5', cat: 'corpo', diff: 'dificil', title: 'Treino de força · 45 min', xp: 40, gold: 35, src: 'Health Connect', done: false, card: 'c2' },
      ],
      weekly: 0, medDone: false, rankTab: 0, flipped: {}, contested: {},
      wipe: null, lvFrom: 1, cover: null,
      email: '', senha: '', showPass: false, loginErr: false, focus: null,
      charName: this.props.characterName || '',
      nomeCompleto: '', usuario: '', nascimento: '', sexo: null, cadErr: '',
      gTab: 0, thread: this.props.startScreen === 'thread' ? 0 : null,
      myProofSent: false, myConfirms: 3,
      confirms: {}, tradeState: {},
      privacy: { corpo: false, ranking: true, guilda: true, saude: true },
      toast: null, levelUp: false,
      battle: null, floaters: [], log: [], flying: null,
      gains: [], xpFlash: false, animGold: 0, animXp: 0, impact: 0, preview: null,
      battleMode: this.props.battleMode || 'confronto',
      proofPhoto: {},
      // cronômetro de estudo (§18.2)
      timer: null,
      // missão épica (§11.4)
      epic: null, epicForm: false, epicPreset: 0, epicDays: 30,
      // guilda: estado vazio, convite por link e primeira meta coletiva (§15)
      guildEmpty: !!this.props.guildEmpty,
      inviteCopied: false, guildGoal: null, guildGoalPick: 0, guildGoalForm: false,
      // Descanso Sagrado (§12.3): folgas planejadas do mês
      restOpen: false, restDays: [],
      // reforja (§17): repetidas na coleção, além das cópias do deck
      dupes: { c1: 6, c3: 5, c5: 5 },
      // aparência escolhida por classe (índice em PORTRAITS)
      portraits: { guerreiro: 0, ladino: 0, mago: 0, clerigo: 0 },
      // desbloqueio: só a primeira aparência vem liberada; épica já concluída?
      unlockedLooks: { guerreiro: [0], ladino: [0], mago: [0], clerigo: [0] },
      epicDone: false, restartAsk: false,
      // §17 equipamento comprado e equipado (índices em GEAR)
      gearOwned: [], gearEquipped: [],
      // §19 LGPD (excluir conta) e §18.1 fonte de validação automática
      deleteAsk: false, healthConnected: false,
    };
    this._t = [];
    this._timerInt = null;
    this._alive = true;
    this._onRender = null;   // definido pelo bootstrap
    this._irisPlay = null;   // definido pelo bootstrap
  }

  var P = App.prototype;

  // ── infraestrutura ────────────────────────────────────────────────────────
  P.setState = function (patch, cb) {
    var prev = this.state;
    var next = typeof patch === 'function' ? patch(prev) : patch;
    if (!next) { if (cb) cb(); return; }
    var merged = {};
    for (var k in prev) merged[k] = prev[k];
    for (var j in next) merged[j] = next[j];
    this.state = merged;
    this.didUpdate(prev);
    if (this._onRender) this._onRender();
    if (cb) cb();
  };
  P.later = function (fn, ms) {
    var self = this;
    var t = setTimeout(function () { if (self._alive) fn(); }, ms);
    this._t.push(t);
    return t;
  };
  P.destroy = function () { this._alive = false; this._t.forEach(clearTimeout); this._t = []; this.stopTimerClock(); };

  P.didUpdate = function (ps) {
    if (ps.gold !== this.state.gold) this.tween('animGold', ps.gold, this.state.gold);
    if (ps.xp !== this.state.xp) this.tween('animXp', ps.xp, this.state.xp);
    var wasOver = !!(ps.battle && ps.battle.result), isOver = !!(this.state.battle && this.state.battle.result);
    var opened = (!ps.levelUp && this.state.levelUp) || (!wasOver && isOver);
    if (opened && !this.state.wipe) {
      var self = this;
      this.state = Object.assign({}, this.state, { wipe: 'close' });
      requestAnimationFrame(function () { if (self._irisPlay) self._irisPlay('close'); });
    }
  };

  P.tween = function (key, from, to) {
    var self = this, st = this.state;
    if (st.cover || st.wipe || st.levelUp) { this.state = Object.assign({}, this.state, defObj(key, to)); return; }
    var t0 = performance.now(), dur = 560;
    var step = function () {
      if (!self._alive) return;
      if (self.state.cover || self.state.wipe) { self.setState(defObj(key, to)); return; }
      var p = Math.min(1, (performance.now() - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      self.setState(defObj(key, Math.round(from + (to - from) * e)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  function defObj(k, v) { var o = {}; o[k] = v; return o; }

  P.mount = function () {
    var self = this;
    if (this.state.screen === 'splash') this.later(function () { self.transitionTo('login'); }, 2200);
  };

  P.transitionTo = function (screen, extra) {
    var self = this;
    if (this.state.cover) return;
    this.setState({ cover: 1 }, function () {
      requestAnimationFrame(function () { if (self._irisPlay) self._irisPlay('cycle'); });
    });
    this.later(function () { self.setState(Object.assign({ screen: screen }, extra || {})); }, 830);
    this.later(function () { self.setState({ cover: null }); }, 1810);
  };

  P.toast = function (msg, sub, color) {
    var self = this;
    this.setState({ toast: { msg: msg, sub: sub, color: color || '#6fc8ee' } });
    this.later(function () { self.setState({ toast: null }); }, 2600);
  };

  P.gain = function (text, color) {
    var self = this, id = Date.now() + Math.random();
    this.setState(function (s) { return { gains: s.gains.concat([{ id: id, text: text, color: color }]), xpFlash: true }; });
    this.later(function () { self.setState(function (s) { return { gains: s.gains.filter(function (g) { return g.id !== id; }) }; }); }, 1300);
    this.later(function () { self.setState({ xpFlash: false }); }, 900);
  };

  // ── derivadas de personagem ───────────────────────────────────────────────
  P.cls = function () { return CLASSES[this.state.clsIdx]; };
  P.total = function (k) {
    var a = ATTRS.find(function (x) { return x.key === k; });
    return a.base + (this.state.alloc[k] || 0) + (this.state.draft[k] || 0);
  };
  P.effective = function (k) { return C.atributoEfetivo(this.total(k), this.state.fatigue); };
  P.hpMax = function () { return C.pvMaximo(this.state.level, mod(this.effective('CON')), this.cls().id); };
  P.defBonus = function () { var s = 0; this.state.gearEquipped.forEach(function (i) { s += GEAR[i].def; }); return s; };
  P.critBonus = function () { var s = 0; this.state.gearEquipped.forEach(function (i) { s += GEAR[i].crit; }); return s; };
  P.critThreshold = function () { return Math.max(2, C.limiarCritico(this.cls().id) - this.critBonus()); };
  P.isCrit = function (rolagem) { return rolagem >= this.critThreshold(); };
  P.defense = function () { return C.defesa(mod(this.effective('DES')), this.defBonus()); };
  P.energyMax = function () { return C.energiaMaxima(this.cls().id); };
  P.costOf = function (k, n) {
    var a = ATTRS.find(function (x) { return x.key === k; });
    return C.custoDeIncrementos(a.base + (this.state.alloc[k] || 0), n);
  };
  P.nextCost = function (k) { return C.custoDoProximo(this.total(k)); };
  P.pointsLeft = function () {
    var d = 0, self = this;
    Object.keys(this.state.draft).forEach(function (k) { d += self.costOf(k, self.state.draft[k]); });
    return this.state.points - d;
  };
  P.age = function () {
    if (!this.state.nascimento) return null;
    var d = new Date(this.state.nascimento); if (isNaN(d)) return null;
    var now = new Date(), a = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a;
  };

  // ── cadastro e login ──────────────────────────────────────────────────────
  P.doCadastro = function () {
    var self = this, s = this.state, a = this.age();
    if (!s.nomeCompleto.trim()) { this.setState({ cadErr: 'Informe o seu nome completo.' }); return; }
    if (!s.nascimento || a === null) { this.setState({ cadErr: 'Informe a data de nascimento.' }); return; }
    if (a < 13) { this.setState({ cadErr: 'A conta exige 13 anos ou mais.' }); return; }
    if (!s.usuario.trim()) { this.setState({ cadErr: 'Escolha um nome de usuário para entrar e aparecer no ranking.' }); return; }
    if (s.senha.trim().length < 8) { this.setState({ cadErr: 'A senha precisa de pelo menos 8 caracteres.' }); return; }
    if (!s.sexo) { this.setState({ cadErr: 'Escolha uma opção de sexo biológico, ou prefiro não informar.' }); return; }
    this.setState({ cadErr: '' });
    this.transitionTo('onboarding', { obStep: 0 });
    if (a < 18) this.later(function () { self.toast('Conta de menor de 18', 'O módulo de composição corporal fica desativado e a base é fixa em 8.', '#7f8ec0'); }, 1200);
  };
  P.doLogin = function () {
    if (!this.state.email.trim() || !this.state.senha.trim()) { this.setState({ loginErr: true }); return; }
    this.setState({ loginErr: false });
    this.transitionTo('onboarding', { obStep: 0 });
  };

  // ── onboarding ────────────────────────────────────────────────────────────
  P.obNext = function () {
    var self = this, s = this.state.obStep;
    if (s === 1 && !this.state.consent) { this.toast('Consentimento necessário', 'A LGPD exige autorização específica antes de coletar dado de saúde.', '#d9a544'); return; }
    if (s < 4) { this.setState({ obStep: s + 1 }); return; }
    if (!this.state.charName.trim()) { this.toast('Escolha um nome', 'Seu personagem precisa de nome antes de entrar no jogo.', '#d9a544'); return; }
    this.transitionTo('inicio');
    this.later(function () {
      self.toast(self.state.charName.trim().toUpperCase() + ' está de pé', '5 missões geradas para hoje. Nível 2 está a 80 XP.', '#4fcbb4');
    }, 1180);
  };
  P.obBack = function () { this.setState({ obStep: Math.max(0, this.state.obStep - 1) }); };

  // ── missões ───────────────────────────────────────────────────────────────
  P.toggleMission = function (id) {
    var self = this, st = this.state;
    var m = st.missions.find(function (x) { return x.id === id; });
    if (!m) return;
    var missions = st.missions.map(function (x) { return x.id === id ? Object.assign({}, x, { done: !x.done }) : x; });
    if (m.done) {
      this.setState({ missions: missions, xp: Math.max(0, st.xp - m.xp), gold: Math.max(0, st.gold - m.gold) });
      return;
    }
    var xp = st.xp + m.xp, gold = st.gold + m.gold, level = st.level, points = st.points, levelUp = false;
    var fromLevel = level;
    while (xp >= xpNeed(level) && level < 20) { xp -= xpNeed(level); level++; points += 2; levelUp = true; }
    var allDone = missions.every(function (x) { return x.done; });
    var fatigue = allDone ? Math.max(0, st.fatigue - 2) : st.fatigue;
    var streak = allDone ? st.streak + 1 : st.streak;
    var weekly = (m.diff === 'dificil' && m.cat === 'corpo') ? Math.min(3, st.weekly + 1) : st.weekly;
    this.setState({ missions: missions, xp: xp, gold: gold, level: level, points: points, weekly: weekly, fatigue: fatigue, streak: streak });
    this.gain('+' + m.xp + ' XP', '#6fc8ee');
    if (levelUp) {
      this.later(function () { self.setState({ levelUp: true, lvFrom: fromLevel, wipe: null }); }, 640);
    } else if (m.card) {
      this.toast('Carta forjada', 'Investida — comum, ataque. O treino virou carta.', '#e8c46a');
    } else {
      this.toast('+' + m.xp + ' XP', m.src === 'autodeclarado'
        ? 'Autodeclarado rende 70% e não conta para o ranking global.'
        : 'Validado por ' + m.src + '.', '#6fc8ee');
    }
  };

  // ── pontos de atributo ────────────────────────────────────────────────────
  P.inc = function (k) {
    if (this.pointsLeft() < this.nextCost(k)) { this.toast('Pontos insuficientes', 'Acima de 15 custa 2 por incremento; acima de 18, custa 3.', '#d9a544'); return; }
    if (this.total(k) >= 20) return;
    var draft = Object.assign({}, this.state.draft); draft[k] = (draft[k] || 0) + 1;
    this.setState({ draft: draft });
  };
  P.dec = function (k) {
    if (!this.state.draft[k]) return;
    var draft = Object.assign({}, this.state.draft); draft[k] -= 1; if (!draft[k]) delete draft[k];
    this.setState({ draft: draft });
  };
  P.commitPoints = function () {
    var self = this, st = this.state;
    var alloc = Object.assign({}, st.alloc), spent = 0;
    Object.keys(st.draft).forEach(function (k) { spent += self.costOf(k, st.draft[k]); alloc[k] = (alloc[k] || 0) + st.draft[k]; });
    this.setState({ alloc: alloc, draft: {}, points: st.points - spent });
    this.toast('Atributos atualizados', 'PV e Defesa recalculados na ficha.', '#4fcbb4');
  };

  P.registrarMedicao = function () {
    if (this.state.medDone) { this.toast('Aguarde 7 dias', 'Composição corporal não muda de forma mensurável em menos de uma semana.', '#6fc8ee'); return; }
    // §6.3: +1,2 kg de massa magra e +1 ponto de água → 3 pontos, nunca negativo
    var pontos = C.pontosDaMedicao(1.2, true);
    this.setState({ medDone: true, points: this.state.points + pontos });
    this.toast('+' + pontos + ' pontos de atributo', 'Massa magra subiu 1,2 kg e a água corporal subiu 1 ponto.', '#4fcbb4');
  };

  // ── §18.2 cronômetro de estudo (validação de camada 2) ────────────────────
  // Estudo e trabalho só contam com o timer rodando no app, com detecção de
  // app em segundo plano. Deixar o app durante um bloco de foco invalida o bloco.
  P.startTimerClock = function () {
    var self = this;
    if (this._timerInt) return;
    this._timerInt = setInterval(function () { if (self._alive) self.tickTimer(); }, TICK_MS);
  };
  P.stopTimerClock = function () { if (this._timerInt) { clearInterval(this._timerInt); this._timerInt = null; } };

  P.openTimer = function (missionId) {
    var m = this.state.missions.find(function (x) { return x.id === missionId; });
    if (!m || m.done) return;
    this.stopTimerClock();
    this.setState({
      timer: {
        missionId: missionId, title: m.title, phase: 'ready',
        block: 1, totalBlocks: STUDY.blocks, blocksDone: 0,
        secLeft: STUDY.blockSec, blockSec: STUDY.blockSec, breakSec: STUDY.breakSec,
        interruptions: 0,
      },
    });
  };
  P.startTimer = function () {
    var t = this.state.timer; if (!t) return;
    var secLeft = t.phase === 'interrupted' ? t.blockSec : t.secLeft;
    this.setState({ timer: Object.assign({}, t, { phase: 'running', secLeft: secLeft }) });
    this.startTimerClock();
  };
  P.pauseTimer = function () {
    var t = this.state.timer; if (!t || t.phase !== 'running') return;
    this.stopTimerClock();
    this.setState({ timer: Object.assign({}, t, { phase: 'ready' }) });
  };
  P.skipBreak = function () {
    var t = this.state.timer; if (!t || t.phase !== 'break') return;
    this.setState({ timer: Object.assign({}, t, { phase: 'running', secLeft: t.blockSec }) });
    this.startTimerClock();
  };
  P.tickTimer = function () {
    var t = this.state.timer;
    if (!t || (t.phase !== 'running' && t.phase !== 'break')) { this.stopTimerClock(); return; }
    var secLeft = t.secLeft - TICK_DEC;
    if (secLeft > 0) { this.setState({ timer: Object.assign({}, t, { secLeft: secLeft }) }); return; }
    if (t.phase === 'break') {
      this.setState({ timer: Object.assign({}, t, { phase: 'running', secLeft: t.blockSec }) });
      return;
    }
    var blocksDone = t.blocksDone + 1;
    if (blocksDone >= t.totalBlocks) {
      this.stopTimerClock();
      this.setState({ timer: Object.assign({}, t, { phase: 'done', blocksDone: blocksDone, secLeft: 0 }) });
    } else {
      this.setState({ timer: Object.assign({}, t, { phase: 'break', blocksDone: blocksDone, block: blocksDone + 1, secLeft: t.breakSec }) });
    }
  };
  // detecção de segundo plano: só o bloco de foco é invalidado; a pausa é livre
  P.timerBackgrounded = function () {
    var t = this.state.timer;
    if (!t || t.phase !== 'running') return;
    this.stopTimerClock();
    this.setState({ timer: Object.assign({}, t, { phase: 'interrupted', secLeft: t.blockSec, interruptions: t.interruptions + 1 }) });
  };
  P.finishTimer = function () {
    var t = this.state.timer; if (!t || t.phase !== 'done') return;
    var id = t.missionId;
    this.stopTimerClock();
    this.setState({ timer: null });
    var m = this.state.missions.find(function (x) { return x.id === id; });
    if (m && !m.done) this.toggleMission(id);
  };
  P.closeTimer = function () { this.stopTimerClock(); this.setState({ timer: null }); };

  // ── §17 equipamento: comprar com ouro, equipar/desequipar ─────────────────
  // equipa i tirando qualquer outro item do mesmo slot
  P._equipInto = function (eq, i) {
    var slot = GEAR[i].slot;
    return eq.filter(function (j) { return GEAR[j].slot !== slot; }).concat([i]);
  };
  P.buyGear = function (i) {
    var st = this.state, g = GEAR[i];
    if (st.gearOwned.indexOf(i) >= 0) return;
    if (st.gold < g.cost) { this.toast('Ouro insuficiente', 'Faltam ' + (g.cost - st.gold) + ' de ouro para forjar ' + g.nome + '.', '#d9a544'); return; }
    this.setState({ gold: st.gold - g.cost, gearOwned: st.gearOwned.concat([i]), gearEquipped: this._equipInto(st.gearEquipped, i) });
    this.toast(g.nome + ' equipado', '−' + g.cost + ' de ouro · ' + g.meta + '. Já vale na Defesa e no combate.', '#4fcbb4');
  };
  P.toggleGear = function (i) {
    var st = this.state;
    if (st.gearOwned.indexOf(i) < 0) { this.buyGear(i); return; }
    var at = st.gearEquipped.indexOf(i);
    var eq = at >= 0 ? st.gearEquipped.filter(function (j) { return j !== i; }) : this._equipInto(st.gearEquipped, i);
    this.setState({ gearEquipped: eq });
  };

  // ── §11.4 missão épica: criação, progresso, conclusão e vencimento ────────
  P.openEpicForm = function () { this.setState({ epicForm: true, epicPreset: 0, epicDays: 30 }); };
  P.closeEpicForm = function () { this.setState({ epicForm: false }); };
  P.setEpicPreset = function (i) { this.setState({ epicPreset: i }); };
  P.setEpicDays = function (d) {
    this.setState({ epicDays: Math.max(EPIC.minDays, Math.min(EPIC.maxDays, d | 0)) });
  };
  P.createEpic = function () {
    var s = this.state, p = EPIC_PRESETS[s.epicPreset];
    if (!C.prazoEpicaValido(s.epicDays)) { this.toast('Prazo fora da faixa', 'A missão épica precisa de 15 a 90 dias.', '#d9a544'); return; }
    this.setState({
      epic: { title: p.title, target: p.target, unit: p.unit, cat: p.cat, current: 0, days: s.epicDays, xp: C.xpEpica(s.epicDays) },
      epicForm: false,
    });
    this.toast('Missão épica criada', p.title + ' · ' + s.epicDays + ' dias. Se o prazo vencer, nada é perdido.', '#d9a544');
  };
  P.advanceEpic = function () {
    var e = this.state.epic; if (!e || e.current >= e.target) return;
    var step = Math.max(1, Math.round(e.target / 8));
    var current = Math.min(e.target, e.current + step);
    this.setState({ epic: Object.assign({}, e, { current: current }) });
    if (current >= e.target) this.toast('Meta atingida', 'Colha a recompensa da missão épica.', '#4fcbb4');
  };
  P.completeEpic = function () {
    var self = this, st = this.state, e = st.epic;
    if (!e || e.current < e.target) return;
    var fromLevel = st.level, res = C.aplicarXp(st.level, st.xp, e.xp);
    this.setState({
      epic: null, xp: res.xp, level: res.nivel,
      points: st.points + res.pontosGanhos + EPIC.points, gold: st.gold + EPIC.gold,
      epicDone: true,
    });
    this._persistUnlocks(this.state.unlockedLooks, true);
    this.gain('+' + e.xp + ' XP', '#d9a544');
    if (res.subiu) {
      this.later(function () { self.setState({ levelUp: true, lvFrom: fromLevel, wipe: null }); }, 640);
    } else {
      this.toast('Missão épica concluída', '+' + e.xp + ' XP · +' + EPIC.gold + ' ouro · +' + EPIC.points + ' pontos de atributo.', '#d9a544');
    }
  };
  P.expireEpic = function () {
    if (!this.state.epic) return;
    this.setState({ epic: null });
    this.toast('Missão expirada', 'Nada foi perdido — sem punição. Você pode recriá-la quando quiser.', '#7f8ec0');
  };

  // ── §15 guilda: estado vazio, convite por link e primeira meta coletiva ───
  P.copyInvite = function () {
    var self = this, link = D.GUILD_INVITE;
    var done = function () {
      self.setState({ inviteCopied: true });
      self.toast('Link copiado', 'Convites por link entram direto na guilda. Mande para quem treina com você.', '#6fc8ee');
      self.later(function () { self.setState({ inviteCopied: false }); }, 2600);
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, done);
      else done();
    } catch (e) { done(); }
  };
  P.setGuildGoalPick = function (i) { this.setState({ guildGoalPick: i }); };
  P.setFirstGuildGoal = function () {
    var g = GUILD_GOALS[this.state.guildGoalPick];
    this.setState({ guildGoal: { title: g.title, target: g.target, cat: g.cat } });
    this.toast('Primeira meta definida', 'A guilda nasce com um objetivo comum. Fechá-lo libera recompensa para todos os membros.', '#4fcbb4');
  };

  // ── §12.3 Descanso Sagrado: folga planejada, sem Fadiga e com sequência intacta
  P.openRest = function () { this.setState({ restOpen: true }); };
  P.closeRest = function () { this.setState({ restOpen: false }); };
  P.toggleRestDay = function (iso) {
    var days = this.state.restDays.slice(), i = days.indexOf(iso);
    if (i >= 0) { days.splice(i, 1); this.setState({ restDays: days }); return; }
    if (days.length >= REST.cap) {
      this.toast('Limite de folgas', 'São até ' + REST.cap + ' Descansos Sagrados por mês. Desmarque um para trocar.', '#d9a544');
      return;
    }
    days.push(iso);
    this.setState({ restDays: days });
    this.toast('Folga marcada', 'Nesse dia não há Fadiga e a sequência é preservada — descanso planejado não pune.', '#7f8ec0');
  };

  // ── batalha ───────────────────────────────────────────────────────────────
  P.startBattle = function () {
    if (this.state.fatigue >= 6) { this.toast('PvP bloqueado', 'Fadiga em 6 ou mais. PvE segue liberado.', '#7f8ec0'); return; }
    var deck = [];
    CARDS.forEach(function (c) { for (var i = 0; i < Math.min(2, c.copies); i++) deck.push(c); });
    var pool = deck.concat(deck).slice(0, 20).sort(function () { return Math.random() - 0.5; });
    this.setState({
      battle: {
        hp: this.hpMax(), hpMax: this.hpMax(), ehp: 48, ehpMax: 48, energy: 3, energyMax: 3, turn: 1,
        deck: pool.slice(5), hand: pool.slice(0, 5), result: null,
        phase: this.state.battleMode === 'confronto' ? 'choose' : 'free',
        enemyCard: ENEMY_DECK[0], playerCard: null, revealed: false, verdict: null, shield: 0,
      },
      log: [{ id: 1, text: this.state.battleMode === 'confronto' ? 'Rodada 1 · a Sentinela já escolheu. Escolha a sua.' : 'Turno 1 · a Sentinela observa o seu padrão.' }],
      floaters: [], flying: null, preview: null,
    });
  };

  P.commitCard = function (i) {
    var self = this, b = this.state.battle;
    if (!b || b.result || b.phase !== 'choose') return;
    var c = b.hand[i];
    if (c.custo > b.energy) { this.toast('Energia insuficiente', 'Avance a rodada para ganhar mais energia.', '#6fc8ee'); return; }
    var nb = Object.assign({}, b, {
      hand: b.hand.filter(function (_, k) { return k !== i; }),
      energy: b.energy - c.custo, playerCard: c, phase: 'reveal', revealed: false,
    });
    this.setState({ battle: nb, preview: null });
    // se o jogador sair do combate antes da revelação, não ressuscita a batalha
    this.later(function () {
      self.setState(function (st) { return st.battle ? { battle: Object.assign({}, st.battle, { revealed: true }) } : null; });
    }, 480);
    this.later(function () { self.resolveClash(); }, 1320);
  };

  P.resolveClash = function () {
    var self = this, b = this.state.battle;
    if (!b || !b.playerCard) return;
    var pc = b.playerCard, ec = b.enemyCard, cls = this.cls();
    var pm = mod(this.effective(cls.prim));
    var raw = pc.dano ? pc.dano + pm * 2 : 0;
    var crit = raw > 0 && this.isCrit(Math.random() * 20 + 1);
    if (crit) raw *= 2;
    var heal = pc.cura ? pc.cura + mod(this.effective('SAB')) * 2 : 0;
    var myDef = pc.def || 0, itsDef = ec.def || 0;
    var dealt = raw > 0 ? Math.max(1, raw - Math.floor((14 + itsDef) / 3)) : 0;
    var taken = ec.dano ? Math.max(1, ec.dano - Math.floor((this.defense() + myDef) / 3)) : 0;
    var title, detail, tone;
    if (dealt > 0 && taken > 0) { title = 'TROCA DE GOLPES'; tone = '#e8c46a'; detail = 'Você tirou ' + dealt + ' e sofreu ' + taken + '.'; }
    else if (dealt > 0) { title = itsDef ? 'GUARDA ROMPIDA' : 'ACERTO LIMPO'; tone = '#4fcbb4'; detail = 'Você tirou ' + dealt + ' e não sofreu nada.'; }
    else if (taken > 0) { title = myDef ? 'DEFENDIDO' : 'VOCÊ SOFREU'; tone = myDef ? '#6fc8ee' : '#d9a544'; detail = myDef ? 'A guarda aguentou. Passaram só ' + taken + '.' : 'Sofreu ' + taken + ' e não devolveu.'; }
    else { title = 'EMPATE'; tone = '#8a97ab'; detail = 'Nenhum golpe passou nesta rodada.'; }
    if (crit) detail = 'Crítico. ' + detail;
    if (heal) detail += ' Recuperou ' + heal + ' PV.';
    var nb = Object.assign({}, b, { phase: 'resolve', verdict: { title: title, detail: detail, tone: tone } });
    nb.ehp = Math.max(0, b.ehp - dealt);
    nb.hp = Math.max(0, Math.min(b.hpMax, b.hp - taken + heal));
    if (dealt > 0) {
      this.setState(function (s) { return { impact: s.impact + 1 }; });
      this.later(function () { self.setState({ impact: 0 }); }, 740);
      this.float(crit ? '−' + dealt + ' CRÍTICO' : '−' + dealt, crit ? '#e8c46a' : '#d9a544');
    }
    this.setState({ battle: nb });
    this.addLog(pc.nome + ' contra ' + ec.nome + ' · ' + title.toLowerCase() + '.');
  };

  P.nextRound = function () {
    var b = this.state.battle; if (!b) return;
    if (b.ehp <= 0) { this.setState({ battle: Object.assign({}, b, { result: 'win' }), gold: this.state.gold + 60, xp: this.state.xp + 90 }); return; }
    if (b.hp <= 0) { this.setState({ battle: Object.assign({}, b, { result: 'lose' }) }); return; }
    var turn = b.turn + 1;
    var deck = b.deck.slice(), hand = b.hand.slice(), hp = b.hp;
    if (hand.length < 8) {
      if (!deck.length) {
        deck = CARDS.slice().sort(function () { return Math.random() - 0.5; });
        hp = Math.max(0, hp - 5);
        this.addLog('Deck reembaralhado · 5 de dano por exaustão.');
      }
      hand.push(deck.shift());
    }
    if (this.cls().id === 'clerigo') hp = Math.min(b.hpMax, hp + Math.round(b.hpMax * 0.05));
    var em = Math.min(this.energyMax(), b.energyMax + 1);
    this.setState({
      battle: Object.assign({}, b, {
        turn: turn, deck: deck, hand: hand, hp: hp, energy: em, energyMax: em, phase: 'choose',
        enemyCard: ENEMY_DECK[(turn - 1) % ENEMY_DECK.length], playerCard: null, revealed: false, verdict: null,
      }),
    });
    this.addLog('Rodada ' + turn + ' · a Sentinela escolheu de novo.');
  };

  P.fleeBattle = function () { this.setState({ battle: null, log: [], floaters: [], wipe: null }); };
  P.resetBattle = function () {
    var self = this;
    if (this.state.wipe === 'open') return;
    this.setState({ wipe: 'open' }, function () { requestAnimationFrame(function () { if (self._irisPlay) self._irisPlay('open'); }); });
    this.later(function () { self.setState({ battle: null, log: [], floaters: [], wipe: null }); }, 860);
  };
  P.addLog = function (text) {
    this.setState(function (s) { return { log: s.log.concat([{ id: Date.now() + Math.random(), text: text }]).slice(-4) }; });
  };
  P.float = function (text, color) {
    var self = this, id = Date.now() + Math.random();
    this.setState(function (s) { return { floaters: s.floaters.concat([{ id: id, text: text, color: color }]) }; });
    this.later(function () { self.setState(function (s) { return { floaters: s.floaters.filter(function (f) { return f.id !== id; }) }; }); }, 1000);
  };
  P.tapCard = function (idx) {
    var b = this.state.battle; if (!b || b.result) return;
    if (this.state.battleMode === 'confronto' && b.phase !== 'choose') return;
    this.setState({ preview: idx });
  };
  P.closePreview = function () { this.setState({ preview: null }); };
  P.confirmPlay = function () {
    var i = this.state.preview; if (i === null) return;
    if (this.state.battleMode === 'confronto') { this.commitCard(i); return; }
    this.setState({ preview: null });
    this.playCard(i);
  };

  P.playCard = function (idx) {
    var self = this, b = this.state.battle; if (!b || b.result) return;
    var c = b.hand[idx];
    if (c.custo > b.energy) { this.toast('Energia insuficiente', 'Encerre o turno para ganhar mais energia.', '#6fc8ee'); return; }
    var nb = Object.assign({}, b);
    nb.hand = b.hand.filter(function (_, i) { return i !== idx; });
    nb.energy = b.energy - c.custo;
    this.setState({ flying: c });
    this.later(function () { self.setState({ flying: null }); }, 720);
    if (c.dano) {
      var m = mod(this.effective(this.cls().prim));
      var crit = this.isCrit(Math.random() * 20 + 1);
      var dmg = C.danoFinal(c.dano, m, 14);
      if (crit) dmg *= 2;
      nb.ehp = Math.max(0, b.ehp - dmg);
      this.setState(function (s) { return { impact: s.impact + 1 }; });
      this.later(function () { self.setState({ impact: 0 }); }, 740);
      this.float(crit ? '−' + dmg + ' CRÍTICO' : '−' + dmg, crit ? '#e8c46a' : '#d9a544');
      this.addLog(c.nome + ' · ' + dmg + ' de dano' + (crit ? ' (crítico, 1d20 ≥ 19)' : '') + '.');
    } else if (c.cura) {
      var h = c.cura + mod(this.effective('SAB')) * 2;
      nb.hp = Math.min(b.hpMax, b.hp + h);
      this.float('+' + h, '#4fcbb4');
      this.addLog(c.nome + ' · ' + h + ' de PV recuperado.');
    } else if (c.def) {
      nb.shield = b.shield + c.def;
      this.addLog(c.nome + ' · +' + c.def + ' de Defesa neste turno.');
    } else {
      this.addLog(c.nome + ' · vantagem na próxima rolagem de crítico.');
    }
    if (nb.ehp <= 0) {
      nb.result = 'win';
      this.setState({ battle: nb, gold: this.state.gold + 60, xp: this.state.xp + 90 });
      return;
    }
    this.setState({ battle: nb });
  };

  P.endTurn = function () {
    var self = this, b = this.state.battle; if (!b || b.result) return;
    var step = ENEMY_SCRIPT[(b.turn - 1) % ENEMY_SCRIPT.length];
    var nb = Object.assign({}, b);
    if (step.dmg) {
      var dmg = Math.max(1, step.dmg - Math.floor((this.defense() + b.shield) / 3));
      nb.hp = Math.max(0, b.hp - dmg);
      this.float('−' + dmg, '#d9a544');
      this.addLog('Sentinela · ' + dmg + ' de dano em você.');
    } else this.addLog('Sentinela · endurece a carapaça.');
    nb.shield = 0;
    nb.turn = b.turn + 1;
    nb.energyMax = Math.min(this.energyMax(), b.energyMax + 1);
    nb.energy = nb.energyMax;
    var deck = b.deck.slice(), hand = nb.hand.slice();
    for (var i = 0; i < 2 && hand.length < 8; i++) {
      if (!deck.length) {
        this.addLog('Deck reembaralhado · 5 de dano por exaustão.');
        nb.hp = Math.max(0, nb.hp - 5);
        deck = CARDS.slice().sort(function () { return Math.random() - 0.5; });
      }
      hand.push(deck.shift());
    }
    nb.deck = deck; nb.hand = hand;
    if (this.cls().id === 'clerigo') nb.hp = Math.min(nb.hpMax, nb.hp + Math.round(nb.hpMax * 0.05));
    if (nb.hp <= 0) nb.result = 'lose';
    this.setState({ battle: nb });
    if (!nb.result) this.later(function () { self.addLog('Turno ' + nb.turn + ' · ' + ENEMY_SCRIPT[(nb.turn - 1) % ENEMY_SCRIPT.length].intent); }, 280);
  };
  P.noopRound = function () { /* aguardando a carta do jogador */ };

  // ── guilda ────────────────────────────────────────────────────────────────
  P.openThread = function (i) { this.setState({ screen: 'thread', thread: i }); };
  P.openMyThread = function () { this.setState({ screen: 'thread', thread: 'me' }); };
  P.confirmThread = function () {
    var t = this.state.thread;
    if (t === 'me') {
      if (!this.state.myProofSent) {
        this.setState({ myProofSent: true });
        this.toast('Comprovação enviada', 'A guilda foi avisada. Precisa de 4 confirmações de 6.', '#6fc8ee');
      }
      return;
    }
    var c = Object.assign({}, this.state.confirms);
    if (c[t]) return;
    c[t] = true;
    var total = GUILD[t].seed.length + 1;
    this.setState({ confirms: c });
    if (total >= MAJORITY) {
      this.toast('Missão validada', GUILD[t].nome + ' recebeu o XP integral. Maioria atingida.', '#4fcbb4');
      this.gain('VALIDADO', '#4fcbb4');
    } else {
      this.toast('Você confirmou', 'Faltam ' + (MAJORITY - total) + ' para a maioria de ' + MAJORITY + '.', '#6fc8ee');
    }
  };
  P.contestThread = function () {
    var t = this.state.thread; if (t === 'me') return;
    var c = Object.assign({}, this.state.contested); c[t] = true;
    this.setState({ contested: c });
    this.toast('Contestação registrada', 'Três contestações invalidam a missão e devolvem as recompensas.', '#d9a544');
  };
  P.resolveTrade = function (i, accept) {
    var ts = Object.assign({}, this.state.tradeState); ts[i] = accept ? 'aceita' : 'recusada';
    this.setState({ tradeState: ts });
    if (accept) this.toast('Troca concluída', 'As cartas mudaram de deck. Nenhum ouro envolvido.', '#4fcbb4');
    else this.toast('Troca recusada', TRADES[i].de + ' foi avisado.', '#8a97ab');
  };

  // ── §17 reforja: 5 repetidas da mesma carta viram 1 de raridade superior ──
  P.reforge = function (cardId) {
    var st = this.state, card = CARDS.find(function (c) { return c.id === cardId; });
    if (!card) return;
    var nextRar = RAR_ORDER[RAR_ORDER.indexOf(card.rar) + 1];
    if (!nextRar) { this.toast('Já é o topo', 'Cartas épicas não têm raridade superior.', '#d9a544'); return; }
    var have = st.dupes[cardId] || 0;
    if (have < REFORGE.need) { this.toast('Faltam repetidas', 'A reforja precisa de ' + REFORGE.need + ' cópias da mesma carta.', '#6fc8ee'); return; }
    var cost = REFORGE.cost[card.rar];
    if (st.gold < cost) { this.toast('Ouro insuficiente', 'Reforjar uma carta ' + RARL[card.rar] + ' custa ' + cost + ' de ouro.', '#d9a544'); return; }
    var produced = CARDS.find(function (c) { return c.rar === nextRar && c.id !== cardId; });
    var dupes = Object.assign({}, st.dupes);
    dupes[cardId] = have - REFORGE.need;
    if (produced) dupes[produced.id] = (dupes[produced.id] || 0) + 1;
    this.setState({ dupes: dupes, gold: st.gold - cost });
    this.gain('REFORJADA', RAR[nextRar]);
    this.toast('Reforja concluída', REFORGE.need + ' × ' + card.nome + ' viraram ' + (produced ? produced.nome : 'uma carta') + ' · ' + RARL[nextRar] + '. −' + cost + ' de ouro.', RAR[nextRar]);
  };

  // ── seletor de aparência (desbloqueio + escolha permanente) ───────────────
  P.isLookUnlocked = function (classId, idx) {
    return (this.state.unlockedLooks[classId] || [0]).indexOf(idx) >= 0;
  };
  P.setPortrait = function (classId, idx) {
    if (!this.isLookUnlocked(classId, idx)) return;   // não veste bloqueado
    var p = Object.assign({}, this.state.portraits); p[classId] = idx;
    this.setState({ portraits: p });
    try { localStorage.setItem('adamante.portraits', JSON.stringify(p)); } catch (e) { /* quota */ }
  };
  // devolve true se desbloqueou agora
  P.unlockLook = function (classId, idx) {
    if (this.isLookUnlocked(classId, idx)) return true;
    var st = this.state, req = LOOK_UNLOCK[idx] || { kind: 'free' };
    if (req.kind === 'gold') {
      if (st.gold < req.cost) { this.toast('Ouro insuficiente', 'Faltam ' + (req.cost - st.gold) + ' de ouro para desbloquear.', '#d9a544'); return false; }
      this.setState({ gold: st.gold - req.cost });
      this._addUnlock(classId, idx);
      this.toast('Aparência desbloqueada', '−' + req.cost + ' de ouro. Vestir uma nova raça exige recomeçar o personagem.', '#4fcbb4');
      return true;
    }
    if (req.kind === 'epic') {
      if (!st.epicDone) { this.toast('Bloqueado', 'Conclua uma missão épica para desbloquear esta aparência.', '#d9a544'); return false; }
      this._addUnlock(classId, idx);
      this.toast('Aparência desbloqueada', 'Recompensa por uma missão épica. Vestir uma nova raça exige recomeçar.', '#4fcbb4');
      return true;
    }
    this._addUnlock(classId, idx);
    return true;
  };
  P._addUnlock = function (classId, idx) {
    var u = Object.assign({}, this.state.unlockedLooks);
    u[classId] = (u[classId] || [0]).concat([idx]);
    this.setState({ unlockedLooks: u });
    this._persistUnlocks(u, this.state.epicDone);
  };
  P._persistUnlocks = function (unlocked, epicDone) {
    try { localStorage.setItem('adamante.unlocks', JSON.stringify({ unlocked: unlocked, epicDone: epicDone })); } catch (e) { /* quota */ }
  };
  // trocar de aparência/raça só recomeçando o personagem do zero
  P.askRestart = function () { this.setState({ restartAsk: true }); };
  P.cancelRestart = function () { this.setState({ restartAsk: false }); };
  P.restartCharacter = function () {
    var alloc = {}; ATTRS.forEach(function (a) { alloc[a.key] = 0; });
    this.stopTimerClock();
    this.setState({
      restartAsk: false, screen: 'onboarding', obStep: 0, cover: null, wipe: null,
      level: 1, xp: 0, points: 0, gold: 0, streak: 0, fatigue: 0,
      alloc: alloc, draft: {}, weekly: 0, medDone: false,
      missions: this.state.missions.map(function (m) { return Object.assign({}, m, { done: false }); }),
      epic: null, epicForm: false, restDays: [], restOpen: false,
      dupes: { c1: 6, c3: 5, c5: 5 }, charName: '', battle: null, timer: null, levelUp: false,
      gearOwned: [], gearEquipped: [],
    });
    this.toast('Personagem recomeçado', 'Do zero. As aparências que você desbloqueou continuam disponíveis.', '#7f8ec0');
  };
  P.loadPortraits = function () {
    try {
      var raw = localStorage.getItem('adamante.portraits');
      if (raw) this.state.portraits = Object.assign({}, this.state.portraits, JSON.parse(raw));
      var u = localStorage.getItem('adamante.unlocks');
      if (u) {
        var d = JSON.parse(u);
        if (d && d.unlocked) this.state.unlockedLooks = Object.assign({}, this.state.unlockedLooks, d.unlocked);
        if (d && d.epicDone) this.state.epicDone = true;
      }
    } catch (e) { /* corrompido ou indisponível */ }
  };

  // ── §19 LGPD: exportar e excluir todos os dados ───────────────────────────
  P.exportData = function () {
    var s = this.state, dump = {
      exportadoEm: new Date().toISOString(),
      personagem: { nome: s.charName, classe: this.cls().nome, nivel: s.level, xp: s.xp, ouro: s.gold, pontos: s.points, sequencia: s.streak, fadiga: s.fatigue },
      atributos: {},
      missoesDoDia: s.missions.map(function (m) { return { titulo: m.title, categoria: m.cat, concluida: m.done, validacao: m.src }; }),
      equipamento: s.gearEquipped.map(function (i) { return GEAR[i].nome; }),
      aparencias: s.portraits, aparenciasDesbloqueadas: s.unlockedLooks,
      fonteDeSaude: s.healthConnected ? 'conectada' : 'não conectada',
      privacidade: s.privacy,
    };
    ATTRS.forEach(function (a) { dump.atributos[a.key] = a.base + (s.alloc[a.key] || 0); });
    if (this._download) this._download('adamante-meus-dados.json', JSON.stringify(dump, null, 2));
    this.toast('Dados exportados', 'Um arquivo com tudo o que é seu foi baixado. No app real, a exportação sai em até 15 dias.', '#6fc8ee');
  };
  P.askDelete = function () { this.setState({ deleteAsk: true }); };
  P.cancelDelete = function () { this.setState({ deleteAsk: false }); };
  P.deleteAccount = function () {
    try {
      var kill = [];
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('adamante.') === 0) kill.push(k); }
      kill.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) { /* indisponível */ }
    this.stopTimerClock();
    var alloc = {}; ATTRS.forEach(function (a) { alloc[a.key] = 0; });
    this.setState({
      deleteAsk: false, screen: 'login', cover: null, wipe: null,
      level: 1, xp: 0, points: 0, gold: 0, streak: 0, fatigue: 0, alloc: alloc, draft: {},
      missions: this.state.missions.map(function (m) { return Object.assign({}, m, { done: false }); }),
      weekly: 0, medDone: false, epic: null, restDays: [], dupes: { c1: 6, c3: 5, c5: 5 },
      charName: '', email: '', senha: '', battle: null, timer: null, levelUp: false,
      portraits: { guerreiro: 0, ladino: 0, mago: 0, clerigo: 0 },
      unlockedLooks: { guerreiro: [0], ladino: [0], mago: [0], clerigo: [0] }, epicDone: false,
      gearOwned: [], gearEquipped: [], proofPhoto: {}, healthConnected: false,
    });
    this.toast('Conta excluída', 'Todos os seus dados foram apagados deste aparelho.', '#7f8ec0');
  };

  // ── §18.1 fonte de validação automática (Health Connect / HealthKit) ──────
  P.connectHealth = function () {
    var connected = !this.state.healthConnected;
    this.setState({ healthConnected: connected });
    if (connected) this.toast('Fonte conectada', 'Passos, treinos, frequência cardíaca e sono passam a validar missões automaticamente.', '#4fcbb4');
    else this.toast('Fonte desconectada', 'As missões de corpo voltam a depender de foto ou autodeclaração.', '#7f8ec0');
  };

  P.go = function (s) { this.setState({ screen: s, obStep: this.state.obStep }); };
  P.flip = function (id) {
    var f = Object.assign({}, this.state.flipped); f[id] = !f[id];
    this.setState({ flipped: f });
  };
  P.setProofPhoto = function (slotId, dataUrl) {
    var p = Object.assign({}, this.state.proofPhoto); p[slotId] = dataUrl;
    this.setState({ proofPhoto: p });
    try { localStorage.setItem('adamante.proof.' + slotId, dataUrl); } catch (e) { /* quota */ }
  };
  P.loadProofPhotos = function () {
    var p = {}, found = false;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('adamante.proof.') === 0) { p[k.slice(15)] = localStorage.getItem(k); found = true; }
      }
    } catch (e) { return; }
    if (found) this.state.proofPhoto = p;
  };

  global.AdmApp = App;
})(window);
