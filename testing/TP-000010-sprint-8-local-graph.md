---
id: TP-000010
title: Testplan Second Brain Sprint 8 Local Graph
version: 1.0
status: APPROVED
author-agent: QA (QA Engineer)
date: 2026-08-20
project: second-brain
sprint: 8
based-on: US-000004@1.0, US-000013@1.0, RM-000001@1.6, SP-000011@1.0, UX-000005@1.0, ADR-000001@1.0, ADR-000003@1.0, CON-000001@1.0
supersedes: —
superseded-by: —
ablage: projects/second-brain/testing/
---

# Testplan: Second Brain — Sprint 8 Local Graph

## 1. Testumfang

- **US-000004:** Direkte, nachvollziehbare lokale Graphbeziehungen aktualisieren und erkunden.
- **US-000013 (Regression):** Die Relationship-Liste bleibt die vollständige, per Tastatur bedienbare Alternative.

**Nicht im Scope:** Semantik, Embeddings, Vektorsuche, OCR, Anhangstext-Extraktion,
automatisch abgeleitete Kanten, Netzwerk/Provider/Telemetrie und Vault-Mutationen. Letztere
werden ausschließlich negativ über die Vault-Hashintegrität geprüft.

## 2. Testbasis und Empfangsprüfung

| Quelle | Status | QA-Prüfung |
|---|---|---|
| US-000004@1.0 | APPROVED | Aufbau, Navigation und Delta-Szenario abgedeckt |
| US-000013@1.0 | APPROVED | Liste, Richtung und Quelle als A11y-Regression abgedeckt |
| UX-000005@1.0 | APPROVED | Loading, Empty, Filtered Empty, Offline/Error, Reflow und Microcopy abgedeckt |
| SP-000011@1.0 | APPROVED | read-only Contract, native SVG und Begrenzung abgedeckt |
| ADR-000001/000003 | APPROVED | lokaler Sidecar, Vertrag und SQLite-Projektion abgedeckt |
| FE+BE-Übergabe | vorhanden | Build, Lint und 117 Vitest-Tests am 2026-08-20 dokumentiert |

**Primärevidenz:** `LocalGraphResponseSchema`, `LocalIndex.localGraph`, `--local-graph`,
`LocalGraphView` sowie Unit-/Integrationstests existieren. Für die native Obsidian-Ansicht
gibt es noch keinen Graph-spezifischen Systempfad; dieser bleibt P0 und darf nicht durch einen
synthetischen Browser-Harness ersetzt werden.

## 3. Testumgebung

| Eigenschaft | Wert |
|---|---|
| Betriebssystem | Windows 11, Europe/Berlin |
| Worktree | `.worktrees/sprint-6`, Branch `feature/sprint-6` |
| Laufzeit | Node.js 24 LTS, npm-Workspace |
| Produkt | gebautes Obsidian-Plugin plus lokaler Node-Sidecar |
| Persistenz | isolierte Test-Vault-Kopie, lokale SQLite-Projektion |
| Native UI | aktuelle Obsidian-Desktop-Version, 100 % und 200 % Zoom |
| Browser-E2E | Playwright Chromium; nur ergänzende Evidenz |
| Netzwerk | deaktiviert/nicht erforderlich |

### Reproduzierbares Testdaten-Setup

1. `npm ci`, `npm run build` und `npm run lint` im Worktree ausführen.
2. Temporären QA-Vault mit `Source.md`, `Target.md`, fehlendem Wiki-Ziel, Tag, Property und
   `Attachment.pdf` anlegen; alle Vault-Dateien per SHA-256 hashen.
3. Plugin nach `<qa-vault>/.obsidian/plugins/second-brain/` kopieren, aktivieren und Sidecar
   über den Plugin-Pfad starten.
4. `Source.md` auf die Ziele verweisen; nach jedem Refresh Vault-Hashes und Indexantwort erfassen.
5. Offline kontrolliert durch Sidecar-Stopp auslösen, danach wieder starten; keine Credentials verwenden.

## 4. Automatisierte Tests

| Ebene | Ziel | Ausgangslage vor `/test-run` |
|---|---|---|
| Unit | Sync-Reihenfolge, read-only und Contractfehler | `local-graph-client.test.ts` vorhanden |
| Integration | Graph, Backlink, fehlendes Ziel, Anhang und Delta | `relationships.test.ts` erweitert |
| E2E | kritische UI-Flows, Offline und A11y | native Graph-Evidenz ausstehend |
| Integrität | keine Vault-Datei durch Read/Refresh verändert | Hash-Nachweis ausstehend |

```powershell
npm run build
npm run lint
npm test
npm run test:coverage
npm run test:e2e
```

Der Playwright-Lauf wird einmal headed ausgeführt. Ist eine echte Obsidian-Interaktion nicht
automatisierbar, wird sie als manueller P0-Systemtest mit Screenshot, Version und Hashliste
dokumentiert, nicht übersprungen.

| Testdatei/Bereich | Abdeckung | Status |
|---|---|---|
| `tests/unit/local-graph-client.test.ts` | Sync, Contract, read-only, Fehler | vorhanden |
| `tests/integration/relationships.test.ts` | Projektion, Missing, `not_extracted`, Delta | vorhanden |
| `tests/integration/node-setup-transport.test.ts` | `--local-graph` am Plugin-Transport | zu ergänzen oder als P0-Systemtest nachweisen |
| `tests/e2e/relationships.spec.ts` | Liste, Tastatur, Navigation | Regression vorhanden |
| `tests/e2e/local-graph.spec.ts` | Graph, Filter, Offline, A11y | zu erstellen, falls Harness die View abbildet |

## 5. Performanz- und Ressourcenprüfungen

| ID | Bereich | Methode | Erwartetes Ergebnis |
|---|---|---|---|
| PERF-001001 | Direktabruf | 30 lokale `--local-graph`-Abrufe messen | Kein Budget definiert: p50/p95/Maximum dokumentieren; kein Timeout |
| PERF-001002 | 100 direkte Kanten | Refresh und Filter messen | Vertrag begrenzt Antwort; Pane bleibt bedienbar |
| PERF-001003 | UI-Interaktion | 30-mal Filter und Canvas-Toggle | keine Eingabeverluste; Messwerte dokumentieren |
| PERF-001004 | Offline/Recovery | 10 Sidecar-Wechsel online/offline | keine Mutation/kein Stau; Refresh erholt sich |

## 6. Traceability

| Anforderung | Testfälle |
|---|---|
| US-000004 Szenario 1 — nachvollziehbarer Graphaufbau | TC-001001, TC-001002, E2E-001001 |
| US-000004 Szenario 2 — Navigation | TC-001003, TC-001004, E2E-001002 |
| US-000004 Szenario 3 — Delta | TC-001005, E2E-001004 |
| UX Loading/Ready/Empty | TC-001001, TC-001006 |
| UX Filtered Empty/Filtergleichheit | TC-001007, E2E-001003 |
| UX Offline/Error | TC-001008, E2E-001005 |
| UX WCAG, Keyboard, Zoom, 320 px | TC-001009, E2E-001006 |
| SP-000011 read-only | TC-001010, SEC-001001–SEC-001003 |
| `not_extracted` | TC-001002, TC-001011 |

## 7. Manuelle und System-Testfälle

### TC-001001: Local graph laden und Herkunft prüfen — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | QA-Vault; `Source.md` aktiv; Sidecar erreichbar |
| Testschritte | 1. **Open local graph** über Ribbon oder Command Palette. 2. Loading beobachten. 3. **Refresh graph** wählen. 4. Fokus, Canvas und Liste vergleichen. |
| Erwartetes Ergebnis | Nur lokale Wiki-Links, Backlinks, Tags und Properties erscheinen mit Richtung, Quelle und Label. Canvas ersetzt die Liste nicht. |
| Status | ⬜ Nicht getestet |

### TC-001002: Aufgelöst, fehlend und nicht extrahiert — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | `Source.md` referenziert `Target.md`, `Missing.md` und `Attachment.pdf` |
| Testschritte | 1. Graph laden. 2. Einträge und Details prüfen. 3. Ziel öffnen. |
| Erwartetes Ergebnis | `Target.md` ist öffnbar; fehlendes Ziel heißt **Unresolved link** und ist nicht öffnbar; PDF heißt **Not extracted** und zeigt keinen Inhalt. |
| Status | ⬜ Nicht getestet |

### TC-001003: Relationship-Ansicht in Graph übernehmen — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | `Source.md` aktiv; Relationship-Ansicht geladen |
| Testschritte | 1. **Show in graph** wählen. 2. Fokusdatei prüfen. 3. **Open note** für ein Ziel wählen. |
| Erwartetes Ergebnis | Graph öffnet für dieselbe Notiz; Ziel öffnet sich in Obsidian; Graph bleibt nutzbar. |
| Status | ⬜ Nicht getestet |

### TC-001004: Backlink und Quellenbeleg — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | `Source.md` verlinkt `Target.md` |
| Testschritte | 1. `Target.md` aktivieren. 2. Graph aktualisieren. 3. Backlink prüfen. |
| Erwartetes Ergebnis | Eingehender Wiki-Link zeigt `Source.md` als Quelle; keine semantisch abgeleitete Kante erscheint. |
| Status | ⬜ Nicht getestet |

### TC-001005: Inkrementelles Delta — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Hashliste; `Source.md` verlinkt `Target.md` |
| Testschritte | 1. Graph laden. 2. Nur Link entfernen. 3. Refresh. 4. Graph von `Target.md` prüfen. |
| Erwartetes Ergebnis | Beziehung verschwindet auf beiden Seiten; andere Kanten bleiben; Refresh schreibt keine Vault-Datei. |
| Status | ⬜ Nicht getestet |

### TC-001006: Empty State — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Aktive indexierte Notiz ohne Beziehungen |
| Testschritte | Local graph öffnen und aktualisieren. |
| Erwartetes Ergebnis | **No indexed relationships are available for this note yet.** erscheint; kein kontextloser leerer Canvas. |
| Status | ⬜ Nicht getestet |

### TC-001007: Filtergleichheit und Filtered Empty — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | mindestens eine Kante je Typ |
| Testschritte | 1. Typen einzeln deaktivieren. 2. Canvas/Liste vergleichen. 3. alle deaktivieren. 4. **Clear filters** wählen. |
| Erwartetes Ergebnis | Canvas und Liste haben dieselbe Teilmenge; **No relationships match these filters.** erscheint; Clear filters stellt alles wieder her. |
| Status | ⬜ Nicht getestet |

### TC-001008: Sidecar offline und Wiederanlauf — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | geladener Graph und Hashliste |
| Testschritte | 1. Sidecar beenden. 2. Refresh. 3. Sidecar starten. 4. Refresh wiederholen. |
| Erwartetes Ergebnis | **The local graph is unavailable while the local service is offline.** erscheint; nach Wiederanlauf funktioniert der Abruf; Vault-Hashes sind gleich. |
| Status | ⬜ Nicht getestet |

### TC-001009: Tastatur, Zoom und 320 px — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Native Ansicht, 200 % Zoom und 320 px Pane |
| Testschritte | Tab-Reihenfolge, Checkboxen, Clear, Refresh, Canvas-Toggle und Open note nur per Tastatur bedienen; Accessibility-Tree prüfen. |
| Erwartetes Ergebnis | sichtbarer Fokus und Live-Status; Liste vollständig nutzbar; Canvas nur ergänzend; keine wichtige Aktion abgeschnitten. |
| Status | ⬜ Nicht getestet |

### TC-001010: Read-only Vault-Integrität — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | vollständige SHA-256-Hashliste aller Vault-Dateien |
| Testschritte | Graph öffnen, mehrfach aktualisieren/filtern, Ziele öffnen und Sidecar neu starten; Hashliste erneut erzeugen. |
| Erwartetes Ergebnis | Keine Vault-Datei unterscheidet sich; nur abgeleitete lokale Indexpersistenz darf sich ändern. |
| Status | ⬜ Nicht getestet |

### TC-001011: Begrenzung — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Testnotiz mit 101 direkten erlaubten Beziehungen |
| Testschritte | Graph aktualisieren, Anzahl/Konsole prüfen, filtern und ein Ziel öffnen. |
| Erwartetes Ergebnis | Vertrag begrenzt sicher; View bleibt stabil und behauptet keine falsche Vollständigkeit. |
| Status | ⬜ Nicht getestet |

## 8. Sicherheits-Smoke-Tests

| ID | Test | Methode | Erwartetes Ergebnis |
|---|---|---|---|
| SEC-001001 | read-only Contract | `readOnly: false` simulieren | Laufzeitvalidierung weist ab |
| SEC-001002 | Pfadgrenze | absoluter Pfad und Traversal an `--local-graph` | kein Zugriff außerhalb des Vaults, typisierter Fehler |
| SEC-001003 | Tainted Labels | HTML/Script-ähnliches Link-/Tag-Label | Text bleibt Text, keine DOM-Injektion |

## 9. Freigabe-Empfehlung

*(Wird nach Testausführung befüllt.)*

**Empfehlung:** [ ] APPROVED  [ ] CONDITIONAL  [ ] REJECTED

**Gate-7-Mindestkriterien:** alle P0 automatisiert oder nativ nachweisbar bestanden; kein
Vault-Hash driftet; Offline und Delta abgedeckt; keine offenen BLOCKER.

---

## Übergabe: QA → QA

**Datum:** 2026-08-20  
**Von:** QA Engineer (QA)  
**An:** QA Engineer (QA)  
**Nächster Befehl:** `/test-run second-brain 8`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000010 | APPROVED | `testing/TP-000010-sprint-8-local-graph.md` | Traceability und P0-Systempfade |
| SP-000011 | APPROVED | `sprints/SP-000011-sprint-8-local-graph.md` | Scope/Ausschlüsse |
| UX-000005 | APPROVED | `ux/UX-000005-graph-exploration.md` | Zustände und Microcopy |

### Kritische Informationen für Empfänger

- Kein Browser-Harness ersetzt den echten Obsidian-/Sidecar-Pfad.
- `not_extracted` ist Metadatenstatus, niemals Inhaltsextraktion.
- Eine Hashdifferenz außerhalb der abgeleiteten Indexpersistenz ist ein BLOCKER.

### Offene Fragen (vererbt)

Keine BLOCKER. Transport-/Graph-E2E wird im Testlauf anhand der Harness-Fähigkeit entschieden;
bei fehlender Automatisierbarkeit ist der manuelle P0-Nachweis Pflicht.

### Nicht-Ziele

Keine semantische Exploration, Anhangsextraktion, Netzwerk- oder Vault-Mutationsfunktion.

---

*Erstellt von: QA-Agent | Datum: 2026-08-20 | Version: 1.0 | Ablage: `testing/`*
