/* FSA⁴Future · site V1 · JS único, sem dependências.
   Menu mobile · consentimento + eventos de analytics · FSiA · fluxo Conversar · confirmação. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Configuração de canais. Canal vazio = não aparece no site.
     Pendências (QA-LOG / F): número de WhatsApp Business, telefone e
     endpoint de formulário. O e-mail atendimento@ ainda precisa ser criado (D8).
  ------------------------------------------------------------------ */
  var CONFIG = {
    // PROVISÓRIO (QA-019, 06/10/2026): contatos da FSA até a FSA⁴Future ter número e atendimento@ próprios.
    email: 'catia@fsasolucoes.com.br',
    whatsapp: '551233519958',          // somente dígitos com DDI (WhatsApp Business da FSA, provisório)
    telefone: '+551233519958',
    telefoneLabel: '(12) 3351-9958',
    calendly: 'https://calendly.com/catiascan/primeiro-atendimento-gratuito-fsa-future',
    formEndpoint: '',        // POST JSON opcional (ex.: Apps Script/Formspree) com cópia para atendimento@
    consentVersion: '1.0'
  };
  var ROOT = document.documentElement.getAttribute('data-root') || './';

  /* ---------------- utilidades ---------------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (k) { if (k) n.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); });
    return n;
  }
  function icon(name, size) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'f4-icon' + (size ? ' f4-icon--' + size : ''));
    s.setAttribute('aria-hidden', 'true');
    var u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', ROOT + 'assets/icons/sprite.svg#i-' + name);
    s.appendChild(u);
    return s;
  }
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var session = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------------- consentimento + analytics ----------------
     Nada além do necessário roda antes da escolha. Eventos vão para
     window.dataLayer só com consentimento de análise. A ferramenta
     de analytics (GA4, Plausible etc.) é carregada em loadAnalytics(). */
  var consent = store.get('f4_consent');
  window.dataLayer = window.dataLayer || [];
  function track(name, params) {
    if (!consent || !consent.analise) return;
    window.dataLayer.push(Object.assign({ event: name }, params || {}));
  }
  window.f4track = track;
  function loadAnalytics() {
    /* Pendente (G4): inserir aqui o carregamento da ferramenta escolhida,
       somente após consentimento. Ex.: GA4 com Consent Mode. */
  }
  function saveConsent(analise, preferencias) {
    consent = { analise: !!analise, preferencias: !!preferencias, versao: CONFIG.consentVersion, data: new Date().toISOString() };
    store.set('f4_consent', consent);
    $('#consent').hidden = true;
    if (consent.analise) loadAnalytics();
  }
  function initConsent() {
    var box = $('#consent'); if (!box) return;
    if (!consent || consent.versao !== CONFIG.consentVersion) box.hidden = false; else if (consent.analise) loadAnalytics();
    $('#consent-accept').addEventListener('click', function () { saveConsent(true, true); });
    $('#consent-reject').addEventListener('click', function () { saveConsent(false, false); });
    $('#consent-choose').addEventListener('click', function () { $('#consent-options').hidden = false; $('#consent-save').hidden = false; $('#c-analise').focus(); });
    $('#consent-save').addEventListener('click', function () { saveConsent($('#c-analise').checked, $('#c-pref').checked); });
    $all('[data-consent-open]').forEach(function (b) {
      b.addEventListener('click', function () {
        box.hidden = false; $('#consent-options').hidden = false; $('#consent-save').hidden = false;
        $('#c-analise').checked = !!(consent && consent.analise); $('#c-pref').checked = !!(consent && consent.preferencias);
        $('#c-analise').focus();
      });
    });
  }

  /* ---------------- eventos declarativos ---------------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-track]');
    if (t) track(t.getAttribute('data-track'), { label: t.getAttribute('data-track-label') || t.textContent.trim().slice(0, 80), page: location.pathname });
  });

  /* ---------------- menu mobile ---------------- */
  function initMenu() {
    var btn = $('#menu-btn'), nav = $('#nav'); if (!btn || !nav) return;
    function set(open) {
      nav.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      btn.querySelector('use').setAttribute('href', ROOT + 'assets/icons/sprite.svg#i-' + (open ? 'x' : 'menu'));
      document.body.style.overflow = open ? 'hidden' : '';
    }
    btn.addEventListener('click', function () { set(!nav.classList.contains('is-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); btn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100) set(false); });
  }

  /* ---------------- resumo e canais ---------------- */
  function summaryText(ctx) {
    var l = ['Resumo para a FSA⁴Future'];
    if (ctx.nome) l.push('Nome: ' + ctx.nome);
    if (ctx.empresa) l.push('Empresa: ' + ctx.empresa);
    if (ctx.email) l.push('E-mail: ' + ctx.email);
    if (ctx.telefone) l.push('Telefone/WhatsApp: ' + ctx.telefone);
    if (ctx.porte) l.push('Tamanho da empresa: ' + ctx.porte);
    if (ctx.desafio && !(ctx.respostas && ctx.respostas.length)) l.push('Desafio: ' + ctx.desafio);
    (ctx.respostas || []).forEach(function (r) { l.push(r[0] + ' ' + r[1]); });
    if (ctx.frente) l.push('Frente sugerida (não é diagnóstico): ' + ctx.frente);
    if (ctx.canal) l.push('Canal escolhido: ' + ctx.canal);
    l.push('Origem: ' + (ctx.origem || 'site') + ' · ' + location.pathname);
    return l.join('\n');
  }
  function channelLinks(ctx, withSummary) {
    var text = withSummary ? summaryText(ctx) : 'Olá, quero conversar sobre meu desafio.';
    var out = [];
    out.push({ key: 'agenda', icon: 'calendar', label: 'Agendar a Conversa de Entendimento', desc: '30 minutos, gratuita, por Google Meet.', href: calendlyUrl(ctx, withSummary), external: true, track: 'agenda_abertura' });
    if (CONFIG.whatsapp) out.push({ key: 'whatsapp', icon: 'message-circle', label: 'WhatsApp', desc: 'Abre o WhatsApp com o resumo pronto para enviar.', href: 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text), external: true, track: 'clique_whatsapp' });
    if (CONFIG.email) out.push({ key: 'email', icon: 'mail', label: 'E-mail', desc: CONFIG.email, href: 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Quero conversar sobre meu desafio') + '&body=' + encodeURIComponent(text), track: 'clique_email' });
    if (CONFIG.telefone) out.push({ key: 'telefone', icon: 'phone', label: 'Telefone', desc: CONFIG.telefoneLabel || CONFIG.telefone, href: 'tel:' + CONFIG.telefone, track: 'solicitacao_telefone' });
    return out;
  }
  function calendlyUrl(ctx, withSummary) {
    var p = [];
    if (ctx.nome) p.push('name=' + encodeURIComponent(ctx.nome));
    if (ctx.email) p.push('email=' + encodeURIComponent(ctx.email));
    if (withSummary) p.push('a1=' + encodeURIComponent(summaryText(ctx).slice(0, 1800)));
    return CONFIG.calendly + (p.length ? '?' + p.join('&') : '');
  }
  window.f4channels = channelLinks;

  /* ---------------- FSiA ----------------
     Roteiro fechado a partir da FSiA_Base_de_Conhecimento_v1.
     Não fecha escopo, não informa preço nem prazo, não afirma viabilidade,
     não diagnostica. Faz handoff humano com resumo, só com consentimento.
     Não promete prazo de resposta (decisão de 06/10: sem SLA público). */
  var FRONTS = {
    flow: { name: 'FSA⁴Flow', url: 'hub/fsa-4-flow/', tag: 'Entender antes de transformar.', desc: 'diagnóstico, processos, eficiência, automação, integrações e produtividade' },
    solutions: { name: 'FSA⁴Solutions', url: 'hub/fsa-4-solutions/', tag: 'Do problema à tecnologia funcionando.', desc: 'APIs, bots, IA, integrações, dados, desenvolvimento e modernização' },
    products: { name: 'FSA⁴Products', url: 'hub/fsa-4-products/', tag: 'Ideias que podem se transformar em novos produtos.', desc: 'produtos próprios, experimentação e novas soluções do hub' },
    partners: { name: 'FSA⁴Partners', url: 'hub/fsa-4-partners/', tag: 'A solução certa nem sempre precisa vir de dentro.', desc: 'ecossistema de parceiros e Programa de Parceiros' }
  };
  var SIGNALS = [
    ['partners', /parceir|indicar|indica[cç][aã]o|comiss/i],
    ['products', /produto|mvp|startup|testar (uma )?ideia|ideia de/i],
    ['solutions', /sistema|app|aplicativ|api|integra|bot|\bia\b|intelig[eê]ncia|dados|banco de dados|legado|moderniz|software|cloud|nuvem/i],
    ['flow', /processo|planilha|manual|retrabalho|lent|redigit|n[aã]o conversam|burocr|produtividade|automa/i]
  ];
  var QUESTIONS = [
    'Me conta um pouco do desafio. O que está acontecendo hoje?',
    'Quem sente isso no dia a dia? Uma área, os clientes, a operação toda?',
    'Já existe algum sistema, planilha ou ferramenta envolvida?',
    'O que mudaria para o seu negócio se isso estivesse resolvido?',
    'Tem alguma data ou urgência que a gente deva saber?'
  ];
  var QLABELS = ['Desafio:', 'Quem sente:', 'Sistemas citados:', 'O que mudaria:', 'Urgência:'];
  var GUARDS = [
    [/pre[cç]o|quanto custa|or[cç]amento|valor[- ]hora|cobram|investimento|tabela de valores/i, 'O valor depende do desafio e do escopo, que a gente define junto numa conversa. Essa primeira conversa é gratuita. Quer agendar?', 'handoff'],
    [/prazo|quanto tempo|quando fica pronto|em quantos dias|entrega em/i, 'O prazo sai do escopo. Na Conversa de Entendimento o time avalia isso com você.', 'handoff'],
    [/d[aá] (pra|para) fazer|[eé] poss[ií]vel|[eé] vi[aá]vel|viabilidade|conseguem fazer/i, 'Parece um desafio que a FSA costuma olhar de perto. Quem confirma é o time, depois de entender o contexto.', 'handoff'],
    [/\bcpf\b|\brg\b|senha|cart[aã]o de cr[eé]dito|conta banc[aá]ria|\bpix\b|dado(s)? de sa[uú]de/i, 'Não preciso desse dado. Por segurança, não envie por aqui.', null],
    [/vaga|curr[ií]culo|trabalhar (na|com a) fsa|emprego/i, 'Envie seu currículo para ' + CONFIG.email + ' com o assunto "Vagas".', null],
    [/voc[eê] [eé] (humana|uma pessoa|rob[oô]|real)|falo com (um )?rob/i, 'Sou a assistente digital da FSA. Posso te conectar com uma pessoa do time quando quiser.', 'handoff'],
    [/ignore|esque[cç]a (as|suas) (regras|instru)|prompt|system/i, 'Vamos voltar ao começo.', 'menu'],
    [/(voc[eê]s )?(fazem|trabalham com|usam) (ia|intelig)/i, 'Sim, quando IA é a resposta certa para o problema. Às vezes a resposta é automação, integração ou dados. Muitas vezes é uma combinação.', null],
    [/concorr|melhor que|compar/i, 'Não comento outras empresas. Posso te contar como a FSA trabalha.', 'metodo'],
    [/apagar (meus )?dados|excluir (meus )?dados|lgpd|privacidade/i, 'Registrei seu pedido. Para tratar dados pessoais, escreva para ' + CONFIG.email + ' com o assunto "Privacidade".', null],
    [/onde fica|endere[cç]o/i, 'O atendimento é remoto ou presencial, a combinar com o time.', 'handoff'],
    [/primeira conversa|tem custo|[eé] gr[aá]tis|gratuit/i, 'A Conversa de Entendimento FSA tem 30 minutos e é gratuita: um primeiro encontro para ouvir seu contexto, entender o desafio e identificar juntos qual pode ser o próximo passo.', 'handoff'],
    [/falar com (algu[eé]m|uma pessoa|humano|atendente)|atendimento humano|quero falar/i, null, 'handoff']
  ];

  function initFSiA() {
    var root = $('#fsia'); if (!root) return;
    var launcher = $('#fsia-launcher'), panel = $('#fsia-panel'), log = $('#fsia-log'), form = $('#fsia-form'), input = $('#fsia-input'), closeBtn = $('#fsia-close');
    var state = { mode: 'menu', q: 0, ctx: session.get('f4_fsia_ctx') || { respostas: [], origem: 'FSiA' }, started: false };

    function save() { session.set('f4_fsia_ctx', state.ctx); }
    function scroll() { log.scrollTop = log.scrollHeight; }
    function clearOptions() { $all('.f4-msg__opts', log).forEach(function (o) { o.remove(); }); }
    function say(text, options, extra) {
      clearOptions();
      var bubble = el('div', { class: 'f4-msg__bubble' }); bubble.textContent = text || '';
      if (extra) bubble.appendChild(extra);
      var m = el('div', { class: 'f4-msg' }, [
        el('div', { class: 'f4-msg__who' }, [el('span', { class: 'f4-msg__avatar', 'aria-hidden': 'true', text: 'iA' }), 'FSiA']),
        bubble
      ]);
      if (options && options.length) {
        var o = el('div', { class: 'f4-msg__opts' });
        options.forEach(function (opt) {
          var b = el('button', { type: 'button', class: 'f4-chip', text: opt.label, onclick: function () { userSay(opt.label); opt.run(); } });
          o.appendChild(b);
        });
        m.appendChild(o);
      }
      log.appendChild(m); scroll();
    }
    function userSay(text) {
      clearOptions();
      log.appendChild(el('div', { class: 'f4-msg f4-msg--user' }, [el('div', { class: 'f4-msg__bubble', text: text })])); scroll();
      if (!state.started) { state.started = true; track('fsia_inicio_conversa'); }
    }
    function menu() {
      state.mode = 'menu';
      say('Por onde começamos?', [
        { label: 'Tenho um desafio', run: startChallenge },
        { label: 'Quero conhecer as soluções', run: solutions },
        { label: 'Quero falar com alguém', run: handoff },
        { label: 'Ainda não sei por onde começar', run: function () { say('Tudo bem. Não precisa saber qual tecnologia usar. Essa parte a gente descobre junto.'); startChallenge(); } }
      ]);
    }
    function opening() {
      say('Olá, eu sou a FSiA. Posso ajudar você a entender como a FSA pode apoiar seu desafio, apresentar nossas soluções ou conectar você com nosso time.');
      menu();
    }
    function startChallenge() { state.mode = 'challenge'; state.q = 0; state.ctx.respostas = []; ask(); }
    function ask() {
      say(QUESTIONS[state.q], [{ label: 'Prefiro falar com alguém', run: handoff }]);
      input.focus();
    }
    function suggestFront(text) {
      for (var i = 0; i < SIGNALS.length; i++) if (SIGNALS[i][1].test(text)) return SIGNALS[i][0];
      return null;
    }
    function finishChallenge() {
      var all = state.ctx.respostas.map(function (r) { return r[1]; }).join(' ');
      var f = suggestFront(all);
      state.ctx.desafio = state.ctx.respostas[0] ? state.ctx.respostas[0][1] : '';
      if (f) {
        state.ctx.frente = FRONTS[f].name; save();
        var a = el('a', { href: ROOT + FRONTS[f].url, text: ' Ver ' + FRONTS[f].name + '.' });
        say('Obrigada. Pelo que você contou, isso conversa com ' + FRONTS[f].name + '. É uma sugestão, não um diagnóstico: quem aprofunda é o time. O próximo passo é uma conversa de 30 minutos, gratuita.', null, a);
      } else {
        save();
        say('Obrigada. O time vai entender melhor na conversa. O próximo passo é uma conversa de 30 minutos, gratuita.');
      }
      handoff();
    }
    function solutions() {
      state.mode = 'menu';
      var wrap = el('span');
      Object.keys(FRONTS).forEach(function (k) {
        var f = FRONTS[k];
        wrap.appendChild(el('br')); wrap.appendChild(el('a', { href: ROOT + f.url, text: f.name })); wrap.appendChild(document.createTextNode(': ' + f.desc + '.'));
      });
      say('O hub tem quatro frentes. IA, cloud, dados, automação e integrações são capacidades que atravessam todas elas.', null, wrap);
      say('Quer contar o seu desafio ou falar com o time?', [
        { label: 'Tenho um desafio', run: startChallenge },
        { label: 'Como vocês trabalham?', run: method },
        { label: 'Quero falar com alguém', run: handoff }
      ]);
    }
    function method() {
      var a = el('a', { href: ROOT + 'como-fazemos/', text: ' Ver as seis etapas.' });
      say('A FSA trabalha em seis etapas: 01 Ouvir, 02 Entender, 03 Conectar, 04 Construir, 05 Validar e 06 Evoluir. Eu participo só do Ouvir; o Entender em diante é com o time.', null, a);
      say('Quer seguir?', [{ label: 'Tenho um desafio', run: startChallenge }, { label: 'Quero falar com alguém', run: handoff }]);
    }
    function handoff() {
      state.mode = 'handoff';
      track('fsia_pedido_humano');
      var hasCtx = state.ctx.respostas && state.ctx.respostas.length;
      if (hasCtx && state.ctx.consentimento === undefined) {
        say('Posso enviar um resumo desta conversa para o time, para você não precisar repetir tudo?', [
          { label: 'Sim, pode enviar', run: function () { state.ctx.consentimento = true; save(); askIdentity(); } },
          { label: 'Não, prefiro não enviar', run: function () { state.ctx.consentimento = false; save(); channels(); } }
        ]);
      } else channels();
    }
    function askIdentity() {
      state.mode = 'identity';
      say('Seus dados são usados só para o time da FSA retornar sobre este atendimento (veja a Política de Privacidade). Como posso te chamar, e de qual empresa?', [{ label: 'Pular', run: channels }]);
      input.focus();
    }
    function channels() {
      state.mode = 'menu';
      var withSummary = !!state.ctx.consentimento;
      var list = el('span', { class: 'f4-msg__links' });
      channelLinks(state.ctx, withSummary).forEach(function (c) {
        var a = el('a', { href: c.href, 'data-track': c.track, 'data-track-label': 'FSiA · ' + c.label });
        if (c.external) { a.target = '_blank'; a.rel = 'noopener'; }
        a.textContent = c.label;
        list.appendChild(el('br')); list.appendChild(a); list.appendChild(document.createTextNode(' · ' + c.desc));
      });
      list.appendChild(el('br'));
      var form = el('a', { href: ROOT + 'conversar/?origem=fsia', text: 'Ou use o formulário de conversa.' });
      list.appendChild(form);
      say('Claro. Como você prefere continuar?' + (withSummary ? ' O resumo vai junto.' : ''), null, list);
      say('Posso ajudar em algo mais?', [{ label: 'Voltar ao início', run: menu }]);
    }
    function onText(text) {
      userSay(text);
      if (state.mode === 'identity') {
        var parts = text.split(/,| da | de | - |\//);
        state.ctx.nome = (parts[0] || '').trim().slice(0, 80);
        state.ctx.empresa = (parts.slice(1).join(' ') || '').trim().slice(0, 80);
        save(); channels(); return;
      }
      if (state.mode === 'challenge') {
        // Durante as perguntas, a resposta é registrada; só dados sensíveis, pedido de humano e tentativa de mudar regras interrompem.
        if (GUARDS[3][0].test(text)) { say(GUARDS[3][1]); return ask(); }
        if (GUARDS[6][0].test(text)) { say(GUARDS[6][1]); return menu(); }
        if (GUARDS[GUARDS.length - 1][0].test(text)) return handoff();
        state.ctx.respostas.push([QLABELS[state.q], text.slice(0, 600)]); save();
        for (var g = 0; g < 3; g++) if (GUARDS[g][0].test(text)) { say(GUARDS[g][1]); break; }
        state.q++;
        if (state.q < QUESTIONS.length) return ask();
        return finishChallenge();
      }
      for (var i = 0; i < GUARDS.length; i++) {
        if (GUARDS[i][0].test(text)) {
          if (GUARDS[i][1]) say(GUARDS[i][1]);
          var next = GUARDS[i][2];
          if (next === 'handoff') return handoff();
          if (next === 'menu') return menu();
          if (next === 'metodo') return method();
          return menu();
        }
      }
      var f = suggestFront(text);
      if (f) {
        var a = el('a', { href: ROOT + FRONTS[f].url, text: ' Ver ' + FRONTS[f].name + '.' });
        say('Isso costuma conversar com ' + FRONTS[f].name + ': ' + FRONTS[f].desc + '.', null, a);
        return say('Quer contar mais sobre o desafio?', [{ label: 'Tenho um desafio', run: startChallenge }, { label: 'Quero falar com alguém', run: handoff }]);
      }
      say('Não tenho essa informação. Posso te conectar com o time.', [{ label: 'Quero falar com alguém', run: handoff }, { label: 'Voltar ao início', run: menu }]);
    }

    function setVh() {
      if (window.visualViewport && window.innerWidth <= 560) root.style.setProperty('--fsia-vh', window.visualViewport.height + 'px');
    }
    function open() {
      panel.hidden = false; root.classList.add('is-open'); launcher.setAttribute('aria-expanded', 'true');
      if (!log.children.length) opening();
      track('fsia_abertura');
      setVh();
      if (window.innerWidth <= 560) document.body.style.overflow = 'hidden';
      setTimeout(function () { input.focus(); }, 30);
    }
    function close() {
      panel.hidden = true; root.classList.remove('is-open'); launcher.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = ''; launcher.focus();
    }
    launcher.addEventListener('click', function () { panel.hidden ? open() : close(); });
    closeBtn.addEventListener('click', close);
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ''; onText(v.slice(0, 1000));
    });
    if (window.visualViewport) { window.visualViewport.addEventListener('resize', setVh); window.visualViewport.addEventListener('scroll', setVh); }
    $all('[data-fsia-open]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
  }

  /* ---------------- Conversar: desafio → dados → canal → agenda ---------------- */
  function initConversar() {
    var f = $('#conversar-form'); if (!f) return;
    var steps = $all('[data-stage]', f), marks = $all('.flow-steps li');
    var fsiaCtx = session.get('f4_fsia_ctx');
    if (fsiaCtx && /origem=fsia/.test(location.search)) {
      if (fsiaCtx.desafio && !f.desafio.value) f.desafio.value = fsiaCtx.respostas.map(function (r) { return r[0] + ' ' + r[1]; }).join('\n');
      if (fsiaCtx.nome) f.nome.value = fsiaCtx.nome;
      if (fsiaCtx.empresa) f.empresa.value = fsiaCtx.empresa;
    }
    function go(n) {
      steps.forEach(function (s) { s.hidden = Number(s.getAttribute('data-stage')) !== n; });
      marks.forEach(function (m, i) {
        m.classList.toggle('is-done', i + 1 < n);
        if (i + 1 === n) m.setAttribute('aria-current', 'step'); else m.removeAttribute('aria-current');
      });
      var h = $('[data-stage="' + n + '"] .stage-title', f); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    }
    function err(stage, msg) { var e = $('[data-stage="' + stage + '"] .form-error', f); e.textContent = msg || ''; }
    function ctx() {
      return { desafio: f.desafio.value.trim(), porte: f.porte.value, nome: f.nome.value.trim(), empresa: f.empresa.value.trim(), email: f.email.value.trim(), telefone: f.telefone.value.trim(), origem: /origem=fsia/.test(location.search) ? 'Formulário (vindo da FSiA)' : 'Formulário do site' };
    }
    $('#to-2').addEventListener('click', function () {
      if (f.desafio.value.trim().length < 10) { err(1, 'Conte o seu desafio em pelo menos uma frase.'); f.desafio.setAttribute('aria-invalid', 'true'); f.desafio.focus(); return; }
      f.desafio.removeAttribute('aria-invalid'); err(1); go(2);
    });
    $('#back-1').addEventListener('click', function () { go(1); });
    $('#to-3').addEventListener('click', function () {
      var bad = null;
      ['nome', 'empresa', 'email'].forEach(function (k) { var ok = f[k].value.trim() && (k !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f[k].value.trim())); f[k].setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok && !bad) bad = f[k]; });
      if (!f.lgpd.checked) { bad = bad || f.lgpd; }
      if (bad) { err(2, 'Preencha nome, empresa, um e-mail válido e confirme a autorização de uso dos dados.'); bad.focus(); return; }
      err(2); renderChannels(); go(3);
      track('envio_formulario', { etapa: 'dados' });
      if (CONFIG.formEndpoint) {
        try { fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign(ctx(), { resumo: summaryText(ctx()) })) }); } catch (e) {}
      }
    });
    $('#back-2').addEventListener('click', function () { go(2); });
    function renderChannels() {
      var box = $('#channels'); box.innerHTML = '';
      channelLinks(ctx(), true).forEach(function (c) {
        var a = el('a', { class: 'channel', href: c.href, 'data-track': c.track, 'data-channel': c.key }, [icon(c.icon, 22), el('span', null, [el('b', { text: c.label }), el('span', { class: 'small muted', text: c.desc })])]);
        if (c.key === 'agenda') a.addEventListener('click', function (e) { e.preventDefault(); openCalendly(); });
        else if (c.external) { a.target = '_blank'; a.rel = 'noopener'; }
        box.appendChild(a);
      });
    }
    function openCalendly() {
      var wrap = $('#calendly-wrap'); wrap.hidden = false;
      var c = ctx();
      var url = calendlyUrl(c, true) + (calendlyUrl(c, true).indexOf('?') > -1 ? '&' : '?') + 'hide_gdpr_banner=1&embed_domain=' + encodeURIComponent(location.hostname) + '&embed_type=Inline';
      var holder = $('#calendly-box'); holder.innerHTML = '';
      holder.appendChild(el('iframe', { src: url, title: 'Agenda: Conversa de Entendimento FSA, 30 minutos', width: '100%', height: '700', style: 'border:0;display:block', loading: 'lazy' }));
      wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); $('#calendly-title').focus();
    }
    window.addEventListener('message', function (e) {
      if (e.origin !== 'https://calendly.com' || !e.data || !e.data.event) return;
      if (e.data.event === 'calendly.event_scheduled') {
        track('agendamento_concluido', { origem: 'conversar' });
        showConfirm({});
      }
    });
    go(1);
  }

  /* ---------------- confirmação "Conversa agendada." ---------------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function icsDate(d) { return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z'; }
  function showConfirm(p) {
    var dlg = $('#confirm-dialog'); if (!dlg) return;
    var start = p.start ? new Date(p.start) : null, end = p.end ? new Date(p.end) : (start ? new Date(start.getTime() + 30 * 60000) : null);
    var when = $('#confirm-when'), add = $('#confirm-add'), gcal = $('#confirm-gcal'), note = $('#confirm-note');
    if (start && !isNaN(start)) {
      when.textContent = start.toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }) + ' (horário de Brasília)';
      when.hidden = false;
      var title = 'Conversa de Entendimento FSA — 30 min';
      var desc = 'Conversa de Entendimento FSA⁴Future. O link do Google Meet está no convite enviado por e-mail.';
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FSA4Future//Site//PT-BR', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@fsa4future.com.br', 'DTSTAMP:' + icsDate(new Date()), 'DTSTART:' + icsDate(start), 'DTEND:' + icsDate(end), 'SUMMARY:' + title, 'DESCRIPTION:' + desc, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      add.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics); add.setAttribute('download', 'conversa-fsa4future.ics'); add.hidden = false;
      gcal.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=' + icsDate(start) + '/' + icsDate(end) + '&details=' + encodeURIComponent(desc);
      gcal.hidden = false; note.hidden = true;
    } else {
      when.hidden = true; add.hidden = true; gcal.hidden = true; note.hidden = false;
    }
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function initConfirmPage() {
    var page = $('#confirm-page'); if (!page) return;
    var q = new URLSearchParams(location.search);
    track('agendamento_concluido', { origem: 'redirect_calendly' });
    showConfirm({ start: q.get('event_start_time'), end: q.get('event_end_time') });
  }
  function initDialogClose() {
    $all('[data-dialog-close]').forEach(function (b) { b.addEventListener('click', function () { var d = b.closest('dialog'); if (d) d.close(); }); });
  }

  /* ---------------- interação do método na Home ---------------- */
  function initMethodHome() {
    var box = $('#method-home'); if (!box) return;
    var btns = $all('.f4-step', box), panels = $all('[data-step-panel]', box);
    function set(i) {
      btns.forEach(function (b, j) {
        b.classList.toggle('f4-step--active', j === i); b.classList.toggle('f4-step--done', j < i);
        b.setAttribute('aria-selected', String(j === i)); b.tabIndex = j === i ? 0 : -1;
      });
      panels.forEach(function (p, j) { p.hidden = j !== i; });
      track('interacao_metodo', { etapa: i + 1 });
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { set(i); });
      b.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? btns.length - 1 : null;
        if (n === null) return; e.preventDefault(); n = (n + btns.length) % btns.length; btns[n].focus(); set(n);
      });
    });
  }

  function init() {
    initConsent(); initMenu(); initFSiA(); initConversar(); initConfirmPage(); initDialogClose(); initMethodHome();
    var hub = document.body.getAttribute('data-hub'); if (hub) track('visita_hub', { frente: hub });
    if (document.body.getAttribute('data-page') === 'case') track('visualizacao_case');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
