/**
 * app.js — Bootstrap + ALL event wiring
 * Gnoke Config
 */
const AppCore = (() => {

  const ADAPTERS = {
    
  php:    AdapterPHP,
  sql:    AdapterSQL,
  sheets: AdapterSheets,
  python: AdapterPython, // Add this
  node:   AdapterNode    // Add this
  };

  const STORAGE_BACKEND  = 'gnoke_hackend_backend';
  const STORAGE_SECURITY = 'gnoke_hackend_security';

  // ─── Navigation ───────────────────────────────────────────────────────────

  function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    State.set('currentPage', page);
    closeDrawer();
    if (page === 'export') refreshManifest();
  }

  // ─── Adapter fields ───────────────────────────────────────────────────────

  function renderAdapterFields(type) {
    const adapter = ADAPTERS[type];
    if (!adapter) return;
    document.getElementById('adapter-fields').innerHTML = adapter.renderFields();
    const saved = State.get('backend');
    if (saved && saved.type === type) adapter.loadFields(saved);
  }

  // ─── Backend ──────────────────────────────────────────────────────────────

  function saveBackend() {
    const type    = document.getElementById('adapter-select').value;
    const adapter = ADAPTERS[type];
    if (!adapter) return;
    const config = adapter.readFields();
    State.set('backend', config);
    localStorage.setItem(STORAGE_BACKEND, JSON.stringify(config));
    GnokeContract.emit('backendUpdated');
    GnokeContract.emit('manifestUpdated');
    UI.toast('Backend saved', 'success');
  }

  async function testConnection() {
    const type    = document.getElementById('adapter-select').value;
    const adapter = ADAPTERS[type];
    if (!adapter) return;
    const config = adapter.readFields();
    UI.showLoading();
    const result = await GnokeContract.wrap(adapter.testConnection.bind(adapter), config);
    UI.hideLoading();
    if (result.success) {
      const card   = document.getElementById('flatjson-preview-card');
      const wrap   = document.getElementById('flatjson-table-wrap');
      const status = document.getElementById('flatjson-status');
      card.style.display = '';
      wrap.innerHTML     = UI.renderFlatTable(result.payload);
      status.textContent = result.payload.rows.length + ' rows · ' + result.payload.headers.length + ' cols · ' + result.meta.latency + 'ms';
      GnokeContract.emit('backendUpdated', result.payload);
      UI.toast('Connection OK', 'success');
    } else {
      UI.toast('Connection failed: ' + result.error, 'error');
    }
  }

  // ─── Security ─────────────────────────────────────────────────────────────

  function saveIdentity() {
    const appName     = document.getElementById('identity-appname').value.trim();
    const maintenance = document.getElementById('identity-maintenance').checked;
    Identity.save(appName, maintenance);
    Identity.applyToTopbar();
    GnokeContract.emit('manifestUpdated');
    UI.toast('Identity saved', 'success');
  }

  function saveSettings() {
    Settings.save({
      environment: document.getElementById('settings-env').value,
      entryLimit:  parseInt(document.getElementById('settings-limit').value, 10) || 50,
      auditStamps: document.getElementById('settings-audit').checked,
      version:     document.getElementById('settings-version').value.trim() || '1.0.0'
    });
    Settings.applyEnvBadge();
    GnokeContract.emit('manifestUpdated');
    UI.toast('Settings saved', 'success');
  }

  function saveSecurity() {
    const security = {
      readonly:     document.getElementById('policy-readonly').checked,
      requireAuth:  document.getElementById('policy-require-auth').checked,
      offlineAccess: document.getElementById('policy-offline').checked,
      roles:        Roles.toManifest()
    };
    State.set('security', security);
    localStorage.setItem(STORAGE_SECURITY, JSON.stringify(security));
    GnokeContract.emit('rolesUpdated');
    GnokeContract.emit('manifestUpdated');
    UI.toast('Security saved', 'success');
  }

  function loadSecurity() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_SECURITY) || 'null');
      if (!saved) return;
      document.getElementById('policy-readonly').checked     = saved.readonly     || false;
      document.getElementById('policy-require-auth').checked = saved.requireAuth  || false;
      document.getElementById('policy-offline').checked      = saved.offlineAccess !== false;
      State.set('security', saved);
    } catch(e) {}
  }

  // ─── Manifest ─────────────────────────────────────────────────────────────

  function buildManifest() {
    const s = Settings.get();
    return {
      _meta: {
        version:    s.version || '1.0.0',
        app:        'gnoke-config',
        updated_at: new Date().toISOString()
      },
      identity: Identity.toManifest(),
      settings: Settings.toManifest(),
      backend:  State.get('backend')  || {},
      security: State.get('security') || {}
    };
  }

  function refreshManifest() {
    const manifest = buildManifest();
    State.set('manifest', manifest);
    document.getElementById('manifest-preview').textContent = JSON.stringify(manifest, null, 2);
  }

  function copyManifest() {
    const text = document.getElementById('manifest-preview').textContent;
    navigator.clipboard.writeText(text).then(() => {
      UI.toast('Copied to clipboard', 'success');
    }).catch(() => {
      UI.toast('Copy failed — select text manually', 'error');
    });
  }

  function downloadManifest() {
    const manifest = buildManifest();
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'gnoke-config-manifest.json';
    a.click();
    URL.revokeObjectURL(url);
    UI.toast('Downloaded', 'success');
  }

  // ─── Drawer ───────────────────────────────────────────────────────────────

  function openDrawer() {
    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawer-overlay').classList.add('open');
  }

  function closeDrawer() {
    document.getElementById('drawer').classList.remove('open');
    document.getElementById('drawer-overlay').classList.remove('open');
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    UI.showLoading();

    // Restore saved backend config
    try {
      const savedBackend = JSON.parse(localStorage.getItem(STORAGE_BACKEND) || 'null');
      if (savedBackend) {
        State.set('backend', savedBackend);
        const sel = document.getElementById('adapter-select');
        if (sel) sel.value = savedBackend.type || 'php';
        UI.setContext(savedBackend.type ? savedBackend.type.toUpperCase() : '');
      }
    } catch(e) {}

    // Render initial adapter fields
    const initialType = document.getElementById('adapter-select').value;
    renderAdapterFields(initialType);

    // Restore identity
    Identity.load();
    const idEl = document.getElementById('identity-appname');
    const idData = Identity.get();
    if (idEl) idEl.value = idData.appName || '';
    const mEl = document.getElementById('identity-maintenance');
    if (mEl) mEl.checked = idData.maintenance || false;
    Identity.applyToTopbar();

    // Restore settings
    Settings.load();
    const sData = Settings.get();
    const envEl = document.getElementById('settings-env');
    if (envEl) envEl.value = sData.environment || 'development';
    const limEl = document.getElementById('settings-limit');
    if (limEl) limEl.value = sData.entryLimit || 50;
    const audEl = document.getElementById('settings-audit');
    if (audEl) audEl.checked = sData.auditStamps || false;
    const verEl = document.getElementById('settings-version');
    if (verEl) verEl.value = sData.version || '1.0.0';
    Settings.applyEnvBadge();

    // Restore security
    Roles.load();
    Roles.renderList();
    loadSecurity();

    // ── Event wiring ──────────────────────────────────────────────────────

    // Navigation — desktop + drawer
    document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', Theme.toggle);

    // Hamburger
    document.getElementById('hamburger').addEventListener('click', openDrawer);

    // Drawer close button
    document.getElementById('drawer-close').addEventListener('click', closeDrawer);

    // Drawer overlay click
    document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

    // Adapter select change
    document.getElementById('adapter-select').addEventListener('change', function() {
      renderAdapterFields(this.value);
      document.getElementById('flatjson-preview-card').style.display = 'none';
    });

    // Backend actions
    document.getElementById('btn-save-backend').addEventListener('click', saveBackend);
    document.getElementById('btn-test-connection').addEventListener('click', testConnection);

    // Identity + settings actions
    document.getElementById('btn-save-identity').addEventListener('click', saveIdentity);
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);

    // Maintenance toggle — immediate save
    document.getElementById('identity-maintenance').addEventListener('change', function() {
      const appName = document.getElementById('identity-appname').value.trim();
      Identity.save(appName, this.checked);
      Identity.applyToTopbar();
      GnokeContract.emit('manifestUpdated');
      UI.toast(this.checked ? 'Maintenance ON' : 'Maintenance OFF', this.checked ? 'error' : 'success');
    });

    // Security actions
    document.getElementById('btn-save-security').addEventListener('click', saveSecurity);

    // Add role modal
    document.getElementById('btn-add-role').addEventListener('click', () => {
      document.getElementById('role-name-input').value = '';
      document.querySelectorAll('#role-perms input').forEach(cb => cb.checked = false);
      UI.openModal('modal-add-role');
    });

    document.getElementById('btn-confirm-add-role').addEventListener('click', () => {
      const name  = document.getElementById('role-name-input').value.trim();
      const perms = [...document.querySelectorAll('#role-perms input:checked')].map(cb => cb.value);
      if (!name) { UI.toast('Enter a role name', 'error'); return; }
      const ok = Roles.add(name, perms);
      if (!ok) { UI.toast('Role already exists', 'error'); return; }
      Roles.renderList();
      UI.closeModal('modal-add-role');
      GnokeContract.emit('rolesUpdated');
      GnokeContract.emit('manifestUpdated');
      UI.toast('Role added: ' + name, 'success');
    });

    // Export actions
    document.getElementById('btn-copy-manifest').addEventListener('click', copyManifest);
    document.getElementById('btn-download-manifest').addEventListener('click', downloadManifest);

    // ── Contract listeners ────────────────────────────────────────
    GnokeContract.on('manifestUpdated', function() {
      if (State.get('currentPage') === 'export') refreshManifest();
    });
    GnokeContract.on('backendUpdated', function() {
      const config = State.get('backend');
      if (config) UI.setContext(config.type ? config.type.toUpperCase() : '');
    });

    UI.hideLoading();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { closeDrawer, navigateTo };
})();
