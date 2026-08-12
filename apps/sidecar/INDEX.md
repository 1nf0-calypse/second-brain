# Sidecar — Index

Letzte Aktualisierung: 2026-08-12

| Pfad | Zweck |
|---|---|
| `src/bootstrap/` | Startpunkt, Setup-Handshake und Konfiguration |
| `src/mcp-gateway/` | MCP-Werkzeuge für Lesen sowie bestätigungspflichtige Ein-Datei-Mutationen |
| `src/policy/` | Vault-Root-, Traversal- und Symlink-Schutz |
| `src/indexing/` | SQLite-Migration, FTS5, Graph-Kanten, Quellenmetadaten, Delta und Rebuild |
| `src/relationships/` | Deterministische Extraktion expliziter Wiki-Link-, Tag- und Property-Kanten |
| `src/search/` | Gemeinsamer Search-/Read-Service mit Vault-Scope |
| `src/errors/` | Versionierte öffentliche Fehlerabbildung für CLI und MCP |
| `src/mutations/` | Persistente Vorschau-Tokens, Hash-Konfliktschutz, atomare Writes, Audit und Rollback |
| `src/providers/` | Credential-freie Provider-Registry, Endpoint-Inspektion und Einmal-Consent-Grenze |
