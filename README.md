# Second Brain

Lokale Sprint-1-Grundlage für ein Obsidian-Plugin mit Claude-Desktop-MCP-Verbindung und
inkrementellem SQLite-Index.

## Entwicklung

Voraussetzung: Node.js 24 LTS.

```powershell
npm ci
npm run lint
npm test
npm run test:coverage
npm run build
```

Build-Ausgaben entstehen unter `dist/`. Der Sidecar nutzt stdout ausschließlich für MCP;
strukturierte Fehler gehen an stderr.

## Lokaler Claude-Desktop-Start

Nach `npm run build` wird der Sidecar mit einem explizit freigegebenen Vault gestartet:

```powershell
$env:SECOND_BRAIN_VAULT_ROOT='C:\Pfad\zum\Vault'
node dist/sidecar/main.js
```

Die Claude-Desktop-Konfiguration verwendet `node` als `command`, den absoluten Pfad zu
`dist/sidecar/main.js` als Argument und `SECOND_BRAIN_VAULT_ROOT` als lokale
Umgebungsvariable. Second Brain verlangt keinen zusätzlichen LLM-API-Key.

ChatGPT und Mistral sind nicht Bestandteil dieses Sprint-1-Setups.

## Sicherheit

- Nur die Capability `setup:read` und ein sicherer Index-Rebuild sind exponiert.
- Absolute Fremdpfade, Traversal und Symlink-Escapes werden blockiert.
- Der Index ist abgeleitet; Vault-Originaldateien werden ausschließlich gelesen.
- Synthetische Fixtures enthalten keine privaten Nutzerdaten.
