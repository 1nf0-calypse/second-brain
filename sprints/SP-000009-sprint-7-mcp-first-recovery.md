---
id: SP-000009
title: Sprint 7 Recovery Backlog — MCP-first Compilation Inbox
version: 1.0
status: SUPERSEDED
author-agent: BA (Business Analyst) + FE + BE
date: 2026-08-15
project: second-brain
sprint: 7
based-on: RM-000001@1.3, RM-000002@1.1, REQ-000002@1.0, US-000006@1.2, US-000008@1.1, US-000016@1.0, US-000017@1.0, ADR-000007@1.0, UX-000004@1.0, RV-000008
supersedes: SP-000008
superseded-by: SP-000010@1.0
---

> ⚠️ SUPERSEDED by SP-000010@1.0 (2026-08-18) — Gate-8-Korrekturen aus RV-000009
> wurden als eigener delta-basierter Implementierungsschnitt neu verfeinert.

# SP-000009: Sprint 7 Recovery — MCP-first Compilation Inbox

## Sprint-Ziel

**In einem Satz:** Ein realer MCP-Client kann genau einen quellengebundenen
Kompilierungsvorschlag ohne UI-Doppelerfassung in eine persistente Obsidian-Inbox
einreichen, die der Nutzer vollständig prüft und genau einmal bestätigt oder verwirft;
Vorlagen und Verlauf bilden dabei den tatsächlichen Zustand ab.

**Messbares Erfolgskriterium:** Die Abnahme durchläuft
`MCP submit → Plugin restart → Pending list → Review → Confirm/Reject → History` mit
Contract 3.0.0 und Schema 6. Kein Standardpfad verlangt `Vault-relative Markdown path`
oder vollständigen Markdown als Nutzereingabe, und kein negativer Pfad verändert den Vault.

## Sprint-Rahmen

| Eigenschaft | Wert |
|---|---|
| Recovery-Start | 2026-08-15 |
| Zieltermin | 2026-08-29 |
| Dauer | 14 Tage |
| Verfeinerter Gesamtaufwand | 42 SP |
| Schwerpunkt BE | 25 SP |
| Schwerpunkt FE | 10 SP |
| Gemeinsame Abnahme FE+BE+QA | 7 SP |
| Referenz | Abgelehnter SP-000008: 23 SP; RM-000002: 26 SP |

Die Aufteilung nach Disziplin ist eine Planungsprojektion, keine parallele
Kapazitätszusage. Contract und Migration werden zuerst stabilisiert; danach können UI und
End-to-End-Abnahme kontrolliert parallelisieren.

## Commit-Stories

| US | Titel | RM-Schätzung | Refinement | Size | Verantwortlich | Abhängigkeiten |
|---|---|---:|---:|---|---|---|
| US-000017 | MCP-first Kompilierung mit ausstehender Bestätigung | 13 SP | 21 SP | XL | BE+FE+QA | ADR-000007, UX-000004, US-000003, US-000005, US-000007 |
| US-000016 | Versionierte projektlokale Kompilierungsvorlagen | 8 SP | 13 SP | L | BE+FE+QA | Contract 3 und Schema 6 aus US-000017 |
| US-000008 | Wahrheitsgetreue lokale Mutationshistorie | 5 SP | 8 SP | L | BE+FE+QA | Zustandsautomat und Auditbezug aus US-000017 |

**Gesamt Commit:** 42 SP. Es gibt keine Stretch-Story; alle drei Stories sind für die
Korrektur der in RV-000008 abgelehnten Sprint-7-Lieferung erforderlich.

## Implementierungsreihenfolge

```text
Contract 3 schemas
  → Schema-6-Migration und Inbox-/Template-Repositories
    → MCP submit/status und plugin-only decision service
      → IPC clients und Pending-UI
        → Template-UI und History-Projektion
          → Restart-, Recovery-, Security- und headed E2E-Abnahme
```

Ein nachgelagerter Task darf beginnen, sobald sein expliziter Vorgänger samt automatischem
Nachweis grün ist. UI-Fixtures dürfen parallel zum Backend entstehen, aber nicht den
verbindlichen Contract ersetzen.

## Subtasks

### US-000017: MCP-first Pending Compilation — 21 SP

| ID | Konkrete Arbeit | Verantwortlich | SP | Eingang / Abhängigkeit | Fertiges Ergebnis | Verbindlicher Nachweis |
|---|---|---|---:|---|---|---|
| R7-17-01 | Contract 3.0.0 in domänenspezifische Schemas für Submit, Status, Summary, List, Detail und Decision teilen; Zustände, Limits und acht fachliche Fehlercodes typisieren | BE | 2 | ADR-000007 §Versionierter Vertrag | Laufzeitvalidierte Exporte in `packages/contracts`; Contract-2-Handshake fällt sicher auf read-only zurück | Contract- und Negativtests für ungültige Quelle, Ziel, Mehrziel, Traversal und Versionsdrift |
| R7-17-02 | Idempotente Schema-5→6-Migration für Request, Payload, Sources, Events und Template Registry anlegen; Legacy-Bindings migrieren oder markiert bereinigen | BE | 2 | R7-17-01 | Schema 6 ist wiederholbar und erhält bestehende Audit-/Vaultdaten | Migrationsfixtures: leer, bestehender Sprint-7-Stand, verwaiste Bindings, zweiter Migrationslauf |
| R7-17-03 | `CompilationInboxRepository` mit State/Revision-Prädikaten, Cursorlisten, 50-Entry-/64-MiB-Limit, 24-h-TTL und sicherem Cleanup implementieren | BE | 2 | R7-17-02 | Durable Inbox ersetzt flüchtige Compilation-Bindings | Repositorytests für Kapazität, Payload-Limit, Ablauf, keine Verdrängung offener Einträge |
| R7-17-04 | MCP-Tools `second_brain_submit_compilation` und `second_brain_compilation_status` mit servergebundenem Client-/Vault-Kontext und `clientRequestId`-Idempotenz registrieren | BE | 2 | R7-17-01, R7-17-03 | Ein realer MCP-Prozess erzeugt/read-only verfolgt Pending-Einträge; kein Entscheidungstoken verlässt MCP | MCP-Integration: identischer Replay, `IDEMPOTENCY_CONFLICT`, getrennte Clients/Vaults |
| R7-17-05 | Plugin-only Decision Service für Detailtoken, Confirm und Reject mit `BEGIN IMMEDIATE`, Revision, Tokenhash, Expiry und Einmalverbrauch implementieren | BE | 3 | R7-17-03 | Genau eine Entscheidung gewinnt; Reject schreibt keine Vault-Datei | Parallel-/Replay-/Expiry-/Drift-Tests sowie expliziter Beleg, dass MCP nicht entscheiden kann |
| R7-17-06 | Write-ahead-Saga für `APPLYING` mit atomarem Ein-Datei-Replace, Auditfinalisierung und Start-Recovery nach Before-/After-/Fremdhash implementieren | BE | 3 | R7-17-05 | Crash zwischen Datei und DB endet wahrheitsgetreu in `CONFIRMED` oder `INCOMPLETE` | Fault-Injection an jedem Saga-Schritt; Restartfälle für drei Hashzustände; keine Überschreibung neuerer Inhalte |
| R7-17-07 | Plugin-IPC für Summary/List/Get/Decide auf JSON-stdin umstellen und konkrete Sidecar-Fehler als strukturierte Codes bis zur UI bewahren | FE+BE | 1 | R7-17-01, R7-17-03, R7-17-05 | Keine großen Kandidaten in Umgebungsvariablen; kein `INVALID_QUERY` als Sammelfehler | Transporttests für Payload, Timeout, Abort und jeden Recovery-Code |
| R7-17-08 | Single-flight Summary-Polling, Badge und zusammengefasste Notice mit 2-s-/15-s-Intervallen, Fokus- und `onunload`-Schutz implementieren | FE | 1 | R7-17-07 | Neue Inbox-Revision wird ohne Fokusverlust sichtbar | Fake-Timer-Tests für Sichtbarkeit, Hintergrund, Überlappung, Unload und einmalige Notice |
| R7-17-09 | `PendingReviewList` und `CompilationReview` aus der monolithischen `MutationView.onOpen` herauslösen; Ziel, Quellen, Vorlage, Diff, Links, Properties und Warnungen read-only darstellen | FE | 2 | R7-17-07, UX-000004 §4–5 | Liste und Detail folgen der festgelegten DOM-Reihenfolge; keine Pfad-/Markdown-Eingabefelder | Komponenten-/DOM-Tests für Loading, Ready, Empty, Warning, Offline und 320-px-Reflow |
| R7-17-10 | Confirm-, Reject-, Conflict-, Expired-, Already-decided-, Checking-outcome- und Incomplete-Flows samt Fokusführung und verbindlicher Microcopy umsetzen | FE | 1 | R7-17-05, R7-17-09 | Jede terminale Entscheidung zeigt den sicheren tatsächlichen Zustand und passende Recovery | Tastaturtests, Dialogfokus, `aria-live`, deaktivierte Confirm-Begründung und Warnungscheckbox |
| R7-17-11 | Prozessübergreifende Contract-, Security- und Storage-Regressionen für Submission, Restart, Replay, Drift, Injectionmarker und Grenzen ergänzen | BE+QA | 1 | R7-17-04–R7-17-07 | Alle serverseitigen Sicherheits- und Persistenzinvarianten sind automatisiert nachgewiesen | Vitest-Integration plus Security-Matrix; bestehende Mutationstests bleiben grün |
| R7-17-12 | Headed Obsidian-E2E mit echtem MCP-Submit ohne UI-Doppelerfassung für Confirm und Reject ergänzen | FE+QA | 1 | R7-17-08–R7-17-11 | Nutzerflow und Fokuspfad funktionieren in gebautem Plugin | Playwright/Obsidian-Harness: Submit, Restart, Open, Review, Confirm/Reject, History |

### US-000016: Projektlokale Template-Versionen — 13 SP

| ID | Konkrete Arbeit | Verantwortlich | SP | Eingang / Abhängigkeit | Fertiges Ergebnis | Verbindlicher Nachweis |
|---|---|---|---:|---|---|---|
| R7-16-01 | Datei-Store unter `.second-brain/templates/<uuid>/` mit Manifest und unveränderlichen `vNNNNNN-<sha256>.md`-Dateien implementieren | BE | 3 | R7-17-02 | Atomare, lokale Source of Truth ohne Überschreiben alter Versionen | File-Store-Tests für Create, neue Version, Hash, Temp-/Rename-Fehler und Pfadgrenzen |
| R7-16-02 | Registry-Rebuild und Crash-Recovery zwischen reservierter Version, Manifest und Inhaltsdatei implementieren; `.second-brain/**` von Index/Quellen ausschließen | BE | 2 | R7-16-01 | SQLite-Index ist aus Dateien reproduzierbar; interne Daten gelangen nie in Suche/Compilation | Rebuild-, Restart-, Orphan- und Indexausschlusstests |
| R7-16-03 | Template-Service für Create/New-Version/List/Read mit eindeutiger Versionreservierung, Cursorlimit 100 und parallelem Race-Schutz implementieren | BE | 2 | R7-16-01, R7-16-02 | Stabile ID, Version und Hash; parallele Änderung liefert handlungsorientierten Konflikt | Service-/Race-Tests einschließlich zweier gleichzeitiger Writer |
| R7-16-04 | Contract-/Plugin-IPC für List, Read, Preview und Confirm vervollständigen; Pending Review bindet ID/Version/Hash read-only | FE+BE | 1 | R7-17-01, R7-16-03 | UI und Compilation verwenden dieselbe immutable Referenz | Contracttests für fehlende, veränderte und ältere gültige Version |
| R7-16-05 | Template Library und Detail als fokussierte Komponenten mit Versionliste und technischem Detailbereich bauen | FE | 2 | R7-16-04, UX-000004 §6 | Vorlagen sind auffindbar und frühere Versionen lesbar | Komponenten-/Tastaturtests für Loading, Empty, Ready und Versionnavigation |
| R7-16-06 | Create-/New-Version-Formular mit Inlinevalidierung, read-only Review und atomarer Einzelbestätigung umsetzen | FE | 1 | R7-16-04, R7-16-05 | Nur Templates besitzen echte Name-/Inhaltsfelder; Draft bleibt bei Race erhalten | UI-Tests für ersten Fehlerfokus, Cancel, Save, Race und Draft-Erhalt |
| R7-16-07 | Migration-, Restart-, Missing-/Drift- und Storage-Grenzfälle automatisieren | BE+QA | 1 | R7-16-01–R7-16-04 | Persistenz und Bindung bleiben über Neustart und Fehler konsistent | Integrationssuite mit echten Verzeichnissen und Schema-5-Fixture |
| R7-16-08 | Headed E2E für Create, neue Version, Wiederfinden und read-only Provenienz im Pending Review ergänzen | FE+QA | 1 | R7-16-05–R7-16-07 | Vollständige UX-Abnahme für US-000016 | Obsidian-Harness mit Tastaturpfad und 320-px-Pane |

### US-000008: History und Rollbackstatus — 8 SP

| ID | Konkrete Arbeit | Verantwortlich | SP | Eingang / Abhängigkeit | Fertiges Ergebnis | Verbindlicher Nachweis |
|---|---|---|---:|---|---|---|
| R7-08-01 | History-Vertrag auf `pending/applying/success/rejected/failed/incomplete/conflicted/expired` und getrennten Rollbackstatus erweitern | BE | 2 | R7-17-01, R7-17-06 | Technischer Vertrag kann keinen Abbruch als Erfolg projizieren | Schema-/Mappingtests für jede erlaubte Kombination und ungültige Kombinationen |
| R7-08-02 | Cursorbasierte History-Abfrage, Event-Timeline und Ursprung↔Rollback-Projektion implementieren | BE | 2 | R7-08-01 | Listenlimit 50/200, unveränderliche Events und korrekte `rolled-back`-Projektion | Repositorytests für Pagination, Reihenfolge, Reject, Incomplete und Rollbackbezug |
| R7-08-03 | History-Liste, Statusfilter und Detailansicht mit getrennter verständlicher Zusammenfassung/Technikdarstellung umsetzen | FE | 2 | R7-08-01, R7-08-02, UX-000004 §7 | Alle Zustände sind textlich und symbolisch unterscheidbar; Rollbackstatus separat | Komponenten-/Accessibility-Tests für Filter, Fokus, leere Liste und technische Details |
| R7-08-04 | Fault-Injection- und Rollbackregressionen gegen tatsächliche Datei-/Audit-Endzustände ergänzen | BE+QA | 1 | R7-17-06, R7-08-02 | Historie entspricht nach Unterbrechung und Rollback dem Vaultzustand | Integrationstestmatrix Before-/After-/Fremdhash und blockierter Rollback |
| R7-08-05 | Headed E2E für Confirmed, Rejected, Incomplete und Rolled back ergänzen | FE+QA | 1 | R7-08-03, R7-08-04 | Statussprache und Rollbacknavigation sind im Plugin abgenommen | Obsidian-Harness mit vier terminalen Zuständen; kein Erfolgssymbol für Incomplete |

## Technische Voraussetzungen

| # | Voraussetzung | Verantwortlich | Status | Nachweis vor Start |
|---:|---|---|---|---|
| 1 | ADR-000001 und ADR-000007 sind `APPROVED` | AR | ✅ | Header und Architekturindex |
| 2 | UX-000004 ist durch `/refine` freigegeben | BA+FE+BE | ✅ | Header, UX-Index und `.phase` |
| 3 | Contract 3.0.0 wird vor Plugin- und MCP-Verbrauchern implementiert | BE | ✅ | R7-17-01 und Contract-Negativtests grün |
| 4 | Schema-5-Produktionsfixture und isolierte Kopie des Test-Vaults liegen für Migrationstests vor | BE+QA | ⬜ | Fixture-Hash und wiederholbarer Setup-Befehl |
| 5 | Node.js 24, `npm ci`, Build-, Lint-, Unit- und E2E-Befehle aus `.toolchain.yml` laufen im Sprint-Worktree | FE+BE | ✅ | Build/Lint Exit 0, 105 Unit-/Integrationstests und 19 headed E2E-Tests bestanden |
| 6 | Keine neue Netzwerkfreigabe, kein Provider-Key und keine externe Infrastruktur erforderlich | FE+BE | ✅ | ADR-000007 / Constitution |

## Backend-Implementierungsstand — 2026-08-15

| Bereich | Ergebnis | Nachweis |
|---|---|---|
| R7-17-01–R7-17-06 | Contract 3, Schema 6, begrenzte Inbox, MCP Submit/Status, plugin-only Decision und Recovery-Saga implementiert | Contract-, Idempotenz-, Capacity-, Replay-, Drift-, Restart- und Recovery-Tests |
| R7-17-07 / R7-17-11 (BE-Anteil) | Strukturierte Fehlercodes und große Plugin-Payloads über JSON-stdin verdrahtet | MCP/stdio- und realer Kindprozess-Test; kein Decision-Token im MCP-Vertrag |
| R7-16-01–R7-16-04 / R7-16-07 (BE-Anteil) | Immutable Template-Dateien, Manifest, Versionsreservierung, List/Read/Write und Registry-Rebuild implementiert | File-Store-, Race- und Rebuild-Tests |
| R7-08-01–R7-08-02 / R7-08-04 (BE-Anteil) | Cursorvertrag, Compilation-Zustände und Ursprung↔Rollback-Projektion implementiert | Status-, History- und Rollback-Projektionstests |

## Frontend-Implementierungsstand — 2026-08-15

| Bereich | Ergebnis | Nachweis |
|---|---|---|
| R7-17-08–R7-17-10 | Changes-Navigation, Single-flight Polling, Pending-Liste, vollständige read-only Detailprüfung und sichere Decision-/Recovery-Zustände implementiert | Fake-Timer-, Contract-, Microcopy- und headed Fokus-/Warnungs-Tests |
| R7-16-05–R7-16-06 | Template Library mit früheren Versionen, Create/New-Version, Inlinevalidierung, Cancel und read-only Save-Review implementiert | Clienttests und headed Create-/Review-/Save-Pfad |
| R7-08-03 | Filterbare History mit getrennten Operation-/Rollbackzuständen und technischer Fehlerangabe implementiert | Contracttests und headed Incomplete-/Rollbackdarstellung |
| R7-17-12 / R7-16-08 / R7-08-05 | Gemeinsamer sichtbarer Changes-Harness bei 320 px ergänzt; MCP-/Restart-/Saga-Persistenz wird zusätzlich durch echte Sidecar-Integration nachgewiesen | 19/19 headed Playwright-Tests sowie Compilation-Inbox-/Template-Integrationstests |

Gate 6 wurde nach erfolgreichem Build, Lint, 105 Unit-/Integrationstests und 19 headed
E2E-Tests bestanden. Die unabhängige Sprint-Abnahme folgt in `/test-plan` und `/test-run`.

## Abnahmekriterien des Backlogs

1. Ein realer MCP-Prozess reicht Kandidat, genau ein Markdown-Ziel und 1–20 Quellen ein;
   Obsidian zeigt den Vorschlag ohne manuelle Pfad- oder Volltexteingabe.
2. Offene Vorschläge überleben Plugin-/MCP-Neustart, bis sie entschieden oder sichtbar
   abgelaufen sind; Limits verdrängen keinen offenen Eintrag.
3. Confirm und Reject sind plugin-only, revisioniert und genau einmal nutzbar. Vor Confirm
   werden Ziel, Quellen und Vorlage erneut geprüft.
4. Der Write-ahead-Saga-Nachweis zeigt für jeden Unterbrechungspunkt den tatsächlichen
   Zustand; neuere Vault-Inhalte werden nie überschrieben.
5. Vorlagen sind dateibasiert, unveränderlich versioniert, rebuildbar und aus Vaultsuche
   sowie Quellenwahl ausgeschlossen.
6. Historie unterscheidet alle Contract-Zustände und Rollbackstatus; `Incomplete` oder
   `Rejected` erscheinen nie als Erfolg.
7. Alle UX-000004-Texte, Tastaturpfade, Fokusregeln, Diff-Alternative und 320-px-Reflow
   sind im gebauten Obsidian-Plugin nachgewiesen.
8. `npm run lint`, `npm test`, `npm run build` und die gezielte headed E2E-Suite bestehen.

## Risiken & Unsicherheiten

| Risiko | Wahrscheinlichkeit | Impact | Mitigation | Blockiert Start? |
|---|---|---|---|---|
| Schema-5-Legacy-Daten sind inkonsistent | Mittel | Hoch | Vor Migration klassifizieren, idempotente Fixtures, keine stillen offenen Einträge löschen | Nein |
| Crash zwischen Dateiersatz und Audit | Mittel | Hoch | Persistenter `APPLYING`-Intent und Fault-Injection vor jeder Zustandsgrenze | Nein |
| Contract-3-Umstellung bricht ältere Plugin-/Sidecar-Paare | Mittel | Hoch | Handshake mit explizitem read-only Fehler und Compatibility-Test | Nein |
| Monolithische `MutationView` macht UI-Zustände untestbar | Hoch | Mittel | Pending, Template und History vor Erweiterung in fokussierte Komponenten trennen | Nein |
| 42 SP überschreiten die frühere Recovery-Grobschätzung | Hoch | Mittel | Strikte Reihenfolge; keine Stretch-Ziele; Fortschritt pro Story/Task nachweisbar | Nein |
| Polling stört Fokus oder erzeugt Prozessüberlappung | Mittel | Mittel | Single-flight, Fokus-/Scroll-Erhalt, Fake-Timer- und headed Tests | Nein |

**Selbstauskunft BA+FE+BE:** Es gibt keinen offenen technischen BLOCKER. Die erhöhte
Schätzung ist ein Kapazitätsrisiko, aber kein ungeklärter Architektur- oder Scopeentscheid.

## Technische Schulden aus dem vorherigen Review

| Fund | Beschreibung | Adressiert durch |
|---|---|---|
| RV-000008 K-001/K-002 | Kein echter MCP-first-Submit und UI-Doppelerfassung | R7-17-01–R7-17-12 |
| RV-000008 K-003/K-004 | Template-/History-Persistenz und Zustände unvollständig | R7-16-01–R7-16-08, R7-08-01–R7-08-05 |
| RV-000008 K-005/P-001 | Unbegrenzte Bindings/Payloads und fehlende Lifecycle-Grenzen | R7-17-02, R7-17-03, R7-17-11 |
| UX-001 | Technische Pfad-/Volltexteingabe im Standardflow | R7-17-09, R7-17-12 |

## Nicht-Ziele

- Kein Obsidian-initiierter Compilation-Editor und keine erneute Quellen-/Zielauswahl.
- Keine eigene LLM-Ausführung, kein Provider-Key und kein neuer Netzwerkpfad.
- Keine automatische Bestätigung, Mehrdatei-Mutation, Löschung, Verschiebung,
  Umbenennung oder Konfliktzusammenführung.
- Kein Template Delete/Share/Sync und keine vollständige Produkt-Release-Sicht.
- Keine Erweiterung um semantische Suche, Anhänge, Graphvisualisierung, Android oder
  campaignworld.

## Definition of Ready

- [x] Alle drei Commit-Stories sind `APPROVED` und haben mindestens drei Akzeptanzszenarien
  beziehungsweise einen klar abgegrenzten Sprint-Slice.
- [x] UX-000004 deckt jede UI-relevante Story ab und ist durch `/refine` freigegeben.
- [x] ADR-000001 und ADR-000007 sind `APPROVED`; Contract, Schema, Limits und Recovery sind entschieden.
- [x] Jede Story und jeder Subtask ist geschätzt, zugeordnet, abhängigkeitsgeordnet und besitzt einen überprüfbaren Output.
- [x] Sprint-Ziel, technische Voraussetzungen, Abnahmekriterien, Risiken und Nicht-Ziele sind definiert.
- [x] Die Abweichung zur Grobschätzung ist in RM-000001@1.3 und RM-000002@1.1 dokumentiert.
- [x] Constitution geprüft: Human-in-the-Loop, lokale Persistenz, Datenintegrität und MCP-Berechtigungsgrenzen sind eingeplant.
- [x] Keine offene BLOCKER- oder MAJOR-Frage aus den Übergaben.
- [x] `sprints/INDEX.md`, Projekt-`INDEX.md`, `.phase` und ID-Zähler werden aktualisiert.
- [x] Freigabe durch Folge-Command `/implement` am 2026-08-15 erteilt.

---

## Übergabe: BA+FE+BE → BE+FE+QA

**Datum:** 2026-08-15
**Von:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)
**An:** Backend Developer, Frontend Developer und QA Engineer (BE+FE+QA)
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| SP-000009 | APPROVED | `sprints/SP-000009-sprint-7-mcp-first-recovery.md` | 42-SP-Recovery-Backlog mit granularen Tasks und Nachweisen |
| UX-000004 | APPROVED | `ux/UX-000004-mcp-first-compilation-review.md` | Verbindlicher Inbox-, Review-, Template- und History-Flow |
| ADR-000007 | APPROVED | `architecture/ADR-000007-mcp-first-pending-confirmation.md` | Contract 3.0.0, Schema 6, Saga, Limits und Polling |
| RM-000002 | APPROVED | `requirements/RM-000002-sprint-7-recovery-roadmap.md` | Recovery-Reihenfolge und Ist-Abweichung |

### Kritische Informationen für Empfänger

- BE beginnt mit R7-17-01; kein UI- oder MCP-Adapter darf einen Parallelvertrag erfinden.
- Der vorhandene `MutationService` und `MutationView.onOpen` sind Integrationsquellen,
  nicht Zielstrukturen. Neue Verantwortungen werden in fokussierte Module ausgelagert.
- Entscheidungstoken bleiben plugin-only; große Payloads laufen über JSON-stdin.
- Jeder Task gilt erst mit seinem genannten automatischen Nachweis als fertig.

### Offene Fragen (vererbt)

Keine BLOCKER- oder MAJOR-Frage. Die reale Sprintkapazität wird als Risiko beobachtet;
Scope oder Sicherheitsnachweise dürfen dafür nicht still gekürzt werden.

### Nicht-Ziele

Die unter `Nicht-Ziele` ausgeschlossenen Provider-, Automations-, Mehrdatei- und
Plattformerweiterungen werden nicht als technische Vorarbeit aufgenommen.

### Empfehlungen

Nach R7-17-01 und R7-17-02 zuerst den vollständigen serverseitigen Submit-/Decision-Pfad
mit Prozess- und Restarttests schließen. Danach IPC und Pending-UI integrieren; Template
und History bauen auf denselben stabilen Zuständen auf.
