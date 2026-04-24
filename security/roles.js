/**
 * Security: Roles
 * Manages role definitions and permission sets
 */
const Roles = (() => {
  const STORAGE_KEY = 'gnoke_hackend_roles';

  let _roles = [];

  function load() {
    try {
      _roles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      _roles = [];
    }
    return _roles;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_roles));
  }

  function add(name, permissions) {
    if (!name) return false;
    const exists = _roles.find(r => r.name.toLowerCase() === name.toLowerCase());
    if (exists) return false;
    _roles.push({ name: name.trim(), permissions: permissions || [] });
    save();
    return true;
  }

  function remove(name) {
    _roles = _roles.filter(r => r.name !== name);
    save();
  }

  function getAll() {
    return [..._roles];
  }

  function toManifest() {
    return _roles.map(r => ({ name: r.name, permissions: r.permissions }));
  }

  function renderList() {
    const container = document.getElementById('roles-list');
    if (!container) return;
    if (_roles.length === 0) {
      container.innerHTML = '<p class="muted-hint">No roles defined yet.</p>';
      return;
    }
    container.innerHTML = _roles.map(r => `
      <div class="role-row" data-role="${r.name}">
        <div class="role-info">
          <span class="role-name">${r.name}</span>
          <span class="role-perms">${r.permissions.join(', ') || 'no permissions'}</span>
        </div>
        <button class="btn-ghost btn-sm btn-danger" data-remove="${r.name}">Remove</button>
      </div>
    `).join('');

    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', function() {
        remove(this.getAttribute('data-remove'));
        renderList();
      });
    });
  }

  return { load, save, add, remove, getAll, toManifest, renderList };
})();
