---
id: TP-000009
title: Testplan Second Brain Sprint 7 Recovery
version: 1.1
status: APPROVED
author-agent: QA (QA Engineer)
date: 2026-08-15
project: second-brain
sprint: 7
based-on: REQ-000002@1.0, US-000017@1.0, US-000016@1.0, US-000008@1.1, SP-000009@1.0, UX-000004@1.0, ADR-000007@1.0, CON-000001@1.0
supersedes: TP-000008
superseded-by: —
ablage: projects/second-brain/testing/
---

# Testplan: Second Brain — Sprint 7 Recovery

## 1. Testumfang

### Getestete Sprint-Stories

- **US-000017:** Reale MCP-Einreichung, durable Pending Inbox, vollständige read-only
  Prüfung, plugin-only Confirm/Reject, Drift-, Replay-, Ablauf-, Restart- und Capacity-Pfade.
- **US-000016:** Projektlokale immutable Template-Versionen, Registry-Rebuild,
  Review-before-save, frühere Versionen, Race- und Provenienzpfade.
- **US-000008@1.1, Sprint-7-Schnitt:** Wahrheitsgetreue lokale Operationshistorie mit
  getrenntem Operation-/Rollbackstatus einschließlich `Incomplete` und `Rolled back`.

TP-000009 ersetzt TP-000008 vollständig. TP-000008 prüfte den durch RV-000008 verworfenen
manuellen US-000015/SP-000008-Flow und ist keine gültige Abnahmebasis für die Recovery.

### Explizit nicht getestet

- Vollständige Produkt-Release-Sicht aus US-000008 — außerhalb des dokumentierten
  Sprint-7-Schnitts; nur lokale Mutationshistorie ist Commit-Scope.
- Obsidian-initiierter Compilation-Editor, Mehrdatei-Mutation, Delete/Move/Rename,
  Konflikt-Merge und automatische Bestätigung — explizite Nicht-Ziele von SP-000009.
- Template Delete/Share/Sync sowie Android, campaignworld, Anhänge, semantische Suche und
  Graphvisualisierung — außerhalb des Recovery-Slices.
- Reale externe KI-Provider — der MCP-Prozess wird lokal und ohne Provider-Key geprüft;
  es entsteht kein neuer Netzwerkpfad.

## 2. Testbasis und Empfangsprüfung

| Quelle | Status | QA-Prüfung |
|---|---|---|
| REQ-000002@1.0 | APPROVED | F-025–F-032, NF-015–NF-017 und EC-011–EC-016 übernommen |
| US-000017@1.0 | APPROVED | sieben Szenarien vollständig abgebildet |
| US-000016@1.0 | APPROVED | drei Szenarien plus Versions-/Race-Grenzen abgebildet |
| US-000008@1.1 | APPROVED | lokaler Sprint-Schnitt, Incomplete und Rollbackstatus abgebildet |
| UX-000004@1.0 | APPROVED | alle Journeys, UI-Zustände, Microcopy, Fokus und 320-px-Reflow abgebildet |
| ADR-000007@1.0 | APPROVED | Contract 3, Schema 6, Limits, TTL, Saga und Polling abgebildet |
| BE+FE-Handoff | vorhanden | Code, Tests und Gate-6-Eintrag existieren im aktiven Worktree |

**Statusprojektion gegen Primärevidenz:** Die Übergabe nennt 105 grüne Vitest- und 19
headed E2E-Tests. Die Dateien und Testnamen existieren; das Ergebnis wird in `/test-run`
unabhängig neu erzeugt. Der aktuelle Changes-E2E benutzt einen synthetischen HTML-Harness.
Er belegt sichtbare Clickpfade, aber noch nicht allein den geforderten realen
`MCP submit → Restart → Plugin → Decision → History`-Prozesspfad. Dieser bleibt P0.

Die Code-Graph-Prüfung zeigt die neuen Inbox-, Poller-, Template- und History-Module als
erreichbare Bestandteile der Changes-View. Exportierte Contract-Schemas mit geringer
Graph-Eingangskante werden über Laufzeit-, Negativ- und Prozessgrenzentests geprüft; ein
reiner Graph-Grad wird nicht als Beleg für toten Code gewertet.

## 3. Testumgebung

| Eigenschaft | Wert |
|---|---|
| Betriebssystem | Windows 11, Europe/Berlin |
| Worktree | `.worktrees/sprint-6`, Branch `feature/sprint-6` |
| Laufzeit | Node.js 24.15.0, npm 11.12.1 |
| Produkt | Gebautes Obsidian-Plugin plus lokaler Node-Sidecar |
| Contract/Schema | Contract 3.0.0, SQLite Schema 6 |
| Native UI | Aktuelle Obsidian-Desktop-Version mit isolierter Kopie von `testing/system-vault` |
| Browser-E2E | Playwright Chromium, headed; HTML-Report unter `testing/playwright-report/` |
| Netzwerk | deaktiviert/nicht erforderlich; keine externen Provider oder APIs |

### 3.1 Reproduzierbares Testdaten-Setup

1. Im Sprint-Worktree `npm ci` und `npm run build` ausführen.
2. `testing/system-vault` in ein temporäres QA-Verzeichnis kopieren; nie das eingecheckte
   Fixture direkt für Mutationstests verwenden.
3. `dist/obsidian-plugin/{main.js,manifest.json,styles.css}` nach
   `<qa-vault>/.obsidian/plugins/second-brain/` kopieren und das Plugin aktivieren.
4. Quellen `Sources/Alpha.md` und `Sources/Beta.md` mit bekannten SHA-256-Hashes anlegen;
   Ziel `Reviews/Sprint-7.md` zunächst nicht anlegen.
5. Sidecar/MCP aus dem gebauten Artefakt starten und für Prozessgrenzentests JSON-RPC über
   stdio verwenden. Plugin-Entscheidungen ausschließlich über den Plugin-IPC senden.
6. Für Restart- und Recovery-Fälle Sidecar/Plugin kontrolliert beenden und aus derselben
   Vault-Kopie neu starten; DB und Vault-Dateihashes vorher/nachher sichern.
7. Für Schema-5-Migration eine separate, unveränderliche Fixture-Kopie samt Hashliste
   verwenden. Die fehlende dokumentierte Produktionsfixture aus SP-000009 Voraussetzung 4
   ist vor TC-000908 bereitzustellen; andernfalls ist der Test `⚠️ Blockiert`, nicht bestanden.

**Notwendige Umgebungsvariablen:** Keine dauerhaften Secrets. Temporäre Vault-Pfade und
operationsbezogene JSON-Nutzlasten werden pro Prozess gesetzt beziehungsweise über stdin
übergeben. `SECOND_BRAIN_CONTRACT_VERSION=3.0.0` muss am IPC-Handshake sichtbar sein.

## 4. Automatisierte Tests

### 4.1 Coverage-Ziele

| Ebene | Ziel für `/test-run` | Ausgangslage vor unabhängiger Ausführung |
|---|---|---|
| Unit | ≥ 80 % Gesamtprojekt; Domain/Policy/Mutations ≥ 90 % Branches soweit im Coverage-Scope | 105 Tests laut FE/BE-Handoff; neu zu messen |
| Integration | 100 % der P0-Zustands-/Integritätsmatrix; keine fehlgeschlagenen Tests | Inbox- und Template-Integration vorhanden; Fault-Matrix auf Vollständigkeit prüfen |
| E2E | alle kritischen Changes-Flows headed; 0 skipped P0 | 19 headed Tests laut Handoff; echter Prozessverbund zusätzlich erforderlich |
| Migration | 100 % der unterstützten Schema-5-Fixtures verlustfrei oder eindeutig abgewiesen | Fixture-Nachweis noch offen |

### 4.2 Ausführungsbefehle

```powershell
npm run build
npm run lint
npm test
npm run test:coverage
npm run test:e2e
```

Der Playwright-Lauf ist bereits als `headless: false` konfiguriert. Pro Spec wird genau ein
headed Lauf ausgeführt; kein zusätzlicher identischer Headless-Lauf ist erforderlich.

### 4.3 Testinventar und Ergänzungsbedarf

| Testdatei | Abdeckung | Status vor `/test-run` |
|---|---|---|
| `tests/integration/compilation-inbox-service.test.ts` | Submit, Idempotenz, Confirm, Reject, Source-Drift, Restart, Capacity, Migration, Rollbackprojektion | vorhanden; Target-/Template-Drift, Expiry und fremder Recovery-Hash ergänzen/prüfen |
| `tests/integration/mcp-mutations.test.ts` | echte MCP-Toolgrenze, Submit/Status, kein Decision-Tool/Token | vorhanden; getrennten Prozess-/Restart-Pfad als P0 ausführen |
| `tests/integration/node-setup-transport.test.ts` | JSON-stdin und Plugin-IPC | vorhanden; alle Recovery-Codes und große 2-MiB-Nutzlast prüfen |
| `tests/integration/template-store.test.ts` | immutable Versionen, stale writer, Registry-Rebuild | vorhanden; Restart/Orphan/Missing-Version und parallele Writer prüfen |
| `tests/unit/compilation-client.test.ts` | Contract-3-Projektionen und Template-IPC | vorhanden |
| `tests/unit/pending-review-poller.test.ts` | 2-s-/15-s-Intervalle, Single-flight, Stop | vorhanden; einmalige Notice-/höhere Revision prüfen |
| `tests/unit/compilation-presentation.test.ts` | Links/Properties und Recovery-Texte | vorhanden; exakte UX-Microcopy prüfen |
| `tests/e2e/changes.spec.ts` | 320 px, Warning-Gate, Confirm/Reject, Template, Statussprache | vorhanden, synthetischer Harness; POM und echter Systempfad erforderlich |
| `tests/e2e/pages/changes.page.ts` | Page Object für Pending, Review, Templates und History | im Rahmen der Testplanung ergänzt |
| Native Obsidian-Systemlauf | gebautes Plugin, Restart, Fokus, Modal, Notice, History | in `/test-run` als P0 mit Screenshot-/Hash-Evidenz auszuführen |

### 4.4 Playwright-E2E-Fälle

| ID | Beschreibung | Typ | Priorität |
|---|---|---|---|
| E2E-000901 | Pending öffnen, vollständiges Warning-Review bestätigen, ohne Pfad-/Volltextfelder | Happy Path | P0 |
| E2E-000902 | Reject-Modal: Cancel und endgültiges Reject ohne Vaultänderung | Error/Decision | P0 |
| E2E-000903 | Drift, Expired, Already decided, Checking outcome und Incomplete mit Recovery | Error Matrix | P0 |
| E2E-000904 | Template v1 erstellen, v2 anlegen, v1 erneut lesen, gebundene Provenienz anzeigen | Happy/Versioning | P0 |
| E2E-000905 | History: Confirmed, Rejected, Failed, Incomplete, Conflict, Expired, Rolled back | State Matrix | P0 |
| E2E-000906 | 320 px/200 %, Tastatur, Fokus-Rückgabe, Modal Escape und Live-Region | Accessibility | P0 |
| E2E-000907 | Loading, Empty, Refreshing, Offline, Error und Capacity ohne Fokusverlust | UX States | P1 |
| E2E-000908 | echter MCP-Submit, Plugin-/Sidecar-Restart, Confirm und History im gebauten Plugin | System E2E | P0 |

## 5. Performanz- und Ressourcenprüfungen

| ID | Bereich | Methode | Erwartetes Ergebnis |
|---|---|---|---|
| PERF-000901 | Sichtbares Polling | Fake Timer plus native Zeitmessung nach neuer Revision | Summary-Start spätestens nach 2 s; UI-Signal spätestens 2.5 s nach verfügbarer Revision |
| PERF-000902 | Hintergrund-Polling | View ausblenden und Prozessstarts protokollieren | Intervall mindestens 15 s; kein paralleler Summary-Request; keine Timer nach Unload |
| PERF-000903 | Inbox mit 50 Einträgen | List/Summary/Detail jeweils 30-mal messen | Kein festgelegtes Latenzbudget — p50/p95/Maximum als Ausgangsmessung dokumentieren; UI bleibt bedienbar |
| PERF-000904 | Maximaler Kandidat | 2 MiB Kandidat und 20 Quellen über JSON-stdin | Kein Env-Limitfehler, keine Protokollkorruption; Laufzeit und Peak-RSS als Ausgangsmessung dokumentieren |
| PERF-000905 | Aktives Storage-Budget | bis 64 MiB aktive Payloads einreichen | Limit kontrolliert; keine Verdrängung offener Einträge; DB-/Dateigröße vor/nach Cleanup dokumentiert |
| PERF-000906 | Restart/Recovery | 50 Pending sowie ein APPLYING-Fall, fünf Wiederholungen | 100 % deterministischer Endzustand; Laufzeit je Start und Peak-RSS dokumentiert |

Für PERF-000903/904/906 existiert kein separates Latenz- oder RSS-Budget. Gemäß
QA-Protokoll wird eine reproduzierbare Ausgangsmessung dokumentiert und nicht nachträglich
ein erfundener Grenzwert verwendet.

## 6. Traceability: Anforderungen zu Testfällen

| Anforderung | Testfälle |
|---|---|
| US-000017 Szenario 1 / F-025/F-026 / NF-015 | TC-000901, TC-000906, E2E-000901, E2E-000908 |
| US-000017 Szenario 2 / F-027 | TC-000902, TC-000909, E2E-000901, E2E-000906 |
| US-000017 Szenario 3 / F-028 | TC-000903, TC-000905, E2E-000908 |
| US-000017 Szenario 4 | TC-000904, TC-000905, E2E-000902 |
| US-000017 Szenario 5 / F-032 / EC-012/013 | TC-000905, TC-000907, E2E-000903 |
| US-000017 Szenario 6 / NF-016 / EC-011/014/015 | TC-000906, TC-000908, PERF-000905/906 |
| US-000017 Szenario 7 / EC-016 | TC-000907, SEC-000902–SEC-000905 |
| US-000016 Szenario 1 / F-029 | TC-000920, E2E-000904 |
| US-000016 Szenario 2 | TC-000921, TC-000922, E2E-000904 |
| US-000016 Szenario 3 / F-027 | TC-000923, TC-000924, E2E-000903 |
| US-000008 Szenario 1 / F-030 / NF-017 | TC-000930, TC-000931, E2E-000905 |
| US-000008 Szenario 3 / F-030 | TC-000932, TC-000933, E2E-000905 |

US-000008 Szenario 2 (vollständige Release-Sicht) ist gemäß Story-Sprint-Schnitt nicht Teil
des Commit-Scope; diese bewusste Abgrenzung ist in Abschnitt 1 dokumentiert.

## 7. Manuelle und System-Testfälle

### 7.1 US-000017 — MCP-first Pending Compilation

#### TC-000901: Reale Einreichung ohne UI-Doppelerfassung — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | gebautes Plugin im isolierten QA-Vault; zwei gehashte Quellen; kein Ziel |
| Testschritte | 1. Obsidian/Plugin schließen. 2. Über einen realen MCP-stdio-Prozess genau einen Contract-3-Vorschlag einreichen. 3. Sidecar beenden und neu starten. 4. Obsidian öffnen. 5. Ribbon **Review Second Brain changes** wählen. 6. Pending-Eintrag öffnen. |
| Erwartetes Ergebnis | Ein eindeutiger Pending-Eintrag bleibt nach Restart sichtbar; Ziel fehlt weiterhin; keine Vault-Datei/Audit-Erfolg vor Confirm; kein Feld `Vault-relative Markdown path` oder `Complete proposed note content`. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000902: Vollständige read-only Prüfung und Warnung — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Pending-Vorschlag mit Template, Wiki-Links, Frontmatter, Instruction-Marker und widersprüchlichen Quellen |
| Testschritte | 1. Detail öffnen. 2. DOM-Reihenfolge per Tastatur durchgehen. 3. Client/Vault, Ziel, Quellen, vollständige technische Hashes, Template-ID/-Version/-Hash, Diff, Links, Properties und Warnungen vergleichen. 4. Confirm vor/nach Warnungscheckbox prüfen. |
| Erwartetes Ergebnis | Alle Werte sind read-only, vollständig und nicht leer; konkrete englische Warntexte; Confirm bis `I reviewed the warnings above.` deaktiviert; Farbe nie einziger Unterschied. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000903: Exakte Bestätigung und Einmaligkeit — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | unveränderter Pending-Vorschlag; Hashliste von gesamtem Vault |
| Testschritte | 1. Detail laden und Token/Revision intern protokollieren. 2. **Confirm and write note** einmal aktivieren. 3. Ziel und übrige Vault-Dateien hashen. 4. denselben Decision-Request erneut senden. 5. History öffnen. |
| Erwartetes Ergebnis | Nur das angezeigte Ziel wird atomar geändert; Audit-ID sichtbar; Replay ohne Mutation; History zeigt `Completed` und Rollback `Available`. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000904: Reject und Dialogabbruch — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | gültiger Pending-Vorschlag; Vault-Hashliste gespeichert |
| Testschritte | 1. Reject öffnen. 2. Dialog mit Escape schließen und Fokus prüfen. 3. erneut öffnen. 4. **Reject without changing the vault** wählen. 5. alten Token zur Bestätigung verwenden. 6. History öffnen. |
| Erwartetes Ergebnis | Escape entspricht Cancel und Fokus kehrt zurück; endgültiges Reject verändert keine Datei; Token ist verbraucht; History zeigt `Rejected — no vault change`. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000905: Drift, Ablauf, Doppelklick und Unterbrechung — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | je isolierter Lauf: Source-, Target- oder Template-Drift; abgelaufener Token; APPLYING-Faultpoint |
| Testschritte | 1. Detail laden. 2. jeweilige Ressource nach Review ändern oder Zeit/Faultpoint auslösen. 3. Confirm doppelt aktivieren. 4. bei Prozessabbruch neu starten. 5. **Check again**/History prüfen. 6. Recovery-Text kopieren. |
| Erwartetes Ergebnis | Keine neuere Datei wird überschrieben; konkrete Ressource statt `INVALID_QUERY`; kein `Try confirm again`; Recovery ergibt Confirmed, Conflict oder `Incomplete`, nie falschen Erfolg. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000906: Restart, Reconnect und mehrere Vorschläge — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | drei Pending-Vorschläge, zwei für dasselbe Ziel; Plugin/Sidecar getrennt |
| Testschritte | 1. Plugin und Sidecar in wechselnder Reihenfolge neu starten. 2. Changes öffnen. 3. alle Einträge zuordnen. 4. einen bestätigen, einen verwerfen. 5. dritten offen lassen und erneut starten. |
| Erwartetes Ergebnis | Nicht abgelaufene Einträge bleiben einzeln prüfbar; Entscheidungen vermischen sich nicht; offener Eintrag bleibt; Badge/History entsprechen tatsächlichem Zustand. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000907: Vertrags- und Scope-Grenzen — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | unveränderter QA-Vault und MCP-Testclient |
| Testschritte | 1. nacheinander 0/1/20/21 Quellen senden. 2. leeres/2-MiB/über-2-MiB Content senden. 3. absoluten Pfad, Traversal, Nicht-Markdown, Ziel=Quelle, doppelte Quelle und simuliertes Mehrziel senden. 4. Status und Vault prüfen. |
| Erwartetes Ergebnis | gültige Grenzwerte werden angenommen; ungültige Fälle liefern feldbezogene Contract-Codes; kein Pending-Eintrag und keine Mutation für abgewiesene Requests. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000908: Capacity, TTL, Cleanup und Schema-5-Migration — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | geprüfte Schema-5-Fixture; 50 Pending beziehungsweise knapp 64 MiB aktive Payloads |
| Testschritte | 1. 51. Eintrag und Budgetüberschreitung versuchen. 2. offene/terminale Daten inventarisieren. 3. Zeit über 24 h vorrücken. 4. Cleanup/Restart ausführen. 5. Migration zweimal ausführen. 6. Audit- und Vault-Hashes vergleichen. |
| Erwartetes Ergebnis | `PENDING_CAPACITY_REACHED`; keine offene Verdrängung; abgelaufene Einträge sichtbar `Expired`, große terminale Payloads bereinigt; Migration idempotent und verlustfrei. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000909: Polling, Notice, Fokus und Offline — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Changes-View sichtbar; fokussierter Listeneintrag; steuerbarer Sidecar |
| Testschritte | 1. neue Revision einreichen. 2. Notice/Badge/Fokus beobachten. 3. View verbergen und erneut einreichen. 4. Sidecar einmalig und wiederholt ausfallen lassen. 5. View schließen/Plugin entladen. |
| Erwartetes Ergebnis | genau eine Notice pro höherer Revision mit verbindlichem Text; kein Fokusverlust; 2-s-/15-s-Polling, Single-flight; vorhandene Liste bleibt beim Refresh; Offline-Microcopy nach Fehler; keine Timer nach Unload. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

### 7.2 US-000016 — Template-Versionen

#### TC-000920: Template v1 mit Review-before-save — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | leere Template Library |
| Testschritte | 1. Templates öffnen. 2. leeren Submit auslösen und ersten Fehlerfokus prüfen. 3. Name/Inhalt eingeben. 4. **Review template version** wählen. 5. read-only Inhalt prüfen. 6. speichern. 7. Dateien/Manifest/Registry prüfen. |
| Erwartetes Ergebnis | Nur Templates hat Eingabefelder; vor Review keine Version; danach v1 mit stabiler ID, Hash, Zeitstempel und atomarer Datei; Library findet sie wieder. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000921: Neue Version ohne Überschreiben — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Template v1 vorhanden |
| Testschritte | 1. v1 lesen und hashen. 2. **Create new version** öffnen. 3. Inhalt ändern, prüfen und speichern. 4. v1 und v2 über Versionsliste lesen. 5. Plugin/Sidecar neu starten und wiederholen. |
| Erwartetes Ergebnis | v2 hat nächste Version und eigenen Hash; v1-Datei bleibt unverändert und lesbar; Registry ist nach Restart reproduzierbar. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000922: Paralleler Writer und Draft-Erhalt — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | zwei UI-/IPC-Sitzungen auf derselben aktuellen Version |
| Testschritte | 1. in beiden Sitzungen unterschiedliche Drafts erstellen. 2. ersten speichern. 3. zweiten speichern. 4. Recovery `Reload versions` ausführen. 5. Draft und Versionsliste prüfen. |
| Erwartetes Ergebnis | genau eine Version gewinnt; zweite erhält handlungsorientierten Race-Fehler; lokaler Draft bleibt erhalten; erneutes Review erzeugt nächste eindeutige Version. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000923: Template-Provenienz und gebundene ältere Version — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | v1 und v2; Pending-Vorschlag bindet v1-ID/Version/Hash |
| Testschritte | 1. Pending-Detail öffnen. 2. Provenienz mit v1 vergleichen. 3. v2 erstellen. 4. Pending erneut öffnen/confirm. |
| Erwartetes Ergebnis | Name, ID, v1 und Hash bleiben read-only sichtbar; v2 ändert die immutable v1-Bindung nicht; Confirm bleibt bei vorhandener unveränderter v1 möglich. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000924: Fehlende/veränderte Vorlage und interne Scope-Grenze — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Pending bindet Template; isolierte Kopie der Template-Dateien |
| Testschritte | 1. gebundene Datei entfernen beziehungsweise Inhalt manipulieren. 2. Detail/Confirm aufrufen. 3. Suche und Quellenwahl nach `.second-brain/**` prüfen. 4. Registry-Rebuild ausführen. |
| Erwartetes Ergebnis | Missing/Drift blockiert ohne Zielmutation und nennt Template-Recovery; interne Vorlagen erscheinen nie als Vaultquelle/Suchergebnis; gültige Dateien rebuilden die Registry. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

### 7.3 US-000008 — History und Rollbackstatus

#### TC-000930: Vollständige Statusmatrix und Filter — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Fixtures für pending, applying, success, rejected, failed, incomplete, conflicted und expired |
| Testschritte | 1. History öffnen. 2. jeden Statusfilter wählen. 3. Einträge öffnen. 4. Ziel, Zeit, Auslöser, Fehlercode/Audit-ID und Rollbackstatus vergleichen. |
| Erwartetes Ergebnis | Jeder Zustand ist textlich/symbolisch unterscheidbar; `Incomplete`/`Rejected` nie Erfolgsstil; Rollbackstatus separat; Filter/Empty-State korrekt. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000931: Einzelrollback und Ursprungprojektion — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | erfolgreiche Compilation mit `Available` und unverändertem Ziel |
| Testschritte | 1. Rollback-Review aus History öffnen. 2. Vorschau prüfen. 3. bestätigen. 4. History neu laden. 5. Zielhash vergleichen. |
| Erwartetes Ergebnis | Ziel entspricht Before-Hash; Ursprung zeigt `Rolled back`; Rollbackoperation zeigt `Not applicable`; keine zweite Datei verändert. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000932: Blockierter Rollback und Incomplete-Recovery — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Ziel nach erfolgreicher Änderung fremd verändert; separater APPLYING-Faultpoint |
| Testschritte | 1. Rollback vorbereiten/versuchen. 2. Restart-Recovery ausführen. 3. History und tatsächlichen Zielhash prüfen. |
| Erwartetes Ergebnis | fremde Änderung bleibt unangetastet; Rollback `Blocked`; Recovery zeigt tatsächlichen `Incomplete`/Conflict-Zustand und keinen Erfolg. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

#### TC-000933: Cursor, Reihenfolge und Inhaltsminimierung — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | mehr als 50 gemischte Operationen mit sensiblen Kandidateninhalten |
| Testschritte | 1. Seiten mit 1/50/200/201 Limit abfragen. 2. Cursor vollständig traversieren. 3. Reihenfolge/Duplikate prüfen. 4. UI/IPC-Antwort nach Kandidatenvolltext durchsuchen. |
| Erwartetes Ergebnis | gültige Limits stabil und ohne Duplikate; 201 abgewiesen; neueste zuerst; History enthält kompakte Metadaten, keinen Kandidatenvolltext. |
| Tatsächliches Ergebnis | *(wird befüllt)* |
| Status | ⬜ Nicht getestet |

## 8. UX-Zustands- und Accessibility-Matrix

| Bereich | Zu prüfende Zustände | Testbezug |
|---|---|---|
| Pending | Initial loading, ready, empty, refreshing, offline, validated error, capacity | E2E-000907, TC-000909 |
| Review | loading, ready, warning, confirming, rejecting, confirmed, rejected, conflict, expired, already decided, checking outcome, incomplete, error | E2E-000901–903 |
| Templates | loading, empty, ready, form error, preview, saved, race, missing version | E2E-000904, TC-000920–924 |
| History | ready, filtered, empty, completed, rejected, failed, incomplete, conflicted, expired, rolled back, blocked | E2E-000905, TC-000930–933 |
| Accessibility | H1-Fokus, Rückfokus, Modal-Fokusfalle/Escape, Live-Status, Alert, Warnungsbeschreibung, 44-px-Ziele, 320 px/200 %, reduced motion | E2E-000906 |

Verbindliche Produktsprache ist Englisch. Exakte UX-000004-Microcopy wird nicht nur auf
Schlüsselwörter, sondern vollständig geprüft. Technische Codes dürfen ergänzen, aber nie
den Recovery-Haupttext ersetzen.

## 9. Sicherheits- und Integritäts-Smoke-Tests

| ID | Test | Methode | Erwartetes Ergebnis |
|---|---|---|---|
| SEC-000901 | MCP kann entscheiden | Toolliste und direkter Toolaufruf | kein Decision-Tool, kein Decision-Token; Ablehnung ohne Mutation |
| SEC-000902 | Pfad-Traversal/absoluter Pfad | `../Outside.md`, `C:\\outside.md` | feldbezogener Source-/Target-Code; keine Fremddatei gelesen/geschrieben |
| SEC-000903 | Nicht-Markdown/Mehrziel/Ziel=Quelle | Contract-Negativmatrix | Request abgewiesen; kein Pending/Audit/Vaultwrite |
| SEC-000904 | Quellen 0/21 und Kandidat >2 MiB | Boundary-Requests | Schemafehler am Feld; kein partieller Zustand |
| SEC-000905 | Idempotency-Konflikt | gleiche `clientRequestId`, anderer Payload | `IDEMPOTENCY_CONFLICT`; ursprünglicher Eintrag unverändert |
| SEC-000906 | Prompt-Injection-Marker | Instruction-/Tool-/Pfadtext in Quelle/Kandidat | nur Warnung/Daten; keine Rechte-, Tool- oder Shellausführung |
| SEC-000907 | Decision-Replay/Expiry | alter/rotierter/verbrauchter Token | konkrete Fehler; keine Mutation |
| SEC-000908 | Race Confirm gegen Reject/Cleanup | parallele Prozesse | genau ein terminaler Gewinner; keine stille Verdrängung |
| SEC-000909 | fremder Hash nach Crash | APPLYING-Restart mit neuem Zielinhalt | `Incomplete`/Conflict; fremder Inhalt nie überschrieben |
| SEC-000910 | interne Template-Daten | Suche, Quellenwahl, History, Logs | `.second-brain/**` und Vollinhalte bleiben ausgeschlossen |
| SEC-000911 | Netzwerk | Prozess-/Socket-Beobachtung während Suite | kein neuer Provider-, LAN- oder externer Netzwerkpfad |
| SEC-000912 | Contract-2-Mismatch | altes Plugin/Sidecar-Paar simulieren | sicherer read-only Fallback; keine inkompatible Mutation |

## 10. Testergebnis-Zusammenfassung

*(Wird durch `/test-run` befüllt.)*

| Kategorie | Bestanden | Fehlgeschlagen | Blockiert/Nicht getestet |
|---|---:|---:|---:|
| Build/Lint | — | — | — |
| Unit | — | — | — |
| Integration/Migration/Security | — | — | — |
| Headed Playwright | — | — | — |
| Native Obsidian P0 | — | — | — |
| Performance/Ressourcen | — | — | — |
| Manuell P0/P1 | — | — | — |

## 11. Gefundene Bugs

Neue Abweichungen werden erst bei `/test-run` als fortlaufende `BUG-NNNNNN` mit
Reproduktionsschritten und bewusst offenem Root-Cause-Abschnitt angelegt. Der Plan selbst
behauptet keine gefundenen Fehler.

## 12. Freigaberegel für Gate 7

Gate 7 kann nur `PASS` erreichen, wenn:

1. TP-000009 durch den Folge-Command `/test-run` freigegeben ist.
2. Build, Lint, vollständige Vitest-Suite und Coverage erfolgreich neu ausgeführt wurden.
3. alle P0-Fälle einschließlich echtem MCP→Restart→gebautes Plugin→Decision→History und
   nativer Obsidian-Abnahme bestanden sind; der synthetische Harness allein genügt nicht.
4. Migration, Fault-Injection, Drift, Replay, Reject, Capacity und Template-Race mit
   tatsächlichen Vault-/DB-Hashes belegt sind.
5. die headed Browser-Clickpfade und der Report dokumentiert sind.
6. PERF-000901–906 mit Ist-Werten dokumentiert sind.
7. kein BLOCKER-Bug in einem Status außer `VERIFIZIERT` offen ist.

## 13. Definition-of-Done-Selbstprüfung — Testplanung

- [x] TP-000009 mit eindeutiger Sprint-/Story-Basis erstellt.
- [x] TP-000008 als verworfene manuelle Abnahmebasis ersetzt.
- [x] Jede Commit-Story besitzt positive, negative, Boundary- und Recovery-Fälle.
- [x] Jedes fachliche Akzeptanzszenario ist mindestens einem Testfall zugeordnet.
- [x] Alle UX-000004-Zustände, Fokus-/A11y-Regeln und Microcopy sind eingeplant.
- [x] Security-, Migration-, Restart-, Race- und Datenintegritätsfälle sind eingeplant.
- [x] Browser-, natives Obsidian- und echtes MCP-System-E2E sind getrennt ausgewiesen.
- [x] Performanztests besitzen konkrete Intervalle oder ausdrücklich definierte Baselines.
- [x] Kein Testfall ohne erwartetes Ergebnis.
- [x] Constitution geprüft; kein Konflikt, kein neuer Netzwerkpfad und keine stille Mutation.
- [x] TP-000009 APPROVED — durch `/test-run` nach aufgelöster Fixture-Frage freigegeben.
- [ ] Tests, Coverage, Performance, P0 und TR ausgeführt — Aufgabe von `/test-run`.

---

## Übergabe: QA-Testplanung → QA-Testausführung

**Datum:** 2026-08-15  
**Von:** QA Engineer (QA)  
**An:** QA Engineer (QA)  
**Nächster Befehl:** `/test-run second-brain 7`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000009 | REVIEW | `testing/TP-000009-sprint-7-recovery.md` | Recovery-Testplan; ersetzt TP-000008 |
| SP-000009 | APPROVED | `sprints/SP-000009-sprint-7-mcp-first-recovery.md` | verbindlicher 42-SP-Scope |
| UX-000004 | APPROVED | `ux/UX-000004-mcp-first-compilation-review.md` | verbindliche UI-Zustände und Microcopy |

### Kritische Informationen für Empfänger

- Der vorhandene headed Changes-Test ist ein synthetischer UI-Harness. Gate 7 verlangt
  zusätzlich den echten Prozessverbund und eine native Obsidian-Abnahme.
- SP-000009 Voraussetzung 4 (gehashte Schema-5-Produktionsfixture) ist noch nicht belegt;
  TC-000908 darf ohne Fixture nicht als bestanden markiert werden.
- Exakte UX-Microcopy, vollständige terminale UI-Zustände und Rückfokus sind P0, nicht
  durch reine Service-Tests ersetzbar.
- Vor jedem negativen Mutationsfall sind Vault-/DB-Hashes zu sichern und danach zu
  vergleichen.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---:|---|---|---|---|
| 1 | Wo liegt die gehashte Schema-5-Produktionsfixture für TC-000908? | SP-000009 Voraussetzung 4 | MAJOR | BE+QA |

### Nicht-Ziele

Keine Provider-, Android-, Mehrdatei-, Template-Delete-/Sync- oder Release-Sicht-Abnahme.

### Empfehlungen

Zuerst die echte MCP-/Restart-/Decision-Prozesskette und Migration-Fixture schließen;
danach headed/native UI, Fault-Matrix, Coverage und Performance in einem reproduzierbaren
Lauf ausführen.

---

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-15 | Recovery-Testplan aus SP-000009 und UX-000004; TP-000008 ersetzt | QA |
| 1.1 | 2026-08-16 | Für den Bugfix-Nachlauf freigegeben; Schema-5-Fixture-Frage durch BUG-000012 aufgelöst | QA |
