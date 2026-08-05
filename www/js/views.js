/* Adamante — telas.
 * Porte do markup do documento de design (x-dc / sc-if / sc-for) para
 * template strings. A estrutura e os estilos seguem o original linha a linha.
 */
(function (global) {
  'use strict';

  var RT = global.AdmRT;
  var s = RT.s, esc = RT.esc, hoverClass = RT.hoverClass;

  // ── registro de handlers do render corrente ───────────────────────────────
  var reg = { click: [], input: [], focus: [], blur: [] };
  function resetReg() { reg.click = []; reg.input = []; reg.focus = []; reg.blur = []; }
  function on(fn) { if (!fn) return ''; reg.click.push(fn); return ' data-h="' + (reg.click.length - 1) + '"'; }
  function oninput(fn) { if (!fn) return ''; reg.input.push(fn); return ' data-hin="' + (reg.input.length - 1) + '"'; }
  function onfocus(fn) { if (!fn) return ''; reg.focus.push(fn); return ' data-hf="' + (reg.focus.length - 1) + '"'; }
  function onblur(fn) { if (!fn) return ''; reg.blur.push(fn); return ' data-hb="' + (reg.blur.length - 1) + '"'; }
  function hv(css) { var c = hoverClass(css); return c ? ' class="' + c + '"' : ''; }

  var SHIELD = 'assets/adamante-shield.webp';

  // ═══════════════════════════════════════════════════════════════════════════
  // Splash
  // ═══════════════════════════════════════════════════════════════════════════
  function splash(v) {
    return `
<div style="position:relative;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;overflow:hidden">
  <div style="${s(v.bloomGoldStyle)}"></div>
  <div style="position:relative;display:flex;flex-direction:column;align-items:center;animation:admRise .7s cubic-bezier(.2,.8,.2,1) .3s both">
    <div style="position:absolute;width:236px;height:236px;border-radius:50%;border:1px dashed rgba(111,200,238,.4);animation:admRing2 24s linear infinite"></div>
    <div style="position:absolute;width:182px;height:182px;border-radius:50%;border:1px solid rgba(232,196,106,.26);animation:admRing2 32s linear reverse infinite"></div>
    <img src="${SHIELD}" alt="Adamante" style="position:relative;display:block;width:132px;height:auto;filter:drop-shadow(0 0 42px rgba(111,200,238,.5)) drop-shadow(0 0 20px rgba(232,196,106,.35));animation:admDrift 6s ease-in-out infinite">
    <div style="position:relative;font-family:'Bebas Neue',sans-serif;font-size:40px;letter-spacing:.24em;margin-top:18px;color:#e8eef5;text-shadow:0 0 30px rgba(111,200,238,.35)">ADAMANTE</div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:64px;display:flex;flex-direction:column;align-items:center;gap:11px">
    <div style="width:132px;height:2px;background:rgba(255,255,255,.09);border-radius:2px;overflow:hidden"><div style="height:100%;background:linear-gradient(90deg,#6fc8ee,#d9a544);transform-origin:left;animation:admBar 2.05s cubic-bezier(.4,0,.5,1) both"></div></div>
    <div style="font-size:9.5px;letter-spacing:.2em;color:#5a6878;text-transform:uppercase">Forjando o seu personagem</div>
  </div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Login
  // ═══════════════════════════════════════════════════════════════════════════
  function login(v) {
    return `
<div style="position:relative;flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden;animation:admStep .5s cubic-bezier(.2,.8,.2,1)">
  <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none">
    <div style="position:absolute;left:12%;bottom:14%;width:9px;height:9px;border:1.5px solid rgba(111,200,238,.6);transform:rotate(45deg);animation:admRune 14s linear infinite"></div>
    <div style="position:absolute;left:36%;bottom:6%;width:2px;height:13px;background:rgba(232,196,106,.6);animation:admRune 17s linear 3.2s infinite"></div>
    <div style="position:absolute;left:68%;bottom:18%;width:10px;height:10px;border:1.5px solid rgba(232,196,106,.5);border-radius:50%;animation:admRune 19s linear 6.4s infinite"></div>
    <div style="position:absolute;left:86%;bottom:9%;width:8px;height:8px;border-left:1.5px solid rgba(111,200,238,.6);border-bottom:1.5px solid rgba(111,200,238,.6);animation:admRune 15.5s linear 1.6s infinite"></div>
  </div>

  <div style="${s(v.loginTopStyle)}">
    <img src="${SHIELD}" alt="Adamante" style="display:block;width:84px;height:auto;filter:drop-shadow(0 0 30px rgba(111,200,238,.45))">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:31px;letter-spacing:.22em;margin-top:12px;color:#e8eef5">ADAMANTE</div>
    <div style="font-size:12.5px;line-height:1.5;color:#8a97ab;margin-top:6px;text-align:center;max-width:250px;text-wrap:pretty">Seu esforço real vira poder concreto. Entre para continuar de onde parou.</div>
  </div>

  <div style="flex:1;overflow-y:auto;overflow-x:hidden;min-height:0;padding:0 22px">
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="${s(v.fieldEmailStyle)}">
        <div style="font-size:9.5px;letter-spacing:.15em;color:#75839a;text-transform:uppercase;margin-bottom:5px">E-mail</div>
        <input type="email" value="${esc(v.email)}"${oninput(v.setEmail)}${onfocus(v.focusEmail)}${onblur(v.blurField)} placeholder="vesper@exemplo.com" style="width:100%;border:none;outline:none;background:transparent;font-family:Karla,sans-serif;font-size:15px;color:#e8eef5;padding:0">
      </div>
      <div style="${s(v.fieldPassStyle)}">
        <div style="font-size:9.5px;letter-spacing:.15em;color:#75839a;text-transform:uppercase;margin-bottom:5px">Senha</div>
        <div style="display:flex;align-items:center;gap:10px">
          <input type="${esc(v.passType)}" value="${esc(v.senha)}"${oninput(v.setSenha)}${onfocus(v.focusPass)}${onblur(v.blurField)} placeholder="••••••••" style="flex:1;border:none;outline:none;background:transparent;font-family:Karla,sans-serif;font-size:15px;color:#e8eef5;padding:0">
          <div${on(v.togglePass)} style="font-size:10px;letter-spacing:.12em;color:#6fc8ee;text-transform:uppercase;cursor:pointer;min-height:28px;display:flex;align-items:center">${esc(v.passLabel)}</div>
        </div>
      </div>
    </div>

    ${v.loginError ? `
      <div style="display:flex;gap:9px;align-items:flex-start;margin-top:10px;background:rgba(217,165,68,.1);border:1px solid rgba(217,165,68,.34);border-radius:12px;padding:10px 12px;animation:admPop .34s cubic-bezier(.2,.8,.2,1)">
        <div style="width:3px;align-self:stretch;background:#d9a544;border-radius:2px"></div>
        <div style="font-size:11.5px;line-height:1.45;color:#c2cfdd">Preencha e-mail e senha para entrar. No protótipo qualquer valor serve.</div>
      </div>` : ''}

    <div${on(v.doLogin)}${hv('filter:brightness(1.1)')} style="${s(v.loginBtnStyle)}">ENTRAR</div>

    <div style="display:flex;align-items:center;gap:11px;margin:18px 0">
      <div style="flex:1;height:1px;background:rgba(255,255,255,.1)"></div>
      <div style="font-size:9.5px;letter-spacing:.16em;color:#5a6878;text-transform:uppercase">ou</div>
      <div style="flex:1;height:1px;background:rgba(255,255,255,.1)"></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:9px">
      <div${on(v.doLogin)}${hv('border-color:rgba(255,255,255,.3)')} style="min-height:48px;display:flex;align-items:center;justify-content:center;gap:10px;border-radius:13px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);font-size:13px;font-weight:600;color:#e8eef5;cursor:pointer">
        <div style="width:15px;height:15px;border-radius:50%;border:2px solid #6fc8ee;border-right-color:#d9a544;border-bottom-color:#4fcbb4"></div>Continuar com Google
      </div>
      <div${on(v.doLogin)}${hv('border-color:rgba(255,255,255,.3)')} style="${s(v.platformBtnStyle)}">
        <div style="width:13px;height:13px;border-radius:3px;background:#e8eef5"></div>${esc(v.platformBtnLabel)}
      </div>
    </div>

    <div style="display:flex;justify-content:center;gap:18px;margin-top:20px">
      <div${on(v.goCadastro)}${hv('color:#a5e2f7')} style="font-size:12.5px;font-weight:600;color:#6fc8ee;cursor:pointer;min-height:32px;display:flex;align-items:center">Criar conta</div>
      <div style="width:1px;background:rgba(255,255,255,.12)"></div>
      <div${on(v.noop)}${hv('color:#e8eef5')} style="font-size:12.5px;color:#8a97ab;cursor:pointer;min-height:32px;display:flex;align-items:center">Esqueci a senha</div>
    </div>

    <div style="margin-top:22px;padding-top:16px;border-top:1px solid rgba(255,255,255,.08);font-size:10.5px;line-height:1.6;color:#5a6878;text-align:center;text-wrap:pretty">Dado de composição corporal só é coletado depois de consentimento explícito e destacado, e nunca aparece em tela pública.</div>
    <div style="height:26px"></div>
  </div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Cadastro
  // ═══════════════════════════════════════════════════════════════════════════
  function cadastro(v) {
    return `
<div style="position:relative;flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden;animation:admStep .5s cubic-bezier(.2,.8,.2,1)">
  <div style="${s(v.cadTopStyle)}">
    <div${on(v.goLogin)}${hv('color:#e8eef5')} style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#8a97ab;cursor:pointer;min-height:32px"><span style="font-family:'Bebas Neue',sans-serif;font-size:16px">‹</span>Entrar</div>
    <div style="display:flex;align-items:center;gap:11px;margin-top:10px">
      <img src="${SHIELD}" alt="" style="display:block;width:44px;height:auto;filter:drop-shadow(0 0 20px rgba(111,200,238,.4))">
      <div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:29px;line-height:1;letter-spacing:.05em">CRIAR CONTA</div>
        <div style="font-size:11.5px;color:#8a97ab;margin-top:3px">Menos de 3 minutos até a primeira missão</div>
      </div>
    </div>
  </div>

  <div style="flex:1;overflow-y:auto;overflow-x:hidden;min-height:0;padding:0 22px">
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="${s(v.fieldNomeStyle)}">
        <div style="font-size:9.5px;letter-spacing:.15em;color:#75839a;text-transform:uppercase;margin-bottom:5px">Nome completo</div>
        <input type="text" value="${esc(v.nomeCompleto)}"${oninput(v.setNomeCompleto)}${onfocus(v.focusNome)}${onblur(v.blurField)} placeholder="Como está no documento" style="width:100%;border:none;outline:none;background:transparent;font-family:Karla,sans-serif;font-size:15px;color:#e8eef5;padding:0">
      </div>
      <div style="${s(v.fieldNascStyle)}">
        <div style="font-size:9.5px;letter-spacing:.15em;color:#75839a;text-transform:uppercase;margin-bottom:5px">Data de nascimento</div>
        <input type="date" value="${esc(v.nascimento)}"${oninput(v.setNascimento)}${onfocus(v.focusNasc)}${onblur(v.blurField)} style="width:100%;border:none;outline:none;background:transparent;font-family:Karla,sans-serif;font-size:15px;color:#e8eef5;padding:0;color-scheme:dark">
        ${v.ageShown ? `<div style="${s(v.ageNoteStyle)}">${esc(v.ageNote)}</div>` : ''}
      </div>
      <div style="${s(v.fieldUserStyle)}">
        <div style="font-size:9.5px;letter-spacing:.15em;color:#75839a;text-transform:uppercase;margin-bottom:5px">Nome de usuário</div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-family:'Bebas Neue',sans-serif;font-size:17px;color:#5a6878">@</span>
          <input type="text" value="${esc(v.usuario)}"${oninput(v.setUsuario)}${onfocus(v.focusUser)}${onblur(v.blurField)} placeholder="usado para entrar e no ranking" style="flex:1;border:none;outline:none;background:transparent;font-family:Karla,sans-serif;font-size:15px;color:#e8eef5;padding:0">
        </div>
      </div>
      <div style="${s(v.fieldPassStyle)}">
        <div style="font-size:9.5px;letter-spacing:.15em;color:#75839a;text-transform:uppercase;margin-bottom:5px">Senha</div>
        <div style="display:flex;align-items:center;gap:10px">
          <input type="${esc(v.passType)}" value="${esc(v.senha)}"${oninput(v.setSenha)}${onfocus(v.focusPass)}${onblur(v.blurField)} placeholder="mínimo de 8 caracteres" style="flex:1;border:none;outline:none;background:transparent;font-family:Karla,sans-serif;font-size:15px;color:#e8eef5;padding:0">
          <div${on(v.togglePass)} style="font-size:10px;letter-spacing:.12em;color:#6fc8ee;text-transform:uppercase;cursor:pointer;min-height:28px;display:flex;align-items:center">${esc(v.passLabel)}</div>
        </div>
        <div style="display:flex;gap:3px;margin-top:9px">
          ${v.passBars.map(function (p) { return `<div style="${s(p.style)}"></div>`; }).join('')}
        </div>
      </div>
    </div>

    <div style="font-size:9.5px;letter-spacing:.15em;color:#75839a;text-transform:uppercase;margin:18px 0 8px">Sexo biológico</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${v.sexOptions.map(function (o) {
        return `
        <div${on(o.pick)}${hv('border-color:rgba(255,255,255,.28)')} style="${s(o.style)}">
          <div style="${s(o.dotStyle)}"></div>
          <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">${esc(o.label)}</div><div style="font-size:11px;color:#8a97ab;margin-top:2px;line-height:1.4">${esc(o.sub)}</div></div>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;gap:9px;align-items:flex-start;margin-top:12px;background:rgba(111,200,238,.08);border:1px solid rgba(111,200,238,.26);border-radius:14px;padding:12px 13px">
      <div style="width:3px;align-self:stretch;background:#6fc8ee;border-radius:2px"></div>
      <div style="font-size:11.5px;line-height:1.5;color:#c2cfdd;text-wrap:pretty">Serve só para achar a faixa de referência do seu próprio perfil. Ninguém compete contra outro perfil, e este dado nunca aparece em tela pública.</div>
    </div>

    ${v.cadError ? `
      <div style="display:flex;gap:9px;align-items:flex-start;margin-top:12px;background:rgba(217,165,68,.1);border:1px solid rgba(217,165,68,.34);border-radius:12px;padding:10px 12px;animation:admPop .34s cubic-bezier(.2,.8,.2,1)">
        <div style="width:3px;align-self:stretch;background:#d9a544;border-radius:2px"></div>
        <div style="font-size:11.5px;line-height:1.45;color:#c2cfdd">${esc(v.cadErrorMsg)}</div>
      </div>` : ''}

    <div${on(v.doCadastro)}${hv('filter:brightness(1.1)')} style="${s(v.cadBtnStyle)}">CRIAR CONTA</div>
    <div style="margin-top:14px;font-size:10.5px;line-height:1.6;color:#5a6878;text-align:center;text-wrap:pretty">Peso, altura e composição corporal vêm depois, no passo de dados corporais, e só com consentimento explícito.</div>
    <div style="height:26px"></div>
  </div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Onboarding
  // ═══════════════════════════════════════════════════════════════════════════
  function onboarding(v) {
    return `
<div style="position:relative;flex:1;display:flex;flex-direction:column;min-height:0;animation:admIn .4s cubic-bezier(.2,.8,.2,1)">
  <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0">
    <div style="position:absolute;left:9%;bottom:12%;width:9px;height:9px;border:1.5px solid rgba(111,200,238,.7);transform:rotate(45deg);animation:admRune 13s linear infinite"></div>
    <div style="position:absolute;left:24%;bottom:4%;width:2px;height:13px;background:rgba(232,196,106,.75);animation:admRune 16s linear 2.4s infinite"></div>
    <div style="position:absolute;left:41%;bottom:18%;width:11px;height:11px;border:1.5px solid rgba(232,196,106,.6);border-radius:50%;animation:admRune 18s linear 5.1s infinite"></div>
    <div style="position:absolute;left:62%;bottom:8%;width:9px;height:9px;border-left:1.5px solid rgba(111,200,238,.7);border-bottom:1.5px solid rgba(111,200,238,.7);animation:admRune 14.5s linear 1.2s infinite"></div>
    <div style="position:absolute;left:78%;bottom:22%;width:2px;height:11px;background:rgba(111,200,238,.6);animation:admRune 17s linear 7.3s infinite"></div>
    <div style="position:absolute;left:90%;bottom:6%;width:8px;height:8px;border:1.5px solid rgba(232,196,106,.55);transform:rotate(45deg);animation:admRune 15s linear 3.8s infinite"></div>
  </div>
  <div style="${s(v.obHeadStyle)}">
    <img src="${SHIELD}" alt="" style="width:23px;height:auto;">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:.22em;color:#e8eef5">ADAMANTE</div>
    <div style="flex:1"></div>
    <div style="font-size:10px;letter-spacing:.14em;color:#75839a;text-transform:uppercase">${esc(v.obStepLabel)}</div>
  </div>
  <div style="display:flex;gap:4px;padding:12px 18px 0">
    ${v.obDots.map(function (d) { return `<div style="${s(d.style)}"></div>`; }).join('')}
  </div>

  <div style="flex:1;overflow-y:auto;overflow-x:hidden;padding:22px 18px 0;min-height:0">
    ${v.obIs0 ? `
      <div style="animation:admStep .44s cubic-bezier(.2,.8,.2,1)">
        <div style="display:flex;justify-content:center;margin:-4px 0 18px">
          <img src="${SHIELD}" alt="Adamante" style="width:152px;height:auto;filter:drop-shadow(0 0 34px rgba(111,200,238,.5)) drop-shadow(0 12px 26px rgba(0,0,0,.6));animation:admDrift 6.5s ease-in-out infinite">
        </div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:44px;line-height:.94;letter-spacing:.01em;margin-bottom:12px">SEU ESFORÇO<br><span style="color:#d9a544">VIRA PODER</span></div>
        <div style="font-size:14.5px;line-height:1.55;color:#9fadc0;max-width:300px;text-wrap:pretty">Treino, estudo e trabalho alimentam os atributos do seu personagem. Nada aqui é decorativo.</div>
        <div style="display:grid;gap:10px;margin-top:28px">
          <div style="display:grid;grid-template-columns:52px 1fr;align-items:center;gap:13px;padding:11px 13px;border-radius:13px;background:rgba(217,165,68,.08);border:1px solid rgba(217,165,68,.24)">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;line-height:.9;letter-spacing:.02em;color:#d9a544">72h</div>
            <div style="font-size:12.5px;line-height:1.45;color:#e4edf5">é o prazo máximo para o esforço virar poder visível</div>
          </div>
          <div style="display:grid;grid-template-columns:52px 1fr;align-items:center;gap:13px;padding:11px 13px;border-radius:13px;background:rgba(111,200,238,.08);border:1px solid rgba(111,200,238,.24)">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;line-height:.9;letter-spacing:.02em;color:#6fc8ee">ZERO</div>
            <div style="font-size:12.5px;line-height:1.45;color:#e4edf5">progresso conquistado que você possa perder depois</div>
          </div>
          <div style="display:grid;grid-template-columns:52px 1fr;align-items:center;gap:13px;padding:11px 13px;border-radius:13px;background:rgba(79,203,180,.08);border:1px solid rgba(79,203,180,.24)">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;line-height:.9;letter-spacing:.02em;color:#4fcbb4">FEZ</div>
            <div style="font-size:12.5px;line-height:1.45;color:#e4edf5">é o que pontua. Nunca a aparência do seu corpo</div>
          </div>
        </div>
        <div style="margin-top:26px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:11px">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;line-height:.9;letter-spacing:.02em;color:#e8eef5">3 min</div>
          <div style="font-size:11.5px;line-height:1.4;color:#8a97ab">até a sua primeira missão concluída.<br>Compatível com a quinta edição.</div>
        </div>
      </div>` : ''}

    ${v.obIs1 ? `
      <div style="animation:admStep .44s cubic-bezier(.2,.8,.2,1)">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;line-height:1;margin-bottom:8px">DADOS CORPORAIS</div>
        <div style="font-size:13.5px;line-height:1.5;color:#9fadc0;margin-bottom:18px;text-wrap:pretty">Usados só para calibrar sua base contra a faixa esperada do seu próprio perfil. Nada disso fica público.</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:12px 13px"><div style="font-size:10px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:5px">Nascimento</div><div style="font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.03em">${esc(v.nascDisplay)}</div></div>
          <div style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:12px 13px"><div style="font-size:10px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:5px">Altura</div><div style="font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.03em">1,74 m</div></div>
          <div style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:12px 13px"><div style="font-size:10px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:5px">Peso</div><div style="font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.03em">71,2 kg</div></div>
          <div style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:12px 13px"><div style="font-size:10px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:5px">Massa muscular</div><div style="font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.03em">31,8 kg</div></div>
        </div>
        <div style="margin-top:14px;background:rgba(111,200,238,.09);border:1px solid rgba(111,200,238,.26);border-radius:14px;padding:13px 14px">
          <div style="font-size:11px;letter-spacing:.12em;color:#6fc8ee;text-transform:uppercase;margin-bottom:6px">Consentimento de dado sensível</div>
          <div style="font-size:12.5px;line-height:1.5;color:#c2cfdd;text-wrap:pretty">Composição corporal é dado pessoal sensível pela LGPD. Você pode exportar ou apagar tudo a qualquer momento.</div>
          <div${on(v.toggleConsent)}${hv('border-color:rgba(111,200,238,.7)')} style="${s(v.consentStyle)}">
            <div style="${s(v.consentBoxStyle)}">${esc(v.consentMark)}</div>
            <div style="font-size:12.5px;line-height:1.35;color:#e8eef5">Autorizo o uso desses dados apenas dentro do app</div>
          </div>
        </div>
        <div style="margin-top:12px;font-size:11.5px;line-height:1.5;color:#68768a;text-wrap:pretty">Menor de 18 anos? O módulo de composição corporal fica desativado e a base é fixa em 8.</div>
      </div>` : ''}

    ${v.obIs2 ? `
      <div style="animation:admStep .44s cubic-bezier(.2,.8,.2,1)">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;line-height:1;margin-bottom:8px">SUA SEMANA</div>
        <div style="font-size:13.5px;line-height:1.5;color:#9fadc0;margin-bottom:18px;text-wrap:pretty">As missões diárias são geradas às 4h a partir disso. Dia de descanso só gera missão de Mente e Ofício.</div>
        <div style="display:flex;gap:6px;margin-bottom:20px">
          ${v.obDays.map(function (d) {
            return `<div${on(d.toggle)} style="${s(d.style)}">
              <div style="font-size:10px;letter-spacing:.1em;color:#75839a">${esc(d.label)}</div>
              <div style="${s(d.dotStyle)}"></div>
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:9px">
          <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:13px 14px"><div style="width:26px;height:26px;border-radius:8px;background:rgba(217,165,68,.2);border:1px solid rgba(217,165,68,.4)"></div><div style="flex:1"><div style="font-size:13.5px;font-weight:600">Treino</div><div style="font-size:11.5px;color:#8a97ab">4 dias marcados · fim da tarde</div></div></div>
          <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:13px 14px"><div style="width:26px;height:26px;border-radius:8px;background:rgba(111,200,238,.2);border:1px solid rgba(111,200,238,.4)"></div><div style="flex:1"><div style="font-size:13.5px;font-weight:600">Estudo</div><div style="font-size:11.5px;color:#8a97ab">1h30 por dia · cronômetro no app</div></div></div>
          <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:13px 14px"><div style="width:26px;height:26px;border-radius:8px;background:rgba(79,203,180,.2);border:1px solid rgba(79,203,180,.4)"></div><div style="flex:1"><div style="font-size:13.5px;font-weight:600">Trabalho</div><div style="font-size:11.5px;color:#8a97ab">Seg a sex · 9h às 18h</div></div></div>
        </div>
      </div>` : ''}

    ${v.obIs3 ? `
      <div style="animation:admStep .44s cubic-bezier(.2,.8,.2,1)">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;line-height:1;margin-bottom:8px">ESCOLHA A CLASSE</div>
        <div style="font-size:13.5px;line-height:1.5;color:#9fadc0;margin-bottom:6px;text-wrap:pretty">O atributo primário define o dano das suas cartas de ataque. Irreversível até o reset de temporada.</div>
        <div style="height:290px;perspective:1100px;display:flex;align-items:center;justify-content:center;position:relative;margin:6px -18px 0">
          <div style="position:absolute;width:246px;height:246px;border-radius:50%;border:1px dashed rgba(111,200,238,.5);animation:admRing2 26s linear infinite;pointer-events:none"></div>
          <div style="position:absolute;width:186px;height:186px;border-radius:50%;border:1px solid rgba(232,196,106,.28);animation:admRing2 34s linear reverse infinite;pointer-events:none"></div>
          ${v.obClasses.map(function (k) {
            return `<div${on(k.pick)} style="${s(k.style)}">
              <div style="position:absolute;inset:0;border-radius:16px;overflow:hidden;pointer-events:none"><div style="${s(k.sheen)}"></div></div>
              <div style="position:relative;height:96px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.22);overflow:hidden;margin-bottom:11px">
                <img class="adm-art" src="${esc(k.art)}" alt="">
              </div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:27px;line-height:1;letter-spacing:.04em">${esc(k.nome)}</div>
              <div style="${s(k.primStyle)}">${esc(k.prim)}</div>
              <div style="font-size:11.5px;line-height:1.4;color:#c2cfdd;margin-top:9px">${esc(k.passiva)}</div>
              <div style="font-size:11px;line-height:1.4;color:#75839a;margin-top:5px">${esc(k.deck)}</div>
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;justify-content:center;gap:7px;margin-top:14px">
          ${v.obClassDots.map(function (d) { return `<div${on(d.pick)} style="${s(d.style)}"></div>`; }).join('')}
        </div>
      </div>` : ''}

    ${v.obIs4 ? `
      <div style="animation:admStep .44s cubic-bezier(.2,.8,.2,1)">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;line-height:1;margin-bottom:8px">BASE CALIBRADA</div>
        <div style="font-size:13.5px;line-height:1.5;color:#9fadc0;margin-bottom:16px;text-wrap:pretty">Sua base vem do percentil dentro da faixa do seu próprio perfil, entre 6 e 10. Dois corpos diferentes, ambos medianos, começam iguais.</div>
        <div style="display:flex;flex-direction:column;gap:7px">
          ${v.baseRows.map(function (b) {
            return `<div style="display:flex;align-items:center;gap:11px">
              <div style="width:34px;font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.08em;color:#8a97ab">${esc(b.sigla)}</div>
              <div style="flex:1;height:8px;background:rgba(255,255,255,.07);border-radius:4px;overflow:hidden"><div style="${s(b.barStyle)}"></div></div>
              <div style="width:26px;text-align:right;font-family:'Bebas Neue',sans-serif;font-size:20px">${esc(b.base)}</div>
            </div>`;
          }).join('')}
        </div>
        <div style="${s(v.nameCardStyle)}">
          <div style="font-size:10px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:7px">Nome do personagem</div>
          <input type="text" value="${esc(v.nameValue)}"${oninput(v.setName)}${onfocus(v.focusName)}${onblur(v.blurField)} maxlength="14" placeholder="Escolha um nome" style="width:100%;border:none;outline:none;background:transparent;font-family:'Bebas Neue',sans-serif;font-size:31px;letter-spacing:.04em;color:#fff;padding:0">
          <div style="display:flex;align-items:center;gap:8px;margin-top:5px">
            <div style="font-size:12px;color:#8a97ab">${esc(v.clsName)} · nível 1</div>
            <div style="flex:1"></div>
            <div style="font-size:10px;color:#5a6878">${esc(v.nameCount)}</div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;padding-top:11px;border-top:1px solid rgba(255,255,255,.08)">
            <div style="font-size:9.5px;letter-spacing:.13em;color:#5a6878;text-transform:uppercase;width:100%;margin-bottom:2px">Sugestões</div>
            ${v.nameIdeas.map(function (n) {
              return `<div${on(n.pick)}${hv('border-color:rgba(111,200,238,.55)')} style="${s(n.style)}">${esc(n.nome)}</div>`;
            }).join('')}
          </div>
        </div>
      </div>` : ''}
    <div style="height:20px"></div>
  </div>

  <div style="padding:12px 18px;display:flex;gap:10px;align-items:center;border-top:1px solid rgba(255,255,255,.07);background:rgba(8,11,20,.7);backdrop-filter:blur(12px)">
    ${v.obCanBack ? `<div${on(v.obBack)}${hv('border-color:rgba(255,255,255,.3);color:#e8eef5')} style="padding:14px 18px;border-radius:12px;border:1px solid rgba(255,255,255,.14);font-size:13px;font-weight:600;color:#9fadc0;cursor:pointer;min-height:48px;display:flex;align-items:center">Voltar</div>` : ''}
    <div${on(v.obNext)}${hv('filter:brightness(1.08)')} style="${s(v.obNextStyle)}">${esc(v.obNextLabel)}</div>
  </div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Início
  // ═══════════════════════════════════════════════════════════════════════════
  function inicio(v) {
    return `
<div style="animation:admIn .34s cubic-bezier(.2,.8,.2,1)">

  <div style="${s(v.heroStageStyle)}">
    <div style="position:absolute;inset:0;background:radial-gradient(65% 55% at 42% 42%,${v.clsGlow},transparent 72%);pointer-events:none"></div>
    <div style="position:absolute;left:50%;bottom:74px;width:280px;height:130px;margin-left:-140px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.55),transparent);transform:perspective(500px) rotateX(72deg);pointer-events:none"></div>
    <div style="${s(v.heroHazeStyle)}"></div>
    <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none">
      <div style="position:absolute;left:14%;bottom:52px;width:3px;height:3px;border-radius:50%;background:#d9a544;box-shadow:0 0 8px #d9a544;animation:admEmber 7.2s linear infinite"></div>
      <div style="position:absolute;left:27%;bottom:38px;width:2px;height:2px;border-radius:50%;background:#e8c46a;box-shadow:0 0 7px #e8c46a;animation:admEmber 8.6s linear 1.3s infinite"></div>
      <div style="position:absolute;left:38%;bottom:60px;width:2.5px;height:2.5px;border-radius:50%;background:#6fc8ee;box-shadow:0 0 8px #6fc8ee;animation:admEmber 9.4s linear 2.6s infinite"></div>
      <div style="position:absolute;left:56%;bottom:44px;width:2px;height:2px;border-radius:50%;background:#d9a544;box-shadow:0 0 7px #d9a544;animation:admEmber 7.8s linear .7s infinite"></div>
      <div style="position:absolute;left:71%;bottom:56px;width:3px;height:3px;border-radius:50%;background:#e8c46a;box-shadow:0 0 8px #e8c46a;animation:admEmber 10.2s linear 3.4s infinite"></div>
      <div style="position:absolute;left:86%;bottom:40px;width:2px;height:2px;border-radius:50%;background:#6fc8ee;box-shadow:0 0 7px #6fc8ee;animation:admEmber 8.1s linear 4.6s infinite"></div>
    </div>

    <div style="position:relative;display:flex;align-items:flex-start;gap:9px;padding:0 16px">
      <div style="display:flex;align-items:center;gap:8px">
        <img src="${SHIELD}" alt="" style="width:27px;height:auto;">
        <div>
          <div style="font-size:9.5px;letter-spacing:.19em;color:#75839a;text-transform:uppercase">Capítulo I · dia 1</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:.13em;color:#e8eef5;margin-top:2px">ADAMANTE</div>
        </div>
      </div>
      <div style="flex:1"></div>
      <div${on(v.goPerfil)}${hv('border-color:rgba(255,255,255,.26)')} style="display:flex;align-items:center;gap:6px;min-height:34px;padding:0 11px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.11);cursor:pointer">
        <div style="width:6px;height:6px;border-radius:2px;transform:rotate(45deg);background:#8a97ab"></div>
        <span style="font-size:11px;letter-spacing:.09em;color:#9fadc0;text-transform:uppercase">Perfil</span>
      </div>
    </div>

    <div style="position:relative;display:flex;align-items:flex-end;gap:12px;padding:11px 16px 0">
      <div style="position:absolute;left:8px;top:-14px;font-family:'Bebas Neue',sans-serif;font-size:104px;line-height:.8;letter-spacing:-.02em;color:rgba(255,255,255,.055);pointer-events:none">${esc(v.charLevel)}</div>
      <div style="${s(v.heroArtStyle)}">
        <img class="adm-art" src="${esc(v.clsArt)}" alt="">
      </div>
      <div style="position:relative;flex:1;min-width:0;padding-bottom:2px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;line-height:.92;letter-spacing:.04em;color:#fff">${esc(v.charName)}</div>
        <div style="${s(v.clsTagStyle)}">${esc(v.clsName)} · ${esc(v.clsPrim)}</div>
        <div style="display:flex;gap:6px;margin-top:9px">
          <div style="flex:1;background:rgba(0,0,0,.3);border:1px solid rgba(217,165,68,.28);border-radius:9px;padding:5px 8px"><div style="font-family:'Bebas Neue',sans-serif;font-size:17px;line-height:1;letter-spacing:.03em;color:#f0cd85">${esc(v.hpMax)}</div><div style="font-size:7.5px;letter-spacing:.14em;color:#75839a;margin-top:1px">PV MÁX</div></div>
          <div style="flex:1;background:rgba(0,0,0,.3);border:1px solid rgba(111,200,238,.28);border-radius:9px;padding:5px 8px"><div style="font-family:'Bebas Neue',sans-serif;font-size:17px;line-height:1;letter-spacing:.03em;color:#a5e2f7">${esc(v.defense)}</div><div style="font-size:7.5px;letter-spacing:.14em;color:#75839a;margin-top:1px">DEFESA</div></div>
        </div>
      </div>
    </div>

    <div style="position:relative;padding:12px 16px 0">
      <div style="display:flex;align-items:baseline;gap:7px;margin-bottom:6px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:.05em;color:#6fc8ee">${esc(v.xpLabel)}</div>
        <div style="flex:1"></div>
        <div style="font-size:10.5px;color:#8a97ab">${esc(v.xpRemaining)}</div>
      </div>
      <div style="height:10px;border-radius:6px;background:rgba(0,0,0,.42);border:1px solid rgba(255,255,255,.09);overflow:hidden;position:relative">
        <div style="${s(v.heroXpFillStyle)}"></div>
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0,transparent 23px,rgba(0,0,0,.35) 23px,rgba(0,0,0,.35) 24px);pointer-events:none"></div>
        ${v.xpFlashOn ? `<div style="position:absolute;top:0;bottom:0;width:44px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.85),transparent);animation:admFlash .85s cubic-bezier(.3,.7,.3,1) forwards;pointer-events:none"></div>` : ''}
        <div style="position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);animation:admGlint 6s ease-in-out infinite;pointer-events:none"></div>
      </div>
    </div>
  </div>

  <div style="display:flex;gap:6px;padding:10px 16px 0">
    <div style="${s(v.statSeqStyle)}">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:19px;line-height:1;letter-spacing:.03em;color:#f0cd85">${esc(v.streak)}</div>
      <div style="font-size:8px;letter-spacing:.13em;color:#75839a">SEQUÊNCIA</div>
    </div>
    <div style="flex:1;display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.04);border:1px solid rgba(232,196,106,.22);border-radius:11px;padding:7px 10px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:19px;line-height:1;letter-spacing:.03em;color:#e8c46a">${esc(v.gold)}</div>
      <div style="font-size:8px;letter-spacing:.13em;color:#75839a">OURO</div>
    </div>
    <div${on(v.goFadiga)} style="${s(v.statFatStyle)}">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:19px;line-height:1;letter-spacing:.03em;color:${v.fatigueColor}">${esc(v.fatigue)}</div>
      <div style="font-size:8px;letter-spacing:.13em;color:#75839a">FADIGA</div>
    </div>
  </div>

  ${v.hasFatigue ? `
    <div${on(v.goFadiga)} style="position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(127,142,192,.16),rgba(127,142,192,.04));border:1px solid rgba(127,142,192,.32);border-radius:15px;padding:12px 14px;margin:10px 16px 0;cursor:pointer">
      <div style="position:absolute;inset:0;background:radial-gradient(70% 100% at 100% 50%,rgba(127,142,192,.2),transparent);animation:admBreathe 3.4s ease-in-out infinite;pointer-events:none"></div>
      <div style="position:relative;display:flex;gap:3px;margin-bottom:9px">
        ${v.fatigueSegs.map(function (sg) { return `<div style="${s(sg.style)}"></div>`; }).join('')}
      </div>
      <div style="position:relative;font-size:12px;line-height:1.5;color:#c2cfdd;text-wrap:pretty">${esc(v.fatigueMsg)}</div>
    </div>` : ''}

  <div style="display:flex;align-items:baseline;gap:9px;padding:16px 16px 2px">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:23px;line-height:1;letter-spacing:.03em;white-space:nowrap">CONTRATO DO DIA</div>
  </div>
  <div style="font-size:10.5px;color:#75839a;padding:0 16px 8px">O mais pesado de hoje. Conclui e forja uma carta.</div>

  <div style="padding:0 16px">
    ${v.heroMission.map(function (m) {
      return `<div${on(m.toggle)}${hv('border-color:rgba(217,165,68,.6)')} style="${s(m.cardStyle)}">
        <div style="position:absolute;inset:0;border-radius:18px;overflow:hidden;pointer-events:none"><div style="${s(m.sheen)}"></div><div style="${s(m.sweep)}"></div></div>
        <div style="position:relative;display:flex;align-items:center;gap:13px">
          <div style="${s(m.checkStyle)}">${esc(m.checkMark)}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
              <span style="${s(m.catStyle)}">${esc(m.catLabel)}</span>
              <span style="${s(m.forgeStyle)}">forja carta</span>
            </div>
            <div style="${s(m.titleStyle)}">${esc(m.title)}</div>
          </div>
        </div>
        <div style="position:relative;display:flex;align-items:center;gap:14px;margin-top:13px;padding-top:12px;border-top:1px solid rgba(255,255,255,.09)">
          <div><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;line-height:1;letter-spacing:.04em;color:#6fc8ee">${esc(m.xpLabel)}</div><div style="font-size:8.5px;letter-spacing:.14em;color:#68768a;margin-top:2px">EXPERIÊNCIA</div></div>
          <div><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;line-height:1;letter-spacing:.04em;color:#e8c46a">${esc(m.goldLabel)}</div><div style="font-size:8.5px;letter-spacing:.14em;color:#68768a;margin-top:2px">OURO</div></div>
          <div style="flex:1"></div>
          <div style="font-size:10px;color:#5a6878;text-align:right;line-height:1.4">validado por<br><span style="color:#8a97ab">${esc(m.srcLabel)}</span></div>
        </div>
      </div>`;
    }).join('')}
  </div>

  <div style="display:flex;align-items:baseline;gap:9px;padding:16px 16px 8px">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.06em;color:#c2cfdd">MAIS 4 HOJE</div>
    <div style="flex:1"></div>
    <div style="font-size:11px;color:#75839a">${esc(v.missionSummary)}</div>
  </div>

  <div style="display:flex;flex-direction:column;gap:7px;padding:0 16px">
    ${v.restMissions.map(function (m) {
      return `<div${on(m.toggle)}${hv('border-color:rgba(255,255,255,.2)')} style="${s(m.cardStyle)}">
        <div style="${s(m.stripeStyle)}"></div>
        <div style="${s(m.checkStyle)}">${esc(m.checkMark)}</div>
        <div style="flex:1;min-width:0">
          <div style="${s(m.titleStyle)}">${esc(m.title)}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:3px">
            <span style="${s(m.catStyle)}">${esc(m.catLabel)}</span>
            <span style="font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:.06em;color:#6fc8ee">${esc(m.xpLabel)}</span>
            <span style="font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:.06em;color:#e8c46a">${esc(m.goldLabel)}</span>
            <span style="font-size:9.5px;color:#5a6878">${esc(m.srcLabel)}</span>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>

  <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.06em;margin:17px 16px 8px;color:#c2cfdd">SEMANAL</div>
  <div style="margin:0 16px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:14px 15px">
    <div style="font-size:14px;font-weight:600;margin-bottom:3px">Três treinos de força nesta semana</div>
    <div style="font-size:11.5px;color:#8a97ab;margin-bottom:11px">Carta garantida na conclusão</div>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="flex:1;height:7px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden"><div style="${s(v.weeklyBarStyle)}"></div></div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.04em;color:#d9a544">${esc(v.weeklyLabel)}</div>
    </div>
  </div>

  <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.06em;margin:17px 16px 8px;color:#c2cfdd">ÉPICA</div>
  ${v.epicActive ? `
  <div style="margin:0 16px;position:relative;overflow:hidden;border:1px solid rgba(217,165,68,.4);border-radius:16px;padding:14px 15px;background:linear-gradient(150deg,rgba(217,165,68,.14),rgba(255,255,255,.03));animation:admIn .4s cubic-bezier(.2,.8,.2,1)">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="${s(v.epicCatStyle)}">${esc(v.epicCatLabel)}</span>
      <span style="font-size:10px;color:#8a97ab">${esc(v.epicDaysLabel)}</span>
    </div>
    <div style="font-family:'Bebas Neue',sans-serif;font-size:23px;line-height:1.02;letter-spacing:.03em;color:#fff">${esc(v.epicTitle)}</div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:12px">
      <div style="flex:1;height:8px;background:rgba(0,0,0,.42);border-radius:4px;overflow:hidden"><div style="${s(v.epicBarStyle)}"></div></div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.04em;color:#f0cd85">${esc(v.epicPctLabel)}</div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:7px">
      <div style="flex:1;font-size:11.5px;color:#c2cfdd">${esc(v.epicProgLabel)}</div>
      <div style="font-size:10.5px;color:#8a97ab">${esc(v.epicRewardLabel)}</div>
    </div>
    <div style="display:flex;gap:8px;margin-top:13px">
      <div${on(v.epicDone ? v.epicComplete : v.epicAdvance)}${hv('filter:brightness(1.08)')} style="${s(v.epicPrimaryStyle)}">${v.epicDone ? 'CONCLUIR MISSÃO' : 'REGISTRAR PROGRESSO'}</div>
      ${v.epicDone ? '' : `<div${on(v.epicExpire)}${hv('color:#e8eef5')} style="min-height:46px;display:flex;align-items:center;padding:0 14px;border-radius:12px;border:1px solid rgba(255,255,255,.14);font-size:12px;color:#8a97ab;cursor:pointer">Deixar vencer</div>`}
    </div>
    ${v.epicDone ? '' : `<div style="font-size:10.5px;color:#68768a;margin-top:9px;line-height:1.4;text-wrap:pretty">Se o prazo vencer sem concluir, nada é perdido — a missão só expira e pode ser recriada.</div>`}
  </div>` : `
  <div style="margin:0 16px;border:1px dashed rgba(255,255,255,.16);border-radius:16px;padding:14px 15px;text-align:center">
    <div style="font-size:12.5px;color:#9fadc0;line-height:1.5;margin-bottom:11px;text-wrap:pretty">Defina uma meta grande, de 15 a 90 dias. Se o prazo vencer, nada é perdido.</div>
    <div${on(v.openEpic)}${hv('background:rgba(217,165,68,.22)')} style="display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:11px;background:rgba(217,165,68,.14);border:1px solid rgba(217,165,68,.4);font-size:13px;font-weight:600;color:#f0cd85;cursor:pointer">Criar missão épica</div>
  </div>`}
  <div style="height:24px"></div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Ficha
  // ═══════════════════════════════════════════════════════════════════════════
  function ficha(v) {
    return `
<div style="animation:admIn .34s cubic-bezier(.2,.8,.2,1);padding:16px 16px 8px">
  <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px">
    <div style="flex:1">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:29px;line-height:1;letter-spacing:.03em">FICHA</div>
      <div style="font-size:11.5px;color:#75839a;margin-top:4px">${esc(v.clsName)} · atributo primário ${esc(v.clsPrim)}</div>
    </div>
    <div style="display:flex;gap:8px">
      <div style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:8px 11px;text-align:center"><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;line-height:1;color:#d9a544">${esc(v.hpMax)}</div><div style="font-size:8.5px;letter-spacing:.14em;color:#75839a;margin-top:2px">PV</div></div>
      <div style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:8px 11px;text-align:center"><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;line-height:1;color:#6fc8ee">${esc(v.defense)}</div><div style="font-size:8.5px;letter-spacing:.14em;color:#75839a;margin-top:2px">DEF</div></div>
    </div>
  </div>

  <div style="position:relative;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:16px 14px 13px;margin-bottom:16px;overflow:hidden">
    <div style="position:absolute;inset:0;background:radial-gradient(60% 70% at 50% 50%,rgba(111,200,238,.12),transparent 70%);pointer-events:none"></div>
    <div style="position:relative;padding:26px 34px 6px">
      <svg viewBox="0 0 240 200" style="width:100%;height:auto;display:block;position:relative">
        <polygon points="120,18 208,68 208,152 120,182 32,152 32,68" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1"></polygon>
        <polygon points="120,52 179,86 179,134 120,148 61,134 61,86" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"></polygon>
        <line x1="120" y1="100" x2="120" y2="18" stroke="rgba(255,255,255,0.07)"></line>
        <line x1="120" y1="100" x2="208" y2="68" stroke="rgba(255,255,255,0.07)"></line>
        <line x1="120" y1="100" x2="208" y2="152" stroke="rgba(255,255,255,0.07)"></line>
        <line x1="120" y1="100" x2="120" y2="182" stroke="rgba(255,255,255,0.07)"></line>
        <line x1="120" y1="100" x2="32" y2="152" stroke="rgba(255,255,255,0.07)"></line>
        <line x1="120" y1="100" x2="32" y2="68" stroke="rgba(255,255,255,0.07)"></line>
        <polygon points="${esc(v.radarPts)}" fill="rgba(111,200,238,0.22)" stroke="#6fc8ee" stroke-width="1.6" stroke-linejoin="round"></polygon>
      </svg>
      ${v.radarLabels.map(function (l) {
        return `<div style="${s(l.style)}">
          <div style="${s(l.siglaStyle)}">${esc(l.sigla)}</div>
          <div style="${s(l.valStyle)}">${esc(l.val)}</div>
        </div>`;
      }).join('')}
    </div>
    <div style="position:relative;display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:8px;padding-top:11px;border-top:1px solid rgba(255,255,255,.07)">
      <div style="display:flex;align-items:center;gap:6px"><div style="width:16px;height:8px;border-radius:2px;background:rgba(111,200,238,.28);border:1px solid #6fc8ee"></div><span style="font-size:10.5px;color:#8a97ab">valor atual</span></div>
      <div style="display:flex;align-items:center;gap:6px"><div style="width:16px;height:8px;border-radius:2px;border:1px solid rgba(255,255,255,.2)"></div><span style="font-size:10.5px;color:#8a97ab">teto 20</span></div>
      <div style="flex:1"></div>
      <span style="${s(v.radarNoteStyle)}">${esc(v.radarNote)}</span>
    </div>
  </div>

  ${v.hasPoints ? `
    <div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(217,165,68,.16),rgba(217,165,68,.04));border:1px solid rgba(217,165,68,.36);border-radius:14px;padding:12px 14px;margin-bottom:12px;animation:admPop .4s cubic-bezier(.2,.8,.2,1)">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;line-height:1;color:#d9a544">${esc(v.pointsLeft)}</div>
      <div style="flex:1;font-size:12.5px;line-height:1.4;color:#e8eef5">${esc(v.pointsMsg)}</div>
      ${v.hasDraft ? `<div${on(v.commitPoints)}${hv('filter:brightness(1.1)')} style="min-height:44px;display:flex;align-items:center;padding:0 15px;border-radius:11px;background:#d9a544;color:#191202;font-size:12.5px;font-weight:700;cursor:pointer">Confirmar</div>` : ''}
    </div>` : ''}

  <div style="display:flex;flex-direction:column;gap:8px">
    ${v.attrRows.map(function (a) {
      return `<div style="${s(a.rowStyle)}">
        <div style="display:flex;align-items:center;gap:11px">
          <div style="${s(a.modStyle)}">${esc(a.modStr)}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:baseline;gap:7px">
              <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.07em">${esc(a.sigla)}</span>
              <span style="font-size:11px;color:#8a97ab">${esc(a.label)}</span>
              ${a.isPrim ? `<span style="font-size:8.5px;letter-spacing:.13em;color:#f0cd85;border:1px solid rgba(217,165,68,.4);border-radius:4px;padding:1px 4px">PRIMÁRIO</span>` : ''}
            </div>
            <div style="font-size:10.5px;color:#5a6878;margin-top:2px">${esc(a.fonte)}</div>
          </div>
          <div style="text-align:right;margin-right:2px">
            <div style="${s(a.valStyle)}">${esc(a.total)}</div>
            <div style="font-size:9px;color:#5a6878">${esc(a.split)}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:3px">
            <div${on(a.inc)} style="${s(a.incStyle)}">+</div>
            <div${on(a.dec)} style="${s(a.decStyle)}">−</div>
          </div>
        </div>
        <div style="height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;margin-top:9px;display:flex">
          <div style="${s(a.baseBarStyle)}"></div>
          <div style="${s(a.allocBarStyle)}"></div>
        </div>
        ${a.showCost ? `<div style="font-size:10.5px;color:#f0cd85;margin-top:6px">${esc(a.costMsg)}</div>` : ''}
      </div>`;
    }).join('')}
  </div>

  <div${on(v.goMedicao)}${hv('border-color:rgba(111,200,238,.4)')} style="display:flex;align-items:center;gap:12px;margin-top:14px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:14px 15px;cursor:pointer;min-height:44px">
    <div style="flex:1"><div style="font-size:13.5px;font-weight:600">Medição de bioimpedância</div><div style="font-size:11.5px;color:#8a97ab;margin-top:2px">${esc(v.medicaoSub)}</div></div>
    <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:#6fc8ee">›</div>
  </div>
  <div style="height:24px"></div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Medição
  // ═══════════════════════════════════════════════════════════════════════════
  function medicao(v) {
    return `
<div style="animation:admIn .34s cubic-bezier(.2,.8,.2,1);padding:16px 16px 8px">
  <div${on(v.goFicha)}${hv('color:#e8eef5')} style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#8a97ab;cursor:pointer;margin-bottom:12px;min-height:32px"><span style="font-family:'Bebas Neue',sans-serif;font-size:16px">‹</span>Ficha</div>
  <div style="font-family:'Bebas Neue',sans-serif;font-size:29px;line-height:1;letter-spacing:.03em">MEDIÇÃO</div>
  <div style="font-size:11.5px;color:#75839a;margin-top:4px;margin-bottom:16px">Visível só para você. Nunca aparece em ranking ou perfil.</div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:9px">
    <div style="background:rgba(255,255,255,.045);border:1px solid rgba(217,165,68,.3);border-radius:14px;padding:12px 13px"><div style="font-size:9.5px;letter-spacing:.13em;color:#f0cd85;text-transform:uppercase;margin-bottom:5px">Peso · obrigatório</div><div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.03em">71,2 <span style="font-size:14px;color:#8a97ab">kg</span></div></div>
    <div style="background:rgba(255,255,255,.045);border:1px solid rgba(217,165,68,.3);border-radius:14px;padding:12px 13px"><div style="font-size:9.5px;letter-spacing:.13em;color:#f0cd85;text-transform:uppercase;margin-bottom:5px">Músculo · obrigatório</div><div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.03em">31,8 <span style="font-size:14px;color:#8a97ab">kg</span></div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
    <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:11px 12px"><div style="font-size:9.5px;letter-spacing:.13em;color:#68768a;text-transform:uppercase;margin-bottom:4px">Massa magra</div><div style="font-family:'Bebas Neue',sans-serif;font-size:22px">55,4 <span style="font-size:12px;color:#8a97ab">kg</span></div></div>
    <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:11px 12px"><div style="font-size:9.5px;letter-spacing:.13em;color:#68768a;text-transform:uppercase;margin-bottom:4px">Água corporal</div><div style="font-family:'Bebas Neue',sans-serif;font-size:22px">57,1 <span style="font-size:12px;color:#8a97ab">%</span></div></div>
    <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:11px 12px"><div style="font-size:9.5px;letter-spacing:.13em;color:#68768a;text-transform:uppercase;margin-bottom:4px">Gordura corporal</div><div style="font-family:'Bebas Neue',sans-serif;font-size:22px">22,2 <span style="font-size:12px;color:#8a97ab">%</span></div><div style="font-size:9.5px;color:#5a6878;margin-top:3px">registro neutro, sem pontuação</div></div>
    <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:11px 12px"><div style="font-size:9.5px;letter-spacing:.13em;color:#68768a;text-transform:uppercase;margin-bottom:4px">Metabolismo basal</div><div style="font-family:'Bebas Neue',sans-serif;font-size:22px">1.612 <span style="font-size:12px;color:#8a97ab">kcal</span></div></div>
  </div>

  <div style="${s(v.medLockStyle)}">
    <div style="font-size:11px;letter-spacing:.12em;color:#6fc8ee;text-transform:uppercase;margin-bottom:6px">${esc(v.medLockTitle)}</div>
    <div style="font-size:12.5px;line-height:1.5;color:#c2cfdd;text-wrap:pretty">${esc(v.medLockMsg)}</div>
  </div>

  <div${on(v.registrarMedicao)}${hv('filter:brightness(1.08)')} style="${s(v.medBtnStyle)}">${esc(v.medBtnLabel)}</div>

  <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.06em;margin:24px 0 4px;color:#c2cfdd">SUA EVOLUÇÃO</div>
  <div style="font-size:11px;color:#68768a;margin-bottom:12px">Massa magra, últimas 8 medições · só você vê isto</div>
  <div style="background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px 14px 12px">
    <div style="display:flex;align-items:flex-end;gap:6px;height:112px">
      ${v.evoBars.map(function (b) {
        return `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;height:100%">
          <div style="${s(b.style)}"></div>
          <div style="font-size:8.5px;color:#5a6878">${esc(b.label)}</div>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:12px;padding-top:11px;border-top:1px solid rgba(255,255,255,.07)">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:17px;color:#4fcbb4;letter-spacing:.04em">+1,4 kg</div>
      <div style="font-size:11.5px;color:#8a97ab">desde a primeira medição</div>
    </div>
  </div>
  <div style="height:24px"></div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Deck
  // ═══════════════════════════════════════════════════════════════════════════
  function deck(v) {
    return `
<div style="animation:admIn .34s cubic-bezier(.2,.8,.2,1);padding:16px 16px 8px">
  <div style="font-family:'Bebas Neue',sans-serif;font-size:29px;line-height:1;letter-spacing:.03em">DECK</div>
  <div style="font-size:11.5px;color:#75839a;margin-top:4px;margin-bottom:14px">${esc(v.deckSummary)}</div>

  <div style="display:flex;gap:7px;margin-bottom:16px">
    ${v.deckStats.map(function (st2) {
      return `<div style="flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:9px 6px;text-align:center">
        <div style="${s(st2.valStyle)}">${esc(st2.val)}</div>
        <div style="font-size:8.5px;letter-spacing:.11em;color:#68768a;text-transform:uppercase;margin-top:2px">${esc(st2.label)}</div>
      </div>`;
    }).join('')}
  </div>

  <div style="font-size:11px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:10px">Reforja · 5 repetidas viram 1 superior</div>
  ${v.reforjaEmpty ? `
  <div style="border:1px dashed rgba(255,255,255,.14);border-radius:14px;padding:13px 14px;margin-bottom:18px;font-size:12px;color:#8a97ab;line-height:1.5;text-wrap:pretty">Junte 5 cópias repetidas da mesma carta para forjar uma de raridade acima. Repetidas vêm de missões que fabricam a carta que você já tem.</div>` : `
  <div style="display:flex;flex-direction:column;gap:9px;margin-bottom:18px">
    ${v.reforjaRows.map(function (r) {
      return `<div style="${s(r.wrapStyle)}">
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">
          <div style="flex:1;min-width:0">
            <div style="font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.nome)}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:5px">
              <span style="${s(r.curChip)}">${esc(r.curLabel)}</span>
              <span style="font-family:'Bebas Neue',sans-serif;font-size:14px;color:#8a97ab">›</span>
              <span style="${s(r.nextChip)}">${esc(r.nextLabel)}</span>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11.5px;color:#c2cfdd">${esc(r.countLabel)}</div>
            <div style="display:flex;align-items:center;gap:4px;justify-content:flex-end;margin-top:2px"><div style="width:6px;height:6px;border-radius:50%;background:#e8c46a"></div><span style="font-size:11px;color:#e8c46a">${esc(r.costLabel)}</span></div>
          </div>
        </div>
        <div style="height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;margin-bottom:11px"><div style="${s(r.barStyle)}"></div></div>
        <div${on(r.reforge)}${hv('filter:brightness(1.08)')} style="${s(r.btnStyle)}">${esc(r.btnLabel)}</div>
      </div>`;
    }).join('')}
  </div>`}

  <div style="font-size:11px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:10px">Coleção · toque para virar</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:11px">
    ${v.collection.map(function (c) {
      return `<div${on(c.flip)} style="perspective:900px;cursor:pointer;height:206px">
        <div style="${s(c.innerStyle)}">
          <div style="${s(c.faceStyle)}">
            <div style="position:absolute;inset:0;border-radius:14px;overflow:hidden;pointer-events:none"><div style="${s(c.sheen)}"></div></div>
            <div style="position:relative;display:flex;align-items:center;gap:6px">
              <div style="${s(c.costStyle)}">${esc(c.custo)}</div>
              <div style="flex:1"></div>
              <div style="${s(c.rarStyle)}">${esc(c.rarLabel)}</div>
            </div>
            <div style="position:relative;flex:1;border-radius:9px;border:1px solid ${'rgba(255,255,255,.1)'};background:rgba(0,0,0,.22);margin:8px 0;overflow:hidden"><img class="adm-art" src="${esc(c.art)}" alt=""></div>
            <div style="position:relative;font-family:'Bebas Neue',sans-serif;font-size:17px;line-height:1.05;letter-spacing:.03em">${esc(c.nome)}</div>
            <div style="position:relative;display:flex;align-items:baseline;gap:5px;margin-top:3px">
              <span style="${s(c.numStyle)}">${esc(c.num)}</span>
              <span style="font-size:9.5px;color:#75839a">${esc(c.numLabel)}</span>
            </div>
          </div>
          <div style="${s(c.backStyle)}">
            <div style="font-size:9px;letter-spacing:.13em;color:#75839a;text-transform:uppercase">Origem</div>
            <div style="font-size:12px;line-height:1.4;color:#e8eef5;margin-top:4px">${esc(c.src)}</div>
            <div style="height:1px;background:rgba(255,255,255,.1);margin:10px 0"></div>
            <div style="font-size:11.5px;line-height:1.45;color:#c2cfdd;flex:1">${esc(c.txt)}</div>
            <div style="font-size:10.5px;color:#8a97ab;margin-top:8px">Escala com <span style="color:#6fc8ee">${esc(c.esc)}</span></div>
            <div style="font-size:10.5px;color:#8a97ab">${esc(c.copies)} no deck</div>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>
  <div style="height:24px"></div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Batalha
  // ═══════════════════════════════════════════════════════════════════════════
  function batalhaIdle(v) {
    return `
<div style="padding:16px 16px 8px">
  <div style="font-family:'Bebas Neue',sans-serif;font-size:29px;line-height:1;letter-spacing:.03em">BATALHA</div>
  <div style="font-size:11.5px;color:#75839a;margin-top:4px;margin-bottom:16px">Derrota não tira nada. Você perde só o tempo da partida.</div>
  <div style="position:relative;overflow:hidden;background:linear-gradient(150deg,rgba(217,165,68,.13),rgba(255,255,255,.03));border:1px solid rgba(217,165,68,.3);border-radius:18px;padding:16px">
    <div style="position:absolute;inset:0;background:radial-gradient(70% 90% at 90% 10%,rgba(217,165,68,.2),transparent 70%);pointer-events:none"></div>
    <div style="position:relative;font-size:10.5px;letter-spacing:.14em;color:#f0cd85;text-transform:uppercase;margin-bottom:8px">Capítulo I · encontro 1 de 10</div>
    <div style="position:relative;display:flex;gap:13px;align-items:center">
      <div style="width:88px;height:104px;border-radius:11px;border:1px solid rgba(217,165,68,.34);background:rgba(0,0,0,.25);overflow:hidden;flex:none;animation:admDrift 5s ease-in-out infinite"><img class="adm-art" src="${esc(v.monArt)}" alt=""></div>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:25px;line-height:1;letter-spacing:.03em">SENTINELA DE ESCÓRIA</div>
        <div style="font-size:11.5px;color:#9fadc0;margin-top:5px;line-height:1.45;text-wrap:pretty">Nível 3 · 48 PV · comportamento determinístico. O padrão dele é aprendível.</div>
      </div>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:9px;margin-top:14px">
    <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px 14px"><div style="font-family:'Bebas Neue',sans-serif;font-size:19px;color:#6fc8ee;width:34px">20</div><div style="flex:1;font-size:12.5px;color:#c2cfdd">cartas no deck ativo</div></div>
    <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px 14px"><div style="font-family:'Bebas Neue',sans-serif;font-size:19px;color:#d9a544;width:34px">${esc(v.hpMax)}</div><div style="flex:1;font-size:12.5px;color:#c2cfdd">PV máximo, com ${esc(v.clsName)}</div></div>
    ${v.pvpBlocked ? `<div style="display:flex;align-items:center;gap:10px;background:rgba(127,142,192,.12);border:1px solid rgba(127,142,192,.32);border-radius:14px;padding:12px 14px"><div style="font-size:12.5px;line-height:1.45;color:#c2cfdd">PvP bloqueado enquanto a Fadiga estiver em 6 ou mais. Conclua as diárias de hoje.</div></div>` : ''}
  </div>
  <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.06em;margin:20px 0 4px;color:#c2cfdd">ESTILO DE COMBATE</div>
  <div style="font-size:11px;color:#75839a;margin-bottom:11px">Você escolhe. Os dois usam o mesmo deck e as mesmas cartas.</div>
  <div style="display:flex;flex-direction:column;gap:9px">
    ${v.modeOptions.map(function (m) {
      return `<div${on(m.pick)}${hv('border-color:rgba(255,255,255,.28)')} style="${s(m.style)}">
        <div style="display:flex;align-items:center;gap:11px">
          <div style="${s(m.dotStyle)}"></div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:19px;line-height:1;letter-spacing:.05em">${esc(m.title)}</div>
            <div style="font-size:11.5px;line-height:1.45;color:#9fadc0;margin-top:5px;text-wrap:pretty">${esc(m.desc)}</div>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>
  <div${on(v.startBattle)}${hv('filter:brightness(1.08)')} style="margin-top:16px;min-height:52px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:linear-gradient(135deg,#d9a544,#b8842c);color:#191202;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.1em;cursor:pointer;box-shadow:0 8px 24px rgba(217,165,68,.3)">ENTRAR EM COMBATE</div>
  <div style="height:24px"></div>
</div>`;
  }

  function batalhaActive(v) {
    return `
<div style="flex:1;display:flex;flex-direction:column;min-height:0;position:relative">
  <div style="flex:1;min-height:0;position:relative;overflow:hidden;perspective:1000px;perspective-origin:50% 34%;background:linear-gradient(180deg,#05080f 0%,#0a1020 46%,#101828 100%)">

    <div style="${s(v.worldStyle)}">
      <div style="position:absolute;left:-45%;right:-45%;bottom:0;height:560px;transform:rotateX(74deg);transform-origin:bottom center;background-image:linear-gradient(rgba(111,200,238,.42) 1px,transparent 1px),linear-gradient(90deg,rgba(111,200,238,.42) 1px,transparent 1px);background-size:64px 64px;animation:admScan 3.4s linear infinite;pointer-events:none"></div>
      <div style="position:absolute;left:-45%;right:-45%;bottom:0;height:560px;transform:rotateX(74deg);transform-origin:bottom center;background:radial-gradient(closest-side at 50% 88%,rgba(217,165,68,.5),transparent 62%);animation:admGround 4.2s ease-in-out infinite;pointer-events:none"></div>
      <div style="position:absolute;left:0;right:0;bottom:47%;height:150px;background:linear-gradient(180deg,rgba(7,11,22,0),rgba(7,11,22,.86) 66%,#080d18);pointer-events:none"></div>
      <div style="position:absolute;left:0;right:0;bottom:47%;height:1px;background:linear-gradient(90deg,transparent,rgba(111,200,238,.5),transparent);pointer-events:none"></div>

      ${v.impactOn ? `<div style="position:absolute;left:50%;bottom:15%;width:210px;height:210px;margin-left:-105px;border-radius:50%;border:3px solid rgba(217,165,68,.9);box-shadow:0 0 34px rgba(217,165,68,.6),inset 0 0 26px rgba(217,165,68,.4);transform-origin:center;animation:admRing .7s cubic-bezier(.15,.75,.25,1) forwards;pointer-events:none"></div>` : ''}

      <div style="${s(v.enemyGroupStyle)}">
        <div style="position:absolute;left:50%;bottom:-16px;width:150px;height:52px;margin-left:-75px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.8),transparent);transform:rotateX(74deg);pointer-events:none"></div>
        <div style="${s(v.enemyArtStyle)}">
          <div style="position:absolute;inset:0;background:linear-gradient(160deg,rgba(217,165,68,.22),transparent 62%);pointer-events:none"></div>
          <img class="adm-art" src="${esc(v.monArt)}" alt="" style="position:relative">

          ${v.impactOn ? `<div style="position:absolute;inset:-20%;overflow:hidden;pointer-events:none">
            <div style="position:absolute;left:0;top:0;width:100%;height:44%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.95),transparent);filter:blur(2px);animation:admSlash .5s cubic-bezier(.3,.7,.2,1) forwards"></div>
          </div>` : ''}
        </div>
        ${v.floaters.map(function (f) { return `<div style="${s(f.style)}">${esc(f.text)}</div>`; }).join('')}
      </div>
    </div>

    <div style="${s(v.battleTopStyle)}">
      <div style="display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:13px;background:rgba(5,8,15,.62);border:1px solid rgba(217,165,68,.28);backdrop-filter:blur(12px)">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:baseline;gap:7px;margin-bottom:5px">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">SENTINELA DE ESCÓRIA</div>
            <div style="flex:1"></div>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:.04em;color:#f0cd85">${esc(v.enemyHpLabel)}</div>
          </div>
          <div style="height:8px;background:rgba(0,0,0,.5);border-radius:5px;overflow:hidden;border:1px solid rgba(255,255,255,.08)"><div style="${s(v.enemyHpStyle)}"></div></div>
        </div>
      </div>
      <div style="display:flex;justify-content:center;margin-top:8px">
        <div style="display:inline-flex;align-items:center;gap:7px;padding:6px 11px;border-radius:9px;background:rgba(5,8,15,.6);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(10px)">
          <div style="width:6px;height:6px;border-radius:2px;transform:rotate(45deg);background:#d9a544;animation:admBreathe 1.8s ease-in-out infinite"></div>
          <span style="font-size:10.5px;color:#c2cfdd">${esc(v.roundHint)}</span>
        </div>
      </div>
    </div>

    ${v.modeConfronto ? `
      <div style="position:absolute;left:0;right:0;top:0;bottom:0;z-index:25;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;perspective:1000px;pointer-events:none">
        <div style="${s(v.clashSlotStyle)}">
          <div style="${s(v.clashEnemyInner)}">
            <div style="${s(v.clashBackStyle)}">
              <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.1em;color:#f0cd85">◈</div>
              <div style="font-size:7.5px;letter-spacing:.16em;color:#8a97ab;text-transform:uppercase;margin-top:4px;text-align:center;line-height:1.5">carta<br>escolhida</div>
            </div>
            <div style="${s(v.clashEnemyFace)}">
              <div style="font-size:7.5px;letter-spacing:.15em;color:#f0cd85;text-transform:uppercase">Sentinela</div>
              <div style="flex:1;border-radius:6px;border:1px dashed rgba(255,255,255,.16);background:rgba(0,0,0,.3);margin:5px 0"></div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:13px;line-height:1.02;letter-spacing:.02em">${esc(v.enemyCardName)}</div>
              <div style="${s(v.enemyCardNumStyle)}">${esc(v.enemyCardNum)}</div>
            </div>
          </div>
        </div>

        ${v.verdictOn ? `
          <div style="${s(v.verdictStyle)}">
            <div style="${s(v.verdictTitleStyle)}">${esc(v.verdictTitle)}</div>
            <div style="font-size:11px;line-height:1.4;color:#c2cfdd;text-align:center;margin-top:3px;text-wrap:pretty">${esc(v.verdictDetail)}</div>
          </div>` : ''}
        ${v.awaitingOn ? `
          <div style="display:flex;align-items:center;gap:8px;padding:7px 13px;border-radius:10px;background:rgba(5,8,15,.72);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(10px)">
            <div style="width:5px;height:5px;border-radius:2px;transform:rotate(45deg);background:#6fc8ee;animation:admBreathe 1.4s ease-in-out infinite"></div>
            <span style="font-size:10.5px;letter-spacing:.06em;color:#9fadc0">aguardando as duas cartas</span>
          </div>` : ''}

        <div style="${s(v.clashSlotStyle)}">
          <div style="${s(v.clashPlayerInner)}">
            <div style="${s(v.clashEmptyStyle)}">
              <div style="font-size:7.5px;letter-spacing:.15em;color:#5a6878;text-transform:uppercase;text-align:center;line-height:1.6">escolha<br>uma carta</div>
            </div>
            <div style="${s(v.clashPlayerFace)}">
              <div style="font-size:7.5px;letter-spacing:.15em;color:#6fc8ee;text-transform:uppercase">Você</div>
              <div style="flex:1;border-radius:6px;border:1px dashed rgba(255,255,255,.16);background:rgba(0,0,0,.3);margin:5px 0"></div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:13px;line-height:1.02;letter-spacing:.02em">${esc(v.playerCardName)}</div>
              <div style="${s(v.playerCardNumStyle)}">${esc(v.playerCardNum)}</div>
            </div>
          </div>
        </div>
      </div>` : ''}

    ${(v.modeLivre && v.hasFlying) ? `<div style="${s(v.flyingStyle)}">${esc(v.flyingName)}</div>` : ''}

    <div style="position:absolute;left:14px;right:14px;bottom:8px;display:flex;flex-direction:column;gap:4px;z-index:15;pointer-events:none">
      ${v.battleLog.map(function (l) { return `<div style="${s(l.style)}">${esc(l.text)}</div>`; }).join('')}
    </div>
  </div>

  <div style="flex:none;padding:10px 14px 0;border-top:1px solid rgba(255,255,255,.08);background:rgba(8,11,20,.6);backdrop-filter:blur(14px)">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:9px">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:7px">
          <div style="flex:1;height:11px;background:rgba(0,0,0,.4);border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,.08)"><div style="${s(v.heroHpStyle)}"></div></div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.04em;color:#d9a544">${esc(v.heroHpLabel)}</div>
        </div>
      </div>
      <div style="display:flex;gap:3px;align-items:center">
        ${v.energyPips.map(function (p) { return `<div style="${s(p.style)}"></div>`; }).join('')}
        <div style="font-family:'Bebas Neue',sans-serif;font-size:15px;color:#6fc8ee;margin-left:3px;letter-spacing:.04em">${esc(v.energyLabel)}</div>
      </div>
    </div>
    <div style="height:186px;perspective:820px;perspective-origin:50% 130%;display:flex;align-items:flex-end;justify-content:center;position:relative;transform-style:preserve-3d">
      ${v.hand.map(function (c) {
        return `<div style="${s(c.wrapStyle)}">
          <div${on(c.play)}${hv('transform:translateY(-20px) translateZ(46px) scale(1.07);filter:brightness(1.18)')} style="${s(c.style)}">
            <div style="display:flex;align-items:center;gap:4px"><div style="${s(c.costStyle)}">${esc(c.custo)}</div><div style="flex:1"></div><div style="${s(c.rarDot)}"></div></div>
            <div style="flex:1;border-radius:6px;border:1px dashed rgba(255,255,255,.14);background:rgba(255,255,255,.03);margin:5px 0"></div>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:12.5px;line-height:1.02;letter-spacing:.02em">${esc(c.nome)}</div>
            <div style="${s(c.numStyle)}">${esc(c.numShort)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div style="position:relative;z-index:40;display:flex;gap:9px;padding:10px 0 12px;margin-top:2px">
      <div${on(v.primaryAction)}${hv('filter:brightness(1.12)')} style="${s(v.primaryActionStyle)}">${esc(v.primaryActionLabel)}</div>
      <div${on(v.fleeBattle)}${hv('color:#e8eef5')} style="min-height:48px;display:flex;align-items:center;padding:0 15px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(7,11,22,.7);font-size:12.5px;color:#8a97ab;cursor:pointer;backdrop-filter:blur(10px)">Sair</div>
    </div>
  </div>
</div>`;
  }

  function batalhaOver(v) {
    return `
<div style="flex:1;position:relative;overflow:hidden">
  <div data-iris="glow" style="${s(v.irisGlowStyle)}"></div><div data-iris="main" style="${s(v.irisStyle)}"></div>
  ${v.resultWin ? `<div style="${s(v.bloomGoldStyle)}"></div>` : ''}
  <div style="${s(v.resultContentStyle)}">
    <div style="${s(v.resultTitleStyle)}">${esc(v.resultTitle)}</div>
    <div style="font-size:13.5px;line-height:1.5;color:#9fadc0;max-width:270px;margin-top:8px;text-wrap:pretty">${esc(v.resultMsg)}</div>
    <div style="display:flex;gap:9px;margin-top:22px">
      ${v.resultRewards.map(function (r) {
        return `<div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:12px 16px;animation:admPop .5s cubic-bezier(.2,.8,.2,1) both;animation-delay:${r.delay}">
          <div style="${s(r.valStyle)}">${esc(r.val)}</div>
          <div style="font-size:9px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-top:3px">${esc(r.label)}</div>
        </div>`;
      }).join('')}
    </div>
    <div${on(v.resetBattle)}${hv('filter:brightness(1.08)')} style="position:relative;margin-top:26px;min-height:50px;display:flex;align-items:center;padding:0 26px;border-radius:13px;background:linear-gradient(135deg,#d9a544,#b8842c);color:#191202;font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:.1em;cursor:pointer">VOLTAR</div>
  </div>
</div>`;
  }

  function batalha(v) {
    return `
<div style="animation:admIn .34s cubic-bezier(.2,.8,.2,1);height:100%;display:flex;flex-direction:column">
  ${v.battleIdle ? batalhaIdle(v) : ''}
  ${v.battleActive ? batalhaActive(v) : ''}
  ${v.battleOver ? batalhaOver(v) : ''}
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Guilda
  // ═══════════════════════════════════════════════════════════════════════════
  // ── guilda: estado vazio (convite por link + primeira meta coletiva) ──────
  function guildaEmpty(v) {
    return `
<div style="animation:admIn .34s cubic-bezier(.2,.8,.2,1);padding:16px 16px 8px">
  <div style="font-family:'Bebas Neue',sans-serif;font-size:29px;line-height:1;letter-spacing:.03em">SUA GUILDA</div>
  <div style="font-size:11.5px;color:#75839a;margin-top:4px;margin-bottom:14px">Você ainda não tem membros. Comece convidando quem treina com você.</div>

  <div style="display:flex;gap:9px;align-items:flex-start;background:rgba(111,200,238,.08);border:1px solid rgba(111,200,238,.26);border-radius:14px;padding:12px 13px;margin-bottom:16px">
    <div style="width:3px;align-self:stretch;background:#6fc8ee;border-radius:2px"></div>
    <div style="font-size:11.5px;line-height:1.5;color:#c2cfdd;text-wrap:pretty">Numa guilda, os membros veem e confirmam as missões uns dos outros — a maioria libera o XP integral. É o antifraude mais barato que existe: o constrangimento social.</div>
  </div>

  <div style="font-size:11px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:9px">Convite por link</div>
  <div style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:14px 15px;margin-bottom:18px">
    <div style="font-size:12.5px;color:#9fadc0;line-height:1.5;margin-bottom:11px;text-wrap:pretty">Quem abrir este link entra direto na guilda. Ele vale para até 10 membros.</div>
    <div style="display:flex;align-items:center;gap:9px;background:rgba(0,0,0,.34);border:1px solid rgba(255,255,255,.1);border-radius:11px;padding:11px 13px;margin-bottom:11px">
      <div style="flex:1;min-width:0;font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.05em;color:#a5e2f7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(v.inviteLink)}</div>
      <div style="width:7px;height:7px;border-radius:2px;transform:rotate(45deg);background:#6fc8ee"></div>
    </div>
    <div${on(v.copyInvite)}${hv('filter:brightness(1.08)')} style="${s(v.copyInviteStyle)}">${esc(v.copyInviteLabel)}</div>
  </div>

  <div style="font-size:11px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:9px">Primeira meta coletiva</div>
  ${v.guildGoalSet ? `
  <div style="position:relative;overflow:hidden;background:linear-gradient(150deg,rgba(79,203,180,.14),rgba(255,255,255,.03));border:1px solid rgba(79,203,180,.4);border-radius:16px;padding:14px 15px;animation:admIn .4s cubic-bezier(.2,.8,.2,1)">
    <div style="font-size:10px;letter-spacing:.14em;color:#4fcbb4;text-transform:uppercase;margin-bottom:5px">Meta definida</div>
    <div style="font-size:14px;font-weight:600;margin-bottom:11px">${esc(v.guildGoalTitle)}</div>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="flex:1;height:7px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden"><div style="height:100%;width:2%;background:linear-gradient(90deg,#4fcbb4,#6fc8ee);border-radius:4px"></div></div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:.04em;color:#4fcbb4">0%</div>
    </div>
    <div style="font-size:10.5px;color:#68768a;margin-top:10px;line-height:1.45;text-wrap:pretty">Aguardando os primeiros membros. Quando a guilda fechar a meta, a recompensa vai para todos.</div>
  </div>` : `
  <div style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:14px 15px">
    <div style="font-size:12.5px;color:#9fadc0;line-height:1.5;margin-bottom:12px;text-wrap:pretty">Escolha o objetivo comum com que a guilda nasce. Fechá-lo libera recompensa para todos os membros.</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:13px">
      ${v.guildGoalOptions.map(function (g) {
        return `<div${on(g.pick)} style="${s(g.style)}">
          <div style="${s(g.dotStyle)}"></div>
          <div style="flex:1;font-size:13px;font-weight:600;color:#e8eef5">${esc(g.title)}</div>
        </div>`;
      }).join('')}
    </div>
    <div${on(v.setFirstGuildGoal)}${hv('filter:brightness(1.08)')} style="min-height:48px;display:flex;align-items:center;justify-content:center;border-radius:13px;background:linear-gradient(135deg,#4fcbb4,#2a8a7a);font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.08em;color:#04140f;cursor:pointer">DEFINIR PRIMEIRA META</div>
  </div>`}

  <div${on(v.viewSampleGuild)}${hv('color:#e8eef5')} style="display:inline-flex;align-items:center;gap:6px;margin-top:16px;font-size:12px;color:#8a97ab;cursor:pointer;min-height:32px">Ver uma guilda de exemplo <span style="font-family:'Bebas Neue',sans-serif;font-size:16px">›</span></div>
  <div style="height:24px"></div>
</div>`;
  }

  function guilda(v) {
    if (v.guildEmpty) return guildaEmpty(v);
    return `
<div style="animation:admIn .34s cubic-bezier(.2,.8,.2,1);padding:16px 16px 8px">
  <div style="font-family:'Bebas Neue',sans-serif;font-size:29px;line-height:1;letter-spacing:.03em">FORJA CINZENTA</div>
  <div style="font-size:11.5px;color:#75839a;margin-top:4px;margin-bottom:13px">6 de 10 membros · maioria de 4 valida uma missão</div>

  <div style="display:flex;gap:5px;padding:4px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;margin-bottom:14px">
    ${v.guildTabs.map(function (t) { return `<div${on(t.pick)} style="${s(t.style)}">${esc(t.label)}</div>`; }).join('')}
  </div>

  ${v.gTabHoje ? `
  <div style="animation:admStep .4s cubic-bezier(.2,.8,.2,1)">
    <div${on(v.openMyThread)}${hv('border-color:rgba(217,165,68,.7)')} style="${s(v.myProofStyle)}">
      <div style="display:flex;align-items:center;gap:11px">
        <div style="${s(v.myProofIconStyle)}">${esc(v.myProofIcon)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:10px;letter-spacing:.14em;color:#f0cd85;text-transform:uppercase">Sua comprovação</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:21px;line-height:1.04;letter-spacing:.03em;margin-top:3px">Treino de força · 45 min</div>
          <div style="font-size:11.5px;color:#c2cfdd;margin-top:4px">${esc(v.myProofMsg)}</div>
        </div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:#d9a544">›</div>
      </div>
      ${v.myProofSent ? `
        <div style="display:flex;align-items:center;gap:8px;margin-top:11px;padding-top:11px;border-top:1px solid rgba(255,255,255,.09)">
          <div style="flex:1;height:6px;background:rgba(0,0,0,.4);border-radius:4px;overflow:hidden"><div style="${s(v.myConfirmBarStyle)}"></div></div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:.04em;color:#4fcbb4">${esc(v.myConfirmLabel)}</div>
        </div>` : ''}
    </div>

    <div style="font-size:11px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin:18px 0 10px">Hoje na guilda · toque para abrir</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${v.guildMembers.map(function (g) {
        return `<div style="${s(g.rowAnim)}">
          <div${on(g.open)}${hv('border-color:rgba(255,255,255,.22)')} style="${s(g.cardStyle)}">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="${s(g.avStyle)}">${esc(g.initial)}</div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:baseline;gap:6px"><span style="font-size:13.5px;font-weight:600">${esc(g.nome)}</span><span style="font-size:10px;color:#68768a">nv ${esc(g.nivel)}</span></div>
                <div style="font-size:11.5px;color:#c2cfdd;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(g.missao)}</div>
              </div>
              <div style="${s(g.stateStyle)}">${esc(g.stateLabel)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:9px;margin-top:10px">
              <div style="flex:1;height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden"><div style="${s(g.progStyle)}"></div></div>
              <div style="font-size:10px;color:#75839a">${esc(g.progLabel)}</div>
              <div style="${s(g.confirmChipStyle)}">${esc(g.confirmChip)}</div>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div style="height:24px"></div>
  </div>` : ''}

  ${v.gTabTrocas ? `
  <div style="animation:admStep .4s cubic-bezier(.2,.8,.2,1)">
    <div style="display:flex;gap:9px;align-items:flex-start;background:rgba(111,200,238,.08);border:1px solid rgba(111,200,238,.26);border-radius:14px;padding:12px 13px;margin-bottom:14px">
      <div style="width:3px;align-self:stretch;background:#6fc8ee;border-radius:2px"></div>
      <div style="font-size:11.5px;line-height:1.5;color:#c2cfdd;text-wrap:pretty">Trocas movem só cartas e equipamento já fabricados por esforço real. Ouro não entra, e nada aqui pode ser comprado.</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${v.trades.map(function (t) {
        return `<div style="${s(t.wrapStyle)}">
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:11px">
            <div style="${s(t.avStyle)}">${esc(t.initial)}</div>
            <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${esc(t.de)}</div><div style="font-size:11px;color:#8a97ab;margin-top:1px">${esc(t.nota)}</div></div>
          </div>
          <div style="display:flex;align-items:stretch;gap:8px">
            <div style="${s(t.offerStyle)}">
              <div style="font-size:8.5px;letter-spacing:.14em;color:#75839a;text-transform:uppercase">Oferece</div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:15px;line-height:1.05;letter-spacing:.02em;margin-top:5px">${esc(t.offerName)}</div>
              <div style="${s(t.offerMetaStyle)}">${esc(t.offerMeta)}</div>
            </div>
            <div style="display:flex;align-items:center;font-family:'Bebas Neue',sans-serif;font-size:19px;color:#d9a544">⇄</div>
            <div style="${s(t.wantStyle)}">
              <div style="font-size:8.5px;letter-spacing:.14em;color:#75839a;text-transform:uppercase">Quer</div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:15px;line-height:1.05;letter-spacing:.02em;margin-top:5px">${esc(t.wantName)}</div>
              <div style="${s(t.wantMetaStyle)}">${esc(t.wantMeta)}</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:11px">
            <div${on(t.accept)}${hv('filter:brightness(1.1)')} style="${s(t.acceptStyle)}">${esc(t.acceptLabel)}</div>
            ${t.open ? `<div${on(t.decline)}${hv('color:#e8eef5')} style="min-height:42px;display:flex;align-items:center;padding:0 14px;border-radius:11px;border:1px solid rgba(255,255,255,.14);font-size:12px;color:#8a97ab;cursor:pointer">Recusar</div>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
    <div${on(v.noop)}${hv('background:rgba(217,165,68,.22)')} style="margin-top:12px;min-height:48px;display:flex;align-items:center;justify-content:center;border-radius:13px;background:rgba(217,165,68,.14);border:1px solid rgba(217,165,68,.42);font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.08em;color:#f0cd85;cursor:pointer">PROPOR UMA TROCA</div>
    <div style="height:24px"></div>
  </div>` : ''}

  ${v.gTabMeta ? `
  <div style="animation:admStep .4s cubic-bezier(.2,.8,.2,1)">
    <div style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:14px 15px">
      <div style="font-size:13.5px;font-weight:600;margin-bottom:3px">40 missões concluídas pela guilda</div>
      <div style="font-size:11.5px;color:#8a97ab;margin-bottom:11px">Recompensa vai para todos os membros</div>
      <div style="display:flex;align-items:center;gap:10px">
        <div style="flex:1;height:7px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden"><div style="height:100%;width:57%;background:linear-gradient(90deg,#4fcbb4,#6fc8ee);border-radius:4px;transform-origin:left;animation:admBar .8s cubic-bezier(.2,.8,.2,1)"></div></div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.04em;color:#4fcbb4">23/40</div>
      </div>
    </div>
    <div style="font-size:11px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin:18px 0 10px">Como a validação funciona</div>
    <div style="display:flex;flex-direction:column;gap:9px">
      <div style="display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px 14px"><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;line-height:.9;color:#4fcbb4;width:26px">4</div><div style="flex:1;font-size:12.5px;line-height:1.45;color:#c2cfdd;text-wrap:pretty">confirmações de 6 membros liberam o XP integral da missão.</div></div>
      <div style="display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px 14px"><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;line-height:.9;color:#d9a544;width:26px">3</div><div style="flex:1;font-size:12.5px;line-height:1.45;color:#c2cfdd;text-wrap:pretty">contestações invalidam a missão e devolvem as recompensas.</div></div>
      <div style="display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px 14px"><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;line-height:.9;color:#8a97ab;width:26px">70%</div><div style="flex:1;font-size:12.5px;line-height:1.45;color:#c2cfdd;text-wrap:pretty">é o que rende uma missão só autodeclarada, sem foto nem confirmação.</div></div>
    </div>
    <div style="height:24px"></div>
  </div>` : ''}
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Thread da guilda
  // ═══════════════════════════════════════════════════════════════════════════
  function thread(v) {
    return `
<div style="animation:admStep .4s cubic-bezier(.2,.8,.2,1);padding:16px 16px 8px">
  <div${on(v.goGuilda)}${hv('color:#e8eef5')} style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#8a97ab;cursor:pointer;margin-bottom:12px;min-height:32px"><span style="font-family:'Bebas Neue',sans-serif;font-size:16px">‹</span>Forja Cinzenta</div>

  <div style="display:flex;align-items:center;gap:11px;margin-bottom:14px">
    <div style="${s(v.thAvStyle)}">${esc(v.thInitial)}</div>
    <div style="flex:1;min-width:0">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;line-height:1;letter-spacing:.04em">${esc(v.thName)}</div>
      <div style="font-size:11.5px;color:#8a97ab;margin-top:3px">${esc(v.thMissao)}</div>
    </div>
    <div style="${s(v.thXpStyle)}">${esc(v.thXp)}</div>
  </div>

  <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
    ${v.thMessages.map(function (m) {
      return `<div style="${s(m.wrapStyle)}"><div style="${s(m.bubbleStyle)}">${esc(m.text)}</div></div>`;
    }).join('')}
  </div>

  <div style="font-size:10px;letter-spacing:.14em;color:#75839a;text-transform:uppercase;margin-bottom:8px">${esc(v.thProofLabel)}</div>
  <div style="${s(v.thProofWrapStyle)}">
    <div data-slot="${esc(v.thSlotId)}" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden">
      ${v.thSlotPhoto
        ? `<img src="${esc(v.thSlotPhoto)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`
        : `<div style="display:flex;flex-direction:column;align-items:center;gap:7px;pointer-events:none">
             <div style="width:34px;height:34px;border-radius:11px;border:1px dashed rgba(255,255,255,.28);display:flex;align-items:center;justify-content:center;font-size:15px;color:#6fc8ee">+</div>
             <div style="font-size:10.5px;letter-spacing:.06em;color:#68768a;text-align:center;line-height:1.5">${esc(v.thSlotPlaceholder)}<br><span style="color:#4a5665">toque ou arraste uma imagem</span></div>
           </div>`}
    </div>
  </div>

  <div style="${s(v.thPanelStyle)}">
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:11px">
      <div style="flex:1">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:.05em;color:${v.thTone}">${esc(v.thCountLabel)}</div>
        <div style="font-size:11px;color:#8a97ab;margin-top:2px">${esc(v.thCountSub)}</div>
      </div>
      <div style="display:flex">
        ${v.thConfirmAvatars.map(function (a) { return `<div style="${s(a.style)}">${esc(a.initial)}</div>`; }).join('')}
      </div>
    </div>
    <div style="height:6px;background:rgba(0,0,0,.42);border-radius:4px;overflow:hidden;margin-bottom:12px"><div style="${s(v.thBarStyle)}"></div></div>
    <div style="display:flex;gap:8px">
      <div${on(v.thAction)}${hv('filter:brightness(1.1)')} style="${s(v.thActionStyle)}">${esc(v.thActionLabel)}</div>
      ${v.thCanContest ? `<div${on(v.thContest)}${hv('background:rgba(217,165,68,.12)')} style="min-height:46px;display:flex;align-items:center;padding:0 14px;border-radius:12px;border:1px solid rgba(217,165,68,.34);font-size:12px;color:#f0cd85;cursor:pointer">Contestar</div>` : ''}
    </div>
  </div>
  <div style="height:24px"></div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Ranking
  // ═══════════════════════════════════════════════════════════════════════════
  function ranking(v) {
    return `
<div style="animation:admIn .34s cubic-bezier(.2,.8,.2,1);padding:16px 16px 8px">
  <div style="font-family:'Bebas Neue',sans-serif;font-size:29px;line-height:1;letter-spacing:.03em">RANKING</div>
  <div style="font-size:11.5px;color:#75839a;margin-top:4px;margin-bottom:14px">Temporada 1 · 68 dias restantes · reset só de posição</div>
  <div style="display:flex;gap:5px;padding:4px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;margin-bottom:14px">
    ${v.rankTabs.map(function (t) { return `<div${on(t.pick)} style="${s(t.style)}">${esc(t.label)}</div>`; }).join('')}
  </div>
  <div style="display:flex;gap:0;padding:0 12px 8px;font-size:9px;letter-spacing:.11em;color:#5a6878;text-transform:uppercase">
    <div style="width:26px">#</div><div style="flex:1">Jogador</div><div style="width:34px;text-align:right">Nv</div><div style="width:38px;text-align:right">Seq</div><div style="width:40px;text-align:right">Miss</div><div style="width:34px;text-align:right">Vit</div>
  </div>
  <div style="display:flex;flex-direction:column;gap:6px">
    ${v.rankRows.map(function (r) {
      return `<div style="${s(r.rowStyle)}">
        <div style="${s(r.posStyle)}">${esc(r.pos)}</div>
        <div style="flex:1;min-width:0;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.nome)}</div>
        <div style="width:34px;text-align:right;font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.04em">${esc(r.nivel)}</div>
        <div style="width:38px;text-align:right;font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.04em;color:#f0cd85">${esc(r.seq)}</div>
        <div style="width:40px;text-align:right;font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.04em;color:#8a97ab">${esc(r.miss)}</div>
        <div style="width:34px;text-align:right;font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.04em;color:#6fc8ee">${esc(r.vit)}</div>
      </div>`;
    }).join('')}
  </div>
  <div style="margin-top:14px;display:flex;gap:9px;align-items:flex-start;background:rgba(79,203,180,.08);border:1px solid rgba(79,203,180,.24);border-radius:14px;padding:12px 13px">
    <div style="width:3px;align-self:stretch;background:#4fcbb4;border-radius:2px"></div>
    <div style="font-size:11.5px;line-height:1.5;color:#c2cfdd;text-wrap:pretty">Nenhum dado de composição corporal aparece aqui. O ranking mostra só nível, sequência, missões e vitórias.</div>
  </div>
  <div style="height:24px"></div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Perfil
  // ═══════════════════════════════════════════════════════════════════════════
  function perfil(v) {
    return `
<div style="animation:admIn .34s cubic-bezier(.2,.8,.2,1);padding:16px 16px 8px">
  <div style="font-family:'Bebas Neue',sans-serif;font-size:29px;line-height:1;letter-spacing:.03em">PERFIL</div>
  <div style="font-size:11.5px;color:#75839a;margin-top:4px;margin-bottom:16px">${esc(v.charName)} · ${esc(v.clsName)} · nível ${esc(v.charLevel)}</div>

  <div style="font-size:11px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:9px">Privacidade</div>
  <div style="display:flex;flex-direction:column;gap:2px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin-bottom:16px">
    ${v.privacyRows.map(function (p) {
      return `<div${on(p.toggle)} style="${s(p.rowStyle)}">
        <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${esc(p.label)}</div><div style="font-size:11px;color:#8a97ab;margin-top:2px;line-height:1.4">${esc(p.sub)}</div></div>
        <div style="${s(p.trackStyle)}"><div style="${s(p.knobStyle)}"></div></div>
      </div>`;
    }).join('')}
  </div>

  <div style="font-size:11px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:9px">Seus dados · LGPD</div>
  <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
    <div${on(v.noop)}${hv('background:rgba(111,200,238,.18)')} style="display:flex;align-items:center;min-height:48px;padding:0 14px;border-radius:14px;background:rgba(111,200,238,.1);border:1px solid rgba(111,200,238,.32);cursor:pointer"><div style="flex:1;font-size:13px;font-weight:600;color:#6fc8ee">Exportar todos os meus dados</div><div style="font-size:11px;color:#75839a">até 15 dias</div></div>
    <div${on(v.noop)}${hv('background:rgba(217,165,68,.1)')} style="display:flex;align-items:center;min-height:48px;padding:0 14px;border-radius:14px;border:1px solid rgba(217,165,68,.32);cursor:pointer"><div style="flex:1;font-size:13px;font-weight:600;color:#f0cd85">Excluir conta e todos os dados</div></div>
  </div>

  <div style="font-size:11px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:9px">Sobre</div>
  <div style="background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px">
    <div style="display:flex;align-items:center;gap:11px;margin-bottom:10px">
      <img src="${SHIELD}" alt="" style="width:38px;height:auto;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.1em">ADAMANTE 1.0</div>
    </div>
    <div style="font-size:12px;line-height:1.6;color:#c2cfdd;text-wrap:pretty">This work includes material from the System Reference Document 5.2 (“SRD 5.2”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.</div>
    <div style="height:1px;background:rgba(255,255,255,.09);margin:12px 0"></div>
    <div style="font-size:12px;line-height:1.6;color:#c2cfdd;text-wrap:pretty">Arte de personagens, monstros e itens: tiles do <span style="color:#a5e2f7">Dungeon Crawl Stone Soup</span>, em sua maioria sob licença Creative Commons Zero (CC0, domínio público), disponíveis em https://github.com/crawl/tiles.</div>
  </div>
  <div style="height:24px"></div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Casca do app: header, conteúdo, barra de abas
  // ═══════════════════════════════════════════════════════════════════════════
  function appShell(v) {
    return `
<div style="position:relative;flex:1;display:flex;flex-direction:column;min-height:0">

  ${v.showHeader ? `
  <div style="${s(v.headerStyle)}">
    <div${on(v.goPerfil)} style="display:flex;align-items:center;gap:11px;cursor:pointer">
      <div style="${s(v.avatarStyle)}">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:21px;line-height:1;color:#fff">${esc(v.charLevel)}</div>
        <div style="position:absolute;bottom:-1px;left:0;right:0;text-align:center;font-size:6.5px;letter-spacing:.18em;color:rgba(255,255,255,.65)">NÍVEL</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;line-height:1;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(v.charName)}</div>
        <div style="font-size:10.5px;color:#8a97ab;margin-top:2px">${esc(v.clsName)} · ${esc(v.xpLabel)}</div>
      </div>
    </div>
    <div style="flex:1"></div>
    <div style="display:flex;gap:7px;align-items:center">
      <div style="display:flex;align-items:center;gap:5px;padding:6px 9px;border-radius:9px;background:rgba(232,196,106,.12);border:1px solid rgba(232,196,106,.3)"><div style="width:7px;height:7px;border-radius:50%;background:#e8c46a"></div><span style="font-family:'Bebas Neue',sans-serif;font-size:15px;color:#e8c46a;letter-spacing:.04em">${esc(v.gold)}</span></div>
      <div style="${s(v.streakChipStyle)}"><span style="font-size:9px;letter-spacing:.1em;color:#f0cd85">SEQ</span><span style="font-family:'Bebas Neue',sans-serif;font-size:15px;color:#d9a544;letter-spacing:.04em">${esc(v.streak)}</span></div>
    </div>
  </div>
  <div style="height:3px;background:rgba(255,255,255,.06);position:relative;flex:none"><div style="${s(v.xpBarStyle)}"></div></div>
  ` : ''}

  <div style="flex:1;overflow-y:auto;overflow-x:hidden;min-height:0;position:relative">
    ${v.isInicio ? inicio(v) : ''}
    ${v.isFicha ? ficha(v) : ''}
    ${v.isMedicao ? medicao(v) : ''}
    ${v.isDeck ? deck(v) : ''}
    ${v.isBatalha ? batalha(v) : ''}
    ${v.isGuilda ? guilda(v) : ''}
    ${v.isThread ? thread(v) : ''}
    ${v.isRanking ? ranking(v) : ''}
    ${v.isPerfil ? perfil(v) : ''}
  </div>

  ${v.showTabBar ? `
  <div style="${s(v.tabBarStyle)}">
    <div style="${s(v.tabIndicatorStyle)}"></div>
    ${v.tabs.map(function (t) {
      return `<div${on(t.go)}${hv('color:#e8eef5')} style="${s(t.style)}">
        <div style="${s(t.iconStyle)}"></div>
        <div style="font-size:9.5px;letter-spacing:.07em;font-weight:600">${esc(t.label)}</div>
      </div>`;
    }).join('')}
  </div>` : ''}
</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Overlays: iris, prévia de carta, ganhos, toast, subida de nível
  // ═══════════════════════════════════════════════════════════════════════════
  function overlays(v) {
    return `
${v.coverOn ? `
  <div style="position:absolute;inset:0;z-index:96;overflow:hidden;pointer-events:none">
    <div data-iris="glow" style="${s(v.irisGlowStyle)}"></div><div data-iris="main" style="${s(v.irisStyle)}"></div>
    <div data-iris="mark" style="${s(v.irisMarkStyle)}"><img src="${SHIELD}" alt="" style="display:block;width:62px;height:auto;filter:drop-shadow(0 0 22px rgba(111,200,238,.55))"></div>
  </div>` : ''}

${v.previewOn ? `
  <div style="position:absolute;inset:0;z-index:70;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;background:rgba(4,6,12,.88);backdrop-filter:blur(12px);animation:admFadeIn .22s ease-out">
    <div style="perspective:1100px;animation:admCardIn .42s cubic-bezier(.2,.8,.2,1)">
      <div style="${s(v.pvCardStyle)}">
        <div style="position:absolute;inset:0;border-radius:18px;overflow:hidden;pointer-events:none"><div style="${s(v.pvSheen)}"></div></div>
        <div style="position:relative;display:flex;align-items:center;gap:8px">
          <div style="${s(v.pvCostStyle)}">${esc(v.pvCost)}</div>
          <div style="flex:1"></div>
          <div style="${s(v.pvRarStyle)}">${esc(v.pvRar)}</div>
        </div>
        <div style="position:relative;flex:1;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.3);margin:11px 0;overflow:hidden">
          <img class="adm-art" src="${esc(v.pvArt)}" alt="">
        </div>
        <div style="position:relative;font-family:'Bebas Neue',sans-serif;font-size:27px;line-height:1;letter-spacing:.03em">${esc(v.pvName)}</div>
        <div style="position:relative;display:flex;align-items:baseline;gap:6px;margin-top:5px">
          <span style="${s(v.pvNumStyle)}">${esc(v.pvNum)}</span>
          <span style="font-size:11px;color:#8a97ab">${esc(v.pvNumLabel)}</span>
        </div>
        <div style="position:relative;font-size:12px;line-height:1.45;color:#c2cfdd;margin-top:9px;text-wrap:pretty">${esc(v.pvTxt)}</div>
      </div>
    </div>

    <div style="width:100%;max-width:268px;margin-top:16px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px 13px">
      <div style="font-size:9.5px;letter-spacing:.15em;color:#75839a;text-transform:uppercase;margin-bottom:8px">${esc(v.pvCalcTitle)}</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${v.pvLines.map(function (l) {
          return `<div style="display:flex;align-items:baseline;gap:8px">
            <div style="flex:1;font-size:11.5px;color:#9fadc0">${esc(l.label)}</div>
            <div style="${s(l.valStyle)}">${esc(l.val)}</div>
          </div>`;
        }).join('')}
      </div>
      <div style="height:1px;background:rgba(255,255,255,.1);margin:9px 0"></div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;font-size:10.5px;color:#75839a">Origem real · ${esc(v.pvSrc)}</div>
      </div>
    </div>

    <div style="display:flex;gap:9px;width:100%;max-width:268px;margin-top:14px">
      <div${on(v.confirmPlay)}${hv('filter:brightness(1.1)')} style="${s(v.pvPlayStyle)}">${esc(v.pvPlayLabel)}</div>
      <div${on(v.closePreview)}${hv('color:#e8eef5')} style="min-height:50px;display:flex;align-items:center;padding:0 16px;border-radius:13px;border:1px solid rgba(255,255,255,.16);font-size:12.5px;color:#8a97ab;cursor:pointer">Voltar</div>
    </div>
  </div>` : ''}

${v.gains.map(function (g) { return `<div style="${s(g.style)}">${esc(g.text)}</div>`; }).join('')}

${v.toastOn ? `
  <div style="${s(v.toastStyle)}">
    <div style="${s(v.toastIconStyle)}"></div>
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:700;line-height:1.25">${esc(v.toastMsg)}</div>
      ${v.toastHasSub ? `<div style="font-size:11.5px;color:#9fadc0;margin-top:2px;line-height:1.35">${esc(v.toastSub)}</div>` : ''}
    </div>
  </div>` : ''}

${v.levelUpOn ? `
  <div style="position:absolute;inset:0;z-index:90;overflow:hidden">
    <div data-iris="glow" style="${s(v.irisGlowStyle)}"></div><div data-iris="main" style="${s(v.irisStyle)}"></div>
    <div style="${s(v.bloomGoldStyle)}"></div>
    <div style="${s(v.overlayContentStyle)}">
      <div style="position:absolute;width:210px;height:210px;border-radius:50%;border:2px solid rgba(217,165,68,.55);animation:admBurst 1.7s ease-out 1.1s infinite"></div>
      <div style="position:absolute;width:210px;height:210px;border-radius:50%;border:2px solid rgba(111,200,238,.45);animation:admBurst 1.7s ease-out 1.55s infinite"></div>
      <div style="position:relative;perspective:900px;margin-bottom:14px">
        <img src="${SHIELD}" alt="" style="display:block;width:118px;height:auto;filter:drop-shadow(0 0 40px rgba(232,196,106,.6)) drop-shadow(0 0 22px rgba(111,200,238,.45));animation:admIdle3d 4.2s ease-in-out infinite">
      </div>
      <div style="position:relative;font-size:11px;letter-spacing:.24em;color:#f0cd85;text-transform:uppercase">Nível alcançado</div>
      <div style="position:relative;display:flex;align-items:baseline;justify-content:center;gap:13px;margin-top:2px">
        <div style="${s(v.lvFromStyle)}">${esc(v.lvFrom)}</div>
        <div style="${s(v.lvArrowStyle)}">›</div>
        <div style="${s(v.lvToStyle)}">${esc(v.charLevel)}</div>
      </div>
      <div style="position:relative;font-size:13.5px;line-height:1.5;color:#c2cfdd;max-width:250px;margin-top:8px;text-wrap:pretty">2 pontos de atributo liberados. Distribua onde quiser — não precisa ser onde você suou.</div>
      <div${on(v.closeLevelUp)}${hv('filter:brightness(1.08)')} style="position:relative;margin-top:24px;min-height:50px;display:flex;align-items:center;padding:0 26px;border-radius:13px;background:linear-gradient(135deg,#d9a544,#b8842c);color:#191202;font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:.1em;cursor:pointer">DISTRIBUIR AGORA</div>
    </div>
  </div>` : ''}

${v.timerOn ? `
  <div style="position:absolute;inset:0;z-index:88;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:26px;background:rgba(4,6,12,.93);backdrop-filter:blur(14px);animation:admFadeIn .24s ease-out">
    <div style="font-size:10px;letter-spacing:.2em;color:#75839a;text-transform:uppercase;margin-bottom:5px">Cronômetro de estudo</div>
    <div style="font-family:'Bebas Neue',sans-serif;font-size:21px;letter-spacing:.03em;color:#e8eef5;margin-bottom:16px">${esc(v.timerBlockLabel)}</div>
    <div style="${s(v.timerRingStyle)}">
      <div style="${s(v.timerRingInnerStyle)}">
        <div style="${s(v.timerPhaseChipStyle)}">${esc(v.timerPhaseLabel)}</div>
        <div style="${s(v.timerClockStyle)}">${esc(v.timerClock)}</div>
      </div>
    </div>
    <div style="font-size:12px;line-height:1.5;color:#c2cfdd;text-align:center;max-width:294px;margin-top:20px;text-wrap:pretty">${esc(v.timerHint)}</div>
    ${v.timerShowInterruptCount ? `<div style="font-size:10.5px;color:#d9a544;margin-top:7px">${esc(v.timerInterruptions)} recomeço(s) por segundo plano</div>` : ''}
    <div style="font-size:10px;color:#5a6878;margin-top:9px;text-align:center;max-width:280px;line-height:1.4">${esc(v.timerProtoNote)}</div>
    <div style="display:flex;gap:9px;width:100%;max-width:300px;margin-top:20px">
      <div${on(v.timerPrimary)}${hv('filter:brightness(1.08)')} style="${s(v.timerPrimaryStyle)}">${esc(v.timerPrimaryLabel)}</div>
      ${v.timerDone ? '' : `<div${on(v.timerClose)}${hv('color:#e8eef5')} style="min-height:50px;display:flex;align-items:center;padding:0 16px;border-radius:13px;border:1px solid rgba(255,255,255,.16);font-size:12.5px;color:#8a97ab;cursor:pointer">Sair</div>`}
    </div>
  </div>` : ''}

${v.epicFormOn ? `
  <div style="position:absolute;inset:0;z-index:86;display:flex;flex-direction:column;justify-content:center;padding:24px;background:rgba(4,6,12,.9);backdrop-filter:blur(14px);animation:admFadeIn .24s ease-out">
    <div style="width:100%;max-width:340px;margin:0 auto;background:linear-gradient(180deg,rgba(14,20,34,.98),rgba(8,11,20,.98));border:1px solid rgba(217,165,68,.32);border-radius:20px;padding:18px 17px;box-shadow:0 24px 60px rgba(0,0,0,.6);animation:admRise .34s cubic-bezier(.2,.8,.2,1)">
      <div style="font-size:10px;letter-spacing:.2em;color:#f0cd85;text-transform:uppercase;margin-bottom:3px">Missão épica</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:25px;letter-spacing:.03em;margin-bottom:4px">DEFINA UMA META GRANDE</div>
      <div style="font-size:11.5px;color:#8a97ab;line-height:1.45;margin-bottom:14px;text-wrap:pretty">De 15 a 90 dias. Se o prazo vencer, nada é perdido — a missão só expira.</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:15px">
        ${v.epicPresets.map(function (p) {
          return `<div${on(p.pick)} style="${s(p.style)}">
            <div><span style="${s(p.catStyle)}">${esc(p.catLabel)}</span></div>
            <div style="font-size:14px;font-weight:600;color:#fff">${esc(p.title)}</div>
            <div style="font-size:11px;color:#8a97ab">${esc(p.sub)}</div>
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;align-items:center;gap:11px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:13px;padding:11px 13px;margin-bottom:7px">
        <div style="flex:1"><div style="font-size:12px;color:#c2cfdd;font-weight:600">Prazo</div><div style="font-size:10.5px;color:#68768a">${esc(v.epicDaysHint)}</div></div>
        <div${on(v.epicDaysDec)}${hv('background:rgba(255,255,255,.12)')} style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);font-size:20px;color:#e8eef5;cursor:pointer">−</div>
        <div style="min-width:70px;text-align:center"><span style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.02em;color:#f0cd85">${esc(v.epicDaysValue)}</span><span style="font-size:11px;color:#8a97ab"> dias</span></div>
        <div${on(v.epicDaysInc)}${hv('background:rgba(255,255,255,.12)')} style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);font-size:20px;color:#e8eef5;cursor:pointer">+</div>
      </div>
      <div style="font-size:11px;color:#9fadc0;text-align:center;margin-bottom:15px">Recompensa · <span style="color:#f0cd85">${esc(v.epicRewardPreview)}</span></div>
      <div style="display:flex;gap:9px">
        <div${on(v.epicCreate)}${hv('filter:brightness(1.08)')} style="flex:1;min-height:50px;display:flex;align-items:center;justify-content:center;border-radius:13px;background:linear-gradient(135deg,#d9a544,#b8842c);font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:.09em;color:#191202;cursor:pointer">CRIAR</div>
        <div${on(v.epicCancel)}${hv('color:#e8eef5')} style="min-height:50px;display:flex;align-items:center;padding:0 16px;border-radius:13px;border:1px solid rgba(255,255,255,.16);font-size:12.5px;color:#8a97ab;cursor:pointer">Cancelar</div>
      </div>
    </div>
  </div>` : ''}

${v.restOpen ? `
  <div${on(v.closeRest)} style="position:absolute;inset:0;z-index:87;display:flex;flex-direction:column;justify-content:flex-end;background:rgba(4,6,12,.86);backdrop-filter:blur(12px);animation:admFadeIn .24s ease-out">
    <div${on(v.noopStop)} style="background:linear-gradient(180deg,rgba(14,20,34,.99),rgba(8,11,20,.99));border-top:1px solid rgba(127,142,192,.34);border-radius:22px 22px 0 0;padding:20px 17px;box-shadow:0 -20px 60px rgba(0,0,0,.6);animation:admRise .34s cubic-bezier(.2,.8,.2,1);max-height:88%;overflow-y:auto">
      <div style="width:38px;height:4px;border-radius:2px;background:rgba(255,255,255,.16);margin:0 auto 15px"></div>
      <div style="display:flex;align-items:flex-start;gap:11px;margin-bottom:6px">
        <div style="flex:1;min-width:0">
          <div style="font-size:10px;letter-spacing:.2em;color:#aebdd8;text-transform:uppercase">Descanso Sagrado</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.03em;margin-top:2px">FOLGA PLANEJADA</div>
        </div>
        <div style="text-align:right"><div style="font-family:'Bebas Neue',sans-serif;font-size:26px;line-height:1;color:#aebdd8">${esc(v.restRemaining)}</div><div style="font-size:8.5px;letter-spacing:.13em;color:#75839a">LIVRES</div></div>
      </div>
      <div style="font-size:11.5px;line-height:1.5;color:#c2cfdd;margin-bottom:14px;text-wrap:pretty">Nos dias marcados não há Fadiga e a sequência é preservada. Até 4 por mês, com no mínimo 12 h de antecedência — o app não pune quem descansa de propósito.</div>
      <div style="font-size:10px;letter-spacing:.13em;color:#75839a;text-transform:uppercase;margin-bottom:9px">${esc(v.restUsedLabel)}</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        ${v.restRows.map(function (r) {
          return `<div${on(r.toggle)} style="${s(r.rowStyle)}">
            <div style="${s(r.boxStyle)}">${esc(r.mark)}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13.5px;font-weight:600;color:${r.locked ? '#68768a' : '#e8eef5'}">${esc(r.name)} <span style="font-size:11px;color:#75839a;font-weight:400">${esc(r.dateLabel)}</span></div>
              ${r.reason ? `<div style="font-size:10.5px;color:#7f8ec0;margin-top:2px">${esc(r.reason)}</div>` : `<div style="font-size:10.5px;color:#68768a;margin-top:2px">${r.marked ? 'folga marcada · sem Fadiga' : 'toque para marcar folga'}</div>`}
            </div>
          </div>`;
        }).join('')}
      </div>
      <div${on(v.closeRest)}${hv('background:rgba(255,255,255,.1)')} style="margin-top:16px;min-height:50px;display:flex;align-items:center;justify-content:center;border-radius:13px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.08em;color:#e8eef5;cursor:pointer">FECHAR</div>
      <div style="height:6px"></div>
    </div>
  </div>` : ''}`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  function render(v) {
    resetReg();
    var html = `
<div style="position:absolute;inset:0;background:radial-gradient(130% 78% at 50% -12%,#16233c 0%,rgba(8,11,20,0) 62%),radial-gradient(80% 50% at 108% 104%,rgba(217,165,68,.16) 0%,rgba(8,11,20,0) 70%);pointer-events:none"></div>
<div style="position:absolute;inset:0;opacity:.05;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px);background-size:34px 34px"></div>
${v.isSplash ? splash(v) : ''}
${v.isLogin ? login(v) : ''}
${v.isCadastro ? cadastro(v) : ''}
${v.isOnboarding ? onboarding(v) : ''}
${v.inApp ? appShell(v) : ''}
${overlays(v)}`;
    return { html: html, reg: reg };
  }

  global.AdmViews = { render: render };
})(window);
