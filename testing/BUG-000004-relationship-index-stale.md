---
id: BUG-000004
title: Bug — Relationship-Ansicht meldet alten Index als Sidecar offline
version: 1.2
status: VERIFIZIERT
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

**Direkte Ursache:** Der erste Fix synchronisiert vor der Abfrage, aber `LocalIndex`
überspringt unveränderte Dateien allein anhand ihres Datei-Fingerabdrucks. Es existiert kein
separater Nachweis, dass der aktuelle Inhalt bereits in Graphkanten projiziert wurde.

**Zugrundeliegende Ursache:** Dateiindex und Graphprojektion teilen implizit denselben
Aktualitätszustand. Eine Schemamigration kann deshalb die Graphtabelle anlegen, ohne die
bereits bekannten Dateien erneut zu projizieren.

**Andere Stellen mit demselben Muster:** Die Search-Ansicht besitzt bereits einen
Setup-/Update-Flow; der neuen Relationship-Ansicht fehlt dieser erreichbare Recovery-Schritt.

**Ausgeschlossene Ursachen:** Sidecar, Vault-Scope und Plugin-Registrierung funktionieren;
Vault-Dateien wurden nicht verändert.

## Fix-Ansatz

Zusätzlich zum Refresh erhält jede Datei einen separaten Relationship-Fingerabdruck. Eine
neue reversible Migration lässt ihn bei Bestandszeilen leer. Die nächste Synchronisierung
projiziert solche Dateien einmalig neu und setzt ihn erst atomar mit den Kanten.

## Regressionsrisiko

**Einschätzung:** Mittel
**Begründung:** Jeder Refresh scannt Vault-Metadaten, liest aber nur geänderte Dateien.

## Verifikation

**Erster Fix:** 49/49 Vitest-Tests bestanden, aber die native Nutzerverifikation zeigte
weiterhin eine leere Liste. Datenbankevidenz: fünf bekannte Dateien, null Graphkanten.

**Migrationsfix:** 50/50 Vitest-Tests, 82,43 % Branch Coverage und 8/8 headed
Playwright-Tests bestanden. Ein persistenter Altindex mit geleerten Kanten und fehlendem
Projektions-Fingerabdruck wird im Regressionstest vollständig nachprojiziert.

**Native Nutzerverifikation:** Bestanden im tatsächlich geöffneten OneDrive-Review-Vault.
Nach vollständigem Obsidian-Neustart migrierte der Sidecar den Altindex automatisch; die
Relationship-Ansicht zeigte die erwarteten Beziehungen. `Strg+R` lud Plugin und
Kindprozess in dieser Obsidian-/Windows-Umgebung nicht zuverlässig neu und ist deshalb
kein zulässiger Installations- oder Nachtestschritt.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-31 | OFFEN | Nutzerabnahme reproduziert den veralteten Graphindex |
| 2026-07-31 | IN_BEARBEITUNG | Root-Cause vor Codeänderung dokumentiert |
| 2026-07-31 | BEHOBEN | Inkrementeller Sync in Relationship-Refresh integriert; Regression grün |
| 2026-07-31 | IN_BEARBEITUNG | Native Verifikation fehlgeschlagen; fehlender Projektions-Fingerabdruck identifiziert |
| 2026-07-31 | BEHOBEN | Schema 4 und einmalige Nachprojektion implementiert; Regression grün |
| 2026-07-31 | VERIFIZIERT | Native Nutzerabnahme nach vollständigem Obsidian-Neustart bestanden |

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.2 | 2026-07-31 | Native Migration im aktiven OneDrive-Vault verifiziert; Neustartbedingung dokumentiert | QA |
| 1.1 | 2026-07-31 | Fehlgeschlagenen Nachtest und tiefere Migrationsursache dokumentiert | RV+BE |
| 1.0 | 2026-07-31 | Ursprünglichen Upgradefehler und ersten Refresh-Fix dokumentiert | RV+FE+BE |

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
