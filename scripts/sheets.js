/**
 * Adapter: Google Sheets (published CSV)
 * Uses a publicly published Google Sheet as a read source
 */
const AdapterSheets = (() => {

  const FIELDS = [
    { id: 'sheets-id',    label: 'Sheet ID',     type: 'text', placeholder: 'From the Google Sheets URL' },
    { id: 'sheets-gid',   label: 'Tab GID',      type: 'text', placeholder: '0 for first tab' },
    { id: 'sheets-range', label: 'Named Range',  type: 'text', placeholder: 'Optional — e.g. A1:D50' }
  ];

  function buildUrl(config) {
    const base = 'https://docs.google.com/spreadsheets/d/' + config.id + '/gviz/tq?tqx=out:json';
    const gid   = config.gid   ? '&gid='   + config.gid   : '';
    const range = config.range ? '&range=' + config.range : '';
    return base + gid + range;
  }

  function renderFields() {
    return FIELDS.map(f =>
      `<div class="field-group"><label for="${f.id}">${f.label}</label><input type="${f.type}" id="${f.id}" placeholder="${f.placeholder || ''}" /></div>`
    ).join('') + '<p class="field-hint">Sheet must be published: File → Share → Publish to web</p>';
  }

  function readFields() {
    return {
      type:  'sheets',
      id:    (document.getElementById('sheets-id')    || {}).value || '',
      gid:   (document.getElementById('sheets-gid')   || {}).value || '0',
      range: (document.getElementById('sheets-range') || {}).value || ''
    };
  }

  function loadFields(config) {
    if (!config) return;
    if (document.getElementById('sheets-id'))    document.getElementById('sheets-id').value    = config.id    || '';
    if (document.getElementById('sheets-gid'))   document.getElementById('sheets-gid').value   = config.gid   || '0';
    if (document.getElementById('sheets-range')) document.getElementById('sheets-range').value = config.range || '';
  }

  async function testConnection(config) {
    if (!config.id) throw new Error('Sheet ID is required');
    const url = buildUrl(config);
    const res  = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const json = JSON.parse(text.replace(/^[^(]+\(/, '').replace(/\);?$/, ''));
    const cols = json.table.cols.map(c => c.label || c.id);
    const rows = json.table.rows.map(r => r.c.map(cell => cell ? String(cell.v !== null ? cell.v : '') : ''));
    return GnokeFlatJSON.parse({ headers: cols, rows });
  }

  return { id: 'sheets', label: 'Google Sheets', renderFields, readFields, loadFields, testConnection };
})();
