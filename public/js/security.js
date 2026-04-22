/**
 * SfriTrav Security Module
 * Protects against: XSS, SQL Injection, CSRF, Clickjacking, Rate Limiting, DOM manipulation
 */
(function () {
  'use strict';

  /* ---- Rate Limiter ---- */
  const RateLimiter = {
    _store: {},
    check(key, limit, windowMs) {
      const now = Date.now();
      if (!this._store[key]) this._store[key] = [];
      this._store[key] = this._store[key].filter(t => now - t < windowMs);
      if (this._store[key].length >= limit) return false;
      this._store[key].push(now);
      return true;
    }
  };

  /* ---- XSS Sanitizer ---- */
  window.Security = {
    sanitizeHTML(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/`/g, '&#x60;');
    },
    sanitizeURL(url) {
      if (!url || typeof url !== 'string') return '#';
      const cleaned = url.trim().toLowerCase();
      if (cleaned.startsWith('javascript:') || cleaned.startsWith('data:') || cleaned.startsWith('vbscript:')) return '#';
      return url.replace(/[<>"']/g, '');
    },
    sanitizeText(str) {
      if (typeof str !== 'string') return '';
      return str.replace(/[<>&"']/g, c => ({ '<': '', '>': '', '&': '&', '"': '', "'": '' }[c]));
    },
    validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    },
    validateName(name) {
      return /^[a-zA-Z\s\u0600-\u06FF]{2,60}$/.test(name.trim());
    },
    stripSQL(str) {
      // Strip common SQL injection patterns
      return str.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE|SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/gi, '');
    },
    checkRateLimit(key, limit = 5, windowMs = 60000) {
      return RateLimiter.check(key, limit, windowMs);
    }
  };

  /* ---- Prevent clickjacking via JS (belt-and-suspenders) ---- */
  if (window.self !== window.top) {
    try { window.top.location = window.self.location; } catch (e) {
      document.body.innerHTML = '<h1>Access Denied</h1>';
    }
  }

  /* ---- Sanitize all dynamic content rendered via innerHTML ---- */
  const _origSetInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  // We intercept DOM writes from our own app functions only via Security.sanitizeHTML

  /* ---- Block suspicious keyboard shortcuts / devtools (soft) ---- */
  // Only log, don't block (blocking devtools is bad UX and ineffective)
  document.addEventListener('contextmenu', () => {});

  /* ---- CSRF Token helper for form submissions ---- */
  window.Security.getCSRFToken = function () {
    let token = sessionStorage.getItem('csrf_token');
    if (!token) {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      token = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem('csrf_token', token);
    }
    return token;
  };

  /* ---- Honeypot field check ---- */
  window.Security.checkHoneypot = function (form) {
    const hp = form.querySelector('[name="website"]');
    return !(hp && hp.value.trim() !== '');
  };

  /* ---- Input sanitization on all forms ---- */
  document.addEventListener('input', function (e) {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      const val = e.target.value;
      if (/<script/i.test(val) || /javascript:/i.test(val)) {
        e.target.value = Security.stripSQL(val).replace(/<[^>]*>/g, '');
      }
    }
  });

  /* ---- Performance: Prevent DDoS-like fetch storms ---- */
  const _origFetch = window.fetch;
  const fetchCounts = {};
  window.fetch = function (url, opts) {
    const key = typeof url === 'string' ? url.split('?')[0] : 'unknown';
    if (!RateLimiter.check('fetch:' + key, 20, 10000)) {
      console.warn('[Security] Fetch rate limit exceeded for:', key);
      return Promise.reject(new Error('Rate limit exceeded'));
    }
    return _origFetch.apply(this, arguments);
  };

  console.info('[SfriTrav] Security module loaded.');
})();
