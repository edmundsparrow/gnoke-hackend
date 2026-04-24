/**
 * Adapter: PHP File / API
 * Handles PHP endpoints that return JSON
 */
const AdapterPHP = (() => {

  const FIELDS = [
    { id: 'php-url',      label: 'Endpoint URL',   type: 'text',     placeholder: 'https://yoursite.com/api.php' },
    { id: 'php-key',      label: 'API Key',         type: 'password', placeholder: 'Optional secret key' },
    { id: 'php-method',   label: 'HTTP Method',     type: 'select',   options: ['GET', 'POST'] },
    { id: 'php-path',     label: 'Data Key (optional)', type: 'text', placeholder: 'e.g. data, results (leave blank for root)' }
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
      type: 'php',
      url:    (document.getElementById('php-url')    || {}).value || '',
      key:    (document.getElementById('php-key')    || {}).value || '',
      method: (document.getElementById('php-method') || {}).value || 'GET',
      path:   (document.getElementById('php-path')   || {}).value || ''
    };
  }

  function loadFields(config) {
    if (!config) return;
    if (document.getElementById('php-url'))    document.getElementById('php-url').value    = config.url    || '';
    if (document.getElementById('php-key'))    document.getElementById('php-key').value    = config.key    || '';
    if (document.getElementById('php-method')) document.getElementById('php-method').value = config.method || 'GET';
    if (document.getElementById('php-path'))   document.getElementById('php-path').value   = config.path   || '';
  }

  async function testConnection(config) {
    if (!config.url) throw new Error('URL is required');
    const headers = {};
    if (config.key) headers['X-API-Key'] = config.key;
    const res = await fetch(config.url, { method: config.method, headers });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const raw = await res.json();
    const data = config.path ? raw[config.path] : raw;
    return GnokeFlatJSON.parse(data);
  }

  return { id: 'php', label: 'PHP File / API', renderFields, readFields, loadFields, testConnection };
})();
