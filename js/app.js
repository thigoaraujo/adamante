/* Adamante — bootstrap.
 * Lê as props da query string, monta o app, liga os eventos delegados e
 * reproduz as animações de íris que o documento de design faz via Web Animations.
 */
(function (global) {
  'use strict';

  var RT = global.AdmRT, Views = global.AdmViews, Vals = global.AdmVals, App = global.AdmApp;

  function readProps() {
    var q = new URLSearchParams(location.search);
    var truthy = function (k) { var v = q.get(k); return v === '' || v === '1' || v === 'true' || v === 'yes'; };
    // sem parâmetro, deduz do aparelho: é assim que o APK e o PWA acertam o respiro do topo
    var auto = /android/i.test(navigator.userAgent) ? 'android' : 'ios';
    var plat = q.get('platform') || auto;
    return {
      platform: plat === 'android' ? 'android' : 'ios',
      startScreen: q.get('start') || q.get('startScreen') || 'splash',
      characterName: q.get('name') || q.get('characterName') || '',
      battleMode: q.get('battleMode') === 'livre' ? 'livre' : 'confronto',
      returningUser: q.has('returning') ? truthy('returning') : false,
      guildEmpty: q.get('guild') === 'empty' || (q.has('guildEmpty') && truthy('guildEmpty')),
    };
  }

  function boot() {
    var root = document.getElementById('adm-root');
    if (!root) return;

    var app = new App(readProps());
    app.loadProofPhotos();
    global.adamante = app;

    var handlers = null;

    function draw() {
      var out = Views.render(Vals(app));
      handlers = out.reg;
      RT.patch(root, out.html);
    }
    app._onRender = draw;

    // ── íris: mesma coreografia do documento de design ──────────────────────
    app._irisPlay = function (kind) {
      var CL = 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)';
      var OP = 'polygon(50% -108%, 208% 50%, 50% 208%, -108% 50%)';
      var OG = 'polygon(50% -120%, 220% 50%, 50% 220%, -120% 50%)';
      var cfg = kind === 'cycle' ? { d: 1800, e: 'cubic-bezier(.4,.1,.3,1)' }
        : kind === 'close' ? { d: 740, e: 'cubic-bezier(.26,.58,.16,1)' }
          : { d: 820, e: 'cubic-bezier(.5,0,.35,1)' };

      [['main', OP], ['glow', OG]].forEach(function (pair) {
        root.querySelectorAll('[data-iris="' + pair[0] + '"]').forEach(function (el) {
          if (!el.animate) return;
          el.getAnimations().forEach(function (a) { a.cancel(); });
          var op = pair[1];
          var kf = kind === 'cycle'
            ? [{ clipPath: CL, offset: 0 }, { clipPath: op, offset: 0.4 }, { clipPath: op, offset: 0.56 }, { clipPath: CL, offset: 1 }]
            : kind === 'close' ? [{ clipPath: CL }, { clipPath: op }] : [{ clipPath: op }, { clipPath: CL }];
          el.animate(kf, { duration: cfg.d, easing: cfg.e, fill: 'both' });
        });
      });

      root.querySelectorAll('[data-iris="mark"]').forEach(function (m) {
        if (!m.animate) return;
        m.getAnimations().forEach(function (a) { a.cancel(); });
        var A = 'translate(-50%,-50%) scale(', small = A + '0.82)', full = A + '1)', big = A + '1.1)';
        var mk = kind === 'cycle'
          ? [{ opacity: 0, transform: small, offset: 0 }, { opacity: 0, transform: small, offset: 0.16 },
             { opacity: 1, transform: full, offset: 0.38 }, { opacity: 1, transform: full, offset: 0.58 },
             { opacity: 0, transform: big, offset: 0.86 }, { opacity: 0, transform: big, offset: 1 }]
          : kind === 'close' ? [{ opacity: 0, transform: small }, { opacity: 1, transform: full }]
            : [{ opacity: 1, transform: full }, { opacity: 0, transform: big }];
        m.animate(mk, { duration: cfg.d, easing: 'ease', fill: 'both' });
      });
    };

    // ── eventos delegados ───────────────────────────────────────────────────
    root.addEventListener('click', function (e) {
      var slot = e.target.closest ? e.target.closest('[data-slot]') : null;
      if (slot) { pickPhoto(slot.getAttribute('data-slot')); return; }
      var el = e.target.closest ? e.target.closest('[data-h]') : null;
      if (!el || !root.contains(el)) return;
      var fn = handlers && handlers.click[+el.getAttribute('data-h')];
      if (fn) fn(e);
    });
    root.addEventListener('input', function (e) {
      var el = e.target.closest ? e.target.closest('[data-hin]') : null;
      if (!el) return;
      var fn = handlers && handlers.input[+el.getAttribute('data-hin')];
      if (fn) fn(e);
    });
    root.addEventListener('focusin', function (e) {
      var el = e.target.closest ? e.target.closest('[data-hf]') : null;
      if (!el) return;
      var fn = handlers && handlers.focus[+el.getAttribute('data-hf')];
      if (fn) fn(e);
    });
    root.addEventListener('focusout', function (e) {
      var el = e.target.closest ? e.target.closest('[data-hb]') : null;
      if (!el) return;
      var fn = handlers && handlers.blur[+el.getAttribute('data-hb')];
      if (fn) fn(e);
    });

    // ── §18.2 detecção de app em segundo plano: invalida o bloco de estudo ───
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) app.timerBackgrounded();
    });

    // ── slot de foto de comprovação (substitui o <image-slot> do canvas) ─────
    var filePicker = null;
    function pickPhoto(slotId) {
      if (!filePicker) {
        filePicker = document.createElement('input');
        filePicker.type = 'file';
        filePicker.accept = 'image/*';
        filePicker.style.display = 'none';
        document.body.appendChild(filePicker);
      }
      filePicker.value = '';
      filePicker.onchange = function () {
        if (filePicker.files && filePicker.files[0]) readPhoto(slotId, filePicker.files[0]);
      };
      filePicker.click();
    }
    function readPhoto(slotId, file) {
      var r = new FileReader();
      r.onload = function () { app.setProofPhoto(slotId, r.result); };
      r.readAsDataURL(file);
    }
    root.addEventListener('dragover', function (e) {
      if (e.target.closest && e.target.closest('[data-slot]')) e.preventDefault();
    });
    root.addEventListener('drop', function (e) {
      var slot = e.target.closest ? e.target.closest('[data-slot]') : null;
      if (!slot) return;
      e.preventDefault();
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f && /^image\//.test(f.type)) readPhoto(slot.getAttribute('data-slot'), f);
    });

    draw();
    app.mount();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
