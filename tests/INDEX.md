# Tests — Index

Letzte Aktualisierung: 2026-08-18

| Pfad | Abdeckung |
|---|---|
| `unit/` | Infrastrukturfreie Delta-, Vertrags-, Relationship-, Compilation-, Polling- und Mutations-Clientlogik |
| `security/` | Vault-Root, Traversal und Fremdpfade |
| `integration/` | Index, Suche, Graph, Mutationen sowie Contract-3-Inbox, JSON-stdin, reale Template-Dateidrift, Registry-Recovery und Post-Write-Audit-Recovery |
| `fixtures/relationships/` | Synthetischer Mini-Vault für deterministische Link-, Tag- und Property-Fälle |
| `fixtures/schema-5/` | Sanitisiertes Schema-5-SQL-Abbild mit SHA-256-Manifest für produktionsnahe Schema-6-Migration |
| `compatibility/` | Vertragsversion, Client-Scope und Konfiguration |
| `e2e/` | Headed Playwright-Clickpfade für Setup, Suche, Beziehungen, Changes-Inbox, Templates, History, Mutationsvorschau und Rollback |
| `e2e/pages/changes.page.ts` | Page Object für reproduzierbare Changes-Inbox-, Template- und History-Interaktionen gemäß TP-000009 |
| `performance/` | Reproduzierbare Search-, Read-, Delta- und Security-Baselines |
| `performance/relationships-baseline.mjs` | Graphabfrage, Delta, Rebuild und RSS auf 500 synthetischen Notizen |
| `performance/mutations-baseline.ts` | Preview-, Confirm-, Rollback-, SQLite- und RSS-Baseline |
| `performance/compilation-baseline.ts` | Inbox-50-, 2-MiB-/20-Quellen-, 64-MiB-Storage- und Restart-Recovery-Baseline |
