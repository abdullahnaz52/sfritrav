/**
 * SfriTrav Cache & Performance Module
 * - Service Worker registration
 * - IndexedDB article cache
 * - Batch processing queue
 * - Image lazy loading with IntersectionObserver
 * - Prefetch on hover
 */
(function () {
  'use strict';

  /* ===== Service Worker Registration ===== */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => console.info('[SW] Registered:', reg.scope))
        .catch(err => console.warn('[SW] Registration failed:', err));
    });
  }

  /* ===== IndexedDB Article Cache ===== */
  const DB_NAME = 'sfritrav_cache';
  const DB_VER = 1;
  const STORE_ARTICLES = 'articles';
  const STORE_META = 'meta';
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour

  let db = null;

  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_ARTICLES)) {
          d.createObjectStore(STORE_ARTICLES, { keyPath: 'id' });
        }
        if (!d.objectStoreNames.contains(STORE_META)) {
          d.createObjectStore(STORE_META, { keyPath: 'key' });
        }
      };
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror = () => reject(req.error);
    });
  }

  window.ArticleCache = {
    async get(key) {
      try {
        const d = await openDB();
        return new Promise((resolve) => {
          const tx = d.transaction(STORE_META, 'readonly');
          const req = tx.objectStore(STORE_META).get(key);
          req.onsuccess = () => {
            const rec = req.result;
            if (!rec) return resolve(null);
            if (Date.now() - rec.ts > CACHE_TTL) return resolve(null); // expired
            resolve(rec.value);
          };
          req.onerror = () => resolve(null);
        });
      } catch { return null; }
    },
    async set(key, value) {
      try {
        const d = await openDB();
        return new Promise((resolve) => {
          const tx = d.transaction(STORE_META, 'readwrite');
          tx.objectStore(STORE_META).put({ key, value, ts: Date.now() });
          tx.oncomplete = resolve;
          tx.onerror = resolve;
        });
      } catch {}
    },
    async cacheArticles(articles) {
      try {
        const d = await openDB();
        const tx = d.transaction(STORE_ARTICLES, 'readwrite');
        const store = tx.objectStore(STORE_ARTICLES);
        articles.forEach(a => store.put({ ...a, _ts: Date.now() }));
        return new Promise(r => { tx.oncomplete = r; tx.onerror = r; });
      } catch {}
    },
    async getArticles() {
      try {
        const d = await openDB();
        return new Promise((resolve) => {
          const tx = d.transaction(STORE_ARTICLES, 'readonly');
          const req = tx.objectStore(STORE_ARTICLES).getAll();
          req.onsuccess = () => {
            const all = (req.result || []).filter(a => Date.now() - a._ts < CACHE_TTL);
            resolve(all);
          };
          req.onerror = () => resolve([]);
        });
      } catch { return []; }
    },
    async clearExpired() {
      try {
        const d = await openDB();
        const tx = d.transaction(STORE_ARTICLES, 'readwrite');
        const store = tx.objectStore(STORE_ARTICLES);
        const req = store.getAll();
        req.onsuccess = () => {
          (req.result || []).forEach(a => {
            if (Date.now() - a._ts > CACHE_TTL) store.delete(a.id);
          });
        };
      } catch {}
    }
  };

  // Clean expired cache every 30 minutes
  setInterval(() => window.ArticleCache.clearExpired(), 30 * 60 * 1000);

  /* ===== Batch Processing Queue ===== */
  window.BatchQueue = {
    _queue: [],
    _running: false,
    _batchSize: 5,
    _delayMs: 50,
    add(fn) { this._queue.push(fn); if (!this._running) this._process(); },
    async _process() {
      this._running = true;
      while (this._queue.length) {
        const batch = this._queue.splice(0, this._batchSize);
        await Promise.allSettled(batch.map(fn => fn()));
        if (this._queue.length) await new Promise(r => setTimeout(r, this._delayMs));
      }
      this._running = false;
    }
  };

  /* ===== Image Lazy Loading ===== */
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      });
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        observer.unobserve(img);
      });
    }, { rootMargin: '200px 0px', threshold: 0.01 });
    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  }

  /* ===== Prefetch on hover ===== */
  const prefetched = new Set();
  function prefetchOnHover() {
    document.addEventListener('mouseover', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.href;
      if (!href || !href.startsWith(window.location.origin)) return;
      if (prefetched.has(href)) return;
      prefetched.add(href);
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    }, { passive: true });
  }

  /* ===== Memory-efficient event delegation ===== */
  window.delegate = function (parent, selector, event, handler) {
    parent.addEventListener(event, function (e) {
      const target = e.target.closest(selector);
      if (target && parent.contains(target)) handler.call(target, e);
    }, { passive: event === 'scroll' || event === 'touchmove' });
  };

  /* ===== Virtual scroll / pagination ===== */
  window.VirtualList = {
    _page: 0,
    _pageSize: 6,
    _allItems: [],
    init(items, renderFn, container) {
      this._allItems = items;
      this._page = 0;
      container.innerHTML = '';
      this._renderPage(renderFn, container);
    },
    loadMore(renderFn, container) {
      this._page++;
      this._renderPage(renderFn, container);
    },
    hasMore() {
      return (this._page + 1) * this._pageSize < this._allItems.length;
    },
    _renderPage(renderFn, container) {
      const start = this._page * this._pageSize;
      const items = this._allItems.slice(start, start + this._pageSize);
      const frag = document.createDocumentFragment();
      items.forEach(item => {
        const el = renderFn(item);
        if (el) frag.appendChild(el);
      });
      container.appendChild(frag);
      initLazyImages();
    }
  };

  /* Init */
  document.addEventListener('DOMContentLoaded', () => {
    initLazyImages();
    prefetchOnHover();
    // Re-observe after dynamic content
    window._reinitLazy = initLazyImages;
  });

  console.info('[SfriTrav] Cache & Performance module loaded.');
})();
