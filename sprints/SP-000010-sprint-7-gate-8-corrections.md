---
id: SP-000010
title: Sprint 7 Gate-8 Correction Backlog
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst) + FE + BE
date: 2026-08-18
project: second-brain
sprint: 7
based-on: SP-000009@1.0, RV-000009@1.0, RM-000001@1.4, RM-000002@1.2, US-000017@1.0, US-000016@1.0, US-000008@1.1, ADR-000007@1.0, UX-000004@1.0
supersedes: SP-000009@1.0
superseded-by: —
---

# SP-000010: Sprint 7 — Gate-8-Korrekturen

## Sprint-Ziel

**In einem Satz:** Die vom Nutzer akzeptierte Sprint-7-Recovery wird an den fünf
technischen Funden aus RV-000009 gehärtet, sodass jeder erfolgreiche Vault-Write
wahrheitsgetreu auditier- und rücksetzbar bleibt, Template-Dateien wirklich die Source of
Truth bilden und die freigegebene Warn-Microcopy exakt erscheint.

**Messbares Erfolgskriterium:** K-001, K-002, K-003, T-001 und UX-001 aus RV-000009 sind
durch gezielte Regressionstests geschlossen; Build, Lint, vollständige Vitest-Suite und
headed Changes-E2E bestehen. Der akzeptierte MCP-first-Flow und der Contract 3.0.0 werden
nicht erweitert.

## Sprint-Rahmen

| Eigenschaft | Wert |
|---|---|
| Korrekturstart | 2026-08-18 |
| Zieltermin | 2026-08-29 |
| Verbleibender Aufwand | 8 SP |
| Schwerpunkt BE | 7 SP |
| Schwerpunkt FE | 1 SP |
| QA | Delta-Nachtest der vier Korrekturpakete |
| Referenz | SP-000009: 42 SP; kumuliert mit Gate-8-Korrektur: 50 SP |

Die 8 SP sind Rework innerhalb des bestehenden Sprint-7-Scopes. Sie erzeugen keine neue
User Story und verschieben keine Produktfunktion in einen späteren Sprint.

## Commit-Stories

| US | Titel | Bisheriges Refinement | Korrekturanteil | Verantwortlich | Abhängigkeiten |
|---|---|---:|---:|---|---|
| US-000017 | MCP-first Kompilierung mit ausstehender Bestätigung | 21 SP | 4 SP | BE+FE+QA | ADR-000007; RV-000009 K-001, UX-001 |
| US-000016 | Versionierte projektlokale Kompilierungsvorlagen | 13 SP | 4 SP | BE+QA | RV-000009 K-002, K-003 |
| US-000008 | Wahrheitsgetreue lokale Mutationshistorie | 8 SP | in K-001 enthalten | BE+QA | Audit-/Rollback-Endzustand aus US-000017 |

**Gesamt Korrektur:** 8 SP. Keine Stretch-Stories.

## Implementierungsreihenfolge

```text
K-001: Post-Write-Saga und Recovery-Nachweis
  ├─→ K-002: Template-Dateidrift vor Confirm
  ├─→ K-003: automatische Registry-Recovery
  └─→ UX-001: exakte Warn-Microcopy
        → vollständiger Delta-Testlauf → Re-Review
```

K-002, K-003 und UX-001 dürfen nach Festlegung der gemeinsamen Test-Fixtures parallel
umgesetzt werden. Der abschließende Delta-Testlauf beginnt erst, wenn K-001 den
Post-Write-Zustand zuverlässig erhält.

## Subtasks

### US-000017 / US-000008 — Saga, Historie und Microcopy: 4 SP

| ID | Review-Fund | Konkrete Arbeit | Verantwortlich | SP | Fertiges Ergebnis | Verbindlicher Nachweis |
|---|---|---|---|---:|---|---|
| R7-G8-01 | K-001, T-001 | Fehlergrenzen in `CompilationInboxService.decide` trennen. Nach erfolgreichem Datei-Write darf ein Finalize-/Auditfehler weder `failed` setzen noch die Payload löschen; `APPLYING` bleibt recoverable. | BE | 3 | Neustart erkennt den After-Hash, finalisiert genau einen Auditdatensatz und stellt einen verfügbaren Einzelrollback bereit. Pre-Write-Fehler bleiben wahrheitsgetreu `failed`/`incomplete`. | Injizierter Fehler exakt zwischen Write und `finalizeConfirmed`; vor Restart: Datei hat After-Hash, State `applying`, Payload vorhanden; nach Restart: `confirmed`, ein Audit, History `success`, Rollback `available`. Wiederholte Recovery ist idempotent. |
| R7-G8-04 | UX-001, T-001 | Warncodes zentral auf die verbindlichen UX-000004-Texte abbilden und Checkboxtext auf `I reviewed the warnings above.` korrigieren; synthetischen E2E-Harness auf dieselben Produktionsstrings umstellen. | FE | 1 | Injection- und Konfliktwarnungen sowie Checkbox entsprechen exakt UX-000004; unbekannte Codes erhalten eine sichere generische Warnung ohne technische Codeanzeige im Haupttext. | DOM-/Komponententests für beide bekannten Codes, Fallback und Confirm-Sperre; headed E2E assertiert die exakten sichtbaren Texte. |

### US-000016 — Datei-Source-of-Truth und Recovery: 4 SP

| ID | Review-Fund | Konkrete Arbeit | Verantwortlich | SP | Fertiges Ergebnis | Verbindlicher Nachweis |
|---|---|---|---|---:|---|---|
| R7-G8-02 | K-002, T-001 | Gebundene Template-Version unmittelbar vor Confirm über den Datei-Store lesen und den realen Inhalts-Hash gegen ID/Version/Hash der Vorschau prüfen. Missing/Drift beendet den Vorschlag konfliktbehaftet ohne Vault-Mutation und verlangt einen neuen Vorschlag. | BE | 2 | SQLite-Metadaten allein können eine gelöschte oder veränderte Template-Datei nicht mehr als gültig bestätigen. | Integrationstests ändern beziehungsweise löschen die gebundene Datei nach Submit; Confirm liefert den konkreten Template-Driftfehler, Zielhash bleibt unverändert, History zeigt keinen Erfolg. Eine unveränderte ältere Version bleibt gültig. |
| R7-G8-03 | K-003, T-001 | Template-Registry beim Sidecar-Start deterministisch aus Manifesten und Inhaltsdateien rekonstruieren beziehungsweise reservierte/orphaned Zustände abgleichen. Ungültige oder partielle Verzeichnisse bleiben isoliert; kein gültiger Eintrag wird still verworfen. | BE | 2 | Registry-Verlust und Crashfenster zwischen Reservierung, Datei, Manifest und Ready-Markierung sind ohne manuellen internen Methodenaufruf recoverable. | Restartmatrix für leere/verlorene Registry, `reserved`, `orphaned`, vollständige Datei+Manifest sowie partielle/ungültige Verzeichnisse; zwei Starts liefern dasselbe Ergebnis. `.second-brain/**` bleibt aus Index und Quellen ausgeschlossen. |

## Technische Voraussetzungen

| # | Voraussetzung | Status | Nachweis |
|---:|---|---|---|
| 1 | US-000017, US-000016 und US-000008 sind APPROVED | ✅ | Artefakt-Header |
| 2 | ADR-000001 und ADR-000007 sind APPROVED | ✅ | Architekturindex |
| 3 | UX-000004 ist APPROVED und enthält verbindliche Warntexte | ✅ | UX-000004 §8 |
| 4 | RV-000009 enthält reproduzierbare Fundstellen und Empfehlungen | ✅ | K-001 bis K-003, T-001, UX-001 |
| 5 | Bestehender Sprint-Worktree und Schema-5-Fixture sind verfügbar | ✅ | `.phase`, `tests/fixtures/schema-5/` |
| 6 | Externe Infrastruktur oder neue Technologieentscheidung erforderlich | N/A | Lokaler TypeScript-/SQLite-/Obsidian-Stack bleibt unverändert |

## Abnahmekriterien des Korrektur-Backlogs

1. Ein Fehler nach erfolgreichem Ziel-Write lässt State und Payload für Recovery bestehen;
   nach Neustart stimmen Datei, Audit, Historie und Rollback überein.
2. Eine gelöschte oder inhaltlich veränderte Template-Datei blockiert Confirm ohne
   Vault-Mutation; eine unveränderte gebundene Version bleibt lesbar.
3. Gültige Template-Dateien erscheinen nach Registry-Verlust oder unterstütztem Crashfenster
   nach Neustart wieder; partielle Dateien werden nicht als gültig erfunden.
4. Die sichtbaren Injection-/Konfliktwarnungen und die Review-Checkbox entsprechen exakt
   UX-000004.
5. Jeder ursprüngliche RV-Fund besitzt mindestens einen Regressionstest, der ohne die
   Korrektur fehlschlägt und mit ihr besteht.
6. `npm run build`, `npm run lint`, `npm test` und die gezielte headed E2E-Suite bestehen.

## Risiken & Unsicherheiten

| Risiko | Wahrscheinlichkeit | Impact | Mitigation | Blockiert Start? |
|---|---|---|---|---|
| Ein breiter Catch terminalisiert auch künftig Post-Write-Fehler | Mittel | Hoch | Explizite Zustandsgrenze und Fehler-Injektion vor Implementierung des Happy Paths | Nein |
| Automatischer Rebuild überschreibt eine noch gültige Registry falsch | Niedrig | Hoch | Datei/Manifest als Source of Truth, transaktionaler Replace, idempotenter Zweitstart | Nein |
| Template-Driftprüfung dupliziert Store-Logik | Mittel | Mittel | Validierung über `TemplateStore.read` oder einen gemeinsamen Port statt eigener SQL-Prüfung | Nein |
| Microcopy driftet erneut zwischen Produkt und Harness | Mittel | Mittel | Zentrale Mapping-Konstante und exakte Textassertions | Nein |

**Selbstauskunft BA+FE+BE:** Es gibt keine ungeklärte Scope-, Architektur- oder UX-Frage.
Der offene RV-BLOCKER ist vollständig in R7-G8-01 geschnitten und blockiert die
Implementierung nicht, wohl aber Test-, Review- und Dokumentationsfreigabe.

## Technische Schulden

Keine. Alle fünf RV-000009-Funde werden in diesem Korrekturlauf geschlossen.

## Nicht-Ziele

- Keine Änderung des akzeptierten MCP→Inbox→Review→Decision-Nutzerflusses.
- Kein Contract 4, keine neue Migration und kein zusätzlicher MCP-Entscheidungsendpunkt.
- Kein Template Delete/Share/Sync und kein Obsidian-initiierter Compilation-Editor.
- Keine neue Autonomiestufe, Mehrdatei-Mutation oder externe Persistenz.
- Keine vollständige Wiederholung unbetroffener Sprint-7-Arbeit; der Rücklauf ist delta-basiert.

## Definition of Ready

- [x] Alle betroffenen User Stories und UX-/ADR-Artefakte sind APPROVED.
- [x] Jeder RV-Fund ist genau einem Task, Verantwortlichen und Nachweis zugeordnet.
- [x] Alle vier Tasks sind geschätzt und abhängigkeitsgeordnet.
- [x] API-/Schemaänderung ist nicht erforderlich; bestehender Contract 3 bleibt verbindlich.
- [x] Keine ungeklärte BLOCKER- oder MAJOR-Frage für den Implementierungsstart.
- [x] Constitution geprüft: Datenintegrität, Human-in-the-Loop, lokale Persistenz und
      Berechtigungsgrenzen werden durch die Korrekturen gestärkt.
- [x] Roadmap-Abweichung auf kumuliert 50 SP dokumentiert.
- [x] `sprints/INDEX.md`, Projekt-`INDEX.md`, `.phase` und ID-Zähler aktualisiert.

---

## Übergabe: BA+FE+BE → FE+BE+QA

**Datum:** 2026-08-18  
**Von:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)  
**An:** Frontend Developer, Backend Developer und QA Engineer (FE+BE+QA)  
**Nächster Befehl:** `/implement all second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| SP-000010 | APPROVED | `sprints/SP-000010-sprint-7-gate-8-corrections.md` | 8-SP-Delta für alle fünf RV-000009-Funde |
| RV-000009 | REQUEST_CHANGES | `reviews/RV-000009-sprint-7-recovery.md` | Nutzer ACCEPTED; technische Korrekturen vor Gate 8 |
| ADR-000007 | APPROVED | `architecture/ADR-000007-mcp-first-pending-confirmation.md` | Saga-, Template- und Zustandsvorgaben bleiben unverändert |
| UX-000004 | APPROVED | `ux/UX-000004-mcp-first-compilation-review.md` | Verbindliche Warn-Microcopy |

### Kritische Informationen für Empfänger

- R7-G8-01 zuerst abschließen; Post-Write-Fehler dürfen keinen falschen Terminalzustand
  erzeugen oder die Recovery-Payload löschen.
- Korrekturen bleiben innerhalb bestehender Verträge und akzeptierter UX.
- Jeder Task gilt erst mit seinem expliziten Regressionstest als fertig.

### Offene Fragen

Keine.

### Nicht-Ziele

Keine erneute fachliche Abnahme unbetroffener Flows und keine Erweiterung des Sprint-Scope.

### Empfehlungen

Nach Implementierung zunächst den gezielten Delta-Lauf, danach die vollständige Suite und
headed E2E ausführen; anschließend `/test-run second-brain 7` und `/review`.

---

*Erstellt von: BA + FE + BE (Re-Refinement) | Datum: 2026-08-18 | Version: 1.0*
