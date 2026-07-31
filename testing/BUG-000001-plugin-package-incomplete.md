---
id: BUG-000001
title: Bug — Obsidian-Plugin-Paket ist nicht installierbar
version: 1.0
status: VERIFIZIERT
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

**Direkte Ursache:** `scripts/build.mjs` bündelt nur zwei JavaScript-Entrypoints. Es kopiert
`manifest.json` und `styles.css` nicht und legt `dist/sidecar/main.js` außerhalb des vom
Plugin fest verdrahteten Pfads `dist/obsidian-plugin/sidecar/main.js` ab.

**Zugrundeliegende (systemische) Ursache:** Der Build wurde als Compiler-Ausgabe statt als
lieferbares Obsidian-Paket modelliert. Es fehlte ein automatisierter Vertragstest, der den
vollständigen Paketinhalt und die Pfadbeziehung zwischen Plugin und Sidecar prüft.

**Andere Stellen mit demselben Muster:** Der README-Startpfad verweist auf den separaten
Sidecar-Build und bildet damit ebenfalls nicht das installierbare Plugin-Paket ab.

**Ausgeschlossene Ursachen:**

- Kein esbuild-Fehler; beide JavaScript-Bundles werden erfolgreich erzeugt.
- Kein Obsidian-Vault- oder Berechtigungsfehler; der Defekt besteht vor der Installation.

## Fix-Ansatz

Eine explizite Packaging-Stufe erzeugt nach dem Bundle ein vollständiges
`dist/obsidian-plugin/` mit Manifest, Styles und `sidecar/main.js`. Ein Regressionstest baut
das Paket in ein temporäres Verzeichnis und prüft alle vier erforderlichen Dateien.

## Regressionsrisiko

**Einschätzung:** Hoch  
**Begründung:** Packaging, Plugin-Start und Sidecar-Auflösung sind betroffen.

## Verifikation

**Ursprüngliche Reproduktionsschritte erneut ausgeführt:** 2026-07-30 — Ergebnis: Der
Fehler tritt nicht mehr auf. `npm run build` erzeugt Manifest, Styles, Plugin-Bundle und
`sidecar/main.js` am erwarteten Ort.

**Regressionstest ergänzt:** Ja (`tests/integration/plugin-package.test.ts`)

**Regressionstest schlägt ohne Fix fehl und besteht mit Fix:** Verifiziert.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-30 | OFFEN | Durch QA im P0-Systemtest erfasst |
| 2026-07-30 | IN_BEARBEITUNG | Root-Cause vor Codeänderung dokumentiert |
| 2026-07-30 | BEHOBEN | Paketierungsstufe und Regressionstest ergänzt |
| 2026-07-30 | VERIFIZIERT | QA hat Reproduktionsschritte und Paketvertrag erfolgreich geprüft |

## Übergabe: FE/BE → QA

**Datum:** 2026-07-30
**Von:** Frontend-/Backend-Agent (FE/BE)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 1`

Der Regressionstest prüft den vollständigen Paketinhalt. QA soll zusätzlich das gebaute
`dist/obsidian-plugin/` in einem synthetischen Vault installieren.
