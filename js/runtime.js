/* Adamante — runtime mínimo.
 *
 * O documento de design roda sobre o runtime do Claude Design (x-dc, sc-if,
 * sc-for, DCLogic). Aqui isso vira JS puro: as telas são funções que devolvem
 * HTML, o estado mora num objeto, e um "morph" costura o HTML novo no DOM
 * existente em vez de trocar innerHTML — se trocasse, toda animação em curso
 * (admDrift, admRing2, admSheen…) reiniciaria a cada setState.
 */
(function (global) {
  'use strict';

  // ── estilos: aceita o mesmo objeto camelCase usado no design ───────────────
  var NUMERIC_OK = {
    opacity: 1, zIndex: 1, flex: 1, flexGrow: 1, flexShrink: 1, fontWeight: 1,
    lineHeight: 1, order: 1, strokeOpacity: 1, fillOpacity: 1, perspective: 0,
  };
  var dashCache = Object.create(null);
  function dash(prop) {
    var v = dashCache[prop];
    if (v) return v;
    v = prop.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); });
    if (v.indexOf('webkit-') === 0 || v.indexOf('ms-') === 0 || v.indexOf('moz-') === 0) v = '-' + v;
    dashCache[prop] = v;
    return v;
  }
  function styleStr(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    var out = '';
    for (var k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      var val = obj[k];
      if (val === null || val === undefined || val === '') continue;
      if (typeof val === 'number' && !NUMERIC_OK[k] && k !== 'perspective') val = val + 'px';
      else if (typeof val === 'number' && k === 'perspective') val = val + 'px';
      out += dash(k) + ':' + val + ';';
    }
    return out;
  }

  // ── escape de texto ───────────────────────────────────────────────────────
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  }

  // ── hover: vira classe CSS real (inline style ganharia do :hover sem isso) ─
  var hoverSheet = null, hoverMap = Object.create(null), hoverSeq = 0;
  function hoverClass(css) {
    if (!css) return '';
    var cls = hoverMap[css];
    if (cls) return cls;
    if (!hoverSheet) {
      var el = document.createElement('style');
      el.setAttribute('data-adm', 'hover');
      document.head.appendChild(el);
      hoverSheet = el.sheet;
    }
    cls = 'admhv' + (++hoverSeq);
    var body = css.split(';').filter(Boolean).map(function (d) {
      var i = d.indexOf(':');
      if (i < 0) return '';
      return d.slice(0, i).trim() + ':' + d.slice(i + 1).trim() + ' !important';
    }).filter(Boolean).join(';');
    try { hoverSheet.insertRule('.' + cls + ':hover{' + body + '}', hoverSheet.cssRules.length); } catch (e) { /* noop */ }
    hoverMap[css] = cls;
    return cls;
  }

  // ── registro de handlers por render ───────────────────────────────────────
  function Handlers() { this.click = []; this.input = []; this.focus = []; this.blur = []; }
  Handlers.prototype.reset = function () { this.click = []; this.input = []; this.focus = []; this.blur = []; };

  // ── morph: costura `next` (árvore solta) dentro de `node` ──────────────────
  function sameKind(a, b) {
    if (a.nodeType !== b.nodeType) return false;
    if (a.nodeType === 1) return a.tagName === b.tagName;
    return true;
  }
  function patchAttrs(el, next) {
    var i, a, na = next.attributes, ea = el.attributes;
    for (i = na.length - 1; i >= 0; i--) {
      a = na[i];
      if (el.getAttribute(a.name) !== a.value) el.setAttribute(a.name, a.value);
    }
    for (i = ea.length - 1; i >= 0; i--) {
      a = ea[i];
      if (!next.hasAttribute(a.name)) el.removeAttribute(a.name);
    }
  }
  function patchInput(el, next) {
    var tag = el.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return;
    // não pisa no campo em foco: destruiria o cursor a cada tecla
    if (document.activeElement === el) return;
    var v = next.getAttribute('value');
    if (v !== null && el.value !== v) el.value = v;
  }
  function morph(node, next) {
    if (node.nodeType === 3) {
      if (node.nodeValue !== next.nodeValue) node.nodeValue = next.nodeValue;
      return;
    }
    if (node.nodeType !== 1) return;
    patchAttrs(node, next);
    patchInput(node, next);
    var oldKids = node.childNodes, newKids = next.childNodes;
    var i = 0;
    while (i < newKids.length) {
      var nk = newKids[i], ok = oldKids[i];
      if (!ok) { node.appendChild(nk.cloneNode(true)); i++; continue; }
      if (!sameKind(ok, nk)) { node.replaceChild(nk.cloneNode(true), ok); i++; continue; }
      morph(ok, nk);
      i++;
    }
    while (oldKids.length > newKids.length) node.removeChild(node.lastChild);
  }

  var scratch = null;
  function patch(root, html) {
    if (!scratch) scratch = document.createElement('div');
    scratch.innerHTML = html;
    var oldKids = root.childNodes, newKids = scratch.childNodes;
    var i = 0;
    while (i < newKids.length) {
      var nk = newKids[i], ok = oldKids[i];
      if (!ok) { root.appendChild(nk.cloneNode(true)); i++; continue; }
      if (!sameKind(ok, nk)) { root.replaceChild(nk.cloneNode(true), ok); i++; continue; }
      morph(ok, nk);
      i++;
    }
    while (oldKids.length > newKids.length) root.removeChild(root.lastChild);
    scratch.innerHTML = '';
  }

  global.AdmRT = {
    s: styleStr, esc: esc, hoverClass: hoverClass, patch: patch, Handlers: Handlers,
  };
})(window);
