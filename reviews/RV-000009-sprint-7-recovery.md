---
id: RV-000009
title: Review Second Brain Sprint 7 Recovery
version: 1.0
status: REQUEST_CHANGES
author-agent: RV (Code Reviewer)
date: 2026-08-18
project: second-brain
sprint: 7
reviewed-stories: US-000017@1.0, US-000016@1.0, US-000008@1.1
qa-report: TR-000012@1.1
based-on: SP-000009@1.0, TP-000009@1.1, TR-000012@1.1, UX-000004@1.0, ADR-000007@1.0
supersedes: RV-000008@1.0
superseded-by: —
---

# Review: Second Brain — Sprint 7 Recovery

## Review-Übersicht

| Eigenschaft | Wert |
|---|---|
| Branch | `feature/sprint-6` |
| Reviewed Commit | `81bec1f` plus uncommitted Sprint-7-Recovery-Diff |
| Diff-Basis | `d31cf59..81bec1f` plus Worktree |
| Reviewer-Agent | RV |
| QA-Freigabe | APPROVED (`TR-000012@1.1`) |
| Nutzerabnahme | **ACCEPTED** |
| Technischer Review | **REQUEST CHANGES** |
| Gesamtentscheidung | **REQUEST CHANGES** |

**Entscheidung:** Der korrigierte MCP-first-Nutzerfluss, die versionierten Vorlagen und
Historie/Rollback wurden vom Nutzer vollständig akzeptiert. Gate 8 bleibt technisch
blockiert: Ein Fehler nach erfolgreichem Vault-Write kann den Vorgang fälschlich als
`failed` terminalisieren, die Recovery-Payload löschen und die bereits erfolgte Änderung
ohne Audit- und Rollback-Nachweis zurücklassen. Drei weitere MAJOR-Abweichungen betreffen
Template-Drift, Registry-Recovery und die verbindliche Warn-Microcopy.

---

## Teil 1: Nutzerabnahme

### Präsentierter Test-Guide

1. **US-000017 — MCP-Kompilierungsvorschläge:** Vorschlag über MCP einreichen, in der
   Obsidian-Inbox prüfen und dort bestätigen oder verwerfen.
2. **US-000016 — Versionierte Vorlagen:** Vorlagenversionen speichern, auswählen und ihre
   unveränderliche Provenienz prüfen.
3. **US-000008 — Historie und Rollback:** Erfolgs-, Ablehnungs- und Recovery-Zustände im
   Verlauf prüfen und eine Änderung zurücksetzen.

### Interview-Ergebnisse

| Feature | Funktioniert? | Nutzer-Befund | Anmerkungen aus Interview |
|---|---|---|---|
| US-000017: MCP-first Pending Compilation | Ja | ACCEPTED | Nutzerantwort: „Funktioniert“. |
| US-000016: Versionierte projektlokale Vorlagen | Ja | ACCEPTED | Nutzerantwort: „Funktioniert“. |
| US-000008: Lokale Historie und Rollback | Ja | ACCEPTED | Nutzerantwort: „Funktioniert“. |

Der Nutzer meldete anschließend „Alles gut.“; damit liegen keine unerwarteten
Verhaltensweisen, UX-Einwände oder Änderungswünsche aus der manuellen Abnahme vor.

### Nutzerabnahme-Entscheidung

- [x] **ACCEPTED** — Alle drei präsentierten Feature-Gruppen funktionieren wie erwartet.
- [ ] CONDITIONAL
- [ ] REJECTED

---

## Teil 2: Technisches Code Review

### Change-Impact und Nachweise

Der Codegraph wurde als `second-brain-sprint7-review` direkt aus dem aktiven Worktree neu
indiziert. `detect_changes` war nicht exponiert; deshalb wurden der Git-Diff sowie
`search_graph`, `get_code_snippet`, `search_code` und Call-Impact verwendet.

- `CompilationInboxService.decide` verbindet den plugin-only Entscheidungs-Claim mit
  Vault-Write, Audit und Recovery und ist der zentrale Datenintegritäts-Risikoknoten.
- `CompilationInboxService.assertTemplate` schützt Submit/Detail/Confirm, prüft derzeit
  aber nur den Registry-Datensatz.
- `TemplateStore.rebuildRegistry` hat laut Codegraph keinen Produktionsaufrufer; der einzige
  sichtbare Aufruf liegt im Integrationstest.
- Geschützte Aktion `plugin:compilation:decide`: Produktvorkommen vollständig geprüft in
  `compilation-inbox-service.ts` (Typ und Guard) sowie `bootstrap/main.ts` (lokaler
  Plugin-IPC-Aufruf). Das MCP-Gateway exponiert keine Decision-Methode.
- Erneut ausgeführt: Build PASS, Lint PASS, Vitest PASS mit 22 Dateien und 110 Tests.
  QA-Evidenz: Gesamt-Coverage 92,83 % Statements / 86,00 % Branches / 89,51 % Functions /
  93,39 % Lines sowie 19/19 headed Playwright-Tests.

## Dimension 1: Korrektheit

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Alle US-Akzeptanzkriterien implementiert | ❌ | Recovery und Template-Drift sind nicht vollständig abgesichert. |
| Implementierung stimmt mit Vertrag überein | ⚠️ | Contract-3-Zustände sind vorhanden; ein Teilfehler kann die Projektion verfälschen. |
| Edge Cases behandelt | ❌ | Post-Write-Finalize-Fehler und echte Registry-Verlustpfade fehlen. |
| Fehlerbehandlung vollständig | ❌ | Erfolgreicher Write und fehlgeschlagene Finalisierung werden zusammen abgefangen. |

| # | Kategorie | Datei:Zeile | Problem | Empfehlung |
|---|---|---|---|---|
| K-001 | **BLOCKER** | `apps/sidecar/src/compilations/compilation-inbox-service.ts:318-325,473-529` | `decide()` fängt Write- und Finalize-Fehler gemeinsam ab. Scheitert `finalizeConfirmed()` nach dem erfolgreichen Datei-Write, setzt `finishWithoutSuccess()` den Vorgang auf `failed` und löscht die Payload. Der Vault wurde dann geändert, während Historie und Rückgabe Misserfolg behaupten; Audit, Rollback und Neustart-Recovery sind verloren. | Write und Finalisierung in getrennte Fehlergrenzen legen. Nach erfolgreichem Write muss der Zustand `applying` samt Payload erhalten bleiben, damit `recoverApplying()` anhand des After-Hash idempotent finalisiert. Fehler-Injektion exakt zwischen Write und Audit ergänzen. |
| K-002 | **MAJOR** | `apps/sidecar/src/compilations/compilation-inbox-service.ts:437-471` | `assertTemplate()` verifiziert nur ID/Version/Hash im SQLite-Index. Eine nach Submit gelöschte oder veränderte Template-Datei wird vor Confirm nicht gelesen oder gehasht; die geforderte Drift-Sperre kann umgangen werden. | Vorlage über den dateibasierten Source-of-Truth lesen und den Inhalts-Hash unmittelbar vor Confirm prüfen; Missing/Drift terminal und ohne Vault-Mutation behandeln. |
| K-003 | **MAJOR** | `apps/sidecar/src/templates/template-store.ts:32-35,118-144`; `apps/sidecar/src/bootstrap/main.ts:160-164` | Der Registry-Rebuild existiert, wird im Produkt aber weder beim Start noch über einen Recovery-Befehl ausgelöst. Reservierte/orphaned Zustände werden nicht abgeglichen. Nach Crash oder Registry-Verlust bleiben gültige Dateien unsichtbar; der Test ruft den Rebuild nur direkt auf einer gesunden Registry auf. | Deterministische Startup-Recovery oder expliziten erreichbaren Rebuild-Pfad implementieren und Verlust-, Reserved-, Orphan- und Restart-Fälle testen. |

## Dimension 2: Sicherheit

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Input-Validierung | ✅ | Zod-Verträge und Feld-spezifische Scope-Fehler vorhanden. |
| Keine Secrets/Credentials | ✅ | Keine Secrets im Sprint-Diff gefunden. |
| Auth/Authz | ✅ | Decision-Capability nicht über MCP exponiert; lokaler Plugin-IPC-Pfad geprüft. |
| Pfad-/Scope-Schutz | ✅ | Relative Markdown-Pfade, reservierte Verzeichnisse und Symlinks werden geprüft. |
| SQL-Injection-Schutz | ✅ | Parametrisierte SQLite-Statements. |
| Sensible Daten nicht geloggt | ✅ | Kein neuer Content-Logpfad gefunden. |
| OWASP Top 10 | N/A | Lokale Desktop-/stdio-Prozessgrenze; keine neue Weboberfläche. |

Kein eigenständiger Security-Fund. K-001 ist dennoch ein Datenintegritäts-BLOCKER.

## Dimension 3: ADR- und Constitution-Konformität

| Vorgabe | Status | Anmerkungen |
|---|---|---|
| ADR-000001 bis ADR-000006 | ✅ | Stack, Modul-, Lokalitäts-, Mutations-, Branch- und Datenflussgrenzen bleiben erhalten. |
| ADR-000007 Write-ahead-Saga | ❌ | K-001 entfernt nach Post-Write-Finalize-Fehler den Recovery-Zustand. |
| ADR-000007 dateibasierte Template-Quelle | ❌ | K-002/K-003 prüfen beziehungsweise rekonstruieren die reale Datei nicht zuverlässig. |
| CON-000001 Human-in-the-loop | ✅ | MCP kann nicht bestätigen; Nutzerentscheidung bleibt im Plugin. |
| CON-000001 wahrheitsgetreue lokale Historie | ❌ | K-001 kann einen erfolgreichen Vault-Write als `failed` projizieren. |

Die Architekturentscheidung selbst bleibt passend; die Funde sind lokal behebbare
Implementierungsabweichungen und erfordern deshalb Korrektur statt erneuten Scope-Schnitt.

## Dimension 4: Code-Qualität

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Datei-Header vorhanden | ✅ | Stichprobe der neuen Inbox-, Template- und Plugin-Dateien bestanden. |
| Öffentliche Funktionen kommentiert | ✅ | Service- und Store-APIs besitzen JSDoc. |
| Kein toter/auskommentierter Code | ⚠️ | `rebuildRegistry()` ist produktiv nicht erreichbar (K-003). |
| Keine Magic Numbers | ✅ | Limits und TTLs sind benannt oder vertraglich gebunden. |
| Keine `any`-Typen | ✅ | Lint ohne Warnungen bestanden. |
| Namensgebung/TODO-Standard | ✅ | Keine abweichenden TODOs in der Stichprobe. |
| Lint | ✅ | Exit 0. |

## Dimension 5: Testabdeckung

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Unit-/Integrationstests für Kernfunktionen | ⚠️ | Happy Paths breit; zwei kritische Fehlerfenster fehlen. |
| Happy Path + Fehlerfall | ❌ | Kein Post-Write-Finalize-Fehler und kein echter Template-Dateidrift-Confirm. |
| QA-Testergebnis | ✅ | `TR-000012@1.1` APPROVED. |
| Coverage-Ziel | ✅ | Gesamt 92,83 % Statements / 86,00 % Branches. |

| # | Kategorie | Bereich | Problem | Empfehlung |
|---|---|---|---|---|
| T-001 | **MAJOR** | Compilation-Saga und Template-Recovery | Die Suite modelliert APPLYING vor und nach dem Write, injiziert aber keinen Fehler in `finalizeConfirmed()` nach erfolgreichem Write. Der Template-Test rebuildet nur explizit bei intakter Registry und prüft weder Dateidrift vor Confirm noch Startup-/Crash-Recovery. | Fehlergrenzen injizierbar machen und für K-001 bis K-003 gezielte Regressionen ergänzen. |

## Dimension 6: Performance und Wartbarkeit

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Keine N+1-Probleme | ✅ | Keine neue ungebremste Relationstraversierung. |
| Ressourcen begrenzt | ✅ | Inbox-Capacity und Payload-Grenzen sind implementiert und getestet. |
| UI-Wartbarkeit | ✅ | Sprint-7-Ansichten wurden in fokussierte Renderer/Clients getrennt. |
| Komplexität angemessen | ⚠️ | Saga-Fehlergrenzen sind zu breit gekoppelt (K-001). |

| # | Kategorie | Datei:Zeile | Problem | Empfehlung |
|---|---|---|---|---|
| UX-001 | **MAJOR** | `apps/obsidian-plugin/src/ui/compilation-review.ts:101-128`; `UX-000004:298-305` | Warncodes werden nur durch Ersetzen von Bindestrichen angezeigt, und die Checkbox lautet `I reviewed these warnings.` statt der verbindlichen konkreten Warntexte und `I reviewed the warnings above.`. Auch der E2E-Harness enthält dieselbe abweichende Kopie. | Codes auf die freigegebene UX-000004-Microcopy abbilden und Assertions gegen die Produktionsstrings ergänzen. |

---

## Zusammenfassung

### Anmerkungen nach Schweregrad

| Schweregrad | Anzahl |
|---|---:|
| BLOCKER | 1 |
| MAJOR | 4 |
| MINOR | 0 |
| SUGGESTION | 0 |

### Gesamtentscheidung

- [ ] APPROVED
- [x] **REQUEST CHANGES**
- [ ] REJECTED

Der Nutzerbefund ist ACCEPTED. Der technische Review verlangt wegen K-001 bis K-003,
T-001 und UX-001 Änderungen vor Merge. Da Scope und Architektur fachlich geklärt sind und
die Abweichungen lokal in FE/BE repariert werden können, erfolgt der Rücksprung in die
Implementierung statt einer erneuten BA-Phase.

### Technische Schulden

Keine neue DEBT-Datei. Alle Funde sind gate-relevante Korrekturen und dürfen nicht in einen
späteren Sprint verschoben werden.

## Gate 8

| Kriterium | Ergebnis |
|---|---|
| RV-000009 status `APPROVED` | **FAIL** — `REQUEST_CHANGES` |
| Entscheidung `APPROVED` | **FAIL** — `REQUEST CHANGES` |
| Keine BLOCKER-Anmerkungen | **FAIL** — K-001 offen |
| Technische Schulden erfasst oder explizit keine | PASS — keine verschiebbaren Schulden |

**Gate 8: BLOCKIERT.** `/manual second-brain 7` darf nicht starten.

## Definition-of-Done-Selbstprüfung

- [x] Test-Guide für alle Sprint-Features präsentiert.
- [x] Nutzer-Interview und Befund pro Feature dokumentiert.
- [x] Alle sechs technischen Review-Dimensionen geprüft.
- [x] Coverage und geschützte Decision-Aktion vollständig dokumentiert.
- [x] Wiederholungs-Check gegen RV-000008, DECISIONS und QA-Funde durchgeführt.
- [x] Jede Anmerkung hat Kategorie, Fundstelle und Empfehlung.
- [x] RV-000009 erstellt und Indizes aktualisiert.
- [x] Technische Schulden geprüft; keine Verschiebung zulässig.
- [ ] Gate 8 bestanden — **FAIL wegen 1 BLOCKER und 4 MAJOR-Funden.**

## Übergabe: RV → FE+BE

**Datum:** 2026-08-18  
**Von:** Code Reviewer (RV)  
**An:** Frontend und Backend Development (FE+BE)  
**Nächster Befehl:** `/implement all second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| RV-000009 | REQUEST_CHANGES | `reviews/RV-000009-sprint-7-recovery.md` | 1 BLOCKER, 4 MAJOR; Nutzerabnahme ACCEPTED |
| TR-000012 | APPROVED | `testing/TR-000012-sprint-7-recovery-retest.md` | Vorliegende QA-Evidenz; gezielte Regressionen ergänzen |

### Kritische Informationen für Empfänger

- K-001 zuerst beheben: Ein erfolgreicher Vault-Write muss bis zur bestätigten
  Audit-Finalisierung recoverable bleiben.
- K-002/K-003 brauchen echte dateibasierte Hash- und Neustartnachweise.
- UX-001 ist eine genaue String-/Mapping-Korrektur in Produkt und E2E-Evidenz.

### Offene Fragen

Keine externe Produktentscheidung erforderlich.

### Nicht-Ziele

- Keine Änderung am akzeptierten MCP-first-Nutzerfluss.
- Keine Erweiterung des Sprint-7-Scopes.
- In dieser Review-Phase wurde kein Produktcode geändert.

### Empfehlungen

Nach den Korrekturen: `/test-run second-brain 7`, anschließend erneuter `/review`.

---

*Erstellt von: RV-Agent | Datum: 2026-08-18 | Version: 1.0 | Ablage: `reviews/`*
