(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LANGS = ['en', 'de'];

  function currentLanguage() {
    return root.getAttribute('lang') || 'en';
  }

  function setLanguage(lang) {
    if (LANGS.indexOf(lang) === -1) lang = 'en';
    root.setAttribute('lang', lang);

    Array.prototype.forEach.call(doc.querySelectorAll('[data-en][data-de]'), function (node) {
      var value = node.getAttribute('data-' + lang);
      var targetAttribute = node.getAttribute('data-i18n-attr');
      if (targetAttribute) node.setAttribute(targetAttribute, value);
      else node.textContent = value;
    });

    Array.prototype.forEach.call(doc.querySelectorAll('.lang-btn'), function (button) {
      var active = button.dataset.lang === lang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    syncNavigationLabel();
  }

  Array.prototype.forEach.call(doc.querySelectorAll('.lang-btn'), function (button) {
    button.addEventListener('click', function () { setLanguage(button.dataset.lang); });
  });

  var initialLanguage = (navigator.language || 'en').slice(0, 2).toLowerCase();
  setLanguage(initialLanguage);

  /* Navigation */
  var header = doc.querySelector('.site-header');
  var nav = doc.getElementById('site-nav');
  var toggle = doc.querySelector('.nav-toggle');

  function syncNavigationLabel() {
    var label = doc.querySelector('.nav-toggle-label');
    var menu = doc.getElementById('site-nav');
    if (!label) return;
    var open = menu && menu.classList.contains('is-open');
    label.textContent = open
      ? (currentLanguage() === 'de' ? 'Schließen' : 'Close')
      : label.getAttribute('data-' + currentLanguage());
  }

  function closeNavigation() {
    nav.classList.remove('is-open');
    doc.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    syncNavigationLabel();
  }

  toggle.addEventListener('click', function () {
    var opening = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', opening);
    doc.body.classList.toggle('nav-open', opening);
    toggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
    syncNavigationLabel();
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeNavigation();
  });

  doc.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeNavigation();
      toggle.focus();
    }
  });

  doc.addEventListener('pointerdown', function (event) {
    if (doc.activeElement === toggle && !event.target.closest('.nav-toggle')) toggle.blur();
  });

  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }, { passive: true });

  var desktopNavigation = window.matchMedia('(min-width: 861px)');
  function resetNavigationOnDesktop(event) {
    if (event.matches) closeNavigation();
  }
  if (desktopNavigation.addEventListener) desktopNavigation.addEventListener('change', resetNavigationOnDesktop);
  else desktopNavigation.addListener(resetNavigationOnDesktop);

  /* Dynamic field panels */
  var sectorPanels = Array.prototype.slice.call(doc.querySelectorAll('.sector-panel'));

  function activateSector(panel) {
    sectorPanels.forEach(function (item) {
      var active = item === panel;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  sectorPanels.forEach(function (panel, index) {
    panel.addEventListener('mouseenter', function () { activateSector(panel); });
    panel.addEventListener('focus', function () { activateSector(panel); });
    panel.addEventListener('click', function () { activateSector(panel); });
    panel.addEventListener('pointermove', function (event) {
      if (reduced) return;
      var bounds = panel.getBoundingClientRect();
      var offset = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
      panel.style.setProperty('--pointer-x', offset.toFixed(2) + 'px');
    });
    panel.addEventListener('pointerleave', function () {
      panel.style.setProperty('--pointer-x', '0px');
    });
    panel.addEventListener('keydown', function (event) {
      var nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % sectorPanels.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + sectorPanels.length) % sectorPanels.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = sectorPanels.length - 1;
      else return;

      event.preventDefault();
      sectorPanels[nextIndex].focus();
      activateSector(sectorPanels[nextIndex]);
    });
  });

  /* Entrance motion */
  var revealItems = doc.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealItems, function (item) { item.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(revealItems, function (item) { observer.observe(item); });
  }

  window.setTimeout(function () {
    Array.prototype.forEach.call(revealItems, function (item) {
      if (item.getBoundingClientRect().top < window.innerHeight) item.classList.add('is-visible');
    });
  }, 700);

  /* Contact form */
  var form = doc.querySelector('.contact-form');
  var message = doc.getElementById('f-msg');
  var formStatus = form.querySelector('.form-status');
  var copyMail = doc.querySelector('.copy-mail');
  var copyMailLabel = copyMail.querySelector('[data-copy-label]');
  var copyStatus = doc.getElementById('copy-status');

  function copiedEmail() {
    var messageText = currentLanguage() === 'de'
      ? 'E-Mail-Adresse kopiert.'
      : 'E-mail address copied.';
    copyStatus.textContent = messageText;
    copyMailLabel.textContent = currentLanguage() === 'de' ? 'Kopiert' : 'Copied';
    window.setTimeout(function () {
      copyMailLabel.textContent = copyMailLabel.getAttribute('data-' + currentLanguage());
    }, 1800);
  }

  copyMail.addEventListener('click', function () {
    var address = 'contact@nexqora.de';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(address).then(copiedEmail, function () {
        copyStatus.textContent = currentLanguage() === 'de'
          ? 'Kopieren nicht möglich. Bitte markieren Sie die Adresse manuell.'
          : 'Copying was unavailable. Please select the address manually.';
      });
      return;
    }

    var fallback = doc.createElement('textarea');
    fallback.value = address;
    fallback.setAttribute('readonly', '');
    fallback.style.position = 'fixed';
    fallback.style.opacity = '0';
    doc.body.appendChild(fallback);
    fallback.select();
    var didCopy = doc.execCommand('copy');
    fallback.remove();
    if (didCopy) copiedEmail();
  });

  message.addEventListener('input', function () {
    message.style.height = 'auto';
    message.style.height = message.scrollHeight + 'px';
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    var data = new FormData(form);
    var topic = doc.getElementById('f-topic');
    var topicLabel = topic.options[topic.selectedIndex].text;
    var name = String(data.get('name') || '').trim();
    var organisation = String(data.get('organisation') || '').trim();
    var email = String(data.get('email') || '').trim();
    var bodyText = String(data.get('message') || '').trim();
    var subject = topicLabel + ' — ' + (organisation || name);
    var body = ['Name: ' + name, 'Organisation: ' + (organisation || '—'), 'E-mail: ' + email, '', bodyText].join('\n');

    formStatus.hidden = false;
    formStatus.textContent = currentLanguage() === 'de'
      ? 'Ihre E-Mail-App wird geöffnet. Falls nichts passiert, schreiben Sie direkt an contact@nexqora.de.'
      : 'Your e-mail app is opening. If nothing happens, write directly to contact@nexqora.de.';
    window.location.href = 'mailto:contact@nexqora.de?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();
