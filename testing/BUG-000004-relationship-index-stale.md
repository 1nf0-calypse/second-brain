---
id: BUG-000004
title: Bug — Relationship-Ansicht meldet alten Index als Sidecar offline
version: 1.0
status: BEHOBEN
author-agent: RV (Code Reviewer)
date: 2026-07-31
project: second-brain
based-on: US-000013, TP-000004, TR-000006
severity: MAJOR
assigned-to: FE+BE
supersedes: —
superseded-by: —
---

# Bug: Relationship-Ansicht meldet alten Index als Sidecar offline

## 1. Symptom

**Erwartetes Verhalten:** `Refresh active note` aktualisiert die abgeleiteten lokalen Daten
und zeigt anschließend die Beziehungen der aktiven Notiz.

**Tatsächliches Verhalten:** Nach Installation des Sprint-3-Plugins enthält ein vorhandener
Sprint-2-Index noch keine Graphkanten. Die Ansicht fragt ihn unmittelbar ab und zeigt
`SIDECAR_OFFLINE`, obwohl der Dienst erreichbar ist.

**Auswirkung:** Die neue Ansicht ist nach einem Upgrade ohne einen getrennten, aus der
Ansicht nicht erreichbaren Indexschritt nicht nutzbar.

## 2. Reproduktionsschritte

1. Review-Vault mit einem vor Sprint 3 erzeugten Index öffnen.
2. Aktuelle Plugin-Version laden und eine verlinkende Notiz aktivieren.
3. Relationship-Ansicht öffnen oder `Refresh active note` wählen.

**Umgebung:** Windows 11, Obsidian Desktop, Node.js v24.15.0, `feature/sprint-3`
**Reproduzierbarkeit:** Immer bei veraltetem Index.

## 3. Schweregrad & Zuweisung

**Schweregrad:** `MAJOR`
**Begründung:** Kernfunktion ist nach einem regulären Upgrade blockiert, aber Daten bleiben
sicher und ein manueller Indexlauf stellt die Funktion wieder her.
**Zugewiesen an:** FE+BE

## 4. Evidenz

```text
SIDECAR_OFFLINE: The local service could not complete the request.
Refresh the index and try again.
```

Nach manueller Indexaktualisierung erschienen `Alpha → Beta`, `Beta → Alpha` und `#alpha`.

## Root-Cause

**Direkte Ursache:** `RelationshipView` ruft nur die Relationship-Operation auf.
`NodeSetupTransport` stellt die inkrementelle Indexaktualisierung bereit, der
Relationship-Vertrag verwendet sie jedoch nicht.

**Zugrundeliegende Ursache:** Der UI-Refresh wurde als reines Lesen modelliert. Die neue
Graphmigration wird angelegt, vorhandene Dateiinhalte werden ohne Synchronisierung aber
nicht erneut in Kanten projiziert.

**Andere Stellen mit demselben Muster:** Die Search-Ansicht besitzt bereits einen
Setup-/Update-Flow; der neuen Relationship-Ansicht fehlt dieser erreichbare Recovery-Schritt.

**Ausgeschlossene Ursachen:** Sidecar, Vault-Scope und Plugin-Registrierung funktionieren;
Vault-Dateien wurden nicht verändert.

## Fix-Ansatz

Der typisierte Relationship-Refresh führt zuerst die vorhandene inkrementelle
Indexaktualisierung aus und fragt danach die aktive Notiz ab. Tests belegen Reihenfolge,
Recovery und unveränderte Originaldateien.

## Regressionsrisiko

**Einschätzung:** Mittel
**Begründung:** Jeder Refresh scannt Vault-Metadaten, liest aber nur geänderte Dateien.

## Verifikation

**Automatisierte Verifikation:** 49/49 Vitest-Tests, Coverage-Gates und 8/8 headed
Playwright-Tests bestanden. Der neue Regressionstest bestätigt, dass Synchronisierung vor
der Relationship-Abfrage erfolgt und bei Sync-Fehlern keine veraltete Abfrage startet.

**Native Nutzerverifikation:** Ausstehend nach Installation des Fix-Builds.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-31 | OFFEN | Nutzerabnahme reproduziert den veralteten Graphindex |
| 2026-07-31 | IN_BEARBEITUNG | Root-Cause vor Codeänderung dokumentiert |
| 2026-07-31 | BEHOBEN | Inkrementeller Sync in Relationship-Refresh integriert; Regression grün |

---

## Übergabe: RV → FE/BE

**Datum:** 2026-07-31
**Von:** Code Reviewer (RV)
**An:** Frontend-/Backend-Agent (FE/BE)
**Nächster Befehl:** `/implement all second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000004 | IN_BEARBEITUNG | `testing/BUG-000004-relationship-index-stale.md` | Root-Cause dokumentiert |

### Kritische Informationen für Empfänger

Nur der abgeleitete Index darf geändert werden; Vault-Dateien bleiben read-only.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele

Kein kontinuierlicher File-Watcher und keine Änderung am Search-Flow.

### Empfehlungen

Bestehende inkrementelle Synchronisierung wiederverwenden und Reihenfolge testen.

---

*Erstellt von: RV-Agent | Datum: 2026-07-31 | Version: 1.0*
