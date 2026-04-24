/**
 * settings.js
 * Environment label + entry limit + audit stamps + version tag
 * Part of Gnoke Config v1.1
 */
const Settings = (() => {
  'use strict';
  const KEY = 'gnoke_hackend_settings';

  const DEFAULTS = {
    environment: 'development',
    entryLimit:  50,
    auditStamps: false,
    version:     '1.1.0'
  };

  let _data = { ...DEFAULTS };

  function load() {
    try { _data = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || 'null')); } catch(e) {}
    return _data;
  }

  function save(values) {
    _data = Object.assign({}, DEFAULTS, values);
    localStorage.setItem(KEY, JSON.stringify(_data));
    return _data;
  }

  function get() { return { ..._data }; }

  function applyEnvBadge() {
    const badge = document.getElementById('env-badge');
    if (!badge) return;
    const map = { development: 'badge-dev', staging: 'badge-staging', production: 'badge-prod' };
    badge.textContent  = _data.environment.toUpperCase();
    badge.className    = 'env-badge ' + (map[_data.environment] || '');
    badge.style.display = 'inline-flex';
  }

  function toManifest() {
    return {
      version:     _data.version,
      environment: _data.environment,
      entryLimit:  _data.entryLimit,
      auditStamps: _data.auditStamps
    };
  }

  return { load, save, get, applyEnvBadge, toManifest };
})();
