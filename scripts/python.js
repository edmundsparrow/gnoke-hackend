/**
 * Adapter: Python API
 * Handles Python-based endpoints (FastAPI, Flask, Django, etc.)
 */
const AdapterPython = (() => {

  const FIELDS = [
    { id: 'py-url',      label: 'FastAPI/Flask URL', type: 'text',     placeholder: 'http://127.0.0.1:8000/api' },
    { id: 'py-token',    label: 'Bearer Token',      type: 'password', placeholder: 'Optional Auth Token' },
    { id: 'py-method',   label: 'HTTP Method',       type: 'select',   options: ['GET', 'POST', 'PUT'] },
    { id: 'py-path',     label: 'JSON Data Path',    type: 'text',     placeholder: 'e.g. items (leave blank for root)' }
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
      type:   'python',
      url:    (document.getElementById('py-url')    || {}).value || '',
      token:  (document.getElementById('py-token')  || {}).value || '',
      method: (document.getElementById('py-method') || {}).value || 'GET',
      path:   (document.getElementById('py-path')   || {}).value || ''
    };
  }

  function loadFields(config) {
    if (!config) return;
    if (document.getElementById('py-url'))    document.getElementById('py-url').value    = config.url    || '';
    if (document.getElementById('py-token'))  document.getElementById('py-token').value  = config.token  || '';
    if (document.getElementById('py-method')) document.getElementById('py-method').value = config.method || 'GET';
    if (document.getElementById('py-path'))   document.getElementById('py-path').value   = config.path   || '';
  }

  async function testConnection(config) {
    if (!config.url) throw new Error('Python Endpoint URL is required');
    const headers = { 'Content-Type': 'application/json' };
    if (config.token) headers['Authorization'] = `Bearer ${config.token}`;
    
    const res = await fetch(config.url, { method: config.method, headers });
    if (!res.ok) throw new Error('Python API Error: ' + res.status);
    
    const raw = await res.json();
    return GnokeFlatJSON.parse(config.path ? raw[config.path] : raw);
  }

  return { renderFields, readFields, loadFields, testConnection };
})();