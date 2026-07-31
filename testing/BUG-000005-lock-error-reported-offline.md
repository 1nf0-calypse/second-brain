---
id: BUG-000005
title: Bug — Windows-Dateisperre wird als Sidecar offline gemeldet
version: 1.0
status: OFFEN
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

## Betroffene Komponenten

- `apps/sidecar/src/errors/public-error.ts`
- `apps/sidecar/src/mutations/mutation-service.ts`
- `apps/obsidian-plugin/src/ipc/node-setup-transport.ts`

## Root-Cause

> Von BE vor jeder Codeänderung auszufüllen.

**Direkte Ursache:** [AUSSTEHEND — BE]

**Zugrundeliegende (systemische) Ursache:** [AUSSTEHEND — BE]

**Andere Stellen mit demselben Muster:** [AUSSTEHEND — BE]

**Ausgeschlossene Ursachen:** Der Sidecar ist erreichbar; Originaldatei und atomare
Temp-Bereinigung funktionieren.

## Fix-Ansatz

[AUSSTEHEND — BE nach Root-Cause-Analyse]

## Regressionsrisiko

**Einschätzung:** Mittel
**Begründung:** Die öffentliche Fehlerabbildung wird von CLI, Plugin und MCP gemeinsam genutzt.

## Verifikation

**Ursprüngliche Reproduktionsschritte erneut ausgeführt:** Ausstehend.

**Regressionstest ergänzt:** Nein — Aufgabe des Fixes.

**Regressionstest schlägt ohne Fix fehl und besteht mit Fix:** Nicht verifiziert.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-31 | OFFEN | Reale Windows-Lock-Reproduktion; Daten intakt, Fehlercode falsch |

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

*Erstellt von: QA-Agent | Datum: 2026-07-31 | Version: 1.0*
