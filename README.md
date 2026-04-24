# Gnoke Hackend

Portable backend configuration tool — part of the Gnoke Suite.

## What it does
- GUI to configure storage backends (PHP, SQL, Google Sheets, Python, Node.js)
- Normalises any backend response via `gnoke-flatjson` → `{ headers, rows }`
- Defines roles and security policy
- Exports a portable JSON manifest

## Structure
```
gnoke-hackend/
├── index.html          ← Splash screen
├── main/index.html     ← App shell
├── js/
│   ├── state.js        ← Runtime state
│   ├── theme.js        ← Dark/light toggle
│   ├── ui.js           ← Toast, modal, loading
│   ├── flatjson.js     ← gnoke-flatjson browser build
│   └── app.js          ← Bootstrap + all event wiring
├── scripts/
│   ├── php.js          ← PHP File/API adapter
│   ├── sql.js          ← SQL adapter (via proxy)
│   ├── sheets.js       ← Google Sheets adapter
│   ├── python.js       ← Python adapter (FastAPI / Flask / Django)
│   └── node.js         ← Node.js adapter (Express)
├── security/
│   └── roles.js        ← Roles + policy module
├── style.css
├── manifest.json
└── sw.js
```

## Adapters

| Value    | Label              | Auth              | Notes                          |
|----------|--------------------|-------------------|--------------------------------|
| `php`    | PHP File / API     | X-API-Key header  | GET or POST                    |
| `sql`    | SQL (MySQL/SQLite) | X-API-Key header  | Requires REST proxy            |
| `sheets` | Google Sheets      | None              | Sheet must be published to web |
| `python` | Python API         | Bearer token      | FastAPI, Flask, Django etc.    |
| `node`   | Node.js (Express)  | X-App-Secret      | Any Express/Node REST API      |

All adapters normalise their response through `GnokeFlatJSON.parse()` and return
`{ headers: string[], rows: string[][] }` — the UI never handles raw adapter payloads.

## Adding a new adapter
1. Create `scripts/myadapter.js` as an IIFE exposing:
   `{ id, label, renderFields, readFields, loadFields, testConnection }`
   - `testConnection(config)` must return `GnokeFlatJSON.parse(data)`
2. Add `<script src="../scripts/myadapter.js">` to `main/index.html` before `app.js`
3. Add `<option value="myadapter">My Adapter</option>` to the adapter `<select>` in `main/index.html`
4. Register in the `ADAPTERS` map in `app.js`

## Adding a new security concern
1. Create `security/myconcern.js` as an IIFE
2. Add script tag to `main/index.html`
3. Add UI card to the Security page

© 2026 Edmund Sparrow — Gnoke Suite