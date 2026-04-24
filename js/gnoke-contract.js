/**
 * gnoke-contract.js
 * 1. Standard adapter response contract
 * 2. Lightweight state events
 * 3. Roles.can() permission helper
 *
 * Dependency-free. Browser-native. No framework.
 */
const GnokeContract = (() => {
  'use strict';

  // ─── 1. RESPONSE CONTRACT ────────────────────────────────────────
  // Every adapter call returns { success, payload, error, meta }
  // UI never needs a try/catch — it just checks result.success

  async function wrap(adapterFn, config) {
    const start = Date.now();
    try {
      const payload = await adapterFn(config);
      return {
        success: true,
        payload: payload || { headers: [], rows: [] },
        error:   null,
        meta:    { type: config && config.type || 'unknown', latency: Date.now() - start }
      };
    } catch (err) {
      return {
        success: false,
        payload: { headers: [], rows: [] },
        error:   err.message || 'Unknown error',
        meta:    { type: config && config.type || 'unknown', latency: Date.now() - start }
      };
    }
  }

  // ─── 2. STATE EVENTS ─────────────────────────────────────────────
  // emit('backendUpdated')  → fires gnoke:backendUpdated
  // on('backendUpdated', fn) → listens for it
  // Named events: backendUpdated | rolesUpdated | manifestUpdated

  function emit(name, detail) {
    document.dispatchEvent(new CustomEvent('gnoke:' + name, { detail: detail || {} }));
  }

  function on(name, fn) {
    document.addEventListener('gnoke:' + name, function(e) { fn(e.detail); });
  }

  // ─── 3. ROLES HELPER ─────────────────────────────────────────────
  // GnokeContract.can('admin', 'delete') → true/false
  // Reads live from Roles module — no extra state

  function can(roleName, permission) {
    if (typeof Roles === 'undefined') return false;
    const role = Roles.getAll().find(function(r) {
      return r.name.toLowerCase() === roleName.toLowerCase();
    });
    return role ? role.permissions.indexOf(permission) !== -1 : false;
  }

  return { wrap, emit, on, can };
})();
