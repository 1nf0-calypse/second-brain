# Testing — Index

Letzte Aktualisierung: 2026-08-20

## Zweck

Testpläne, Ausführungsberichte, Fehlerberichte und Playwright-Evidenz.

## Inhalte

| Datei | ID | Version | Status | Agent | Kurzbeschreibung |
|---|---|---|---|---|---|
| `TP-000001-sprint-1.md` | TP-000001 | 1.0 | APPROVED | QA | Sprint-1-Testplan für Setup und lokalen Index |
| `TP-000002-sprint-1-review-fixes.md` | TP-000002 | 1.0 | APPROVED | QA | Nachtestplan für die Gate-8-Review-Korrekturen |
| `TP-000003-sprint-2.md` | TP-000003 | 1.0 | APPROVED | QA | Sprint-2-Testplan für lokale Suche, Quellen, Scope und Degradation |
| `TP-000004-sprint-3.md` | TP-000004 | 1.0 | APPROVED | QA | Sprint-3-Testplan für explizite lokale Beziehungen |
| `TP-000005-sprint-4.md` | TP-000005 | 1.0 | APPROVED | QA | Sprint-4-Testplan für bestätigte Ein-Datei-Mutationen |
| `TP-000006-sprint-5.md` | TP-000006 | 1.1 | APPROVED | QA | Nachtestplan für Remote-Clients, Einmal-Consent und Prozessgrenzen |
| `TP-000007-sprint-6.md` | TP-000007 | 1.0 | APPROVED | QA | Testplan für Human-on/out, 60/60-Budget, Pause, Audit und Rollback |
| `TP-000008-sprint-7.md` | TP-000008 | 1.0 | SUPERSEDED | QA | Verworfener manueller Sprint-7-Testplan; ersetzt durch TP-000009 |
| `TP-000009-sprint-7-recovery.md` | TP-000009 | 1.1 | APPROVED | QA | Freigegebener Recovery-Testplan für MCP-first Inbox, Templates, History, Restart und native UI |
| `TP-000010-sprint-8-local-graph.md` | TP-000010 | 1.0 | APPROVED | QA | Sprint-8-Testplan für lokalen read-only Graphen, native Obsidian-A11y und Vault-Integrität |
| `TR-000014-sprint-8-local-graph.md` | TR-000014 | 1.0 | CONDITIONAL | QA | Sprint-8-Testlauf: Contract/Index grün, native Obsidian- und E2E-Auflagen offen |
| `TR-000015-sprint-8-review-retest.md` | TR-000015 | 1.0 | APPROVED | QA | Sprint-8-Nachtest: Review-Funde, 118 Vitest, Coverage und E2E-Re-Verify grün |
| `TR-000001-sprint-1.md` | TR-000001 | 1.0 | REJECTED | QA | Testlauf: automatisiert grün, Gate 7 wegen zwei BLOCKERN fehlgeschlagen |
| `TR-000002-sprint-1.md` | TR-000002 | 1.0 | APPROVED | QA | Bugfixes und echter Desktop-P0-Pfad verifiziert; Gate 7 PASS |
| `TR-000003-sprint-1-review-fixes.md` | TR-000003 | 1.0 | CONDITIONAL | QA | Review-Regressionen grün; erneuter Desktop-Systemtest offen |
| `TR-000004-sprint-2.md` | TR-000004 | 1.0 | REJECTED | QA | Sprint-2-Testlauf; Gate 7 wegen Scope-Fehlercode und offener Desktop-P0-Pfade fehlgeschlagen |
| `TR-000005-sprint-2-retest.md` | TR-000005 | 1.0 | CONDITIONAL | QA | BUG-000003 verifiziert; automatisiert grün, native Desktop-Abnahme offen |
| `TR-000006-sprint-3.md` | TR-000006 | 1.2 | APPROVED | QA | Sprint-3-Testlauf einschließlich Obsidian und Claude Desktop bestanden |
| `TR-000007-sprint-4.md` | TR-000007 | 1.2 | CONDITIONAL | QA | Gate 7 funktional bestanden; Claude-Desktop-UI als Review-Auflage |
| `TR-000008-sprint-5.md` | TR-000008 | 1.2 | CONDITIONAL | QA | Alle Sprint-5-BLOCKER verifiziert; native und reale Provider-Abnahme als MAJOR-Auflage offen |
| `TR-000009-sprint-6.md` | TR-000009 | 1.4 | CONDITIONAL | QA | Finale Pause-Semantik verifiziert; native UI- und dedizierte Harness-Abnahme offen |
| `TR-000010-sprint-7.md` | TR-000010 | 1.1 | SUPERSEDED | QA | Veraltete Bewertung auf Basis des verworfenen TP-000008; ersetzt durch TR-000011 |
| `TR-000011-sprint-7-recovery.md` | TR-000011 | 1.0 | REJECTED | QA | Recovery-Testlauf: 105 Tests und 19 headed E2E grün, Gate 7 wegen Recovery-BLOCKER abgelehnt |
| `TR-000012-sprint-7-recovery-retest.md` | TR-000012 | 1.1 | APPROVED | QA | Nachtest: alle Befunde sowie die manuelle native Obsidian-P0-Abnahme bestanden |
| `TR-000013-sprint-7-gate-8-corrections.md` | TR-000013 | 1.0 | APPROVED | QA | Gate-8-Delta: 114 Vitest, Coverage, 19 headed E2E und Performance grün |
| `BUG-000001-plugin-package-incomplete.md` | BUG-000001 | 1.0 | VERIFIZIERT | QA | Vollständiges Plugin-Paket bestätigt |
| `BUG-000002-native-node-launch-invalid.md` | BUG-000002 | 1.0 | VERIFIZIERT | QA | Node-Runtime und realer Sidecar-Pfad bestätigt |
| `BUG-000003-scope-error-code-generic.md` | BUG-000003 | 1.2 | VERIFIZIERT | QA | Scope-Verletzung wird über CLI, MCP und Plugin stabil typisiert |
| `BUG-000004-relationship-index-stale.md` | BUG-000004 | 1.2 | VERIFIZIERT | RV+FE+BE+QA | Altindex-Migration nativ nach vollständigem Obsidian-Neustart bestätigt |
| `BUG-000005-lock-error-reported-offline.md` | BUG-000005 | 1.6 | VERIFIZIERT | QA | Reale Windows-Sperre liefert stabil MUTATION_WRITE_FAILED |
| `BUG-000006-preview-storage-unbounded.md` | BUG-000006 | 1.3 | VERIFIZIERT | QA | Preview-Speichergrenze und Cleanup unabhängig bestätigt |
| `BUG-000007-consent-flow-unreachable.md` | BUG-000007 | 1.0 | VERIFIZIERT | QA | Consent-/Transferpfad unabhängig nachgetestet |
| `BUG-000008-provider-handshake-not-performed.md` | BUG-000008 | 1.0 | VERIFIZIERT | QA | Handshake- und Scope-Negativpfade unabhängig nachgetestet |
| `BUG-000009-provider-consent-not-server-bound.md` | BUG-000009 | 1.0 | VERIFIZIERT | QA | Serverseitige Prepare→Confirm-Bindung unabhängig nachgetestet |
| `BUG-000010-applying-create-recovery-invalid-target.md` | BUG-000010 | 1.3 | VERIFIZIERT | QA | Fünf Create-Recovery-Neustarts enden deterministisch als incomplete |
| `BUG-000011-mutation-branch-coverage-below-gate.md` | BUG-000011 | 1.3 | VERIFIZIERT | QA | Mutations-Branch-Coverage unabhängig mit 91,47 % bestätigt |
| `BUG-000012-schema-5-production-fixture-missing.md` | BUG-000012 | 1.3 | VERIFIZIERT | QA | Gehashte Schema-5-Fixture und idempotente Migration unabhängig bestätigt |
