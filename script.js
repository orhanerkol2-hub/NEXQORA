(function () {
  'use strict';

  var doc = document;
  var header = doc.querySelector('[data-header]');
  var progress = doc.querySelector('[data-scroll-progress]');
  var menuButton = doc.querySelector('.menu-button');
  var mainNav = doc.querySelector('.main-nav');
  var heroVideo = doc.querySelector('[data-hero-video]');
  var videoToggle = doc.querySelector('[data-video-toggle]');
  var videoIcon = doc.querySelector('[data-video-icon]');
  var videoLabel = doc.querySelector('[data-video-label]');
  var sceneLabel = doc.querySelector('[data-scene-label]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function closeMenu() {
    if (!menuButton || !mainNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Menü öffnen');
    mainNav.classList.remove('is-open');
    doc.body.classList.remove('menu-open');
  }

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      var open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      mainNav.classList.toggle('is-open', open);
      doc.body.classList.toggle('menu-open', open);
    });
    mainNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });
  }

  function updateScroll() {
    var scrollTop = window.scrollY || doc.documentElement.scrollTop;
    var total = Math.max(1, doc.documentElement.scrollHeight - window.innerHeight);
    if (header) header.classList.toggle('is-sticky', scrollTop > 24);
    if (progress) progress.style.transform = 'scaleX(' + Math.min(1, scrollTop / total) + ')';
  }
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });

  var scenes = [
    { start: 0, label: 'Cruise · Nordics' },
    { start: 3, label: 'Resorts · Indian Ocean' },
    { start: 6, label: 'City · Europe' },
    { start: 9, label: 'Journeys · Asia' },
    { start: 12, label: 'Cruise · Worldwide' }
  ];

  function updateScene() {
    if (!heroVideo || !sceneLabel) return;
    var current = scenes[0].label;
    for (var i = 0; i < scenes.length; i += 1) {
      if (heroVideo.currentTime >= scenes[i].start) current = scenes[i].label;
    }
    if (sceneLabel.textContent !== current) sceneLabel.textContent = current;
  }

  function setVideoState(isPlaying) {
    if (!videoToggle) return;
    videoToggle.setAttribute('aria-label', isPlaying ? 'Film pausieren' : 'Film abspielen');
    if (videoIcon) videoIcon.textContent = isPlaying ? 'Ⅱ' : '▶';
    if (videoLabel) videoLabel.textContent = isPlaying ? 'Pause' : 'Play';
  }

  if (heroVideo) {
    heroVideo.addEventListener('timeupdate', updateScene);
    heroVideo.addEventListener('play', function () { setVideoState(true); });
    heroVideo.addEventListener('pause', function () { setVideoState(false); });
    if (reduceMotion.matches) heroVideo.pause();
  }

  if (videoToggle && heroVideo) {
    videoToggle.addEventListener('click', function () {
      if (heroVideo.paused) {
        heroVideo.play().catch(function () { setVideoState(false); });
      } else {
        heroVideo.pause();
      }
    });
  }

  var revealItems = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px' });
    revealItems.forEach(function (item, index) {
      item.style.transitionDelay = Math.min((index % 4) * 70, 210) + 'ms';
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  var contactForm = doc.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = contactForm.querySelector('.form-status');
      var required = contactForm.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function (field) {
        var fieldValid = field.checkValidity();
        field.classList.toggle('field-error', !fieldValid);
        if (!fieldValid) valid = false;
      });
      if (!valid) {
        if (status) status.textContent = 'Bitte vervollständige die markierten Felder.';
        var invalid = contactForm.querySelector('.field-error');
        if (invalid) invalid.focus();
        return;
      }
      var values = new FormData(contactForm);
      var topic = values.get('topic') || 'Allgemeine Anfrage';
      var body = [
        'Hallo NEXQORA Travel Group,',
        '',
        values.get('message') || '',
        '',
        'Anliegen: ' + topic,
        'Name: ' + (values.get('name') || ''),
        'E-Mail: ' + (values.get('email') || '')
      ].join('\n');
      if (status) status.textContent = 'Dein E-Mail-Programm wird geöffnet …';
      window.location.href = 'mailto:contact@nexqora.de?subject=' + encodeURIComponent(topic + ' – NEXQORA Travel Group') + '&body=' + encodeURIComponent(body);
    });
    contactForm.addEventListener('input', function (event) {
      if (event.target.matches('.field-error') && event.target.checkValidity()) event.target.classList.remove('field-error');
    });
  }

  doc.querySelectorAll('[data-year]').forEach(function (item) {
    item.textContent = String(new Date().getFullYear());
  });
}());
