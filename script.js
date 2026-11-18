/* Espaço Angels Hands — JavaScript puro */
(function () {
  'use strict';
  var WA = '5513988741234';
  var DEFAULT_MSG = 'Olá! Conheci o Espaço Angels Hands pelo site e gostaria de saber mais sobre os atendimentos e agendar uma avaliação.';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var waUrl = function (m) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m); };

  /* WhatsApp: todos os links com [data-wa] */
  function initWhatsApp() {
    $$('[data-wa]').forEach(function (a) {
      var s = a.getAttribute('data-msg');
      var m = s ? 'Olá! Conheci o Espaço Angels Hands pelo site e gostaria de saber mais sobre ' + s + '.' : DEFAULT_MSG;
      a.href = waUrl(m); a.target = '_blank'; a.rel = 'noopener';
    });
  }

  /* Header + menu mobile */
  function initHeader() {
    var h = $('#header'), btn = $('#menuBtn'), nav = $('#nav');
    if (!h || !btn || !nav) return;
    var onScroll = function () { h.classList.toggle('scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    var set = function (open) { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); };
    btn.addEventListener('click', function () { set(!nav.classList.contains('open')); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  /* Scroll reveal */
  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: .12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* Carrossel de avaliações */
  function initCarousel() {
    var c = $('#carousel'); if (!c) return;
    var track = $('.track', c), n = $$('.slide', c).length, dots = $('#dots'), i = 0, timer;
    var go = function (k) {
      i = (k + n) % n; track.style.transform = 'translateX(-' + i * 100 + '%)';
      $$('button', dots).forEach(function (d, j) { d.classList.toggle('on', j === i); d.setAttribute('aria-current', j === i); });
    };
    for (var k = 0; k < n; k++) (function (k) {
      var d = document.createElement('button'); d.setAttribute('aria-label', 'Ir para avaliação ' + (k + 1));
      d.addEventListener('click', function () { go(k); }); dots.appendChild(d);
    })(k);
    $('#prev').addEventListener('click', function () { go(i - 1); });
    $('#next').addEventListener('click', function () { go(i + 1); });
    c.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(i - 1); if (e.key === 'ArrowRight') go(i + 1); });
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) { timer = setInterval(function () { go(i + 1); }, 7000); c.addEventListener('mouseenter', function () { clearInterval(timer); }); }
    go(0);
  }

  /* FAQ accordion */
  function initFaq() {
    var qs = $$('.faq-q'); if (!qs.length) return;
    qs.forEach(function (q, idx) {
      var a = q.closest('.faq-item').querySelector('.faq-a');
      q.id = 'faq-q' + idx; a.id = 'faq-a' + idx; q.setAttribute('aria-controls', a.id); a.setAttribute('role', 'region'); a.setAttribute('aria-labelledby', q.id);
      q.addEventListener('click', function () {
        var open = q.getAttribute('aria-expanded') === 'true';
        qs.forEach(function (o) { o.setAttribute('aria-expanded', 'false'); o.closest('.faq-item').querySelector('.faq-a').style.maxHeight = null; });
        if (!open) { q.setAttribute('aria-expanded', 'true'); a.style.maxHeight = a.scrollHeight + 'px'; }
      });
    });
  }

  /* Lightbox */
  function initLightbox() {
    var lb = $('#lightbox'), img = $('#lb-img'), close = $('#lb-close'), last;
    if (!lb) return;
    var shut = function () { lb.hidden = true; if (last) last.focus(); };
    $$('.g-item[data-full]').forEach(function (b) {
      b.addEventListener('click', function () { last = b; var s = $('img', b); img.src = b.dataset.full; img.alt = s ? s.alt : ''; lb.hidden = false; close.focus(); });
    });
    close.addEventListener('click', shut);
    lb.addEventListener('click', function (e) { if (e.target === lb) shut(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) shut(); });
  }

  /* Formulário → WhatsApp */
  function initForm() {
    var f = $('#form'); if (!f) return;
    var rules = [['#f-nome', function (v) { return v.trim().length >= 2; }, 'Informe seu nome.'],
                 ['#f-tel', function (v) { return v.replace(/\D/g, '').length >= 10; }, 'Informe um telefone com DDD.'],
                 ['#f-serv', function (v) { return v !== ''; }, 'Selecione um serviço.']];
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var ok = true;
      rules.forEach(function (r) {
        var el = $(r[0]), er = el.parentNode.querySelector('.err'), good = r[1](el.value);
        el.classList.toggle('invalid', !good); el.setAttribute('aria-invalid', !good); er.textContent = good ? '' : r[2]; if (!good) ok = false;
      });
      if (!ok) return;
      var msg = 'Olá, meu nome é ' + $('#f-nome').value.trim() + '.\n\nGostaria de saber mais sobre ' + $('#f-serv').value + '.\n\nTelefone: ' + $('#f-tel').value.trim() + '.\n\nMensagem: ' + ($('#f-msg').value.trim() || '—') + '\n\nEncontrei o Espaço Angels Hands pelo site.';
      $('#f-ok').textContent = 'Abrindo o WhatsApp…';
      window.open(waUrl(msg), '_blank', 'noopener'); f.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
    initWhatsApp(); initHeader(); initReveal(); initCarousel(); initFaq(); initLightbox(); initForm();
  });
})();
