/* Adamante — camada de valores.
 * Porte de renderVals() do documento de design: recebe o app e devolve todos
 * os estilos, rótulos e handlers que as telas consomem.
 */
(function (global) {
  'use strict';

  var D = global.AdmData, C = global.AdmCore;
  var CATS = D.CATS, DIFFS = D.DIFFS, RAR = D.RAR, RARL = D.RARL;
  var CLASSES = D.CLASSES, ATTRS = D.ATTRS, CARDS = D.CARDS;
  var ENEMY_SCRIPT = D.ENEMY_SCRIPT, DAYS = D.DAYS;
  var GUILD = D.GUILD, GEAR = D.GEAR, TRADES = D.TRADES;
  var GUILD_SIZE = D.GUILD_SIZE, MAJORITY = D.MAJORITY;
  var EPIC = D.EPIC, EPIC_PRESETS = D.EPIC_PRESETS, GUILD_GOALS = D.GUILD_GOALS, GUILD_INVITE = D.GUILD_INVITE;
  var REST = D.REST, WEEKDAYS = D.WEEKDAYS, RAR_ORDER = D.RAR_ORDER, REFORGE = D.REFORGE;
  var mod = C.mod, xpNeed = C.xpNeed;

  function vals(app) {
    var st = app.state, cls = app.cls(), ios = (app.props.platform || 'ios') === 'ios';
    var need = xpNeed(st.level), pct = Math.min(100, Math.round(st.xp / need * 100));

    var pill = function (color, extra) {
      return Object.assign({
        fontSize: 9, letterSpacing: '.13em', textTransform: 'uppercase', fontWeight: 700,
        color: color, border: '1px solid ' + color + '55', borderRadius: 4, padding: '2px 5px',
      }, extra || {});
    };
    var btn = function (bg, fg) {
      return {
        flex: 1, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 12, background: bg, color: fg, fontFamily: "'Bebas Neue',sans-serif",
        fontSize: 18, letterSpacing: '.1em', cursor: 'pointer',
      };
    };
    var sheen = {
      position: 'absolute', top: 0, bottom: 0, width: '38%',
      background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.13),transparent)',
      animation: 'admSheen 4.5s ease-in-out infinite',
    };
    var age = app.age();

    var iris = function (bg) {
      return {
        position: 'absolute', inset: 0, background: bg,
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)', pointerEvents: 'none',
      };
    };
    var field = function (on) {
      return {
        background: on ? 'rgba(111,200,238,.08)' : 'rgba(255,255,255,.04)',
        border: '1px solid ' + (on ? 'rgba(111,200,238,.55)' : 'rgba(255,255,255,.11)'),
        borderRadius: 14, padding: '11px 14px', transition: 'all .2s',
        boxShadow: on ? '0 0 0 3px rgba(111,200,238,.1)' : 'none',
      };
    };

    // ── onboarding: carrossel 3D de classes ─────────────────────────────────
    var obClasses = CLASSES.map(function (k, i) {
      var off = i - st.clsIdx, sel = off === 0;
      return {
        nome: k.nome, prim: k.prim, passiva: k.passiva, deck: k.deck,
        pick: function () { app.setState({ clsIdx: i }); },
        sheen: sel ? sheen : { display: 'none' },
        primStyle: Object.assign(pill(k.cor), { display: 'inline-block', marginTop: 6 }),
        style: {
          position: 'absolute', width: 188, padding: 14, borderRadius: 16, cursor: 'pointer',
          boxSizing: 'border-box', overflow: 'hidden',
          background: sel ? 'linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.03))' : 'rgba(255,255,255,.035)',
          border: '1px solid ' + (sel ? k.cor + '88' : 'rgba(255,255,255,.08)'),
          boxShadow: sel ? '0 18px 40px rgba(0,0,0,.5), 0 0 0 1px ' + k.cor + '22' : 'none',
          transform: 'translateX(' + (off * 122) + 'px) rotateY(' + (off * -26) + 'deg) translateZ(' + (sel ? 60 : -60) + 'px) scale(' + (sel ? 1 : .88) + ')',
          opacity: Math.abs(off) > 1 ? 0 : sel ? 1 : .5, zIndex: 10 - Math.abs(off),
          transition: 'transform .48s cubic-bezier(.2,.85,.2,1), opacity .38s, box-shadow .4s',
          pointerEvents: Math.abs(off) > 1 ? 'none' : 'auto',
        },
      };
    });

    // ── missões ─────────────────────────────────────────────────────────────
    // missão validada por cronômetro abre o timer de estudo em vez de só marcar
    var missionTap = function (m) {
      return function () {
        if (m.src === 'cronômetro' && !m.done) app.openTimer(m.id);
        else app.toggleMission(m.id);
      };
    };
    var mkMission = function (m) {
      var cat = CATS[m.cat];
      return {
        title: m.title, catLabel: cat.label, diffLabel: DIFFS[m.diff], srcLabel: m.src,
        xpLabel: '+' + m.xp, goldLabel: '+' + m.gold,
        toggle: missionTap(m),
        sheen: m.done ? { display: 'none' } : sheen,
        sweep: m.done ? {
          position: 'absolute', top: 0, bottom: 0, width: '46%',
          background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.34),transparent)',
          animation: 'admSweep .85s cubic-bezier(.3,.7,.3,1) forwards',
        } : { display: 'none' },
        forgeStyle: Object.assign(pill('#e8c46a'), { background: 'rgba(232,196,106,.1)' }),
        cardStyle: {
          position: 'relative', padding: '16px 17px', borderRadius: 18, cursor: 'pointer', overflow: 'hidden',
          transition: 'border-color .2s, background .25s',
          background: m.done ? 'linear-gradient(150deg,rgba(79,203,180,.12),rgba(255,255,255,.03))' : 'linear-gradient(150deg,rgba(217,165,68,.14),rgba(255,255,255,.035))',
          border: '1px solid ' + (m.done ? 'rgba(79,203,180,.42)' : 'rgba(217,165,68,.4)'),
          boxShadow: m.done ? 'none' : '0 10px 30px rgba(217,165,68,.12)',
        },
        checkStyle: {
          flex: 'none', width: 40, height: 40, borderRadius: 12, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800,
          color: m.done ? '#04140f' : 'transparent', background: m.done ? '#4fcbb4' : 'rgba(0,0,0,.28)',
          border: '1.5px solid ' + (m.done ? '#4fcbb4' : 'rgba(217,165,68,.55)'), transition: 'all .22s',
          animation: m.done ? 'admPop .34s cubic-bezier(.2,.8,.2,1)' : 'none',
        },
        checkMark: m.done ? '✓' : '',
        catStyle: pill(cat.color),
        titleStyle: {
          fontFamily: "'Bebas Neue',sans-serif", fontSize: 25, lineHeight: 1.02, letterSpacing: '.03em',
          textDecoration: m.done ? 'line-through' : 'none', textDecorationColor: 'rgba(79,203,180,.6)',
          color: m.done ? '#9fadc0' : '#fff',
        },
      };
    };
    var dailyMissions = st.missions.map(function (m) {
      var cat = CATS[m.cat];
      return {
        title: m.title, catLabel: cat.label, diffLabel: DIFFS[m.diff], srcLabel: m.src,
        xpLabel: '+' + m.xp + ' XP', goldLabel: '+' + m.gold + ' OURO',
        toggle: missionTap(m),
        cardStyle: {
          position: 'relative', display: 'flex', gap: 12, alignItems: 'flex-start',
          padding: '13px 14px 13px 16px', borderRadius: 16, cursor: 'pointer', overflow: 'hidden',
          transition: 'border-color .2s, background .25s, opacity .25s',
          background: m.done ? 'rgba(79,203,180,.07)' : 'rgba(255,255,255,.045)',
          border: '1px solid ' + (m.done ? 'rgba(79,203,180,.3)' : 'rgba(255,255,255,.09)'),
          opacity: m.done ? .78 : 1,
        },
        stripeStyle: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: m.done ? '#4fcbb4' : cat.color },
        checkStyle: {
          flex: 'none', width: 26, height: 26, borderRadius: 8, marginTop: 2, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800,
          color: m.done ? '#04140f' : 'transparent', background: m.done ? '#4fcbb4' : 'transparent',
          border: '1.5px solid ' + (m.done ? '#4fcbb4' : 'rgba(255,255,255,.22)'), transition: 'all .22s',
          animation: m.done ? 'admPop .34s cubic-bezier(.2,.8,.2,1)' : 'none',
        },
        checkMark: m.done ? '✓' : '',
        catStyle: pill(cat.color),
        titleStyle: {
          fontSize: 13.5, fontWeight: 600, lineHeight: 1.3,
          textDecoration: m.done ? 'line-through' : 'none', textDecorationColor: 'rgba(79,203,180,.6)',
          color: m.done ? '#9fadc0' : '#e8eef5',
        },
      };
    });
    var doneCount = st.missions.filter(function (m) { return m.done; }).length;
    var heroSrc = st.missions.filter(function (m) { return m.diff === 'dificil'; });
    var restSrc = st.missions.filter(function (m) { return m.diff !== 'dificil'; });
    var heroMission = heroSrc.map(function (m) { return mkMission(m); });
    var restMissions = restSrc.map(function (m, i) {
      var d = Object.assign({}, dailyMissions[st.missions.indexOf(m)]);
      d.cardStyle = Object.assign({}, d.cardStyle, {
        animation: 'admIn .44s cubic-bezier(.2,.8,.2,1) both', animationDelay: (0.06 + i * 0.055) + 's',
      });
      return d;
    });

    // ── ficha: linhas de atributo ───────────────────────────────────────────
    var attrRows = ATTRS.map(function (a) {
      var alloc = (st.alloc[a.key] || 0), draft = (st.draft[a.key] || 0);
      var tot = a.base + alloc + draft, m = mod(tot);
      var eff = app.effective(a.key), weakened = eff !== tot;
      var isPrim = cls.prim === a.key, cost = app.nextCost(a.key);
      return {
        sigla: a.key, label: a.label, fonte: a.fonte, isPrim: isPrim, total: tot,
        modStr: (m >= 0 ? '+' : '') + m, split: a.base + ' base · ' + (alloc + draft) + ' aloc.',
        showCost: cost > 1, costMsg: 'Próximo incremento custa ' + cost + ' pontos',
        inc: function () { app.inc(a.key); }, dec: function () { app.dec(a.key); },
        rowStyle: {
          padding: '12px 14px', borderRadius: 16,
          background: draft ? 'rgba(217,165,68,.08)' : 'rgba(255,255,255,.04)',
          border: '1px solid ' + (draft ? 'rgba(217,165,68,.34)' : isPrim ? 'rgba(217,165,68,.18)' : 'rgba(255,255,255,.08)'),
          transition: 'all .25s', animation: 'admIn .46s cubic-bezier(.2,.8,.2,1) both',
          animationDelay: (0.08 + ATTRS.indexOf(a) * 0.05) + 's',
        },
        modStyle: {
          flex: 'none', width: 40, height: 40, borderRadius: 11, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 20, letterSpacing: '.03em',
          background: isPrim ? 'rgba(217,165,68,.16)' : 'rgba(255,255,255,.05)',
          border: '1px solid ' + (isPrim ? 'rgba(217,165,68,.4)' : 'rgba(255,255,255,.1)'),
          color: isPrim ? '#f0cd85' : '#c2cfdd',
        },
        valStyle: {
          fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, lineHeight: 1, letterSpacing: '.03em',
          color: weakened ? '#7f8ec0' : draft ? '#d9a544' : '#fff',
          animation: draft ? 'admPop .3s cubic-bezier(.2,.8,.2,1)' : 'none',
        },
        incStyle: {
          width: 30, height: 21, borderRadius: 7, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
          color: app.pointsLeft() >= cost ? '#e8eef5' : '#465360',
        },
        decStyle: {
          width: 30, height: 21, borderRadius: 7, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
          color: draft ? '#e8eef5' : '#3a4552',
        },
        baseBarStyle: { width: (a.base / 20 * 100) + '%', background: 'linear-gradient(90deg,#465360,#68768a)' },
        allocBarStyle: {
          width: ((alloc + draft) / 20 * 100) + '%',
          background: draft ? 'linear-gradient(90deg,#d9a544,#e8c46a)' : 'linear-gradient(90deg,#6fc8ee,#4fcbb4)',
          transition: 'width .3s cubic-bezier(.2,.8,.2,1)',
        },
      };
    });

    // ── ficha: radar ────────────────────────────────────────────────────────
    var RC = [[120, 18], [208, 68], [208, 152], [120, 182], [32, 152], [32, 68]];
    var radarPts = ATTRS.map(function (a, i) {
      var r = Math.max(.14, app.total(a.key) / 20), cx = 120, cy = 100;
      return (cx + (RC[i][0] - cx) * r).toFixed(1) + ',' + (cy + (RC[i][1] - cy) * r).toFixed(1);
    }).join(' ');
    var RLPOS = [
      { left: '50%', top: '9%', tx: '-50%', ty: '-112%', align: 'center' },
      { left: '86.7%', top: '34%', tx: '4%', ty: '-50%', align: 'left' },
      { left: '86.7%', top: '76%', tx: '4%', ty: '-50%', align: 'left' },
      { left: '50%', top: '91%', tx: '-50%', ty: '55%', align: 'center' },
      { left: '13.3%', top: '76%', tx: '-104%', ty: '-50%', align: 'right' },
      { left: '13.3%', top: '34%', tx: '-104%', ty: '-50%', align: 'right' },
    ];
    var radarLabels = ATTRS.map(function (a, i) {
      var p = RLPOS[i], tot = app.total(a.key), eff = app.effective(a.key);
      var weak = eff !== tot, isPrim = cls.prim === a.key;
      return {
        sigla: a.key, val: tot,
        style: {
          position: 'absolute', left: p.left, top: p.top,
          transform: 'translate(' + p.tx + ',' + p.ty + ')', textAlign: p.align,
          lineHeight: 1, pointerEvents: 'none', whiteSpace: 'nowrap',
        },
        siglaStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, letterSpacing: '.11em', color: isPrim ? '#f0cd85' : '#8a97ab' },
        valStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: '.03em', marginTop: 1, color: weak ? '#aebdd8' : '#fff' },
      };
    });

    // ── deck: coleção ───────────────────────────────────────────────────────
    var collection = CARDS.map(function (c, ci) {
      var flipped = !!st.flipped[c.id], col = RAR[c.rar];
      var num = c.dano ? c.dano : c.cura ? c.cura : c.def ? '+' + c.def : '—';
      return {
        nome: c.nome, custo: c.custo, rarLabel: RARL[c.rar], src: c.src, txt: c.txt, esc: c.esc,
        copies: Math.min(2, c.copies), num: num,
        numLabel: c.dano ? 'de dano' : c.cura ? 'de cura' : c.def ? 'de Defesa' : c.tipo,
        flip: function () { app.flip(c.id); },
        sheen: (c.rar === 'epica' || c.rar === 'rara') ? sheen : { display: 'none' },
        innerStyle: {
          position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d',
          transition: 'transform .6s cubic-bezier(.2,.85,.2,1)', transform: flipped ? 'rotateY(180deg)' : 'none',
          animation: 'admFadeIn .55s ease-out both', animationDelay: (0.05 + ci * 0.06) + 's',
        },
        faceStyle: {
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex',
          flexDirection: 'column', padding: 11, borderRadius: 14, boxSizing: 'border-box',
          background: 'linear-gradient(165deg,' + col + '2e,rgba(255,255,255,.03))',
          border: '1px solid ' + col + '77', overflow: 'hidden',
          animation: c.rar === 'epica' ? 'admAura 2.8s ease-in-out infinite' : 'none',
        },
        backStyle: {
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
          display: 'flex', flexDirection: 'column', padding: 12, borderRadius: 14, boxSizing: 'border-box',
          background: 'linear-gradient(200deg,rgba(14,20,34,.98),rgba(8,11,20,.98))',
          border: '1px solid ' + col + '55',
        },
        costStyle: {
          width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 15,
          background: 'rgba(111,200,238,.2)', border: '1px solid rgba(111,200,238,.5)', color: '#a5e2f7',
        },
        rarStyle: pill(col),
        numStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: '.03em', color: col },
      };
    });

    // ── reforja (§17): pilhas de repetidas que dá para subir de raridade ─────
    var reforjaRows = CARDS.filter(function (c) {
      return RAR_ORDER.indexOf(c.rar) < RAR_ORDER.length - 1 && (st.dupes[c.id] || 0) > 0;
    }).map(function (c) {
      var have = st.dupes[c.id] || 0;
      var nextRar = RAR_ORDER[RAR_ORDER.indexOf(c.rar) + 1];
      var cost = REFORGE.cost[c.rar];
      var enough = have >= REFORGE.need, ready = enough && st.gold >= cost;
      var curCol = RAR[c.rar], nextCol = RAR[nextRar];
      return {
        nome: c.nome, countLabel: have + '/' + REFORGE.need + ' repetidas', costLabel: cost + ' ouro',
        curLabel: RARL[c.rar], nextLabel: RARL[nextRar],
        curChip: pill(curCol), nextChip: pill(nextCol),
        reforge: function () { app.reforge(c.id); },
        wrapStyle: {
          background: 'rgba(255,255,255,.04)', borderRadius: 14, padding: '12px 13px',
          border: '1px solid ' + (ready ? nextCol + '66' : 'rgba(255,255,255,.09)'), transition: 'border-color .25s',
        },
        barStyle: { height: '100%', width: Math.min(100, have / REFORGE.need * 100) + '%', background: 'linear-gradient(90deg,' + curCol + ',' + nextCol + ')', borderRadius: 3, transition: 'width .4s cubic-bezier(.2,.8,.2,1)' },
        btnLabel: ready ? 'REFORJAR' : enough ? 'OURO INSUFICIENTE' : 'FALTAM ' + (REFORGE.need - have),
        btnStyle: {
          minHeight: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 11,
          fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: '.08em', cursor: ready ? 'pointer' : 'default',
          background: ready ? 'linear-gradient(135deg,' + nextCol + ',' + nextCol + 'bb)' : 'rgba(255,255,255,.05)',
          border: ready ? 'none' : '1px solid rgba(255,255,255,.1)', color: ready ? '#04141f' : '#68768a',
        },
      };
    });

    // ── batalha: mão ────────────────────────────────────────────────────────
    var b = st.battle;
    var hand = (b && b.hand) ? b.hand.map(function (c, i) {
      var off = i - (b.hand.length - 1) / 2, col = RAR[c.rar], afford = c.custo <= b.energy;
      return {
        wrapStyle: {
          position: 'absolute', bottom: 16, width: 86, height: 124, transformStyle: 'preserve-3d',
          transform: 'translateX(' + (off * 60) + 'px) translateY(' + (Math.abs(off) * 5 - 10) + 'px) translateZ(' + (-Math.abs(off) * 26) + 'px) rotateZ(' + (off * 7) + 'deg) rotateX(' + (11 - Math.abs(off) * 2) + 'deg) rotateY(' + (off * -7) + 'deg)',
          transformOrigin: 'bottom center', transition: 'transform .38s cubic-bezier(.2,.85,.2,1)',
          zIndex: 10 - Math.abs(Math.round(off)),
        },
        nome: c.nome, custo: c.custo, play: function () { app.tapCard(i); },
        numShort: c.dano ? c.dano + ' DANO' : c.cura ? c.cura + ' CURA' : c.def ? '+' + c.def + ' DEF' : 'EFEITO',
        numStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, letterSpacing: '.05em', color: col, marginTop: 2 },
        costStyle: {
          width: 18, height: 18, borderRadius: 6, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 12,
          background: afford ? 'rgba(111,200,238,.25)' : 'rgba(255,255,255,.06)',
          border: '1px solid ' + (afford ? 'rgba(111,200,238,.6)' : 'rgba(255,255,255,.12)'),
          color: afford ? '#a5e2f7' : '#5a6878',
        },
        rarDot: { width: 7, height: 7, borderRadius: 2, transform: 'rotate(45deg)', background: col },
        style: {
          width: '100%', height: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 11,
          cursor: 'pointer', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'linear-gradient(168deg,' + col + '4d 0%,rgba(9,14,24,.99) 58%,rgba(7,10,26,1) 100%)',
          border: '1px solid ' + (afford ? col + 'bb' : 'rgba(255,255,255,.14)'),
          boxShadow: '0 16px 34px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.05) inset',
          opacity: afford ? 1 : .45,
          transition: 'transform .24s cubic-bezier(.2,.85,.2,1), filter .2s',
        },
      };
    }) : [];
    var energyPips = (b && b.energyMax) ? Array.from({ length: Math.min(11, b.energyMax) }, function (_, i) {
      return {
        style: {
          width: 8, height: 8, borderRadius: 2, transform: 'rotate(45deg)',
          background: i < b.energy ? '#6fc8ee' : 'rgba(255,255,255,.1)',
          border: '1px solid ' + (i < b.energy ? '#6fc8ee' : 'rgba(255,255,255,.15)'),
          transition: 'background .25s',
        },
      };
    }) : [];
    var enemyStep = b ? ENEMY_SCRIPT[(b.turn - 1) % ENEMY_SCRIPT.length] : null;

    // ── batalha: prévia da carta ────────────────────────────────────────────
    var pv = (b && b.hand && st.preview !== null && b.hand[st.preview]) ? st.preview : null;
    var pvc = pv !== null ? b.hand[pv] : null;
    var pvAfford = !!(pvc && b && pvc.custo <= b.energy);
    var pvNum = '', pvNumLabel = '', pvCalcTitle = 'Efeito', pvLines = [];
    if (pvc) {
      var num = function (lbl, val, col) {
        return { label: lbl, val: val, valStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: '.03em', color: col || '#e8eef5' } };
      };
      var pm = mod(app.effective(cls.prim));
      if (pvc.dano) {
        var mit = C.mitigacao(14), fin = C.danoFinal(pvc.dano, pm, 14);
        pvNum = pvc.dano; pvNumLabel = 'de dano base'; pvCalcTitle = 'Dano contra a Sentinela';
        pvLines = [
          num('Dano base da carta', pvc.dano),
          num('Modificador de ' + cls.prim + ' × 2', (pm >= 0 ? '+' : '') + (pm * 2), '#6fc8ee'),
          num('Mitigação · Defesa 14 ÷ 3', '−' + mit, '#7f8ec0'),
          num('Dano final', fin, '#d9a544'),
        ];
      } else if (pvc.cura) {
        var sm = mod(app.effective('SAB')), fin2 = pvc.cura + sm * 2;
        pvNum = pvc.cura; pvNumLabel = 'de cura base'; pvCalcTitle = 'Cura estimada';
        pvLines = [num('Cura base', pvc.cura), num('Modificador de SAB × 2', (sm >= 0 ? '+' : '') + (sm * 2), '#6fc8ee'), num('PV recuperado', fin2, '#4fcbb4')];
      } else if (pvc.def) {
        pvNum = '+' + pvc.def; pvNumLabel = 'de Defesa'; pvCalcTitle = 'Mitigação neste turno';
        pvLines = [num('Defesa atual', app.defense()), num('Bônus da carta', '+' + pvc.def, '#4fcbb4'), num('Dano reduzido em', '−' + C.mitigacao(app.defense() + pvc.def), '#7f8ec0')];
      } else {
        pvNum = '—'; pvNumLabel = pvc.tipo; pvCalcTitle = 'Efeito';
        pvLines = [num('Escala com', pvc.esc, '#6fc8ee'), num('Duração', '1 rolagem'), num('Vantagem', 'dois d20, usa o melhor', '#e8c46a')];
      }
    }

    var tabDefs = [
      { id: 'inicio', label: 'INÍCIO', keys: ['inicio'] },
      { id: 'ficha', label: 'FICHA', keys: ['ficha', 'medicao'] },
      { id: 'deck', label: 'DECK', keys: ['deck'] },
      { id: 'batalha', label: 'BATALHA', keys: ['batalha'] },
      { id: 'guilda', label: 'GUILDA', keys: ['guilda', 'thread'] },
      { id: 'ranking', label: 'RANKING', keys: ['ranking'] },
    ];

    // ── guilda ──────────────────────────────────────────────────────────────
    var gConf = function (i) { return GUILD[i].seed.length + (st.confirms[i] ? 1 : 0); };
    var guildMembers = GUILD.map(function (g, i) {
      var n = gConf(i), validated = n >= MAJORITY, contested = !!st.contested[i];
      var cat = CATS[g.cat];
      var state = contested ? { l: 'Contestada', c: '#d9a544' }
        : validated ? { l: 'Validada', c: '#4fcbb4' }
          : g.ok ? { l: 'Aguardando', c: '#6fc8ee' } : { l: 'Sem foto', c: '#d9a544' };
      return {
        nome: g.nome, nivel: g.nivel, missao: g.missao, initial: g.nome.charAt(0),
        open: function () { app.openThread(i); },
        rowAnim: { animation: 'admIn .46s cubic-bezier(.2,.8,.2,1) both', animationDelay: (0.05 + i * 0.055) + 's' },
        cardStyle: {
          background: validated ? 'rgba(79,203,180,.08)' : 'rgba(255,255,255,.04)',
          border: '1px solid ' + (validated ? 'rgba(79,203,180,.3)' : 'rgba(255,255,255,.08)'),
          borderRadius: 14, padding: '12px 13px', cursor: 'pointer', transition: 'all .22s',
        },
        avStyle: {
          flex: 'none', width: 34, height: 34, borderRadius: 11, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 17, background: cat.color + '22', border: '1px solid ' + cat.color + '55', color: '#e8eef5',
        },
        stateStyle: pill(state.c), stateLabel: state.l,
        progStyle: {
          height: '100%', width: (g.feitas / 5 * 100) + '%',
          background: 'linear-gradient(90deg,' + cat.color + ',#6fc8ee)', borderRadius: 3,
          transformOrigin: 'left', animation: 'admBar .7s cubic-bezier(.2,.8,.2,1) both',
          animationDelay: (i * 0.05) + 's',
        },
        progLabel: g.feitas + '/5 diárias',
        confirmChip: n + '/' + MAJORITY + ' ✓',
        confirmChipStyle: {
          fontSize: 10, fontWeight: 700, letterSpacing: '.04em', padding: '3px 7px', borderRadius: 6,
          color: validated ? '#4fcbb4' : '#8a97ab',
          background: validated ? 'rgba(79,203,180,.14)' : 'rgba(255,255,255,.05)',
          border: '1px solid ' + (validated ? 'rgba(79,203,180,.36)' : 'rgba(255,255,255,.1)'),
        },
      };
    });

    var cardById = function (id) { return CARDS.find(function (c) { return c.id === id; }); };
    var trades = TRADES.map(function (t, i) {
      var stt = st.tradeState[i], done = !!stt;
      var oName = t.offer.k === 'gear' ? GEAR[t.offer.id].nome : cardById(t.offer.id).nome;
      var oMeta = t.offer.k === 'gear' ? GEAR[t.offer.id].meta : RARL[cardById(t.offer.id).rar];
      var oCol = t.offer.k === 'gear' ? RAR[GEAR[t.offer.id].rar] : RAR[cardById(t.offer.id).rar];
      var wName = cardById(t.want.id).nome, wCol = RAR[cardById(t.want.id).rar], wMeta = RARL[cardById(t.want.id).rar];
      var slot = function (col) {
        return {
          flex: 1, minWidth: 0, padding: '9px 10px', borderRadius: 12,
          background: 'linear-gradient(165deg,' + col + '2a,rgba(255,255,255,.03))',
          border: '1px solid ' + col + '66',
        };
      };
      return {
        de: t.de, nota: t.nota, initial: t.de.charAt(0), open: !done,
        offerName: oName, offerMeta: oMeta, wantName: wName, wantMeta: wMeta,
        wrapStyle: {
          background: 'rgba(255,255,255,.04)',
          border: '1px solid ' + (stt === 'aceita' ? 'rgba(79,203,180,.34)' : 'rgba(255,255,255,.09)'),
          borderRadius: 16, padding: '13px 14px', opacity: stt === 'recusada' ? .5 : 1,
          transition: 'all .25s', animation: 'admIn .46s cubic-bezier(.2,.8,.2,1) both',
          animationDelay: (0.05 + i * 0.06) + 's',
        },
        avStyle: {
          flex: 'none', width: 30, height: 30, borderRadius: 10, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 15, background: 'rgba(111,200,238,.14)', border: '1px solid rgba(111,200,238,.32)', color: '#a5e2f7',
        },
        offerStyle: slot(oCol), wantStyle: slot(wCol),
        offerMetaStyle: { fontSize: 10, letterSpacing: '.04em', color: oCol, marginTop: 3 },
        wantMetaStyle: { fontSize: 10, letterSpacing: '.04em', color: wCol, marginTop: 3 },
        accept: function () { if (!done) app.resolveTrade(i, true); },
        decline: function () { if (!done) app.resolveTrade(i, false); },
        acceptLabel: stt === 'aceita' ? 'TROCA FEITA' : stt === 'recusada' ? 'RECUSADA' : 'ACEITAR TROCA',
        acceptStyle: {
          flex: 1, minHeight: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 11, fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: '.08em',
          cursor: done ? 'default' : 'pointer',
          background: stt === 'aceita' ? 'rgba(79,203,180,.18)' : stt === 'recusada' ? 'rgba(255,255,255,.05)' : 'linear-gradient(135deg,#d9a544,#b8842c)',
          border: stt ? '1px solid rgba(255,255,255,.14)' : 'none',
          color: stt === 'aceita' ? '#4fcbb4' : stt === 'recusada' ? '#68768a' : '#191202',
        },
      };
    });

    // ── guilda: thread ──────────────────────────────────────────────────────
    var th = st.thread, isMe = th === 'me';
    var thG = (!isMe && th !== null) ? GUILD[th] : null;
    var thN = isMe ? st.myConfirms : (thG ? gConf(th) : 0);
    var thTotal = isMe ? st.myConfirms : thN;
    var thDone = thTotal >= MAJORITY;
    var thSeed = isMe ? ['Kaio', 'Bru', 'Tê'] : (thG ? thG.seed.concat(st.confirms[th] ? ['Você'] : []) : []);
    var thSlotId = isMe ? 'adamante-proof-me' : 'adamante-proof-' + (thG ? thG.nome.toLowerCase() : 'x');

    // ── ranking ─────────────────────────────────────────────────────────────
    var RANKS = [
      [['Rafa', 9, 24, 118, 12], ['Duda', 8, 16, 96, 9], ['Kaio', 7, 11, 74, 7], ['Tê', 6, 9, 61, 5], ['Bru', 5, 19, 58, 3], ['Nina', 4, 6, 40, 2], ['VOCÊ', st.level, st.streak, doneCount, 0]],
      [['Rafa', 9, 24, 118, 12], ['Duda', 8, 16, 96, 9], ['Kaio', 7, 11, 74, 7], ['Bru', 5, 19, 58, 3], ['VOCÊ', st.level, st.streak, doneCount, 0]],
      [['forjadeaço', 20, 214, 1840, 96], ['mvp_luna', 19, 190, 1712, 88], ['tanque.br', 18, 176, 1602, 81], ['n0turno', 17, 168, 1498, 77], ['claraluz', 17, 151, 1440, 70], ['—', 0, 0, 0, 0], ['VOCÊ', st.level, st.streak, doneCount, 0]],
    ];
    var rankRows = RANKS[st.rankTab].map(function (r, i) {
      var me = r[0] === 'VOCÊ', gap = r[0] === '—';
      return {
        pos: gap ? '···' : '' + (i + 1), nome: gap ? 'sua posição: 2.418' : r[0],
        nivel: gap ? '' : r[1], seq: gap ? '' : r[2], miss: gap ? '' : r[3], vit: gap ? '' : r[4],
        rowStyle: {
          display: 'flex', alignItems: 'center', padding: '11px 12px', borderRadius: 13,
          background: me ? 'rgba(217,165,68,.12)' : gap ? 'transparent' : 'rgba(255,255,255,.035)',
          border: '1px solid ' + (me ? 'rgba(217,165,68,.4)' : gap ? 'transparent' : 'rgba(255,255,255,.07)'),
          opacity: gap ? .5 : 1, animation: 'admIn .44s cubic-bezier(.2,.8,.2,1) both',
          animationDelay: (0.04 + i * 0.05) + 's',
        },
        posStyle: {
          width: 26, fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: '.04em',
          color: i === 0 && !gap ? '#e8c46a' : me ? '#d9a544' : '#68768a',
        },
      };
    });

    // ── perfil: privacidade ─────────────────────────────────────────────────
    var privDefs = [
      { k: 'corpo', label: 'Composição corporal no perfil', sub: 'Permanentemente desativado por design. Nunca é público.', locked: true },
      { k: 'ranking', label: 'Aparecer no ranking global', sub: 'Mostra nível, sequência, missões e vitórias.' },
      { k: 'guilda', label: 'Guilda vê minhas conclusões', sub: 'Necessário para a validação social funcionar.' },
      { k: 'saude', label: 'Sincronizar com Health Connect', sub: 'Passos, treinos, frequência cardíaca e sono.' },
    ];
    var privacyRows = privDefs.map(function (p) {
      var on = st.privacy[p.k] && !p.locked;
      return {
        label: p.label, sub: p.sub,
        toggle: function () {
          if (p.locked) { app.toast('Bloqueado por design', 'Dado de composição corporal nunca aparece em tela pública.', '#7f8ec0'); return; }
          var pvv = Object.assign({}, st.privacy); pvv[p.k] = !pvv[p.k];
          app.setState({ privacy: pvv });
        },
        rowStyle: {
          display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', cursor: 'pointer',
          borderBottom: '1px solid rgba(255,255,255,.06)', opacity: p.locked ? .6 : 1,
        },
        trackStyle: {
          flex: 'none', width: 44, height: 26, borderRadius: 13, padding: 3, boxSizing: 'border-box',
          display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
          background: on ? '#4fcbb4' : 'rgba(255,255,255,.1)',
          border: '1px solid ' + (on ? '#4fcbb4' : 'rgba(255,255,255,.14)'), transition: 'background .25s',
        },
        knobStyle: { width: 20, height: 20, borderRadius: '50%', background: on ? '#04140f' : '#8a97ab', transition: 'all .25s' },
      };
    });

    var evo = [53.1, 53.4, 53.8, 54.0, 54.3, 54.9, 55.1, st.medDone ? 56.6 : 55.4];
    var evoBars = evo.map(function (v, i) {
      return {
        label: 'M' + (i + 1),
        style: {
          width: '100%', borderRadius: '4px 4px 2px 2px', height: ((v - 52) / 5.2 * 100) + '%',
          background: i === 7 ? 'linear-gradient(180deg,#4fcbb4,#2a8a7a)' : 'linear-gradient(180deg,rgba(111,200,238,.6),rgba(111,200,238,.18))',
          border: '1px solid ' + (i === 7 ? 'rgba(79,203,180,.6)' : 'rgba(111,200,238,.3)'),
          transformOrigin: 'bottom', animation: 'admBar .7s cubic-bezier(.2,.8,.2,1) both',
          animationDelay: (i * 0.05) + 's',
        },
      };
    });

    // ── cronômetro de estudo ─────────────────────────────────────────────────
    var tm = st.timer;
    var fmtClock = function (sec) {
      var s = Math.max(0, Math.ceil(sec)), m = Math.floor(s / 60), r = s % 60;
      return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
    };
    var timerPaused = !!(tm && tm.phase === 'ready' && tm.secLeft < tm.blockSec);
    var timerColor = '#6fc8ee', timerPct = 0;
    if (tm) {
      var full = tm.phase === 'break' ? tm.breakSec : tm.blockSec;
      timerPct = Math.max(0, Math.min(100, (1 - tm.secLeft / full) * 100));
      timerColor = tm.phase === 'interrupted' ? '#d9a544' : tm.phase === 'break' ? '#4fcbb4'
        : tm.phase === 'done' ? '#e8c46a' : '#6fc8ee';
    }
    var timerPhaseLabel = tm ? ({ ready: timerPaused ? 'PAUSADO' : 'PRONTO', running: 'FOCO', break: 'PAUSA', interrupted: 'INTERROMPIDO', done: 'CONCLUÍDO' })[tm.phase] : '';
    var timerHints = {
      ready: timerPaused ? 'Pausado. O tempo volta de onde parou.' : 'Dois blocos de 25 min. O relógio só conta com o app aberto — sair invalida o bloco.',
      running: 'App aberto, tempo contando. Trocar de app agora zera este bloco.',
      break: 'Pausa curta entre os blocos. Aqui você pode sair à vontade.',
      interrupted: 'O app foi para segundo plano durante o foco. O bloco recomeça do zero — é assim que o cronômetro evita tempo inflado.',
      done: 'Dois blocos completos. O estudo entra validado pelo cronômetro, com XP integral.',
    };
    var timerPrimaryLabel = '', timerPrimary = function () {};
    if (tm) {
      if (tm.phase === 'ready') { timerPrimaryLabel = timerPaused ? 'CONTINUAR' : 'INICIAR BLOCO'; timerPrimary = function () { app.startTimer(); }; }
      else if (tm.phase === 'running') { timerPrimaryLabel = 'PAUSAR'; timerPrimary = function () { app.pauseTimer(); }; }
      else if (tm.phase === 'break') { timerPrimaryLabel = 'PULAR PAUSA'; timerPrimary = function () { app.skipBreak(); }; }
      else if (tm.phase === 'interrupted') { timerPrimaryLabel = 'RECOMEÇAR O BLOCO'; timerPrimary = function () { app.startTimer(); }; }
      else if (tm.phase === 'done') { timerPrimaryLabel = 'COLHER RECOMPENSA'; timerPrimary = function () { app.finishTimer(); }; }
    }

    // ── missão épica ─────────────────────────────────────────────────────────
    var epic = st.epic, epicDone = !!(epic && epic.current >= epic.target);
    var epicCat = epic ? CATS[epic.cat] : CATS.corpo;
    var epicPct = epic ? Math.min(100, Math.round(epic.current / epic.target * 100)) : 0;
    var epicPreset = EPIC_PRESETS[st.epicPreset] || EPIC_PRESETS[0];

    // ── guilda: estado vazio ─────────────────────────────────────────────────
    var gGoal = st.guildGoal, gGoalPick = GUILD_GOALS[st.guildGoalPick] || GUILD_GOALS[0];

    // ── Descanso Sagrado: próximos 7 dias, com a regra das 12 h de antecedência
    var restNow = new Date(), restUsed = st.restDays.length;
    var restRows = [];
    for (var rdi = 0; rdi < 7; rdi++) {
      var rd = new Date(restNow.getFullYear(), restNow.getMonth(), restNow.getDate() + rdi);
      var rIso = rd.getFullYear() + '-' + (rd.getMonth() + 1) + '-' + rd.getDate();
      var hoursUntil = (rd.getTime() - restNow.getTime()) / 3600000;
      var rLocked = hoursUntil < REST.antecedenceHours;
      var rMarked = st.restDays.indexOf(rIso) >= 0;
      var rFull = !rMarked && restUsed >= REST.cap;
      restRows.push((function (iso, i, locked, marked, full, d) {
        var name = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : WEEKDAYS[d.getDay()];
        var dateLabel = d.getDate() + '/' + (d.getMonth() + 1);
        var disabled = locked || full;
        return {
          name: name, dateLabel: dateLabel, marked: marked, locked: locked,
          reason: locked ? 'menos de 12 h de antecedência' : full ? 'limite de ' + REST.cap + ' no mês' : '',
          toggle: locked ? function () {} : function () { app.toggleRestDay(iso); },
          rowStyle: {
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 13px', borderRadius: 13,
            cursor: locked ? 'default' : 'pointer', transition: 'all .2s', opacity: disabled && !marked ? .5 : 1,
            background: marked ? 'rgba(127,142,192,.16)' : 'rgba(255,255,255,.04)',
            border: '1px solid ' + (marked ? 'rgba(127,142,192,.5)' : 'rgba(255,255,255,.09)'),
          },
          boxStyle: {
            flex: 'none', width: 24, height: 24, borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 14, fontWeight: 800, color: marked ? '#04140f' : 'transparent',
            background: marked ? '#7f8ec0' : 'transparent',
            border: '1.5px solid ' + (marked ? '#7f8ec0' : locked ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.26)'),
          },
          mark: marked ? '✓' : '',
        };
      })(rIso, rdi, rLocked, rMarked, rFull, rd));
    }

    var fatigueMsgs = {
      1: 'Sequência zerada. Um dia com todas as diárias concluídas remove 2 pontos.',
      3: 'Atributos calculados a 80% no combate. Cartas raras e épicas bloqueadas. O valor real na ficha está intacto.',
      6: 'Atributos a 60% e PvP bloqueado. Cinco dias de diárias completas devolvem você ao estado pleno.',
    };
    var fKey = st.fatigue >= 6 ? 6 : st.fatigue >= 3 ? 3 : 1;

    return {
      isOnboarding: st.screen === 'onboarding',
      inApp: ['onboarding', 'splash', 'login', 'cadastro'].indexOf(st.screen) < 0,
      isInicio: st.screen === 'inicio', isFicha: st.screen === 'ficha', isMedicao: st.screen === 'medicao',
      isDeck: st.screen === 'deck', isBatalha: st.screen === 'batalha', isGuilda: st.screen === 'guilda',
      isRanking: st.screen === 'ranking', isPerfil: st.screen === 'perfil',
      charName: (st.charName.trim() || 'SEM NOME').toUpperCase(),
      clsName: cls.nome, clsPrim: cls.prim, charLevel: st.level,
      isSplash: st.screen === 'splash', isLogin: st.screen === 'login',
      coverOn: !!st.cover,

      loginTopStyle: { flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: (ios ? 66 : 30) + 'px 22px 26px' },
      email: st.email, senha: st.senha,
      setEmail: function (e) { app.setState({ email: e.target.value, loginErr: false }); },
      setSenha: function (e) { app.setState({ senha: e.target.value, loginErr: false }); },
      focusEmail: function () { app.setState({ focus: 'email' }); },
      focusPass: function () { app.setState({ focus: 'senha' }); },
      focusName: function () { app.setState({ focus: 'nome' }); },
      blurField: function () { app.setState({ focus: null }); },
      togglePass: function () { app.setState({ showPass: !st.showPass }); },
      passType: st.showPass ? 'text' : 'password', passLabel: st.showPass ? 'ocultar' : 'mostrar',
      loginError: st.loginErr, doLogin: function () { app.doLogin(); },
      isCadastro: st.screen === 'cadastro',
      goCadastro: function () { app.transitionTo('cadastro'); },
      goLogin: function () { app.transitionTo('login'); },
      cadTopStyle: { flex: 'none', padding: (ios ? 60 : 24) + 'px 22px 20px' },
      nomeCompleto: st.nomeCompleto, usuario: st.usuario, nascimento: st.nascimento,
      setNomeCompleto: function (e) { app.setState({ nomeCompleto: e.target.value, cadErr: '' }); },
      setUsuario: function (e) { app.setState({ usuario: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''), cadErr: '' }); },
      setNascimento: function (e) { app.setState({ nascimento: e.target.value, cadErr: '' }); },
      focusNome: function () { app.setState({ focus: 'nomeC' }); },
      focusUser: function () { app.setState({ focus: 'user' }); },
      focusNasc: function () { app.setState({ focus: 'nasc' }); },
      fieldNomeStyle: field(st.focus === 'nomeC'), fieldUserStyle: field(st.focus === 'user'), fieldNascStyle: field(st.focus === 'nasc'),
      nascDisplay: st.nascimento ? st.nascimento.split('-').reverse().join(' / ') : '— / — / —',
      ageShown: age !== null,
      ageNote: age === null ? '' : age < 18
        ? age + ' anos · composição corporal desativada, base fixa em 8'
        : age + ' anos · faixa de referência ' + (age < 25 ? '18-24' : age < 35 ? '25-34' : age < 45 ? '35-44' : '45+'),
      ageNoteStyle: { fontSize: 10.5, lineHeight: 1.4, marginTop: 7, color: age !== null && age < 18 ? '#aebdd8' : '#4fcbb4' },
      passBars: [0, 1, 2, 3].map(function (i) {
        var s = st.senha;
        var score = (s.length >= 8 ? 1 : 0) + (s.length >= 12 ? 1 : 0) + (/[0-9]/.test(s) ? 1 : 0) + (/[^a-zA-Z0-9]/.test(s) ? 1 : 0);
        var on = i < score, col = score <= 1 ? '#d9a544' : score === 2 ? '#e8c46a' : '#4fcbb4';
        return { style: { flex: 1, height: 3, borderRadius: 2, background: on ? col : 'rgba(255,255,255,.1)', transition: 'background .25s' } };
      }),
      sexOptions: [
        { id: 'f', label: 'Feminino', sub: 'Faixa de referência feminina para a base normalizada' },
        { id: 'm', label: 'Masculino', sub: 'Faixa de referência masculina para a base normalizada' },
        { id: 'n', label: 'Prefiro não informar', sub: 'Base fixa em 8, a mediana, registrada como estimativa' },
      ].map(function (o) {
        var on = st.sexo === o.id;
        return {
          label: o.label, sub: o.sub, pick: function () { app.setState({ sexo: o.id, cadErr: '' }); },
          style: {
            display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px', borderRadius: 14,
            cursor: 'pointer', transition: 'all .22s',
            background: on ? 'rgba(111,200,238,.1)' : 'rgba(255,255,255,.04)',
            border: '1px solid ' + (on ? 'rgba(111,200,238,.5)' : 'rgba(255,255,255,.09)'),
          },
          dotStyle: {
            flex: 'none', width: 18, height: 18, borderRadius: '50%',
            border: '2px solid ' + (on ? '#6fc8ee' : 'rgba(255,255,255,.24)'),
            background: on ? 'radial-gradient(closest-side,#6fc8ee 52%,transparent 56%)' : 'transparent',
            transition: 'all .22s',
          },
        };
      }),
      cadError: !!st.cadErr, cadErrorMsg: st.cadErr, doCadastro: function () { app.doCadastro(); },
      cadBtnStyle: { marginTop: 16, minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, background: 'linear-gradient(135deg,#d9a544,#b8842c)', color: '#191202', fontFamily: "'Bebas Neue',sans-serif", fontSize: 21, letterSpacing: '.12em', cursor: 'pointer', boxShadow: '0 10px 28px rgba(217,165,68,.26)' },
      fieldEmailStyle: field(st.focus === 'email'), fieldPassStyle: field(st.focus === 'senha'),
      loginBtnStyle: { marginTop: 16, minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, background: 'linear-gradient(135deg,#d9a544,#b8842c)', color: '#191202', fontFamily: "'Bebas Neue',sans-serif", fontSize: 21, letterSpacing: '.12em', cursor: 'pointer', boxShadow: '0 10px 28px rgba(217,165,68,.26)' },
      platformBtnStyle: { minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 13, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.04)', fontSize: 13, fontWeight: 600, color: '#e8eef5', cursor: 'pointer' },
      platformBtnLabel: ios ? 'Continuar com Apple' : 'Continuar com Samsung',
      nameValue: st.charName,
      setName: function (e) { app.setState({ charName: e.target.value.replace(/[^\p{L}\p{N} '·-]/gu, '') }); },
      nameCount: st.charName.length + '/14',
      nameCardStyle: {
        marginTop: 20, background: 'rgba(255,255,255,.045)',
        border: '1px solid ' + (st.focus === 'nome' ? 'rgba(111,200,238,.55)' : st.charName.trim() ? 'rgba(79,203,180,.34)' : 'rgba(255,255,255,.09)'),
        borderRadius: 16, padding: 15, transition: 'border-color .2s',
      },
      nameIdeas: ['Vesper', 'Adamar', 'Nix', 'Korve', 'Solaine'].map(function (n) {
        return {
          nome: n, pick: function () { app.setState({ charName: n }); },
          style: {
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: '.06em',
            padding: '5px 10px', borderRadius: 8, cursor: 'pointer', transition: 'all .2s',
            background: st.charName === n ? 'rgba(111,200,238,.16)' : 'rgba(255,255,255,.05)',
            border: '1px solid ' + (st.charName === n ? 'rgba(111,200,238,.5)' : 'rgba(255,255,255,.1)'),
            color: st.charName === n ? '#a5e2f7' : '#c2cfdd',
          },
        };
      }),

      gold: st.animGold, streak: st.streak, xpLabel: st.animXp + ' / ' + need + ' XP',
      xpFlashOn: st.xpFlash,
      gains: st.gains.map(function (g) {
        return {
          text: g.text,
          style: {
            position: 'absolute', left: 0, right: 0, top: '46%', textAlign: 'center', zIndex: 85,
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 46, letterSpacing: '.05em', color: g.color,
            textShadow: '0 0 34px ' + g.color + 'aa, 0 3px 20px rgba(0,0,0,.9)',
            animation: 'admGain 1.3s cubic-bezier(.2,.8,.2,1) forwards', pointerEvents: 'none',
          },
        };
      }),
      tabIndicatorStyle: {
        position: 'absolute', top: 0, height: 2, borderRadius: 2, width: (100 / 6) + '%',
        left: (Math.max(0, ['inicio', 'ficha', 'deck', 'batalha', 'guilda', 'ranking'].indexOf(
          st.screen === 'medicao' ? 'ficha' : st.screen === 'thread' ? 'guilda' : st.screen === 'perfil' ? 'inicio' : st.screen
        )) * (100 / 6)) + '%',
        background: 'linear-gradient(90deg,transparent,#d9a544,transparent)',
        transition: 'left .38s cubic-bezier(.2,.85,.2,1)', pointerEvents: 'none',
      },
      hpMax: app.hpMax(), defense: app.defense(),
      headerStyle: { flex: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: (ios ? 56 : 12) + 'px 16px 11px', position: 'relative', zIndex: 5 },
      avatarStyle: {
        position: 'relative', flex: 'none', width: 42, height: 42, borderRadius: 13, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(140deg,' + cls.cor + '55,rgba(14,20,34,.9))',
        border: '1px solid ' + cls.cor + '88',
      },
      streakChipStyle: {
        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 9px', borderRadius: 9,
        background: st.streak ? 'rgba(217,165,68,.14)' : 'rgba(255,255,255,.05)',
        border: '1px solid ' + (st.streak ? 'rgba(217,165,68,.34)' : 'rgba(255,255,255,.1)'),
      },
      xpBarStyle: {
        position: 'absolute', left: 0, top: 0, bottom: 0, width: pct + '%',
        background: 'linear-gradient(90deg,#6fc8ee,#4fcbb4)', boxShadow: '0 0 12px rgba(111,200,238,.6)',
        transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
      },

      obHeadStyle: { display: 'flex', alignItems: 'center', gap: 10, padding: (ios ? 56 : 14) + 'px 18px 0' },
      obStepLabel: 'Passo ' + (st.obStep + 1) + ' de 5',
      obDots: [0, 1, 2, 3, 4].map(function (i) {
        return { style: { flex: 1, height: 3, borderRadius: 2, background: i <= st.obStep ? '#d9a544' : 'rgba(255,255,255,.12)', transition: 'background .3s' } };
      }),
      obIs0: st.obStep === 0, obIs1: st.obStep === 1, obIs2: st.obStep === 2, obIs3: st.obStep === 3, obIs4: st.obStep === 4,
      obCanBack: st.obStep > 0,
      obBack: function () { app.obBack(); }, obNext: function () { app.obNext(); },
      obNextLabel: st.obStep === 4 ? 'CRIAR PERSONAGEM' : st.obStep === 0 ? 'COMEÇAR' : 'CONTINUAR',
      obNextStyle: btn('linear-gradient(135deg,#d9a544,#b8842c)', '#191202'),
      toggleConsent: function () { app.setState({ consent: !st.consent }); },
      consentStyle: {
        display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '11px 12px',
        borderRadius: 11, cursor: 'pointer',
        background: st.consent ? 'rgba(79,203,180,.12)' : 'rgba(255,255,255,.04)',
        border: '1px solid ' + (st.consent ? 'rgba(79,203,180,.45)' : 'rgba(255,255,255,.14)'),
        transition: 'all .22s',
      },
      consentBoxStyle: {
        flex: 'none', width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#04140f',
        background: st.consent ? '#4fcbb4' : 'transparent',
        border: '1.5px solid ' + (st.consent ? '#4fcbb4' : 'rgba(255,255,255,.25)'),
      },
      consentMark: st.consent ? '✓' : '',
      obDays: DAYS.map(function (d, i) {
        return {
          label: d,
          toggle: function () { var t = st.trainDays.slice(); t[i] = !t[i]; app.setState({ trainDays: t }); },
          style: {
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
            padding: '10px 0', borderRadius: 11, cursor: 'pointer',
            background: st.trainDays[i] ? 'rgba(217,165,68,.14)' : 'rgba(255,255,255,.04)',
            border: '1px solid ' + (st.trainDays[i] ? 'rgba(217,165,68,.4)' : 'rgba(255,255,255,.09)'),
            transition: 'all .2s',
          },
          dotStyle: { width: 7, height: 7, borderRadius: 2, transform: 'rotate(45deg)', background: st.trainDays[i] ? '#d9a544' : 'rgba(255,255,255,.14)' },
        };
      }),
      obClasses: obClasses,
      obClassDots: CLASSES.map(function (k, i) {
        return {
          pick: function () { app.setState({ clsIdx: i }); },
          style: { width: i === st.clsIdx ? 20 : 7, height: 7, borderRadius: 4, cursor: 'pointer', background: i === st.clsIdx ? k.cor : 'rgba(255,255,255,.16)', transition: 'all .3s' },
        };
      }),
      baseRows: ATTRS.map(function (a) {
        return {
          sigla: a.key, base: a.base,
          barStyle: { height: '100%', width: (a.base / 10 * 100) + '%', background: 'linear-gradient(90deg,#6fc8ee,#4fcbb4)', borderRadius: 4, transformOrigin: 'left', animation: 'admBar .7s cubic-bezier(.2,.8,.2,1) both' },
        };
      }),

      showHeader: st.screen !== 'inicio' && !(st.screen === 'batalha' && b && !b.result),
      showTabBar: !(st.screen === 'batalha' && b && !b.result),
      heroStageStyle: { position: 'relative', paddingTop: (ios ? 56 : 16) + 'px', paddingBottom: 20, overflow: 'hidden', background: 'linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,0) 78%)', borderBottom: '1px solid rgba(255,255,255,.08)' },
      clsGlow: cls.cor + '2e',
      heroHazeStyle: st.fatigue > 0 ? { position: 'absolute', inset: 0, background: 'radial-gradient(58% 48% at 42% 46%,rgba(127,142,192,.34),transparent 72%)', animation: 'admBreathe 3.6s ease-in-out infinite', pointerEvents: 'none' } : { display: 'none' },
      heroArtStyle: {
        position: 'relative', flex: 'none', width: 116, height: 158, borderRadius: 13,
        border: '1px dashed ' + (st.fatigue > 0 ? 'rgba(127,142,192,.5)' : 'rgba(255,255,255,.22)'),
        background: 'linear-gradient(170deg,' + cls.cor + '1f,rgba(0,0,0,.34))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'admDrift 6s ease-in-out infinite', filter: st.fatigue > 0 ? 'saturate(.45)' : 'none',
        boxShadow: '0 16px 40px rgba(0,0,0,.5)',
      },
      clsTagStyle: Object.assign(pill(cls.cor), { display: 'inline-block', marginTop: 7, background: cls.cor + '18' }),
      xpRemaining: st.level >= 20 ? 'nível máximo' : (need - st.xp) + ' XP até o nível ' + (st.level + 1),
      heroXpFillStyle: {
        position: 'absolute', left: 0, top: 0, bottom: 0, width: Math.max(1.5, pct) + '%',
        background: 'linear-gradient(90deg,#6fc8ee,#4fcbb4)',
        boxShadow: '0 0 16px rgba(111,200,238,.7), 2px 0 12px 2px rgba(232,196,106,.85)',
        transition: 'width .65s cubic-bezier(.2,.8,.2,1)', animation: 'admSpark 2.1s ease-in-out infinite',
      },
      statSeqStyle: { flex: 1, background: st.streak ? 'rgba(217,165,68,.1)' : 'rgba(255,255,255,.04)', border: '1px solid ' + (st.streak ? 'rgba(217,165,68,.3)' : 'rgba(255,255,255,.09)'), borderRadius: 13, padding: '10px 11px' },
      statFatStyle: { flex: 1, cursor: 'pointer', background: st.fatigue ? 'rgba(127,142,192,.14)' : 'rgba(255,255,255,.04)', border: '1px solid ' + (st.fatigue ? 'rgba(127,142,192,.4)' : 'rgba(255,255,255,.09)'), borderRadius: 13, padding: '10px 11px' },
      fatigueColor: st.fatigue ? '#aebdd8' : '#4fcbb4',
      heroMission: heroMission, restMissions: restMissions,
      dailyMissions: dailyMissions, missionSummary: doneCount + ' de 5 concluídas hoje',
      weeklyBarStyle: { height: '100%', width: (st.weekly / 3 * 100) + '%', background: 'linear-gradient(90deg,#d9a544,#e8c46a)', borderRadius: 4, transition: 'width .5s cubic-bezier(.2,.8,.2,1)' },
      weeklyLabel: st.weekly + '/3',
      hasFatigue: st.fatigue > 0, fatigue: st.fatigue, fatigueMsg: fatigueMsgs[fKey],
      fatigueSegs: Array.from({ length: 9 }, function (_, i) {
        return {
          style: {
            flex: 1, height: 5, borderRadius: 3,
            background: i < st.fatigue ? '#7f8ec0' : 'rgba(255,255,255,.09)',
            transition: 'background .3s', transformOrigin: 'left',
            animation: i < st.fatigue ? 'admSegFill .42s cubic-bezier(.2,.8,.2,1) both' : 'none',
            animationDelay: (i * 0.06) + 's',
          },
        };
      }),
      goFadiga: function () { app.openRest(); },

      attrRows: attrRows, radarPts: radarPts, radarLabels: radarLabels,
      radarNote: st.fatigue >= 3 ? 'violeta = enfraquecido pela Fadiga' : cls.prim + ' é o seu atributo primário',
      radarNoteStyle: { fontSize: 10.5, color: st.fatigue >= 3 ? '#aebdd8' : '#f0cd85' },
      hasPoints: st.points > 0, pointsLeft: app.pointsLeft(), hasDraft: Object.keys(st.draft).length > 0,
      pointsMsg: Object.keys(st.draft).length ? 'Confirme para aplicar. Acima de 15 custa 2; acima de 18, custa 3.' : 'pontos livres. Aplique onde você quiser, não onde suou.',
      commitPoints: function () { app.commitPoints(); },
      medicaoSub: st.medDone ? 'Registrada hoje · próxima em 7 dias' : 'Última há 8 dias · liberada',
      goMedicao: function () { app.go('medicao'); }, goFicha: function () { app.go('ficha'); }, goPerfil: function () { app.go('perfil'); },
      medLockStyle: Object.assign({ borderRadius: 14, padding: '13px 14px', marginTop: 12 },
        st.medDone ? { background: 'rgba(127,142,192,.12)', border: '1px solid rgba(127,142,192,.32)' } : { background: 'rgba(111,200,238,.09)', border: '1px solid rgba(111,200,238,.26)' }),
      medLockTitle: st.medDone ? 'Bloqueado por 7 dias' : 'Como isso vira pontos',
      medLockMsg: st.medDone
        ? 'A composição corporal não muda de forma mensurável em menos de uma semana. Medições muito frequentes captam só variação de hidratação.'
        : 'Pontos vêm do delta em relação à sua medição anterior, com teto de 5. Se a medição vier pior, o resultado é zero — nunca negativo.',
      medBtnStyle: Object.assign(btn(st.medDone ? 'rgba(255,255,255,.05)' : 'linear-gradient(135deg,#6fc8ee,#3f9ecb)', st.medDone ? '#68768a' : '#04141f'), { marginTop: 14, border: st.medDone ? '1px solid rgba(255,255,255,.1)' : 'none' }),
      medBtnLabel: st.medDone ? 'PRÓXIMA EM 7 DIAS' : 'REGISTRAR MEDIÇÃO',
      registrarMedicao: function () { app.registrarMedicao(); }, evoBars: evoBars,

      collection: collection, deckSummary: '8 cartas únicas · 20 no deck ativo · fabricadas por ação real',
      reforjaRows: reforjaRows, reforjaEmpty: reforjaRows.length === 0,
      deckStats: [
        { val: 20, label: 'no deck', color: '#e8eef5' }, { val: 8, label: 'únicas', color: '#6fc8ee' },
        { val: 1, label: 'épica', color: '#d9a544' }, { val: '2,1', label: 'custo méd.', color: '#4fcbb4' },
      ].map(function (s) {
        return { val: s.val, label: s.label, valStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, lineHeight: 1, letterSpacing: '.03em', color: s.color } };
      }),

      battleIdle: !b, battleActive: !!b && !b.result, battleOver: !!b && !!b.result,
      pvpBlocked: C.fadigaBloqueiaPvp(st.fatigue),
      startBattle: function () { app.startBattle(); }, endTurn: function () { app.endTurn(); },
      fleeBattle: function () { app.fleeBattle(); }, resetBattle: function () { app.resetBattle(); },
      modeOptions: [
        { id: 'confronto', title: 'CONFRONTO SIMULTÂNEO', desc: 'A Sentinela escolhe primeiro, escondido. Vocês revelam juntos no centro e o resultado sai da comparação: acerto limpo, troca de golpes, defendido ou empate.' },
        { id: 'livre', title: 'TURNO LIVRE', desc: 'O modelo da especificação. Você joga quantas cartas a energia permitir, encerra o turno e só então a Sentinela age.' },
      ].map(function (m) {
        var on = st.battleMode === m.id;
        return {
          title: m.title, desc: m.desc, pick: function () { app.setState({ battleMode: m.id }); },
          style: {
            padding: '13px 14px', borderRadius: 16, cursor: 'pointer', transition: 'all .22s',
            background: on ? 'linear-gradient(150deg,rgba(217,165,68,.14),rgba(255,255,255,.03))' : 'rgba(255,255,255,.035)',
            border: '1px solid ' + (on ? 'rgba(217,165,68,.45)' : 'rgba(255,255,255,.09)'),
          },
          dotStyle: {
            flex: 'none', width: 18, height: 18, borderRadius: '50%',
            border: '2px solid ' + (on ? '#d9a544' : 'rgba(255,255,255,.24)'),
            background: on ? 'radial-gradient(closest-side,#d9a544 52%,transparent 56%)' : 'transparent',
            transition: 'all .22s',
          },
        };
      }),
      modeLivre: st.battleMode === 'livre', modeConfronto: st.battleMode === 'confronto',
      roundHint: st.battleMode === 'livre'
        ? (enemyStep ? enemyStep.intent : '')
        : (b && b.phase === 'choose' ? 'Rodada ' + b.turn + ' · a Sentinela já escolheu' : b && b.phase === 'reveal' ? 'revelando' : 'resultado da rodada'),
      awaitingOn: !!(b && b.phase === 'choose'),
      verdictOn: !!(b && b.verdict),
      verdictTitle: b && b.verdict ? b.verdict.title : '', verdictDetail: b && b.verdict ? b.verdict.detail : '',
      verdictStyle: {
        padding: '9px 14px', borderRadius: 12, maxWidth: 232, background: 'rgba(5,8,15,.86)',
        border: '1px solid ' + (b && b.verdict ? b.verdict.tone + '77' : 'transparent'),
        backdropFilter: 'blur(12px)', boxShadow: '0 14px 34px rgba(0,0,0,.6)',
        animation: 'admSlam3d .5s cubic-bezier(.2,.85,.2,1)',
      },
      verdictTitleStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 21, letterSpacing: '.08em', textAlign: 'center', color: b && b.verdict ? b.verdict.tone : '#fff' },
      clashSlotStyle: { width: 98, height: 138, perspective: 900, pointerEvents: 'none' },
      clashEnemyInner: { position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform .6s cubic-bezier(.2,.85,.2,1)', transform: (b && b.revealed ? 'rotateY(180deg)' : 'rotateY(0deg)') + ' rotateX(-9deg)' },
      clashPlayerInner: { position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform .6s cubic-bezier(.2,.85,.2,1)', transform: (b && b.playerCard ? (b.revealed ? 'rotateY(180deg)' : 'rotateY(0deg)') : 'rotateY(0deg)') + ' rotateX(9deg)' },
      clashBackStyle: { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: 'linear-gradient(160deg,rgba(217,165,68,.2),rgba(5,8,16,.99))', border: '1px solid rgba(217,165,68,.5)', boxShadow: '0 18px 40px rgba(0,0,0,.7)' },
      clashEmptyStyle: { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, border: '1px dashed rgba(255,255,255,.2)', background: 'rgba(5,8,15,.5)' },
      clashEnemyFace: b && b.enemyCard ? { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', padding: 9, boxSizing: 'border-box', borderRadius: 12, background: 'linear-gradient(168deg,rgba(217,165,68,.4),rgba(7,10,20,.99))', border: '1px solid rgba(217,165,68,.85)', boxShadow: '0 18px 40px rgba(0,0,0,.7)' } : {},
      clashPlayerFace: b && b.playerCard ? { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', padding: 9, boxSizing: 'border-box', borderRadius: 12, background: 'linear-gradient(168deg,' + RAR[b.playerCard.rar] + '5c,rgba(7,10,20,.99))', border: '1px solid ' + RAR[b.playerCard.rar] + 'cc', boxShadow: '0 18px 40px rgba(0,0,0,.7)' } : {},
      enemyCardName: b && b.enemyCard ? b.enemyCard.nome : '',
      enemyCardNum: b && b.enemyCard ? (b.enemyCard.dano ? b.enemyCard.dano + ' DANO' : '+' + b.enemyCard.def + ' DEF') : '',
      enemyCardNumStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, letterSpacing: '.05em', color: '#f0cd85', marginTop: 2 },
      playerCardName: b && b.playerCard ? b.playerCard.nome : '',
      playerCardNum: b && b.playerCard ? (b.playerCard.dano ? b.playerCard.dano + ' DANO' : b.playerCard.cura ? b.playerCard.cura + ' CURA' : b.playerCard.def ? '+' + b.playerCard.def + ' DEF' : 'EFEITO') : '',
      playerCardNumStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, letterSpacing: '.05em', color: b && b.playerCard ? RAR[b.playerCard.rar] : '#6fc8ee', marginTop: 2 },
      primaryAction: st.battleMode === 'livre' ? function () { app.endTurn(); }
        : (b && b.phase === 'resolve' ? function () { app.nextRound(); } : function () { app.noopRound(); }),
      primaryActionLabel: st.battleMode === 'livre' ? 'ENCERRAR TURNO'
        : (b && b.phase === 'resolve' ? 'PRÓXIMA RODADA' : b && b.phase === 'reveal' ? 'REVELANDO…' : 'ESCOLHA UMA CARTA'),
      primaryActionStyle: (function () {
        var ready = st.battleMode === 'livre' || (b && b.phase === 'resolve');
        return {
          flex: 1, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: '.1em',
          cursor: ready ? 'pointer' : 'default', backdropFilter: 'blur(10px)',
          background: ready ? 'rgba(111,200,238,.22)' : 'rgba(255,255,255,.04)',
          border: '1px solid ' + (ready ? 'rgba(111,200,238,.5)' : 'rgba(255,255,255,.1)'),
          color: ready ? '#a5e2f7' : '#68768a',
        };
      })(),
      previewOn: pv !== null,
      pvName: pvc ? pvc.nome : '', pvCost: pvc ? pvc.custo : '', pvRar: pvc ? RARL[pvc.rar] : '',
      pvTxt: pvc ? pvc.txt : '', pvSrc: pvc ? pvc.src : '',
      pvNum: pvNum, pvNumLabel: pvNumLabel, pvCalcTitle: pvCalcTitle, pvLines: pvLines,
      pvCardStyle: pvc ? {
        position: 'relative', width: 224, height: 316, padding: 15, boxSizing: 'border-box',
        borderRadius: 18, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transformStyle: 'preserve-3d', animation: 'admIdle3d 5.5s ease-in-out infinite',
        background: 'linear-gradient(168deg,' + RAR[pvc.rar] + '5c 0%,rgba(9,14,24,.99) 56%,rgba(5,8,16,1) 100%)',
        border: '1px solid ' + RAR[pvc.rar] + 'cc',
        boxShadow: '0 34px 70px rgba(0,0,0,.8), 0 0 60px ' + RAR[pvc.rar] + '44',
      } : {},
      pvSheen: pvc && (pvc.rar === 'epica' || pvc.rar === 'rara') ? sheen : { display: 'none' },
      pvCostStyle: { width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, background: 'rgba(111,200,238,.24)', border: '1px solid rgba(111,200,238,.6)', color: '#a5e2f7' },
      pvRarStyle: pvc ? Object.assign(pill(RAR[pvc.rar]), { fontSize: 10 }) : {},
      pvNumStyle: pvc ? { fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: '.03em', color: RAR[pvc.rar] } : {},
      pvPlayLabel: pvAfford ? 'JOGAR · ' + (pvc ? pvc.custo : '') + ' ENERGIA' : 'ENERGIA INSUFICIENTE',
      pvPlayStyle: {
        flex: 1, minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 13, cursor: pvAfford ? 'pointer' : 'not-allowed',
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: '.08em',
        background: pvAfford ? 'linear-gradient(135deg,#d9a544,#b8842c)' : 'rgba(255,255,255,.06)',
        border: pvAfford ? 'none' : '1px solid rgba(255,255,255,.12)',
        color: pvAfford ? '#191202' : '#68768a',
      },
      confirmPlay: function () { app.confirmPlay(); }, closePreview: function () { app.closePreview(); },
      battleTopStyle: { position: 'absolute', left: 14, right: 14, top: ios ? 52 : 12, zIndex: 20 },
      worldStyle: { position: 'absolute', inset: 0, transformStyle: 'preserve-3d', animation: st.impact ? 'admCam .62s cubic-bezier(.25,.75,.25,1)' : 'none' },
      impactOn: !!st.impact,
      enemyGroupStyle: { position: 'absolute', left: '50%', bottom: '25%', width: 172, marginLeft: -86, transformStyle: 'preserve-3d', transform: 'translateZ(-70px)' },
      enemyArtStyle: {
        position: 'relative', width: 172, height: 214, borderRadius: 13,
        border: '1px dashed rgba(255,255,255,.26)',
        background: 'linear-gradient(170deg,rgba(217,165,68,.2),rgba(4,6,16,.95))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        boxShadow: '0 34px 64px rgba(0,0,0,.8), 0 0 60px rgba(217,165,68,.24), inset 0 1px 0 rgba(255,255,255,.14)',
        transformStyle: 'preserve-3d',
        animation: st.impact ? 'admRecoil .58s cubic-bezier(.2,.8,.2,1)' : 'admDrift 5.4s ease-in-out infinite',
      },
      enemyHpStyle: { height: '100%', width: b ? (b.ehp / b.ehpMax * 100) + '%' : '0%', background: 'linear-gradient(90deg,#d9a544,#b8842c)', borderRadius: 5, transition: 'width .4s cubic-bezier(.2,.8,.2,1)' },
      enemyHpLabel: b ? b.ehp + '/' + b.ehpMax : '',
      enemyIntent: enemyStep ? enemyStep.intent : '',
      heroHpStyle: { height: '100%', width: b ? (b.hp / b.hpMax * 100) + '%' : '0%', background: 'linear-gradient(90deg,#4fcbb4,#6fc8ee)', borderRadius: 6, transition: 'width .4s cubic-bezier(.2,.8,.2,1)' },
      heroHpLabel: b ? b.hp + '/' + b.hpMax : '',
      energyLabel: b ? b.energy + '/' + b.energyMax : '', energyPips: energyPips, hand: hand,
      floaters: st.floaters.map(function (f) {
        return {
          text: f.text,
          style: {
            position: 'absolute', left: 0, right: 0, top: -18, textAlign: 'center',
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 38, letterSpacing: '.04em',
            whiteSpace: 'nowrap', color: f.color,
            textShadow: '0 0 26px ' + f.color + 'aa, 0 3px 18px rgba(0,0,0,.9)',
            animation: 'admFloat 1s cubic-bezier(.2,.8,.2,1) forwards', pointerEvents: 'none', zIndex: 30,
          },
        };
      }),
      battleLog: st.log.map(function (l, i) {
        return { text: l.text, style: { fontSize: 11.5, lineHeight: 1.4, color: i === st.log.length - 1 ? '#c2cfdd' : '#5a6878', textAlign: 'center', animation: 'admIn .3s ease-out' } };
      }),
      hasFlying: !!st.flying, flyingName: st.flying ? st.flying.nome : '',
      flyingStyle: st.flying ? {
        position: 'absolute', left: '50%', top: '34%', marginLeft: -62, width: 124, height: 172,
        borderRadius: 14, display: 'flex', alignItems: 'flex-end', padding: 12, boxSizing: 'border-box',
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, letterSpacing: '.03em',
        background: 'linear-gradient(165deg,' + RAR[st.flying.rar] + '66,rgba(11,16,26,.98))',
        border: '1px solid ' + RAR[st.flying.rar],
        boxShadow: '0 30px 70px rgba(0,0,0,.8), 0 0 54px ' + RAR[st.flying.rar] + '66',
        animation: 'admCast .7s cubic-bezier(.2,.8,.2,1) forwards', transformStyle: 'preserve-3d',
        zIndex: 40, pointerEvents: 'none',
      } : {},
      resultWin: !!(b && b.result === 'win'),
      resultTitle: b && b.result === 'win' ? 'VITÓRIA' : 'DERROTA',
      resultTitleStyle: {
        position: 'relative', fontFamily: "'Bebas Neue',sans-serif", fontSize: 62, lineHeight: .92,
        letterSpacing: '.05em', color: b && b.result === 'win' ? '#4fcbb4' : '#7f8ec0',
        textShadow: b && b.result === 'win' ? '0 0 44px rgba(79,203,180,.45)' : 'none',
        animation: b && b.result === 'win' ? 'admSlam .9s cubic-bezier(.2,.9,.2,1) .88s both' : 'admRise .8s cubic-bezier(.2,.8,.2,1) .88s both',
      },
      resultMsg: b && b.result === 'win'
        ? 'A Sentinela cai. O padrão dela é sempre o mesmo — na próxima você resolve em menos turnos.'
        : 'Você não perdeu nada além do tempo da partida. Nem XP, nem ouro, nem cartas.',
      resultRewards: b && b.result === 'win'
        ? [{ val: '+90', label: 'XP', c: '#6fc8ee' }, { val: '+60', label: 'Ouro', c: '#e8c46a' }, { val: '+1', label: 'Carta', c: '#d9a544' }].map(function (r, i) {
          return { val: r.val, label: r.label, delay: (i * 0.14 + 1.18) + 's', valStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 27, lineHeight: 1, letterSpacing: '.03em', color: r.c } };
        })
        : [{ val: '0', label: 'Perdido', c: '#8a97ab' }].map(function (r) {
          return { val: r.val, label: r.label, delay: '1.18s', valStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 27, lineHeight: 1, letterSpacing: '.03em', color: r.c } };
        }),

      guildMembers: guildMembers, trades: trades,
      isThread: st.screen === 'thread', goGuilda: function () { app.go('guilda'); },
      openMyThread: function () { app.openMyThread(); },
      guildTabs: ['HOJE', 'TROCAS', 'META'].map(function (l, i) {
        return {
          label: l, pick: function () { app.setState({ gTab: i }); },
          style: {
            flex: 1, minHeight: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 9, cursor: 'pointer', fontFamily: "'Bebas Neue',sans-serif", fontSize: 15,
            letterSpacing: '.1em', background: i === st.gTab ? 'rgba(217,165,68,.18)' : 'transparent',
            border: '1px solid ' + (i === st.gTab ? 'rgba(217,165,68,.42)' : 'transparent'),
            color: i === st.gTab ? '#f0cd85' : '#75839a', transition: 'all .22s',
          },
        };
      }),
      gTabHoje: st.gTab === 0, gTabTrocas: st.gTab === 1, gTabMeta: st.gTab === 2,
      myProofSent: st.myProofSent,
      myProofMsg: st.myProofSent ? 'Foto enviada. A guilda está confirmando.' : 'Mande uma foto e a guilda confirma. Sem foto, a missão rende 70%.',
      myProofStyle: {
        position: 'relative', overflow: 'hidden', cursor: 'pointer', borderRadius: 18,
        padding: '14px 15px', transition: 'all .22s',
        background: st.myProofSent ? 'linear-gradient(150deg,rgba(79,203,180,.14),rgba(255,255,255,.03))' : 'linear-gradient(150deg,rgba(217,165,68,.16),rgba(255,255,255,.035))',
        border: '1px solid ' + (st.myProofSent ? 'rgba(79,203,180,.4)' : 'rgba(217,165,68,.44)'),
      },
      myProofIcon: st.myProofSent ? '✓' : '◎',
      myProofIconStyle: {
        flex: 'none', width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 17, fontWeight: 800,
        background: st.myProofSent ? '#4fcbb4' : 'rgba(0,0,0,.28)',
        border: '1.5px solid ' + (st.myProofSent ? '#4fcbb4' : 'rgba(217,165,68,.55)'),
        color: st.myProofSent ? '#04140f' : '#f0cd85',
      },
      myConfirmBarStyle: { height: '100%', width: Math.min(100, st.myConfirms / MAJORITY * 100) + '%', background: 'linear-gradient(90deg,#4fcbb4,#6fc8ee)', borderRadius: 4, transition: 'width .5s cubic-bezier(.2,.8,.2,1)' },
      myConfirmLabel: st.myConfirms + '/' + MAJORITY,

      thName: isMe ? 'VESPER · você' : (thG ? thG.nome : ''),
      thInitial: isMe ? 'V' : (thG ? thG.nome.charAt(0) : ''),
      thMissao: isMe ? 'Treino de força · 45 min' : (thG ? thG.missao : ''),
      thXp: isMe ? '+40 XP' : (thG ? '+' + thG.xp + ' XP' : ''),
      thXpStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: '.04em', color: thDone ? '#4fcbb4' : '#6fc8ee', padding: '5px 9px', borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' },
      thAvStyle: { flex: 'none', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 21, background: 'rgba(111,200,238,.16)', border: '1px solid rgba(111,200,238,.36)', color: '#a5e2f7' },
      thMessages: (isMe
        ? [{ who: 'me', text: 'Treino fechado. Segue a foto do painel da academia.' }, { who: 'them', text: 'Kaio: confirmo, te vi lá hoje.' }]
        : (thG ? [{ who: 'them', text: thG.nome + ': ' + thG.msg }, { who: 'me', text: thN >= MAJORITY ? 'Confirmado. Maioria atingida.' : 'Vou olhar a foto.' }] : [])
      ).map(function (m) {
        return {
          text: m.text,
          wrapStyle: { display: 'flex', justifyContent: m.who === 'me' ? 'flex-end' : 'flex-start' },
          bubbleStyle: {
            maxWidth: '82%', fontSize: 12.5, lineHeight: 1.45, padding: '9px 12px', borderRadius: 14,
            background: m.who === 'me' ? 'rgba(111,200,238,.14)' : 'rgba(255,255,255,.05)',
            border: '1px solid ' + (m.who === 'me' ? 'rgba(111,200,238,.3)' : 'rgba(255,255,255,.1)'),
            color: '#e8eef5',
          },
        };
      }),
      thProofLabel: isMe ? 'Sua foto de comprovação' : 'Foto enviada por ' + (thG ? thG.nome : ''),
      thSlotId: thSlotId,
      thSlotPlaceholder: isMe ? 'Arraste a foto do treino' : 'Foto de ' + (thG ? thG.nome : ''),
      thSlotPhoto: st.proofPhoto[thSlotId] || '',
      thProofWrapStyle: { position: 'relative', width: '100%', height: 196, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.03)' },
      thPanelStyle: {
        marginTop: 14, borderRadius: 16, padding: '13px 14px',
        background: thDone ? 'rgba(79,203,180,.1)' : 'rgba(255,255,255,.04)',
        border: '1px solid ' + (thDone ? 'rgba(79,203,180,.36)' : 'rgba(255,255,255,.09)'),
        transition: 'all .25s',
      },
      thTone: thDone ? '#4fcbb4' : '#6fc8ee',
      thCountLabel: thDone ? 'VALIDADA PELA GUILDA' : thTotal + ' DE ' + MAJORITY + ' CONFIRMARAM',
      thCountSub: thDone ? 'XP integral liberado. Conta para o ranking global.' : 'Maioria de ' + MAJORITY + ' em ' + GUILD_SIZE + ' membros libera o XP integral.',
      thBarStyle: { height: '100%', width: Math.min(100, thTotal / MAJORITY * 100) + '%', background: thDone ? 'linear-gradient(90deg,#4fcbb4,#6fc8ee)' : 'linear-gradient(90deg,#6fc8ee,#a5e2f7)', borderRadius: 4, transition: 'width .5s cubic-bezier(.2,.8,.2,1)' },
      thConfirmAvatars: thSeed.map(function (nome, i) {
        return {
          initial: nome.charAt(0),
          style: {
            width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 13,
            marginLeft: i ? -7 : 0, background: '#131c2a', border: '1.5px solid rgba(79,203,180,.6)',
            color: '#4fcbb4', animation: 'admPop .38s cubic-bezier(.2,.8,.2,1) both',
            animationDelay: (i * 0.06) + 's',
          },
        };
      }),
      thAction: function () { app.confirmThread(); }, thContest: function () { app.contestThread(); },
      thCanContest: !isMe && !thDone,
      thActionLabel: isMe ? (st.myProofSent ? 'COMPROVAÇÃO ENVIADA' : 'ENVIAR COMPROVAÇÃO') : (st.confirms[th] ? 'VOCÊ CONFIRMOU' : 'CONFIRMAR QUE FEZ'),
      thActionStyle: (function () {
        var spent = isMe ? st.myProofSent : !!st.confirms[th];
        return {
          flex: 1, minHeight: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: '.08em',
          cursor: spent ? 'default' : 'pointer',
          background: spent ? 'rgba(79,203,180,.16)' : 'linear-gradient(135deg,#4fcbb4,#2a8a7a)',
          border: spent ? '1px solid rgba(79,203,180,.4)' : 'none',
          color: spent ? '#4fcbb4' : '#04140f',
        };
      })(),

      rankTabs: ['AMIGOS', 'GUILDA', 'GLOBAL'].map(function (t, i) {
        return {
          label: t, pick: function () { app.setState({ rankTab: i }); },
          style: {
            flex: 1, minHeight: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 9, cursor: 'pointer', fontFamily: "'Bebas Neue',sans-serif", fontSize: 15,
            letterSpacing: '.1em', background: i === st.rankTab ? 'rgba(217,165,68,.18)' : 'transparent',
            border: '1px solid ' + (i === st.rankTab ? 'rgba(217,165,68,.42)' : 'transparent'),
            color: i === st.rankTab ? '#f0cd85' : '#75839a', transition: 'all .22s',
          },
        };
      }),
      rankRows: rankRows, privacyRows: privacyRows,

      tabBarStyle: { flex: 'none', display: 'flex', gap: 2, padding: '9px 8px ' + (ios ? 26 : 14) + 'px', borderTop: '1px solid rgba(255,255,255,.08)', background: 'rgba(6,8,16,.82)', backdropFilter: 'blur(18px)', position: 'relative', zIndex: 5 },
      tabs: tabDefs.map(function (t) {
        var on = t.keys.indexOf(st.screen) >= 0;
        return {
          label: t.label, go: function () { app.go(t.id); },
          style: {
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            padding: '6px 0', minHeight: 46, borderRadius: 10, cursor: 'pointer',
            color: on ? '#f0cd85' : '#68768a', transition: 'color .2s',
          },
          iconStyle: {
            width: on ? 16 : 9, height: 9, borderRadius: on ? 3 : 2,
            transform: on ? 'none' : 'rotate(45deg)',
            background: on ? 'linear-gradient(90deg,#d9a544,#e8c46a)' : 'rgba(255,255,255,.2)',
            transition: 'all .28s cubic-bezier(.2,.8,.2,1)',
            animation: on ? 'admBounce .44s cubic-bezier(.2,.8,.2,1)' : 'none',
          },
        };
      }),

      toastOn: !!st.toast, toastMsg: st.toast ? st.toast.msg : '', toastSub: st.toast ? st.toast.sub : '',
      toastHasSub: !!(st.toast && st.toast.sub),
      toastStyle: {
        position: 'absolute', left: 14, right: 14, bottom: ios ? 96 : 84, zIndex: 80, display: 'flex',
        gap: 11, alignItems: 'flex-start', padding: '13px 14px', borderRadius: 15,
        background: 'rgba(13,18,30,.94)',
        border: '1px solid ' + (st.toast ? st.toast.color + '66' : 'transparent'),
        boxShadow: '0 18px 44px rgba(0,0,0,.6)', backdropFilter: 'blur(16px)',
        animation: 'admRise .34s cubic-bezier(.2,.8,.2,1)',
      },
      toastIconStyle: { flex: 'none', width: 9, height: 9, marginTop: 4, borderRadius: 2, transform: 'rotate(45deg)', background: st.toast ? st.toast.color : 'transparent' },
      levelUpOn: st.levelUp,
      closeLevelUp: function () {
        if (st.wipe === 'open') return;
        app.setState({ wipe: 'open' }, function () { requestAnimationFrame(function () { if (app._irisPlay) app._irisPlay('open'); }); });
        app.later(function () { app.setState({ levelUp: false, wipe: null, screen: 'ficha' }); }, 860);
      },
      irisGlowStyle: iris('linear-gradient(140deg,#6fc8ee,#e8c46a 50%,#6fc8ee)'),
      irisStyle: iris('radial-gradient(130% 130% at 50% 34%,#0e1526,#05080f 76%)'),
      irisMarkStyle: { position: 'absolute', left: '50%', top: '50%', opacity: 0, transform: 'translate(-50%,-50%) scale(.82)', pointerEvents: 'none' },
      bloomGoldStyle: {
        position: 'absolute', left: '50%', top: '46%', width: 380, height: 380, marginLeft: -190,
        marginTop: -190, borderRadius: '50%',
        background: 'radial-gradient(closest-side,rgba(232,196,106,.34),rgba(111,200,238,.12) 52%,transparent 72%)',
        animation: 'admBloom 1.3s cubic-bezier(.2,.8,.2,1) .82s both', pointerEvents: 'none',
      },
      overlayContentStyle: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 26, textAlign: 'center', animation: st.wipe === 'open' ? 'admFadeOut .3s ease-in both' : 'admRise .68s cubic-bezier(.2,.8,.2,1) .84s both' },
      resultContentStyle: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', animation: st.wipe === 'open' ? 'admFadeOut .3s ease-in both' : 'admRise .68s cubic-bezier(.2,.8,.2,1) .84s both' },
      lvFrom: st.lvFrom,
      lvFromStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 46, lineHeight: .9, letterSpacing: '.02em', color: '#8a97ab', animation: 'admNumFade 1s cubic-bezier(.4,0,.6,1) 1.46s both' },
      lvArrowStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, lineHeight: 1, color: '#d9a544', animation: 'admPop .48s cubic-bezier(.2,.8,.2,1) 1.28s both' },
      lvToStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 96, lineHeight: .88, letterSpacing: '.02em', color: '#fff', textShadow: '0 0 44px rgba(217,165,68,.6)', animation: 'admSlam .9s cubic-bezier(.2,.9,.2,1) 1.34s both' },

      // ── cronômetro de estudo ───────────────────────────────────────────────
      timerOn: !!tm,
      timerBlockLabel: tm ? 'Bloco ' + tm.block + ' de ' + tm.totalBlocks : '',
      timerPhaseLabel: timerPhaseLabel,
      timerClock: tm ? fmtClock(tm.secLeft) : '',
      timerHint: tm ? timerHints[tm.phase] : '',
      timerProtoNote: 'Protótipo · relógio acelerado; no app real cada bloco leva 25 minutos.',
      timerInterrupted: !!(tm && tm.phase === 'interrupted'),
      timerDone: !!(tm && tm.phase === 'done'),
      timerInterruptions: tm ? tm.interruptions : 0,
      timerShowInterruptCount: !!(tm && tm.interruptions > 0 && tm.phase !== 'interrupted'),
      timerPrimaryLabel: timerPrimaryLabel, timerPrimary: timerPrimary,
      timerClose: function () { app.closeTimer(); },
      timerRingStyle: {
        position: 'relative', width: 208, height: 208, borderRadius: '50%',
        background: 'conic-gradient(' + timerColor + ' ' + (timerPct * 3.6) + 'deg, rgba(255,255,255,.09) 0deg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .18s linear', boxShadow: '0 0 44px ' + timerColor + '33',
      },
      timerRingInnerStyle: {
        width: 176, height: 176, borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 38%,#121a2c,#080b14 78%)',
        border: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 4,
      },
      timerClockStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, lineHeight: 1, letterSpacing: '.03em', color: '#fff' },
      timerPhaseChipStyle: {
        fontSize: 9.5, fontWeight: 700, letterSpacing: '.18em', color: timerColor,
        padding: '2px 8px', borderRadius: 5, background: timerColor + '1a', border: '1px solid ' + timerColor + '55',
      },
      timerColor: timerColor,
      timerPrimaryStyle: {
        flex: 1, minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 13,
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: '.09em', cursor: 'pointer',
        background: 'linear-gradient(135deg,' + timerColor + ',' + timerColor + 'bb)', color: '#04141f',
      },

      // ── missão épica ───────────────────────────────────────────────────────
      epicActive: !!epic,
      epicTitle: epic ? epic.title : '',
      epicCatLabel: epicCat.label, epicCatStyle: pill(epicCat.color),
      epicProgLabel: epic ? epic.current + ' / ' + epic.target + ' ' + epic.unit : '',
      epicPctLabel: epicPct + '%',
      epicDaysLabel: epic ? epic.days + ' dias de prazo' : '',
      epicXpLabel: epic ? '+' + epic.xp + ' XP' : '',
      epicRewardLabel: epic ? '+' + epic.xp + ' XP · +' + EPIC.gold + ' ouro · +' + EPIC.points + ' pontos' : '',
      epicDone: epicDone,
      epicBarStyle: { height: '100%', width: epicPct + '%', background: 'linear-gradient(90deg,' + epicCat.color + ',#e8c46a)', borderRadius: 4, transition: 'width .5s cubic-bezier(.2,.8,.2,1)' },
      openEpic: function () { app.openEpicForm(); },
      epicAdvance: function () { app.advanceEpic(); },
      epicComplete: function () { app.completeEpic(); },
      epicExpire: function () { app.expireEpic(); },
      epicPrimaryStyle: {
        flex: 1, minHeight: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12,
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: '.08em', cursor: 'pointer',
        background: epicDone ? 'linear-gradient(135deg,#d9a544,#b8842c)' : 'rgba(217,165,68,.14)',
        border: epicDone ? 'none' : '1px solid rgba(217,165,68,.42)',
        color: epicDone ? '#191202' : '#f0cd85',
      },
      // criação de missão épica
      epicFormOn: st.epicForm,
      epicPresets: EPIC_PRESETS.map(function (p, i) {
        var sel = i === st.epicPreset, cat = CATS[p.cat];
        return {
          title: p.title, sub: 'meta de ' + p.target + ' ' + p.unit, pick: function () { app.setEpicPreset(i); },
          catStyle: pill(cat.color), catLabel: cat.label,
          style: {
            display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 13px', borderRadius: 13, cursor: 'pointer',
            transition: 'all .2s',
            background: sel ? 'rgba(217,165,68,.12)' : 'rgba(255,255,255,.04)',
            border: '1px solid ' + (sel ? 'rgba(217,165,68,.5)' : 'rgba(255,255,255,.09)'),
          },
        };
      }),
      epicDaysValue: st.epicDays,
      epicDaysDec: function () { app.setEpicDays(st.epicDays - 5); },
      epicDaysInc: function () { app.setEpicDays(st.epicDays + 5); },
      epicDaysHint: 'de ' + EPIC.minDays + ' a ' + EPIC.maxDays + ' dias',
      epicXpPreview: '+' + C.xpEpica(st.epicDays) + ' XP',
      epicRewardPreview: '+' + C.xpEpica(st.epicDays) + ' XP · +' + EPIC.gold + ' ouro · +' + EPIC.points + ' pontos de atributo',
      epicCreate: function () { app.createEpic(); },
      epicCancel: function () { app.closeEpicForm(); },

      // ── guilda: estado vazio ───────────────────────────────────────────────
      guildEmpty: st.guildEmpty,
      inviteLink: GUILD_INVITE,
      inviteCopied: st.inviteCopied,
      copyInviteLabel: st.inviteCopied ? 'LINK COPIADO ✓' : 'COPIAR LINK',
      copyInvite: function () { app.copyInvite(); },
      copyInviteStyle: {
        minHeight: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12,
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: '.08em', cursor: 'pointer',
        background: st.inviteCopied ? 'rgba(79,203,180,.16)' : 'linear-gradient(135deg,#6fc8ee,#3f9ecb)',
        border: st.inviteCopied ? '1px solid rgba(79,203,180,.4)' : 'none',
        color: st.inviteCopied ? '#4fcbb4' : '#04141f',
      },
      guildGoalSet: !!gGoal,
      guildGoalTitle: gGoal ? gGoal.title : '',
      guildGoalOptions: GUILD_GOALS.map(function (g, i) {
        var sel = i === st.guildGoalPick, cat = CATS[g.cat];
        return {
          title: g.title, pick: function () { app.setGuildGoalPick(i); },
          dotStyle: {
            flex: 'none', width: 16, height: 16, borderRadius: '50%',
            border: '2px solid ' + (sel ? cat.color : 'rgba(255,255,255,.24)'),
            background: sel ? 'radial-gradient(closest-side,' + cat.color + ' 52%,transparent 56%)' : 'transparent',
            transition: 'all .2s',
          },
          style: {
            display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px', borderRadius: 13, cursor: 'pointer',
            transition: 'all .2s',
            background: sel ? 'rgba(79,203,180,.1)' : 'rgba(255,255,255,.04)',
            border: '1px solid ' + (sel ? 'rgba(79,203,180,.45)' : 'rgba(255,255,255,.09)'),
          },
        };
      }),
      setFirstGuildGoal: function () { app.setFirstGuildGoal(); },
      viewSampleGuild: function () { app.setState({ guildEmpty: false }); },

      // ── Descanso Sagrado ───────────────────────────────────────────────────
      restOpen: st.restOpen,
      restRows: restRows,
      restUsedLabel: restUsed + ' de ' + REST.cap + ' folgas usadas neste mês',
      restRemaining: REST.cap - restUsed,
      openRest: function () { app.openRest(); },
      closeRest: function () { app.closeRest(); },
      noopStop: function () {},

      noop: function () { app.toast('Fora do escopo do protótipo', 'Este fluxo existe na especificação, mas não foi montado aqui.', '#8a97ab'); },
    };
  }

  global.AdmVals = vals;
})(window);
