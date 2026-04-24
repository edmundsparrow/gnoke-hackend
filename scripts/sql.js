/**
 * Adapter: SQL (MySQL / SQLite via API proxy)
 * Connects through a REST proxy that wraps SQL queries
 */
const AdapterSQL = (() => {

  const FIELDS = [
    { id: 'sql-url',    label: 'Proxy Endpoint',  type: 'text',     placeholder: 'https://yoursite.com/sql-proxy.php' },
    { id: 'sql-key',    label: 'API Key',          type: 'password', placeholder: 'Optional secret key' },
    { id: 'sql-table',  label: 'Table / Query',    type: 'text',     placeholder: 'e.g. users  or  SELECT * FROM config' },
    { id: 'sql-driver', label: 'Driver',           type: 'select',   options: ['mysql', 'sqlite', 'pgsql'] }
  ];

  function renderFields() {
    return FIELDS.map(f => {
      if (f.type === 'select') {
        const opts = f.options.map(o => `<option value="${o}">${o}</option>`).join('');
        return `<div class="field-group"><label for="${f.id}">${f.label}</label><select id="${f.id}">${opts}</select></div>`;
      }
      return `<div class="field-group"><label for="${f.id}">${f.label}</label><input type="${f.type}" id="${f.id}" placeholder="${f.placeholder || ''}" /></div>`;
    }).join('');
  }

  function readFields() {
    return {
      type:   'sql',
      url:    (document.getElementById('sql-url')    || {}).value || '',
      key:    (document.getElementById('sql-key')    || {}).value || '',
      table:  (document.getElementById('sql-table')  || {}).value || '',
      driver: (document.getElementById('sql-driver') || {}).value || 'mysql'
    };
  }

  function loadFields(config) {
    if (!config) return;
    if (document.getElementById('sql-url'))    document.getElementById('sql-url').value    = config.url    || '';
    if (document.getElementById('sql-key'))    document.getElementById('sql-key').value    = config.key    || '';
    if (document.getElementById('sql-table'))  document.getElementById('sql-table').value  = config.table  || '';
    if (document.getElementById('sql-driver')) document.getElementById('sql-driver').value = config.driver || 'mysql';
  }

  async function testConnection(config) {
    if (!config.url) throw new Error('Proxy endpoint is required');
    const headers = { 'Content-Type': 'application/json' };
    if (config.key) headers['X-API-Key'] = config.key;
    const body = JSON.stringify({ table: config.table, driver: config.driver });
    const res  = await fetch(config.url, { method: 'POST', headers, body });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const raw = await res.json();
    return GnokeFlatJSON.parse(raw);
  }

  return { id: 'sql', label: 'SQL', renderFields, readFields, loadFields, testConnection };
})();
