(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var MEASUREMENT_ID = 'G-FVQH4JEZ35';
  var CONSENT_KEY = 'nexqora-consent-v1';
  var CONSENT_VERSION = 1;
  var analyticsLoaded = false;
  var consentState = readConsent();

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500
  });
  window.gtag('set', 'ads_data_redaction', true);
  window.gtag('set', 'url_passthrough', false);

  function readConsent() {
    try {
      var stored = JSON.parse(window.localStorage.getItem(CONSENT_KEY));
      if (!stored || stored.version !== CONSENT_VERSION || typeof stored.analytics !== 'boolean') return null;
      return stored;
    } catch (error) {
      return null;
    }
  }

  function saveConsent(analyticsAllowed) {
    consentState = {
      version: CONSENT_VERSION,
      analytics: analyticsAllowed,
      updatedAt: new Date().toISOString()
    };
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consentState));
    } catch (error) {
      /* Consent still applies for the current page if storage is unavailable. */
    }
  }

  function updateGoogleConsent(analyticsAllowed) {
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: analyticsAllowed ? 'granted' : 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted'
    });
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    var tag = doc.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    tag.setAttribute('data-nexqora-analytics', '');
    doc.head.appendChild(tag);

    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: 'auto',
      cookie_expires: 34128000,
      cookie_update: false,
      send_page_view: true
    });
  }

  function deleteAnalyticsCookies() {
    doc.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (name !== '_ga' && name.indexOf('_ga_') !== 0) return;
      ['/', ''].forEach(function (path) {
        doc.cookie = name + '=; Max-Age=0; path=' + path + '; SameSite=Lax';
        doc.cookie = name + '=; Max-Age=0; path=' + path + '; domain=.nexqora.de; SameSite=Lax';
      });
    });
  }

  function track(name, parameters) {
    if (!consentState || !consentState.analytics || !analyticsLoaded) return;
    window.gtag('event', name, parameters || {});
  }

  function language() {
    return root.getAttribute('lang') === 'de' ? 'de' : 'en';
  }

  function copy() {
    if (language() === 'de') {
      return {
        label: 'Datenschutz-Einstellungen',
        title: 'Analyse nach Ihrer Wahl.',
        text: 'Wir verwenden Google Analytics nur mit Ihrer Einwilligung, um zu verstehen, welche Inhalte besonders relevant sind. Ohne Einwilligung wird kein Google-Tag geladen. Werbung und Personalisierung bleiben deaktiviert.',
        reject: 'Nur erforderlich',
        accept: 'Analyse erlauben',
        details: 'Datenschutz ansehen'
      };
    }
    return {
      label: 'Privacy settings',
      title: 'Analytics on your terms.',
      text: 'We use Google Analytics only with your consent to understand which travel inspiration is most relevant. No Google tag is loaded without consent. Advertising and personalisation remain disabled.',
      reject: 'Necessary only',
      accept: 'Allow analytics',
      details: 'View privacy notice'
    };
  }

  function ensureConsentUi() {
    var banner = doc.querySelector('[data-consent-banner]');
    if (!banner) {
      banner = doc.createElement('section');
      banner.className = 'consent-banner';
      banner.setAttribute('data-consent-banner', '');
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-labelledby', 'consent-title');
      banner.innerHTML = '<div class="consent-banner__copy"><p class="consent-banner__label" data-consent-label></p><h2 id="consent-title" data-consent-title></h2><p data-consent-text></p></div><div class="consent-banner__actions"><button type="button" class="consent-button consent-button--secondary" data-consent-reject></button><button type="button" class="consent-button consent-button--primary" data-consent-accept></button><a href="/datenschutz.html#google-analytics" data-consent-details></a></div>';
      doc.body.appendChild(banner);

      banner.querySelector('[data-consent-accept]').addEventListener('click', function () {
        saveConsent(true);
        updateGoogleConsent(true);
        loadAnalytics();
        banner.hidden = true;
        track('consent_update', { analytics_consent: 'granted' });
      });

      banner.querySelector('[data-consent-reject]').addEventListener('click', function () {
        var wasLoaded = analyticsLoaded;
        saveConsent(false);
        updateGoogleConsent(false);
        deleteAnalyticsCookies();
        banner.hidden = true;
        if (wasLoaded) window.location.reload();
      });
    }

    var settingsButton = doc.querySelector('[data-consent-settings], [data-consent-open]');
    if (!settingsButton) {
      settingsButton = doc.createElement('button');
      settingsButton.type = 'button';
      settingsButton.className = 'consent-settings-button';
      settingsButton.setAttribute('data-consent-settings', '');
      var footerNav = doc.querySelector('.footer-links > div:last-child, .footer-nav, .legal-footer nav');
      if (footerNav) footerNav.appendChild(settingsButton);
    }

    if (!settingsButton.hasAttribute('data-consent-bound')) {
      settingsButton.setAttribute('data-consent-settings', '');
      settingsButton.setAttribute('data-consent-bound', '');
      settingsButton.addEventListener('click', function () {
        banner.hidden = false;
        banner.querySelector('[data-consent-accept]').focus();
      });
    }

    renderConsentUi();
    banner.hidden = Boolean(consentState);
  }

  function renderConsentUi() {
    var texts = copy();
    var banner = doc.querySelector('[data-consent-banner]');
    var settingsButton = doc.querySelector('[data-consent-settings], [data-consent-open]');
    if (settingsButton) settingsButton.textContent = texts.label;
    if (!banner) return;
    banner.querySelector('[data-consent-label]').textContent = texts.label;
    banner.querySelector('[data-consent-title]').textContent = texts.title;
    banner.querySelector('[data-consent-text]').textContent = texts.text;
    banner.querySelector('[data-consent-reject]').textContent = texts.reject;
    banner.querySelector('[data-consent-accept]').textContent = texts.accept;
    banner.querySelector('[data-consent-details]').textContent = texts.details;
  }

  function trackingLocation(element) {
    if (element.closest('.site-header')) return 'header';
    if (element.closest('.film-hero')) return 'hero';
    if (element.closest('.brand-section')) return 'brands';
    if (element.closest('.principles-section')) return 'principles';
    if (element.closest('.trust-section')) return 'trust';
    if (element.closest('.contact-section')) return 'contact';
    if (element.closest('.site-footer, .legal-footer')) return 'footer';
    return 'page';
  }

  function registerInteractionTracking() {
    doc.addEventListener('click', function (event) {
      var target = event.target.closest('a, button');
      if (!target || target.hasAttribute('data-consent-settings')) return;

      if (target.hasAttribute('data-journey')) {
        track('travel_category_select', {
          travel_category: target.getAttribute('data-journey') || 'unknown',
          interaction_location: 'hero_tabs'
        });
      }

      if (target.matches('a[href^="mailto:"]')) {
        track('contact_click', { method: 'email', interaction_location: trackingLocation(target) });
      }

      if (target.matches('.header-cta, .hero-actions .button, .worldwide .button, .story-card a, .world-card a')) {
        track('cta_click', { interaction_location: trackingLocation(target) });
      }
    });

    var form = doc.querySelector('.contact-form');
    if (form) {
      form.addEventListener('submit', function () {
        var topic = doc.getElementById('f-topic');
        track('generate_lead', {
          lead_source: 'contact_form',
          enquiry_topic: topic ? topic.value : 'unknown'
        });
      });
    }

    if ('IntersectionObserver' in window) {
      var seenSections = {};
      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || seenSections[entry.target.id]) return;
          seenSections[entry.target.id] = true;
          track('section_view', { section_id: entry.target.id });
        });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(doc.querySelectorAll('main section[id]'), function (section) {
        sectionObserver.observe(section);
      });
    }

    var sentDepths = {};
    window.addEventListener('scroll', function () {
      var available = doc.documentElement.scrollHeight - window.innerHeight;
      if (available <= 0) return;
      var depth = Math.round((window.scrollY / available) * 100);
      [25, 50, 75, 90].forEach(function (milestone) {
        if (depth < milestone || sentDepths[milestone]) return;
        sentDepths[milestone] = true;
        track('scroll_depth', { percent_scrolled: milestone });
      });
    }, { passive: true });
  }

  function initialize() {
    ensureConsentUi();
    registerInteractionTracking();

    if (consentState && consentState.analytics) {
      updateGoogleConsent(true);
      loadAnalytics();
    } else {
      updateGoogleConsent(false);
    }

    new MutationObserver(function (mutations) {
      if (mutations.some(function (mutation) { return mutation.attributeName === 'lang'; })) renderConsentUi();
    }).observe(root, { attributes: true, attributeFilter: ['lang'] });
  }

  window.NexqoraAnalytics = { track: track, measurementId: MEASUREMENT_ID };
  window.NexqoraConsent = {
    open: function () {
      var banner = doc.querySelector('[data-consent-banner]');
      if (banner) banner.hidden = false;
    }
  };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
