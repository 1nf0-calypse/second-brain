# Sidecar — Index

Letzte Aktualisierung: 2026-08-18

| Pfad | Zweck |
|---|---|
| `src/bootstrap/` | Startpunkt, Setup-Handshake und Konfiguration |
| `src/mcp-gateway/` | MCP-Werkzeuge für Lesen, servergebundene Compilation-Vorschläge und kontrollierte Mutationen |
| `src/policy/` | Vault-Root-, Traversal- und Symlink-Schutz |
| `src/indexing/` | SQLite-Migration, FTS5, Graph-Kanten, Quellenmetadaten, Delta und Rebuild |
| `src/relationships/` | Deterministische Extraktion expliziter Wiki-Link-, Tag- und Property-Kanten |
| `src/search/` | Gemeinsamer Search-/Read-Service mit Vault-Scope |
| `src/errors/` | Versionierte öffentliche Fehlerabbildung für CLI und MCP |
| `src/mutations/` | Persistente Vorschau-Tokens, Hash-Konfliktschutz, atomare Writes, Audit und Rollback |
| `src/providers/` | Credential-freie Provider-Registry, Endpoint-Inspektion und Einmal-Consent-Grenze |
| `src/compilations/` | Schema-6-Inbox, Idempotenz, plugin-only Decision, Post-Write-Audit-Recovery, reale Template-Dateidrift und History-Projektion |
| `src/templates/` | Dateibasierte immutable Template-Versionen und beim Sidecar-Start rebuildbare SQLite-Registry |
