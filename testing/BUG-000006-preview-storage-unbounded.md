---
id: BUG-000006
title: Bug — Abgelaufene Mutationsvorschauen wachsen unbegrenzt
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

# Bug: Abgelaufene Mutationsvorschauen wachsen unbegrenzt

## 1. Symptom

**Erwartetes Verhalten:** Kurzlebige Preview-Tokens bleiben nur so lange gespeichert, wie es
für Bestätigung, Replay-Schutz und Audit notwendig ist; abgelaufene Preview-Inhalte werden
sicher bereinigt.

**Tatsächliches Verhalten:** Jede Vorschau persistiert Vorherinhalt, Nachherinhalt und Diff.
Die Performance-Baseline erzeugte nach 30 großen und 1.000 kleinen Previews eine SQLite-Datei
von 240.488.448 Byte; es gibt keinen beobachtbaren Cleanup-Pfad für abgelaufene Einträge.

**Auswirkung:** Wiederholte große, auch niemals bestätigte Vorschauen können lokalen Speicher
und Prozess-RSS ungebremst erhöhen. Der RSS stieg im Baselineprozess um 158.224.384 Byte.

## 2. Reproduktionsschritte

1. 30 Preview-Anfragen für eine 2-MB-Markdown-Datei vorbereiten, ohne zu bestätigen.
2. 1.000 kleine Create-Previews vorbereiten.
3. SQLite-Größe und RSS vor/nach dem Lauf vergleichen; Zeitablauf/Cleanup prüfen.

**Umgebung:** Windows, Node.js 24.15.0, `tests/performance/mutations-baseline.ts`.
**Reproduzierbarkeit:** Immer.

## 3. Schweregrad & Zuweisung

**Schweregrad:** `MAJOR`
**Begründung:** Kein unmittelbarer Datenverlust, aber lokaler Speicher kann durch einen
freigegebenen Mutations-Client dauerhaft und ohne Budgetgrenze wachsen.
**Zugewiesen an:** BE

## 4. Evidenz

```json
{
  "preview2Mb":{"runs":30,"p50Ms":113.65,"p95Ms":171.03},
  "previewStorage":{"entries":1000,"databaseBytes":240488448},
  "rssDeltaBytes":158224384
}
```

## Betroffene Komponenten

- `apps/sidecar/src/mutations/mutation-service.ts`
- SQLite-Tabelle `mutation_previews`

## Root-Cause

> Von BE vor jeder Codeänderung auszufüllen.

**Direkte Ursache:** [AUSSTEHEND — BE]

**Zugrundeliegende (systemische) Ursache:** [AUSSTEHEND — BE]

**Andere Stellen mit demselben Muster:** [AUSSTEHEND — BE]

**Ausgeschlossene Ursachen:** Die gemessenen Latenzen liegen deutlich unter dem Timeout;
der Befund betrifft Aufbewahrung und Speicherwachstum, nicht die Einzeloperation.

## Fix-Ansatz

[AUSSTEHEND — BE nach Root-Cause-Analyse]

## Regressionsrisiko

**Einschätzung:** Hoch
**Begründung:** Cleanup darf Replay-Schutz, laufende Tokens, Audit und Rollback nicht brechen.

## Verifikation

**Ursprüngliche Reproduktionsschritte erneut ausgeführt:** Ausstehend.

**Regressionstest ergänzt:** Nein — Aufgabe des Fixes.

**Regressionstest schlägt ohne Fix fehl und besteht mit Fix:** Nicht verifiziert.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-31 | OFFEN | Unbegrenztes Preview-Wachstum in reproduzierbarer Baseline erfasst |

---

## Übergabe: QA → BE

**Datum:** 2026-07-31
**Von:** QA Engineer (QA)
**An:** Backend Developer (BE)
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000006 | OFFEN | `testing/BUG-000006-preview-storage-unbounded.md` | Cleanup braucht Audit-/Replay-Regressionsschutz |

### Kritische Informationen für Empfänger

Die Baseline misst bewusst gültige 2-MB-Previews. Cleanup muss abgelaufene/verbrauchte
Preview-Payloads begrenzen, ohne bestätigte Audit-/Rollbackdaten zu verlieren.

### Offene Fragen (vererbt)

Keine Reproduktionsfrage.

### Nicht-Ziele

Auditdaten dürfen nicht pauschal zusammen mit Preview-Payloads gelöscht werden.

---

*Erstellt von: QA-Agent | Datum: 2026-07-31 | Version: 1.0*
