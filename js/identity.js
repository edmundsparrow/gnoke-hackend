/**
 * identity.js
 * App name + maintenance mode
 * Part of Gnoke Config v1.1
 */
const Identity = (() => {
  'use strict';
  const KEY = 'gnoke_hackend_identity';

  let _data = { appName: 'Gnoke-Hackend', maintenance: false };

  function load() {
    try { _data = JSON.parse(localStorage.getItem(KEY) || 'null') || _data; } catch(e) {}
    return _data;
  }

  function save(appName, maintenance) {
    _data = { appName: appName || '', maintenance: !!maintenance };
    localStorage.setItem(KEY, JSON.stringify(_data));
    return _data;
  }

  function get() { return { ..._data }; }

  function applyToTopbar() {
    const el = document.getElementById('topbar-appname');
    if (el) el.textContent = _data.appName || '';
    const badge = document.getElementById('maintenance-badge');
    if (badge) badge.style.display = _data.maintenance ? 'inline-flex' : 'none';
  }

  function toManifest() {
    return { appName: _data.appName, maintenance: _data.maintenance };
  }

  return { load, save, get, applyToTopbar, toManifest };
})();
