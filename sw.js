const CACHE_NAME = 'gnoke-config-v1';
const ASSETS = [
  './',
  './index.html',
  './main/index.html',
  './style.css',
  './manifest.json',
  './js/state.js',
  './js/theme.js',
  './js/ui.js',
  './js/gnoke-flatjson.js',
  './js/app.js',
  './scripts/php.js',
  './scripts/sql.js',
  './scripts/sheets.js',
  './security/roles.js',
  './js/identity.js',
  './js/settings.js',
  './js/gnoke-contract.js'
];

self.addEventListener('install',  e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))));
self.addEventListener('fetch',    e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
