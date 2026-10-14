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
    whatsapp: '551233519958',          // somente dígitos com DDI (FSA 57, provisório — voltou a 12/10/2026: o (12) 99676-0183 não funcionou no WhatsApp Web)
    telefone: '+551233519958',
    telefoneLabel: '(12) 3351-9958',
    calendly: 'https://calendly.com/catiascan/primeiro-atendimento-gratuito-fsa-future',
    formEndpoint: 'https://formsubmit.co/ajax/catia@fsasolucoes.com.br',        // POST JSON opcional (ex.: Apps Script/Formspree) com cópia para atendimento@
    consentVersion: '1.0',
    analytics: false /* nenhuma ferramenta de análise em uso: o aviso de cookies não aparece. Pôr true quando loadAnalytics() tiver a ferramenta escolhida. */
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
    if (!CONFIG.analytics) { box.hidden = true; return; } /* só o necessário: não há nada a consentir */
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
    if (CONFIG.email) out.push({ key: 'email', icon: 'mail', label: 'E-mail', desc: CONFIG.email + ' · abre no Gmail', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONFIG.email) + '&su=' + encodeURIComponent('Quero conversar sobre meu desafio') + '&body=' + encodeURIComponent(text), external: true, track: 'clique_email' });
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
    ['products', /produto|mvp|startup|ideia|criar (um |uma )?(app|aplicativ|plataforma|sistema|site)|do zero/i],
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
  var IDEA_QUESTIONS = [
    'Me conta um pouco do desafio. O que está acontecendo hoje?',
    'Que bom! Para quem é essa ideia? Quem usaria no dia a dia?',
    'Qual é a principal coisa que ela precisa fazer? Pode ser em uma frase.',
    'Já existe algo pronto, como um rascunho, um protótipo ou conversas com possíveis clientes?',
    'Tem alguma data ou meta, como lançamento, investidor ou edital?'
  ];
  var IDEA_LABELS = ['Ideia:', 'Para quem:', 'O que precisa fazer:', 'O que já existe:', 'Data ou meta:'];
  var IDEA_SIGNAL = /ideia|criar (um |uma )?(app|aplicativ|plataforma|sistema|site|produto)|startup|\bmvp\b|do zero|ainda n[aã]o existe|s[oó] uma ideia|n[aã]o tem opera/i;
  var CAP_GUARD = /(vcs|voc[eê]s|a fsa) (fazem|criam|desenvolvem|constroem|trabalham com)|fazem (isso|app|aplicativ|sistema|site|plataforma)|se (vcs|voc[eê]s) fazem/i;
  var CAP_ANSWER = 'Sim. A FSA⁴Future desenvolve sistemas, aplicativos, integrações e soluções com IA, do zero ou a partir do que já existe. Para uma ideia nova, o caminho costuma começar por uma versão mínima (MVP), para testar com quem vai usar antes de investir no produto completo.';
  var ABOUT_TEXT = 'A FSA⁴Future é um Technology & Business Hub. Combinamos experiência, proximidade e diferentes capacidades tecnológicas para entender, desenhar e construir soluções para desafios reais de negócio. São mais de 20 anos em consultoria e tecnologia, antes como FSA Soluções em Tecnologia, da descoberta à execução, com NPS 70. A nossa promessa: você traz o desafio; a gente encontra, conecta ou constrói a tecnologia para resolvê-lo.';
  var WHO_TEXT = 'Atendemos empresas com um desafio real de negócio, de pequenas a grandes. Muitos clientes são empresas em operação que não têm um time de tecnologia próprio: indústria, distribuição, clínicas, escritórios de serviços e comércio. Quem decide costuma ser o dono ou um diretor, e por isso a gente explica tudo sem jargão. O que importa é o problema, não o tamanho.';
  var PILLARS_TEXT = 'O que guia a gente: proximidade (você acompanha e decide junto), tecnologia sem dogma (IA, automação, dados e integrações são meios, não fins), capacidade de construir (a gente não para no diagnóstico) e experiência para enxergar riscos e oportunidades que não aparecem no pedido. Nada sobre o cliente sem o cliente.';
  var KNOW = [
    [/^(oi|ol[aá]|bom dia|boa tarde|boa noite|e a[ií])\b[!.,\s]*$/i, 'Olá! Que bom ter você por aqui.', 'menu'],
    [/quem (s[aã]o|[eé]) (voc[eê]s|a fsa)|o que [eé] a fsa|sobre (a fsa|voc[eê]s|a empresa)|conhecer a fsa|hist[oó]ria|h[aá] quanto tempo|experi[eê]ncia de voc/i, 'ABOUT', 'about'],
    [/(que|quais) (tipo|tipos) de (empresa|cliente)|para quem|quem (voc[eê]s )?atendem|atendem (empresa|pequen|grande|m[eé]di|cl[ií]nica|ind[uú]stria|com[eé]rcio)|porte|segmento|setor|nicho/i, 'WHO', 'after'],
    [/o que (voc[eê]s|a fsa) (fazem|faz|oferece)|quais (s[aã]o os )?servi[cç]os|servi[cç]os de voc|solu[cç][oõ]es de voc|com o que trabalham/i, null, 'solutions'],
    [/como (voc[eê]s )?trabalham|m[eé]todo|metodologia|como funciona o (trabalho|processo)|etapas/i, null, 'metodo'],
    [/valores|princ[ií]pios|pilares|diferencial|por que (a fsa|voc[eê]s)|o que (te|os) diferencia/i, 'PILLARS', 'after'],
    [/preciso saber (qual|que) tecnologia|n[aã]o entendo de tecnologia|n[aã]o sou t[eé]cnic/i, 'Não precisa. Essa parte a gente descobre junto. Você traz o problema; a escolha da tecnologia é com o time, explicada sem jargão.', 'after'],
    [/s[oó] (fazem )?(projeto )?do zero|j[aá] tenho (um )?sistema|integrar com o que (eu )?j[aá] tenho|aproveitar o que (eu )?j[aá] tenho/i, 'Não fazemos só do zero. Às vezes a melhor resposta já existe e só precisa ser conectada, integrada ou melhorada. A gente olha primeiro o que você já tem.', 'after'],
    [/\bcases?\b|portf[oó]lio|clientes de voc|quem j[aá] atenderam|exemplos? de projeto/i, 'Os cases completos estão em autorização com os clientes, por isso não citamos nomes. Já entregamos, por exemplo: automação do envio de e-mails e de rotinas de cobrança, integrações com bancos e emissão de boletos, limpeza e organização de bases de dados antigas, relatórios gerenciais confiáveis, plataformas web e aplicativos, e sites institucionais. Em segmentos como cobrança e recuperação de crédito, contabilidade e serviços financeiros, saúde e serviços. Na conversa gratuita, o time conta experiências parecidas com a sua.', 'after'],
    [/startup|founder|aceleradora|incubadora|mvp|demo day|edital/i, 'STARTUP', 'startup'],
    [/como (é|funciona) a (primeira )?conversa|conversa de entendimento|reuni[aã]o inicial/i, 'É a Conversa de Entendimento FSA⁴Future: 30 minutos, gratuita, por Google Meet. Um primeiro encontro para ouvir seu contexto, entender o desafio e identificar juntos qual pode ser o próximo passo. Não precisa chegar com a solução definida.', 'handoff'],
    [/reclama|insatisfeit|p[eé]ssimo atendimento|n[aã]o (est[aá]|ficou) funcionando|problema com (o|a) (sistema|entrega|servi[cç]o) de voc|sou cliente/i, 'Sinto muito pelo transtorno. Vou te conectar com o time agora, com prioridade.', 'handoff'],
    [/impressora|formatar|conserto|consertar (o |meu )?(pc|computador|celular|notebook)|wi-?fi|internet (caiu|lenta)|v[ií]rus no/i, 'Esse não é um serviço da FSA⁴Future. Se fizer parte de um desafio maior de tecnologia na sua empresa, posso te conectar com o time.', 'after'],
    [/quanto (eu )?ganho|comiss[aã]o|percentual (de|do) parceiro/i, 'Os percentuais estão no contrato de adesão, que você vê na página de adesão do Programa de Parceiros. O valor de cada indicação é definido quando o cliente fecha.', 'parceiro'],
    [/porra|caralho|merda|idiota|lixo|burra|in[uú]til/i, 'Entendo que você esteja chateado. Posso te conectar com uma pessoa do time.', 'handoff'],
    [/obrigad|valeu|agrade[cç]o|tchau|at[eé] mais/i, 'Eu que agradeço! Se precisar, é só chamar.', 'end']
  ];
  var PRICE_GUARD = /pre[cç]o|quanto custa|or[cç]amento|valor[- ]hora|cobram|investimento|tabela de valores|quanto (fica|sai)/i;
  var TIME_GUARD = /prazo|quanto tempo|quando fica pronto|em quantos dias|entrega em/i;
  var GUARDS = [
    [/pre[cç]o|quanto custa|or[cç]amento|valor[- ]hora|cobram|investimento|tabela de valores/i, 'O valor depende do desafio e do escopo, que a gente define junto numa conversa. Essa primeira conversa é gratuita. Quer agendar?', 'handoff'],
    [/prazo|quanto tempo|quando fica pronto|em quantos dias|entrega em/i, 'O prazo sai do escopo. Na Conversa de Entendimento o time avalia isso com você.', 'handoff'],
    [/d[aá] (pra|para) fazer|[eé] poss[ií]vel|[eé] vi[aá]vel|viabilidade|conseguem fazer/i, 'Parece um desafio que a FSA⁴Future costuma olhar de perto. Quem confirma é o time, depois de entender o contexto.', 'handoff'],
    [/\bcpf\b|\brg\b|senha|cart[aã]o de cr[eé]dito|conta banc[aá]ria|\bpix\b|dado(s)? de sa[uú]de/i, 'Não preciso desse dado. Por segurança, não envie por aqui.', null],
    [/vaga|curr[ií]culo|trabalhar (na|com a) fsa|emprego/i, 'Envie seu currículo para ' + CONFIG.email + ' com o assunto "Vagas".', null],
    [/voc[eê] [eé] (humana|uma pessoa|rob[oô]|real)|falo com (um )?rob/i, 'Sou a assistente digital da FSA⁴Future. Posso te conectar com uma pessoa do time quando quiser.', 'handoff'],
    [/ignore|esque[cç]a (as|suas) (regras|instru)|prompt|system/i, 'Vamos voltar ao começo.', 'menu'],
    [/(voc[eê]s )?(fazem|trabalham com|usam) (ia|intelig)/i, 'Sim, quando IA é a resposta certa para o problema. Às vezes a resposta é automação, integração ou dados. Muitas vezes é uma combinação.', null],
    [/concorr|melhor que|compar/i, 'Não comento outras empresas. Posso te contar como a FSA⁴Future trabalha.', 'metodo'],
    [/apagar (meus )?dados|excluir (meus )?dados|lgpd|privacidade/i, 'Registrei seu pedido. Para tratar dados pessoais, escreva para ' + CONFIG.email + ' com o assunto "Privacidade".', null],
    [/onde fica|endere[cç]o/i, 'O atendimento é remoto ou presencial, a combinar com o time.', 'handoff'],
    [/primeira conversa|tem custo|[eé] gr[aá]tis|gratuit/i, 'A Conversa de Entendimento FSA⁴Future tem 30 minutos e é gratuita: um primeiro encontro para ouvir seu contexto, entender o desafio e identificar juntos qual pode ser o próximo passo.', 'handoff'],
    [/falar com (algu[eé]m|uma pessoa|humano|atendente)|atendimento humano|quero falar/i, null, 'handoff']
  ];

  function initFSiA() {
    var root = $('#fsia'); if (!root) return;
    var launcher = $('#fsia-launcher'), panel = $('#fsia-panel'), log = $('#fsia-log'), form = $('#fsia-form'), input = $('#fsia-input'), closeBtn = $('#fsia-close');
    var state = { mode: 'menu', q: 0, ctx: session.get('f4_fsia_ctx') || { respostas: [], origem: 'FSiA' }, started: false };

    var faceTop = $('#fsia-face'), faceBase = faceTop ? faceTop.getAttribute('src').replace(/fsia-ouvindo\.svg$/, '') : '', faceTimer;
    function faceImg(k) { var i = el('img', { class: 'f4-msg__avatar f4-msg__avatar--img', src: faceBase + 'fsia-' + k + '.svg', alt: '', width: '24', height: '25' }); i.setAttribute('aria-hidden', 'true'); return i; }
    function face(k, back) { if (!faceTop) return; clearTimeout(faceTimer); faceTop.src = faceBase + 'fsia-' + k + '.svg'; if (back) faceTimer = setTimeout(function () { faceTop.src = faceBase + 'fsia-ouvindo.svg'; }, back); }
    function save() { session.set('f4_fsia_ctx', state.ctx); }
    function scroll() { log.scrollTop = log.scrollHeight; }
    function clearOptions() { $all('.f4-msg__opts', log).forEach(function (o) { o.remove(); }); }
    function say(text, options, extra) {
      clearOptions(); face('respondendo', 1800);
      var bubble = el('div', { class: 'f4-msg__bubble' }); bubble.textContent = text || '';
      if (extra) bubble.appendChild(extra);
      var m = el('div', { class: 'f4-msg' }, [
        el('div', { class: 'f4-msg__who' }, [faceImg('respondendo'), 'FSiA']),
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
      clearOptions(); face('pensando');
      log.appendChild(el('div', { class: 'f4-msg f4-msg--user' }, [el('div', { class: 'f4-msg__bubble', text: text })])); scroll();
      if (!state.started) { state.started = true; track('fsia_inicio_conversa'); }
    }
    function menu() {
      state.mode = 'menu';
      say('Por onde começamos?', [
        { label: 'Tenho um desafio', run: startChallenge },
        { label: 'Quero conhecer as soluções', run: solutions },
        { label: 'Quem é a FSA⁴Future?', run: about },
        { label: 'Quero falar com alguém', run: handoff },
        { label: 'Ainda não sei por onde começar', run: function () { say('Tudo bem. Não precisa saber qual tecnologia usar. Essa parte a gente descobre junto.'); startChallenge(); } }
      ]);
    }
    function opening() {
      say('Olá, eu sou a FSiA. Posso ajudar você a entender como a FSA⁴Future pode apoiar seu desafio, apresentar nossas soluções ou conectar você com nosso time.');
      menu();
    }
    function startChallenge() { state.mode = 'challenge'; state.q = 0; state.path = 'empresa'; state.priceAsks = 0; state.ctx.respostas = []; delete state.ctx.consentimento; delete state.ctx.enviado; delete state.ctx.frente; save(); ask(); }
    function qList() { return state.path === 'ideia' ? IDEA_QUESTIONS : QUESTIONS; }
    function qLabels() { return state.path === 'ideia' ? IDEA_LABELS : QLABELS; }
    function ask() {
      say(qList()[state.q], [{ label: 'Prefiro falar com alguém', run: handoff }]);
      input.focus();
    }
    function nextQ() {
      state.q++;
      if (state.q < qList().length) return ask();
      return finishChallenge();
    }
    function pauseWith(text) {
      say(text, [
        { label: 'Agendar a conversa gratuita', run: handoff },
        { label: 'Continuar contando', run: nextQ }
      ]);
    }
    function suggestFront(text) {
      for (var i = 0; i < SIGNALS.length; i++) if (SIGNALS[i][1].test(text)) return SIGNALS[i][0];
      return null;
    }
    function finishChallenge() {
      var all = state.ctx.respostas.map(function (r) { return r[1]; }).join(' ');
      if (state.path === 'ideia') {
        state.ctx.frente = 'FSA⁴Products · Startups'; state.ctx.desafio = state.ctx.respostas[0] ? state.ctx.respostas[0][1] : ''; save();
        var sa = el('a', { href: ROOT + 'hub/fsa-4-products/startups/', text: ' Ver o caminho para startups.' });
        say('Obrigada! A sua ideia conversa com o caminho da FSA⁴Future para startups: ideia clara, validação, protótipo, MVP e produto. O próximo passo é uma conversa de 30 minutos, gratuita, para entender onde você está.', null, sa);
        return handoff();
      }
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
    function about() {
      state.mode = 'menu';
      var a = el('a', { href: ROOT + 'sobre/', text: ' Ver a página Sobre.' });
      say(ABOUT_TEXT, null, a);
      say('Quer saber mais?', [
        { label: 'Para quem vocês trabalham?', run: function () { say(WHO_TEXT); afterAnswer(); } },
        { label: 'O que vocês fazem?', run: solutions },
        { label: 'Tenho um desafio', run: startChallenge }
      ]);
    }
    function afterAnswer() {
      say('Posso ajudar em mais alguma coisa?', [
        { label: 'Tenho um desafio', run: startChallenge },
        { label: 'Quem é a FSA⁴Future?', run: about },
        { label: 'Quero falar com alguém', run: handoff }
      ]);
    }
    function startupInfo() {
      var a = el('a', { href: ROOT + 'hub/fsa-4-products/startups/', text: ' Ver o caminho para startups e contar sua ideia.' });
      say('A FSA⁴Future acompanha startups da ideia ao MVP, em etapas: ideia clara, validação, protótipo, MVP e produto. Você entra na etapa em que está e investe na próxima só depois de ver a anterior funcionando.', null, a);
      say('Quer me contar a sua ideia?', [{ label: 'Tenho uma ideia', run: function () { startChallenge(); state.path = 'ideia'; } }, { label: 'Quero falar com alguém', run: handoff }]);
    }
    function partnerInfo() {
      var a = el('a', { href: ROOT + 'hub/fsa-4-partners/adesao/', text: ' Ir para a adesão.' });
      say('Empresas com CNPJ ativo que atendem outras empresas (agências, contabilidades, consultorias, integradores, mentores e assessorias) podem indicar quem precisa de tecnologia. A FSA⁴Future conduz a conversa, o escopo e a proposta. Com o contrato fechado e pago, o parceiro recebe comissão sobre o valor líquido recebido.', null, a);
      afterAnswer();
    }
    function knowledge(text) {
      for (var k = 0; k < KNOW.length; k++) {
        if (!KNOW[k][0].test(text)) continue;
        var ans = KNOW[k][1] === 'ABOUT' ? null : KNOW[k][1] === 'WHO' ? WHO_TEXT : KNOW[k][1] === 'PILLARS' ? PILLARS_TEXT : KNOW[k][1];
        var nx = KNOW[k][2];
        if (nx === 'about') { about(); return true; }
        if (nx === 'startup') { startupInfo(); return true; }
        if (ans) say(ans);
        if (nx === 'menu') menu(); else if (nx === 'solutions') solutions(); else if (nx === 'metodo') method();
        else if (nx === 'handoff') handoff(); else if (nx === 'parceiro') partnerInfo(); else if (nx === 'after') afterAnswer();
        return true;
      }
      return false;
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
      say('A FSA⁴Future trabalha em seis etapas: 01 Ouvir, 02 Entender, 03 Conectar, 04 Construir, 05 Validar e 06 Evoluir. Eu participo só do Ouvir; o Entender em diante é com o time.', null, a);
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
      say('Seus dados são usados só para o time da FSA⁴Future retornar sobre este atendimento (veja a Política de Privacidade). Como posso te chamar, e de qual empresa?', [{ label: 'Pular', run: channels }]);
      input.focus();
    }
    function sendSummary() {
      if (!CONFIG.formEndpoint || state.ctx.enviado) return;
      state.ctx.enviado = true; save();
      var c = state.ctx, body = { _subject: 'FSiA: nova conversa no site' + (c.empresa ? ' (' + c.empresa + ')' : ''), _template: 'table', _captcha: 'false',
        'Nome': c.nome || '—', 'Empresa': c.empresa || '—', 'Frente sugerida': c.frente || '—', 'Página': location.href };
      (c.respostas || []).forEach(function (r, i) { body[(i + 1) + '. ' + r[0].replace(':', '')] = r[1]; });
      try { fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body) }); } catch (e) {}
    }
    function channels() {
      state.mode = 'menu';
      var withSummary = !!state.ctx.consentimento;
      if (withSummary) sendSummary();
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
        if (/\?\s*$/.test(text) && !PRICE_GUARD.test(text) && !TIME_GUARD.test(text) && !CAP_GUARD.test(text)) {
          for (var kk = 0; kk < KNOW.length; kk++) {
            if (KNOW[kk][0].test(text) && ['after', 'menu'].indexOf(KNOW[kk][2]) >= 0 && KNOW[kk][1]) {
              var a0 = KNOW[kk][1] === 'WHO' ? WHO_TEXT : KNOW[kk][1] === 'PILLARS' ? PILLARS_TEXT : KNOW[kk][1];
              say(a0); return ask();
            }
          }
        }
        if (state.q === 0 && IDEA_SIGNAL.test(text)) state.path = 'ideia';
        state.ctx.respostas.push([qLabels()[state.q], text.slice(0, 600)]); save();
        if (CAP_GUARD.test(text)) say(CAP_ANSWER);
        if (PRICE_GUARD.test(text)) {
          state.priceAsks = (state.priceAsks || 0) + 1;
          return pauseWith(state.priceAsks === 1
            ? 'O valor depende do que vai ser construído, e isso a gente define junto. A primeira conversa, de 30 minutos, é gratuita e já sai com um caminho e uma noção de investimento para o seu caso.'
            : 'Entendo, o investimento é importante para decidir. Não passo valores por aqui porque cada caso é diferente e eu não quero te dar um número errado. Na conversa gratuita o time olha a sua ideia e te diz por onde começar gastando pouco.');
        }
        if (TIME_GUARD.test(text)) return pauseWith('O prazo sai do escopo. Na conversa gratuita o time avalia isso com você.');
        return nextQ();
      }
      if (knowledge(text)) return;
      if (CAP_GUARD.test(text)) {
        say(CAP_ANSWER);
        return say('Quer me contar a sua ideia ou o seu desafio?', [{ label: 'Tenho um desafio', run: startChallenge }, { label: 'Quero falar com alguém', run: handoff }]);
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
    setTimeout(function () { root.classList.add('is-quiet'); }, 6000); // QA-022: etiqueta só nos primeiros segundos
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
        try { var c0 = ctx(); fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ _subject: 'Novo contato pelo site: ' + (c0.empresa || c0.nome), _template: 'table', _captcha: 'false', 'Nome': c0.nome, 'Empresa': c0.empresa, 'E-mail': c0.email, 'Telefone / WhatsApp': c0.telefone || '—', 'Tamanho da empresa': c0.porte || '—', 'Desafio': c0.desafio, 'Origem': c0.origem, 'Página': location.href }) }); } catch (e) {}
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


  /* ---------------- acessibilidade (QA-023) ----------------
     Botão fixo à esquerda: Libras (VLibras, só carrega quando a pessoa ativa), ouvir a página,
     texto maior, alto contraste, sublinhar links e pausar animações. Preferências ficam no aparelho. */
  function initA11y() {
    var KEY = 'f4_a11y', html = document.documentElement;
    var pref = {}; try { pref = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { pref = {}; }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch (e) {} }
    function apply() {
      html.classList.toggle('a11y-text-1', pref.text === 1); html.classList.toggle('a11y-text-2', pref.text === 2);
      html.classList.toggle('a11y-contrast', !!pref.contrast); html.classList.toggle('a11y-links', !!pref.links); html.classList.toggle('a11y-still', !!pref.still);
    }
    apply();
    var ICON = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="7" r="1.4" fill="currentColor"/><path d="M7 10h10M12 10v4l-2.5 5M12 14l2.5 5"/></svg>';
    var wrap = el('div', { class: 'a11y', id: 'a11y' });
    var btn = el('button', { type: 'button', class: 'a11y__btn', id: 'a11y-btn', 'aria-expanded': 'false', 'aria-controls': 'a11y-panel' });
    btn.innerHTML = ICON + '<span class="visually-hidden">Acessibilidade</span>';
    var panel = el('section', { class: 'a11y__panel', id: 'a11y-panel', role: 'dialog', 'aria-label': 'Opções de acessibilidade', hidden: '' });
    function opt(id, label, desc) {
      var b = el('button', { type: 'button', class: 'a11y__opt', id: id, 'aria-pressed': 'false' }, [el('b', { text: label }), el('span', { text: desc })]);
      return b;
    }
    var bLibras = opt('a11y-libras', 'Libras', 'Tradução para Libras com o VLibras, do Governo Federal');
    var bOuvir = opt('a11y-ouvir', 'Ouvir a página', 'Lê o conteúdo em voz alta');
    var bTexto = opt('a11y-texto', 'Texto maior', 'Aumenta o tamanho de tudo em dois passos');
    var bContraste = opt('a11y-contraste', 'Alto contraste', 'Deixa textos e cores mais fortes');
    var bLinks = opt('a11y-links', 'Destacar links', 'Sublinha todos os links');
    var bParar = opt('a11y-parar', 'Pausar animações', 'Para a mascote e os movimentos');
    var reset = el('button', { type: 'button', class: 'a11y__reset', text: 'Voltar ao padrão' });
    var more = el('a', { class: 'a11y__more', href: ROOT + 'acessibilidade/', text: 'Sobre a acessibilidade do site' });
    panel.appendChild(el('div', { class: 'a11y__head' }, [el('b', { text: 'Acessibilidade' }), el('button', { type: 'button', class: 'a11y__close', 'aria-label': 'Fechar acessibilidade', text: '×', onclick: function () { toggle(false); } })]));
    [bLibras, bOuvir, bTexto, bContraste, bLinks, bParar].forEach(function (b) { panel.appendChild(b); });
    panel.appendChild(el('div', { class: 'a11y__foot' }, [reset, more]));
    wrap.appendChild(panel); wrap.appendChild(btn); document.body.appendChild(wrap);
    function sync() {
      bTexto.setAttribute('aria-pressed', pref.text ? 'true' : 'false'); bTexto.querySelector('span').textContent = pref.text === 2 ? 'Tamanho máximo. Toque de novo para voltar' : pref.text === 1 ? 'Toque de novo para aumentar mais' : 'Aumenta o tamanho de tudo em dois passos';
      bContraste.setAttribute('aria-pressed', pref.contrast ? 'true' : 'false'); bLinks.setAttribute('aria-pressed', pref.links ? 'true' : 'false'); bParar.setAttribute('aria-pressed', pref.still ? 'true' : 'false');
    }
    sync();
    function toggle(open) { panel.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); if (open) panel.querySelector('.a11y__opt').focus(); else btn.focus(); }
    btn.addEventListener('click', function () { toggle(panel.hidden); });
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
    bTexto.addEventListener('click', function () { pref.text = ((pref.text || 0) + 1) % 3; save(); apply(); sync(); });
    bContraste.addEventListener('click', function () { pref.contrast = !pref.contrast; save(); apply(); sync(); });
    bLinks.addEventListener('click', function () { pref.links = !pref.links; save(); apply(); sync(); });
    bParar.addEventListener('click', function () { pref.still = !pref.still; save(); apply(); sync(); });
    reset.addEventListener('click', function () { pref = {}; save(); apply(); sync(); stopSpeech(); });
    // Ouvir a página (voz do próprio aparelho, sem serviço externo)
    var speaking = false;
    function stopSpeech() { if (window.speechSynthesis) speechSynthesis.cancel(); speaking = false; bOuvir.setAttribute('aria-pressed', 'false'); bOuvir.querySelector('b').textContent = 'Ouvir a página'; }
    bOuvir.addEventListener('click', function () {
      if (!('speechSynthesis' in window)) { bOuvir.querySelector('span').textContent = 'Este navegador não lê em voz alta. Use o leitor de tela do aparelho.'; return; }
      if (speaking) { stopSpeech(); return; }
      var main = document.getElementById('conteudo') || document.querySelector('main'); if (!main) return;
      var parts = (main.innerText || '').split(/\n+/).map(function (t) { return t.trim(); }).filter(Boolean);
      var voices = speechSynthesis.getVoices().filter(function (v) { return /^pt(-|_)BR/i.test(v.lang); });
      speechSynthesis.cancel(); speaking = true; bOuvir.setAttribute('aria-pressed', 'true'); bOuvir.querySelector('b').textContent = 'Parar a leitura';
      parts.forEach(function (t, i) { var u = new SpeechSynthesisUtterance(t); u.lang = 'pt-BR'; if (voices[0]) u.voice = voices[0]; u.rate = 1; if (i === parts.length - 1) u.onend = stopSpeech; speechSynthesis.speak(u); });
      track('acessibilidade_ouvir');
    });
    window.addEventListener('pagehide', function () { if (window.speechSynthesis) speechSynthesis.cancel(); });
    // Libras: VLibras só é carregado quando a pessoa pede
    var vlibrasOn = false;
    bLibras.addEventListener('click', function () {
      track('acessibilidade_libras');
      if (vlibrasOn) { var vb = document.querySelector('[vw-access-button]'); if (vb) vb.click(); toggle(false); return; }
      vlibrasOn = true; bLibras.querySelector('span').textContent = 'Carregando o VLibras…';
      var box = document.createElement('div'); box.setAttribute('vw', ''); box.className = 'enabled';
      box.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
      document.body.appendChild(box);
      var sc = document.createElement('script'); sc.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      sc.onload = function () {
        try { new window.VLibras.Widget('https://vlibras.gov.br/app'); } catch (e) {}
        if (typeof window.onload === 'function') { try { window.onload(); } catch (e) {} }
        bLibras.setAttribute('aria-pressed', 'true'); bLibras.querySelector('span').textContent = 'Ativo. Clique num texto para ver em Libras.';
        setTimeout(function () { var vb = document.querySelector('[vw-access-button]'); if (vb) vb.click(); }, 900);
        toggle(false);
      };
      sc.onerror = function () { vlibrasOn = false; bLibras.querySelector('span').textContent = 'Não foi possível carregar o VLibras agora. Tente de novo.'; };
      document.body.appendChild(sc);
    });
  }

  /* Contagem de visitas: Cloudflare Web Analytics (14/10/2026). Não usa cookies nem
     identifica a pessoa, por isso não depende do aviso de cookies. */
  function loadVisitCounter() {
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.protocol === 'file:') return;
    var s = document.createElement('script');
    s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', '{"token": "5e5be302fdf04cf4b8b2daec3e408aa7"}');
    document.body.appendChild(s);
  }

  function init() {
    loadVisitCounter(); initConsent(); initMenu(); initA11y(); initFSiA(); initConversar(); initConfirmPage(); initDialogClose(); initMethodHome();
    var hub = document.body.getAttribute('data-hub'); if (hub) track('visita_hub', { frente: hub });
    if (document.body.getAttribute('data-page') === 'case') track('visualizacao_case');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
