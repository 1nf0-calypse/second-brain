---
id: BUG-000005
title: Bug — Windows-Dateisperre wird als Sidecar offline gemeldet
version: 1.6
status: VERIFIZIERT
author-agent: QA (QA Engineer)
date: 2026-07-31
project: second-brain
based-on: TP-000005, US-000014
severity: MAJOR
assigned-to: BE
supersedes: —
superseded-by: —
---

# Bug: Windows-Dateisperre wird als Sidecar offline gemeldet

## 1. Symptom

**Erwartetes Verhalten:** Wenn Windows den atomaren Ersatz wegen eines exklusiven Datei-Handles
blockiert, erklärt Second Brain den Schreibfehler konkret, bestätigt den konsistenten
Vault-Zustand und verlangt eine neue Vorschau.

**Tatsächliches Verhalten:** Die Datei bleibt korrekt unverändert und es bleibt keine
Temp-Datei zurück, aber CLI/Plugin erhalten `SIDECAR_OFFLINE: The local service could not
complete the request.` Obwohl der Dienst antwortet, wird eine falsche Recovery suggeriert.

**Auswirkung:** Nutzer diagnostizieren einen Verbindungsfehler statt einer Dateisperre; das
bereits beanspruchte Confirmation-Token ist danach nicht mehr nutzbar.

## 2. Reproduktionsschritte

1. Für eine vorhandene Markdown-Datei eine Update-Vorschau erzeugen.
2. Die Zieldatei mit `FileShare.None` exklusiv öffnen.
3. Das gültige Token über `--confirm-mutation` bestätigen.

**Umgebung:** Windows, Node.js 24.15.0, Sprint-4-Commit `0807991`, lokaler temporärer Vault.
**Reproduzierbarkeit:** Immer bei exklusivem Windows-Dateilock.

## 3. Schweregrad & Zuweisung

**Schweregrad:** `MAJOR`
**Begründung:** Datenintegrität und Atomizität funktionieren, aber ein verpflichtender
Recovery-Zustand des sicherheitskritischen P0-Schreibpfads ist sachlich falsch.
**Zugewiesen an:** BE

## 4. Evidenz

**Screenshot-Pfad:** Nicht anwendbar — reproduziert an der realen Sidecar-Prozessgrenze.
**Trace-Pfad:** Nicht anwendbar.
**Log-Auszug:**

```json
{"confirmExit":1,"code":"SIDECAR_OFFLINE","content":"before","tempFiles":0}
```

**QA-Nachtest auf Fix-Commit `6e22875`:**

```json
{"exitCode":1,"code":"SIDECAR_OFFLINE","content":"before","tempFiles":0}
```

## Betroffene Komponenten

- `apps/sidecar/src/errors/public-error.ts`
- `apps/sidecar/src/mutations/mutation-service.ts`
- `apps/obsidian-plugin/src/ipc/node-setup-transport.ts`

## Root-Cause

> Von BE vor jeder Codeänderung auszufüllen.

**Direkte Ursache:** Der erste Fix typisiert Fehler aus `atomicWrite()`/`rm()`. Ein exklusives
Windows-Handle blockiert aber bereits `readExisting()` in `confirm()` bei der TOCTOU-
Hashprüfung. Dieser Leseaufruf liegt vor dem geschützten Dateioperationsblock; sein
`EBUSY`/`EPERM` erreicht `toPublicErrorResponse()` untypisiert und wird zu `SIDECAR_OFFLINE`.

**Zugrundeliegende (systemische) Ursache:** Die Fehlergrenze wurde nach Dateisystemoperation
(Write/Delete) statt nach fachlicher Confirm-Transaktion gezogen. Die zwingende Pre-Write-
Validierung gehört zum selben konsistent abgebrochenen Mutationsversuch, war aber nicht in
der domänenspezifischen Übersetzung enthalten.

**Andere Stellen mit demselben Muster:** Update, Create und Rollback laufen alle durch
`confirm()` und dessen erneutes Lesen. Prepare-Lesefehler bleiben bewusst außerhalb: Dort
existiert noch kein beanspruchtes Confirmation-Token und kein Commitversuch.

**Ausgeschlossene Ursachen:** Der Sidecar ist erreichbar; Originaldatei und atomare
Temp-Bereinigung funktionieren.

## Fix-Ansatz

`MutationService.confirm()` zieht die sichere Fehlergrenze um die vollständige Pre-Write-
Prüfung und anschließende Write/Delete-Operation. Nicht-fachliche I/O-Fehler werden einheitlich
zu `MUTATION_WRITE_FAILED`; Hashabweichungen bleiben `MUTATION_CONFLICT`. Eine injizierbare
Leseoperation reproduziert deterministisch den zweiten, gesperrten Read nach erfolgreicher
Preview. Der echte Windows-Prozessgrenztest bleibt QA-Evidenz.

## Regressionsrisiko

**Einschätzung:** Mittel
**Begründung:** Die öffentliche Fehlerabbildung wird von CLI, Plugin und MCP gemeinsam genutzt.

## Verifikation

**Ursprüngliche Reproduktionsschritte erneut ausgeführt:** 2026-07-31 — Ergebnis: Fehler
wurde durch BE nach dem zweiten Fix an der realen Sidecar-Prozessgrenze nicht mehr
beobachtet. Ein exklusives `FileShare.None`-Handle liefert `MUTATION_WRITE_FAILED`;
Originalinhalt `before` und 0 Temp-Dateien bleiben korrekt. Unabhängiger QA-Nachtest offen.

**Regressionstest ergänzt:** Ja — `tests/integration/mutation-service.test.ts` deckt
Write-Fehler, gesperrten Pre-Write-Read und Audit-Recovery ab;
`tests/unit/public-error.test.ts` prüft den öffentlichen Vertrag.

**Regressionstest schlägt ohne Fix fehl und besteht mit Fix:** Durch BE verifiziert. Ohne
zweiten Fix entkommt der injizierte Read-`EBUSY`; mit Fix bleibt der stabile Code erhalten.

**Unabhängiger QA-Nachtest:** PASS — der reale Windows-`FileShare.None`-Prozessgrenztest
liefert Exitcode 1 und `MUTATION_WRITE_FAILED`; der Inhalt bleibt `before`, es existieren
0 Temp-Dateien. Die Mutations-Branch-Coverage beträgt 91,04 %.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-31 | OFFEN | Reale Windows-Lock-Reproduktion; Daten intakt, Fehlercode falsch |
| 2026-07-31 | IN_BEARBEITUNG | Root-Cause und domänenweiter Fix-Ansatz durch BE dokumentiert |
| 2026-07-31 | BEHOBEN | Typisierter Write-Fehler und Regressionstests implementiert; an QA übergeben |
| 2026-07-31 | OFFEN | QA-Nachtest: reale Windows-Sperre liefert weiterhin SIDECAR_OFFLINE |
| 2026-07-31 | IN_BEARBEITUNG | BE reproduziert und Pre-Write-Lesegrenze als Restursache dokumentiert |
| 2026-07-31 | BEHOBEN | Vollständige Confirm-I/O-Grenze, realer Lock-Nachweis und 91,04 % Branches |
| 2026-07-31 | VERIFIZIERT | Unabhängiger QA-Systemtest bestätigt Fehlercode, Originalerhalt und Temp-Bereinigung |

---

## Übergabe: QA → BE

**Datum:** 2026-07-31
**Von:** QA Engineer (QA)
**An:** Backend Developer (BE)
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000005 | OFFEN | `testing/BUG-000005-lock-error-reported-offline.md` | Root-Cause vor Fix ausfüllen |

### Kritische Informationen für Empfänger

Der Dateizustand ist konsistent; korrigiert werden müssen stabile Fehlersemantik, Recovery
und ein deterministischer Windows-Lock-Regressionstest.

### Offene Fragen (vererbt)

Keine Reproduktionsfrage.

### Nicht-Ziele

Kein Wechsel des atomaren Write-Modells ohne neue Architekturentscheidung.

---

*Erstellt von: QA-Agent | Datum: 2026-07-31 | Version: 1.5*

---

## Übergabe: BE → QA

**Datum:** 2026-07-31
**Von:** Backend Developer (BE)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 4`

`MUTATION_WRITE_FAILED` ist über Vertrag, Service sowie CLI-/MCP-Fehlergrenze stabil.
QA soll den ursprünglichen exklusiven Windows-Dateilock erneut an der realen Prozessgrenze
ausführen und Originalerhalt sowie Temp-Bereinigung bestätigen.

---

## Übergabe: QA → BE — Nachtest fehlgeschlagen

**Datum:** 2026-07-31
**Von:** QA Engineer (QA)
**An:** Backend Developer (BE)
**Nächster Befehl:** `/implement be second-brain`

Die reale Sperre tritt bereits beim Lesen des aktuellen Dateiinhalts vor `atomicWrite()` auf
und umgeht deshalb die neue Write/Delete-Fehlergrenze. Der nächste Regressionstest muss
diesen Prozessgrenzfall abdecken und das Mutations-Branchziel auf mindestens 90 % anheben.

---

## Übergabe: BE → QA — zweiter Fix

**Datum:** 2026-07-31
**Von:** Backend Developer (BE)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 4`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000005 | BEHOBEN | `testing/BUG-000005-lock-error-reported-offline.md` | Pre-Write-Read und Write/Delete einheitlich typisiert |
| Regressionstests | bestanden | `tests/integration/mutation-service.test.ts` | realer Lock-Pfad und Audit-Restore |

### Kritische Informationen für Empfänger

Der reale BE-Systemtest ergab `MUTATION_WRITE_FAILED`, Original `before`, 0 Temp-Dateien.
Mutations-Branch-Coverage beträgt 91,04 %. QA muss denselben Windows-Lock unabhängig
wiederholen; BUG-000006 bleibt unverändert `VERIFIZIERT`.

### Offene Fragen

Keine.

### Nicht-Ziele

Keine Änderung an Preview-Speicher, UI, Auditformat oder Mutationsumfang.
