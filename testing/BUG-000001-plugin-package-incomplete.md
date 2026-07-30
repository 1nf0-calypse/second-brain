---
id: BUG-000001
title: Bug — Obsidian-Plugin-Paket ist nicht installierbar
version: 1.0
status: OFFEN
author-agent: QA (QA Engineer)
date: 2026-07-30
project: second-brain
based-on: TP-000001, US-000011
severity: BLOCKER
assigned-to: FE+BE
supersedes: —
superseded-by: —
---

# Bug: Obsidian-Plugin-Paket ist nicht installierbar

## 1. Symptom

**Erwartetes Verhalten:** `npm run build` erzeugt ein manuell installierbares
Obsidian-Plugin mit `manifest.json`, `main.js`, `styles.css` und dem unter
`sidecar/main.js` erwarteten Sidecar.

**Tatsächliches Verhalten:** `dist/obsidian-plugin/` enthält ausschließlich `main.js`;
der Sidecar wird separat nach `dist/sidecar/main.js` geschrieben.

**Auswirkung:** TC-000001 kann nicht begonnen werden. Obsidian kann das ausgelieferte
Verzeichnis nicht als Plugin installieren und der vom Plugin berechnete Sidecar-Pfad
existiert nicht.

## 2. Reproduktionsschritte

1. `npm ci` und `npm run build` ausführen.
2. `dist/obsidian-plugin/` rekursiv auflisten.
3. Das Ergebnis mit dem von `apps/obsidian-plugin/src/main.ts` erwarteten Pfad vergleichen.

**Umgebung:** Windows 11, Node.js 24, Sprint-Worktree `feature/sprint-1`  
**Reproduzierbarkeit:** Immer

## 3. Schweregrad & Zuweisung

**Schweregrad:** `BLOCKER`  
**Begründung:** Blockiert den verpflichtenden P0-Systempfad und damit Gate 7.  
**Zugewiesen an:** FE+BE

## 4. Evidenz

```text
dist/obsidian-plugin/main.js
dist/sidecar/main.js
```

Betroffene Komponenten:

- `scripts/build.mjs`
- `apps/obsidian-plugin/manifest.json`
- `apps/obsidian-plugin/styles.css`
- `apps/obsidian-plugin/src/main.ts`

## Root-Cause

**Direkte Ursache:**  

**Zugrundeliegende (systemische) Ursache:**  

**Andere Stellen mit demselben Muster:**  

**Ausgeschlossene Ursachen:**  

## Fix-Ansatz

Von FE/BE nach Root-Cause-Analyse auszufüllen.

## Regressionsrisiko

**Einschätzung:** Hoch  
**Begründung:** Packaging, Plugin-Start und Sidecar-Auflösung sind betroffen.

## Verifikation

Noch nicht verifiziert.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-30 | OFFEN | Durch QA im P0-Systemtest erfasst |

## Übergabe: QA → FE/BE

**Nächster Befehl:** `/implement all second-brain`

Root-Cause ist vor jeder Codeänderung auszufüllen; anschließend ist ein
Installations-/Packaging-Regressionstest zu ergänzen.
