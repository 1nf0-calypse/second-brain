---
id: TP-000006
title: Testplan Second Brain Sprint 5
version: 1.1
status: APPROVED
author-agent: QA (QA Engineer)
date: 2026-08-13
project: second-brain
sprint: 5
based-on: US-000001, US-000007, UX-000003, SP-000006, ADR-000006, CON-000001, BUG-000007, BUG-000008
supersedes: —
superseded-by: —
---

# Testplan: Second Brain — Sprint 5

## 1. Testumfang und Traceability

**Getestete Features:**

- US-000001: ChatGPT-Remote-/Tunnel- und Mistral-Connector-Setup ohne Plugin-Credential.
- US-000007: minimierter externer Datenfluss mit sichtbarer Einmalbestätigung, Replay-,
  Ablauf- und Widerrufsschutz.

| Akzeptanzszenario | Automatisierte Evidenz | Manuelle Evidenz |
|---|---|---|
| US-000001/1 geführtes Remote-Setup | Setup-Client, Node-Transport, Playwright-Harness | TC-000501, TC-000502 |
| US-000001/2 kein zusätzlicher API-Key | Contract-/Quelltext- und UI-Prüfung | TC-000503 |
| US-000001/3 ungültiger Endpoint/Client | Contract-, HTTP- und Scope-Negativtests | TC-000504, TC-000505 |
| US-000007/1 Injection bleibt Inhalt | Payload-Schema und MCP-Capability-Regression | TC-000506, SEC-000501 |
| US-000007/2 sichtbarer Einmal-Consent | Consent-Service plus Browser-/Obsidian-Pfad | TC-000507–TC-000510 |
| US-000007/3 unzulässige Werkzeuge | MCP-Tool-Inventar und Negativaufruf | TC-000511, SEC-000502 |

**Explizit nicht getestet:** Consumer-ChatGPT, automatische Klassifikation sensibler Daten,
projektbetriebener Tunnel, Provider-Credential-Rotation und höhere Autonomiestufen; diese
Bereiche sind durch ADR-000006 und UX-000003 ausgeschlossen.

## 2. Testumgebung

| Eigenschaft | Wert |
|---|---|
| Arbeitsstand | Windows-Worktree `.worktrees/sprint-5`, Branch `feature/sprint-5` |
| Runtime | Node.js ≥24; exakte Version im TR-000008 protokollieren |
| UI | sichtbarer Chromium-Harness und echtes Obsidian Desktop |
| Clients | lokaler Sidecar; echter ChatGPT-Business/Enterprise/Edu-Tunnel und Mistral-Connector nur bei nutzerseitiger Verfügbarkeit |
| Testdaten | ausschließlich synthetische Exzerpte und `testing/system-vault/`; kein persönlicher Vault |
| Netzwerk | lokaler Fake-Adapter für Negativtests; reale Provider nur nach expliziter Nutzerkonfiguration |
| Secrets | keine Provider-Credentials im Prozess, Environment, Plugin, Log oder Testartefakt |

Die fehlende reale Workspace-/Tunnel-Konfiguration blockiert Contract-, UI-, Security- und
Fake-Adapter-Tests nicht, blockiert aber die endgültige reale Client-Kompatibilitätsabnahme.

## 3. Automatisierte Tests

### 3.1 Ziele und Befehle

| Ebene | Ziel | Befehl |
|---|---|---|
| Unit/Integration | ≥80 % Statements/Branches/Functions/Lines für konfigurierten Scope | `npm run test:coverage` |
| Vollständige Regression | alle Vitest-Tests grün | `npm test` |
| Build und Vertrag | TypeScript/Bundle fehlerfrei | `npm run build` |
| Statische Qualität | 0 Lintfehler | `npm run lint` |
| E2E | alle kritischen Clickpfade in sichtbarem Chromium | `npm run test:e2e` |

### 3.2 Testinventar

| Datei | Bereich | Status / Ergänzung |
|---|---|---|
| `tests/unit/provider-service.test.ts` | Registry, Payload-Hash, Receipt, Ablauf, Replay, Widerruf | vorhanden; Boundary-Fälle ergänzt |
| `tests/integration/node-setup-transport.test.ts` | echter Sidecar-Prozess und Remote-Endpoint-Inspektion | vorhanden; Remote-Fall ergänzt |
| `tests/e2e/setup-flow.test.ts` | typisierter Plugin-/Setup-Vertrag | vorhanden |
| `tests/e2e/setup.spec.ts` | bestehende Setup-Regression | vorhanden |
| `tests/e2e/remote-consent.spec.ts` | Provider-Setup, Consent, Payload-Invalidierung, Cancel, Disconnect und A11y | vorhanden; Browser-Harness-Evidenz |
| `tests/e2e/pages/remote-consent.page.ts` | stabiler Page-Object-Clickpfad | vorhanden; `data-testid`-basiert |

`ConsentService.confirm` wird im produktiven CLI-Branch `--provider-transfer` aufgerufen.
Da der Graph Top-Level-CLI-Verzweigungen nicht zuverlässig als Call-Kanten modelliert, ersetzt
dies keine Prozessgrenzenprüfung: Der Testlauf trennt Service-Unit-Test, Node-Transport,
Browser-Harness und echte Obsidian-/Provider-Abnahme. Ein fehlender öffentlicher
Prepare-/Confirm-Pfad ist mindestens MAJOR; fehlt dadurch die bewusste Bestätigung, ist er
BLOCKER.

### 3.3 Playwright-Fälle

| ID | Beschreibung | Typ | Priorität |
|---|---|---|---|
| E2E-000501 | ChatGPT und Mistral zeigen Voraussetzungen, HTTPS-Endpoint und keine Secret-Eingabe | Happy Path | P0 |
| E2E-000502 | ungültiger Endpoint/Scope bleibt deaktiviert und liefert sichere Recovery | Error | P0 |
| E2E-000503 | Review zeigt Provider, Zweck, Operation, Exzerpt, Quellen-ID und Ausschlüsse | Happy Path | P0 |
| E2E-000504 | `Allow this transfer once` bleibt bis zur Review-Checkbox deaktiviert | Security/A11y | P0 |
| E2E-000505 | Payload-Änderung invalidiert die Checkbox; Policy-Drift erzeugt `CONSENT_EXPIRED`; Replay sendet nichts | Error | P0 |
| E2E-000506 | Fokusfolge, zugängliche Namen und `aria-live` bestehen bei 320 px/200 % | Accessibility | P1 |

Der HTML-Report wird gemäß `playwright.config.ts` unter `testing/playwright-report/`
versioniert. Der Browserlauf ist bereits `headless: false`; kein doppelter Headless-Lauf.

## 4. Manuelle Systemtestfälle

| ID | Prio | Vorbedingungen und Schritte | Erwartetes Ergebnis |
|---|---:|---|---|
| TC-000501 | P0 | Obsidian starten → Setup öffnen → ChatGPT wählen → Voraussetzungen lesen → nutzerverwaltete HTTPS-Tunnel-URL eintragen → Verbindung testen. | Plan, Transport, Prüfdatum und erwartete Scopes sichtbar; erst echter Handshake darf `Connected` zeigen. |
| TC-000502 | P0 | Wie TC-000501 mit Mistral-Connector-URL und im Workspace hinterlegtem Credential. | Plugin fragt kein Credential ab; Connector bleibt nutzerverwaltet; Ergebnis nennt keine Secrets. |
| TC-000503 | P0 | Plugin-, Sidecar-, Prozess- und Logausgaben nach Setup durchsuchen; Setup abbrechen und neu öffnen. | Kein API-Key/Credential und kein persistierter Endpoint nach Abbruch; bestehender Vault unverändert. |
| TC-000504 | P0 | `http://`, fehlerhafte URL, unerreichbaren Host und falschen Provider testen. | Validierung/Handshake scheitert konkret; keine Erfolgssprache, kein Vault-Inhalt übertragen. |
| TC-000505 | P0 | Handshake mit breiteren oder fehlenden Scopes simulieren. | Erwartete/gefundene Scopes getrennt; Verbindung bleibt deaktiviert. |
| TC-000506 | P0 | Exzerpt enthält Anweisungen für Shell, Prozess, Codeausführung und Scope-Erweiterung → Transfer vorbereiten. | Text bleibt sichtbarer Payload; keine Fähigkeit, Toolliste oder Berechtigung ändert sich. |
| TC-000507 | P0 | Transfer mit einem synthetischen Exzerpt vorbereiten → Review ohne Checkbox prüfen → Checkbox aktivieren → einmal erlauben. | Exakter Payload und Ausschlüsse sichtbar; Button vorher deaktiviert; genau ein Adapteraufruf danach. |
| TC-000508 | P0 | Nach Review Text oder Provider ändern; Policy-Version im Sidecar auf veraltet setzen und den alten Transfer auslösen. | Checkbox/alter Token sind ungültig; `CONSENT_EXPIRED` wird ohne entfernte Details gezeigt; kein Netzwerkaufruf; nur Neuprüfung oder Abbruch möglich. |
| TC-000509 | P0 | Erfolgreichen Token erneut verwenden; abgelaufenen Token verwenden; Vorschau abbrechen. | Replay, Ablauf und Abbruch senden nichts; sichere Meldung ohne Inhalt/Secret. |
| TC-000510 | P1 | Erfolgreiche Quittung und Disconnect prüfen. | Quittung enthält Metadaten/Quellen-IDs, aber keinen Notiztext; Widerruf wird angezeigt und gespeichert. |
| TC-000511 | P0 | Über MCP Shell-, Prozess-, Code- und Pfadaußerhalb-Anfragen senden. | Werkzeug fehlt oder verweigert; keine fremden Daten; sichere inhaltsarme Diagnose. |
| TC-000512 | P1 | Alle Setup-/Consent-Aktionen ausschließlich per Tastatur bei 320 px und 200 % Zoom durchführen. | Logische Fokusfolge; sichtbarer Fokus; Status über `aria-live`; keine verdeckte Pflichtaktion. |

Statuswerte werden erst in TR-000008 befüllt: ⬜ nicht getestet, ✅ bestanden,
❌ fehlgeschlagen oder ⚠️ blockiert.

## 5. Security- und Datenschutzmatrix

| ID | Angriff/Boundary | Erwartetes Ergebnis |
|---|---|---|
| SEC-000501 | Prompt-Injection im Exzerpt | bleibt inert; keine Scope-/Tooländerung |
| SEC-000502 | Shell/Prozess/Code als MCP-Tool | nicht angeboten bzw. stabil verweigert |
| SEC-000503 | Vollvault, Index, Pfad, Dateiname, Anhang, Secret, Audit/Diagnose im Request | striktes Schema verwirft Request vor Adapteraufruf |
| SEC-000504 | HTTP, URL mit eingebettetem Credential, fehlender/zusätzlicher Scope | Handshake abgelehnt beziehungsweise `connected: false`; keine Secret-Offenlegung |
| SEC-000505 | Token-Replay, Ablauf, unbekannter Token | kein Adapteraufruf; `CONSENT_REQUIRED/EXPIRED` |
| SEC-000506 | Payload-/Policy-Drift nach Review | Hash/Version ungültig; frische Review erforderlich |
| SEC-000507 | Adapterfehler nach Confirm | keine falsche Erfolgsquittung, keine Doppelübermittlung |
| SEC-000508 | Receipt-/Log-Inspektion | kein Exzerpt, Credential, Pfad, Dateiname oder Diagnosedaten; erlaubt sind nur Receipt-Metadaten und pseudonyme Quellen-IDs |

## 6. Performance und Stabilität

Es existiert kein produktweites Latenz- oder Ressourcenbudget. Der Testlauf dokumentiert
reproduzierbare Ausgangsmessungen statt erfundener Grenzwerte.

| ID | Messung | Methode | Abnahmekriterium |
|---|---|---|---|
| PERF-000501 | Prepare/Hash-Latenz für 1 und 20 Exzerpte | 100 Iterationen, p50/p95/max | Baseline dokumentiert; keine superlineare Auffälligkeit |
| PERF-000502 | Consent-Speicher nach 1.000 Prepare/Confirm/Replay-Zyklen | Prozess-RSS und Map-Zustand | keine unbeschränkte Pending-Zunahme nach Confirm/Ablauf |
| PERF-000503 | Endpoint-Inspektion | 100 Sidecar-Prozesse, p50/p95/max | Baseline dokumentiert; Timeouts stabil |
| PERF-000504 | UI-Interaktion Review → Checkbox → Confirm | Playwright-Tracing | keine sichtbare Doppelaktion oder blockierter Main Thread |

## 7. Risiken, Ergebnisvorlage und Freigaberegel

| Risiko | Schwere | Behandlung |
|---|---|---|
| CLI-Top-Level-Branch ist im Codegraph nicht als Call-Kante sichtbar | MAJOR | `--provider-transfer` über echten Node-Kindprozess mit Fake-HTTPS-MCP abnehmen; Browser-Harness nicht als Ersatz werten |
| Browser-Harness ist nicht Obsidian | MAJOR | TC-000501–512 im echten Desktop-Host |
| Reale Provider-Workspaces/Tunnel sind nutzerverwaltet | MAJOR | bei Fehlen CONDITIONAL statt fiktivem PASS; Contract-/Fake-Adapter-Evidenz getrennt |
| Providerquelle kann veralten | MAJOR | URL, Prüfdatum und Policy-Version vor Abnahme prüfen |

Freigabe ist nur möglich, wenn kein BLOCKER offen ist, 0 unerlaubte Offenlegungen auftreten,
alle P0-Consent-/Scope-Fälle bestehen und die reale Client-Abnahme entweder bestanden oder
als klar begründete externe Auflage in `CONDITIONAL` dokumentiert ist.

## 8. Definition-of-Done-Selbstprüfung

- [x] Jede Sprint-US besitzt positive, negative, Boundary- und Security-Fälle.
- [x] Alle sechs Story-Szenarien und alle UX-Zustände sind zu Tests gemappt.
- [x] Loading, Error, Scope mismatch, stale, sending, complete und disconnected sind enthalten.
- [x] Browser-Harness, echtes Obsidian und reale Provider-Abnahme sind getrennt.
- [x] Accessibility, Tastatur, Fokus, 320 px und 200 % sind enthalten.
- [x] Performance-Baselines haben konkrete Methoden; fehlendes Budget ist dokumentiert.
- [x] Codegraph-Lücke und externe Client-Voraussetzungen sind als Risiken sichtbar.
- [x] Automatisierte Boundary-Tests für Ablauf, Replay, Schema und Endpoint ergänzt.
- [x] Nach BUG-000007/000008 auf vorhandene Remote-Consent-Spec, POM und Prozessgrenze aktualisiert.
- [x] Policy-Stale und zusätzlicher Scope als eigenständige P0-Nachtests präzisiert.
- [x] Keine offene Testplanungsfrage blockiert `/test-run`.
- [x] Constitution, ADR-000006 und Sprint-Nicht-Ziele bleiben eingehalten.

---

## Übergabe: QA-Testplanung → QA-Testausführung

**Datum:** 2026-08-13
**Von:** QA Engineer (QA)  
**An:** QA Engineer (QA)  
**Nächster Befehl:** `/test-run second-brain 5`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000006 | REVIEW | `testing/TP-000006-sprint-5.md` | Version 1.1; 12 manuelle, 8 Security-, 6 E2E- und 4 Performance-Fälle |
| Automatisierte Tests | vorhanden | `tests/` | 79 Vitest-Tests, 16 sichtbare Playwright-Tests; Prozessgrenzen-Nachtest verbleibt |
| Implementierung | committed | `apps/`, `packages/` | Branch `feature/sprint-5`, Commit `43586d5` |

### Kritische Informationen für Empfänger

- Der echte CLI-Branch ruft `ConsentService.confirm` auf; der Graph erfasst Top-Level-CLI-Logik
  jedoch nicht als Call-Kante. P0 bleibt deshalb ein echter Node-Kindprozess statt Unit-Test.
- Reale Provider-Abnahme benötigt nutzerverwalteten Workspace, Tunnel bzw. Connector.
- Kein Test darf persönliche Vault-Daten oder Provider-Credentials verwenden.

### Offene Fragen

Keine BLOCKER- oder MAJOR-Planungsfrage. Die tatsächliche Erreichbarkeit des Consent-Pfads
ist eine bewusst eingeplante Testhypothese, keine vorweggenommene Freigabe.

### Nicht-Ziele

Consumer-ChatGPT, automatische Datenklassifikation, Provider-Credential-Verwaltung,
Vollvault-Synchronisation und höhere Autonomiestufen.

### Empfehlung

Zuerst Build/Vitest/Coverage, dann die vorhandene Consent-E2E-Spec, anschließend Security- und
Performance-Matrix sowie echte Obsidian-/Provider-P0-Pfade.

---

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-12 | Erster Sprint-5-Testplan | QA |
| 1.1 | 2026-08-13 | BUG-000007/000008-Fixstand, vorhandene E2E-Specs und Prozessgrenzen-Nachtest eingearbeitet | QA |

*Erstellt von: QA-Agent | Datum: 2026-08-13 | Version: 1.1*
