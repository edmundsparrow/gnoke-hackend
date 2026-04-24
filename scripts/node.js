/**
 * Adapter: Node.js / Express
 * Handles Node.js backend integration
 */
const AdapterNode = (() => {

  const FIELDS = [
    { id: 'node-url',    label: 'Server URL',      type: 'text',     placeholder: 'http://localhost:3000' },
    { id: 'node-secret', label: 'App Secret',      type: 'password', placeholder: 'X-App-Secret' },
    { id: 'node-path',   label: 'Response Path',   type: 'text',     placeholder: 'e.g. data.rows' }
  ];

  function renderFields() {
    return FIELDS.map(f => 
      `<div class="field-group"><label for="${f.id}">${f.label}</label><input type="${f.type}" id="${f.id}" placeholder="${f.placeholder || ''}" /></div>`
    ).join('');
  }

  function readFields() {
    return {
      type:   'node',
      url:    (document.getElementById('node-url')    || {}).value || '',
      secret: (document.getElementById('node-secret') || {}).value || '',
      path:   (document.getElementById('node-path')   || {}).value || ''
    };
  }

  function loadFields(config) {
    if (!config) return;
    if (document.getElementById('node-url'))    document.getElementById('node-url').value    = config.url    || '';
    if (document.getElementById('node-secret')) document.getElementById('node-secret').value = config.secret || '';
    if (document.getElementById('node-path'))   document.getElementById('node-path').value   = config.path   || '';
  }

  async function testConnection(config) {
    if (!config.url) throw new Error('Node.js Server URL is required');
    const headers = { 'Content-Type': 'application/json' };
    if (config.secret) headers['X-App-Secret'] = config.secret;

    const res = await fetch(config.url, { headers });
    if (!res.ok) throw new Error('Node.js Server Error: ' + res.status);
    
    const raw = await res.json();
    // Simple path traversal for Node responses
    const data = config.path ? config.path.split('.').reduce((o, i) => o[i], raw) : raw;
    return GnokeFlatJSON.parse(data);
  }

  return { renderFields, readFields, loadFields, testConnection };
})();