---
id: PC-000001
title: Process Change Proposal — Implizite Freigabe und integrierte Analyse
version: 1.0
status: DRAFT
author-agent: AC (Agile Coach)
date: 2026-07-31
project: second-brain
sprint: 1
based-on: RETRO-000001
supersedes: —
superseded-by: —
---

# Process Change Proposal: Implizite Freigabe und integrierte Analyse

## Zusammenfassung

**Problem:** Nutzer müssen Artefakte separat freigeben und anschließend nochmals den
Folge-Command starten. `/analyze` erzeugt zusätzlich einen eigenen Phasen- und
Interaktionspunkt.

**Ursache:** Artefaktfreigabe, Gate-Prüfung und Phasenaktivierung sind als drei getrennte
Aktionen modelliert, obwohl der Folge-Command bereits eine eindeutige Handlungsabsicht ist.

**Empfehlung:** Ein Folge-Command soll REVIEW-Artefakte der vorherigen Phase implizit
freigeben und deren Gate ausführen. Die Cross-Artefakt-Analyse bleibt erhalten, wird aber
beim Start von `/implement` ausgeführt; `/analyze` bleibt als optionaler Diagnosebefehl.

**Priorität:** Hoch

**Aufwand:** M (< 2h)

## Problem-Beschreibung

In Sprint 1 entstanden vier negative Gate-/Review-Läufe. Testing und Review fanden echte
Produktdefekte. Gate 5.5 fand ebenfalls einen echten Scopefehler, verlangte aber einen
separaten `/analyze`-Aufruf, einen neuen Story-Slice, Re-Refinement und einen weiteren
`/analyze`-Aufruf. Zusätzlich wurden Artefaktfreigabe und Start des Folge-Commands als
getrennte Nutzeraktionen behandelt.

**Beobachtet in:** Sprint 1, Gate 5.5 sowie Übergänge aller Artefaktphasen

**Häufigkeit:** Bei jedem freigabepflichtigen Phasenübergang

**Impact:** Zusätzliche Nutzerinteraktionen, wahrgenommene Wiederholung und langsamere
Fortbewegung ohne proportionalen Qualitätsgewinn.

## Ursachen-Analyse

**Direkte Ursache:** Commands lesen nur bereits `APPROVED` markierte Eingaben; sie dürfen
den Aufruf selbst nicht als Freigabe eines `REVIEW`-Artefakts interpretieren.

**Systemische Ursache:** Die Tool Chain modelliert Freigabe als isoliertes Statusereignis
statt als Teil eines bewusst gestarteten Übergangs.

**Ausgeschlossene Ursachen:**

- Nicht die Existenz von Gates an sich; Gate 7 und Gate 8 schützten vor echten Defekten.
- Nicht mangelnde Artefaktdetailtiefe; Sprint 1 war bereits stark dokumentiert.
- Nicht das Ziel der Cross-Artefakt-Prüfung; nur ihre eigenständige Position im Standardfluss.

## Empfohlene Änderung

### Betroffene Dateien

| Datei | Änderung | Abschnitt |
|---|---|---|
| `toolchain/agents/_base-agent.md` | Ergänzung | Artefaktfreigabe und Phasenstart |
| `toolchain/protocols/artifact-lifecycle.md` | Ergänzung | REVIEW → APPROVED durch Folge-Command |
| `toolchain/protocols/gate-protocol.md` | Ergänzung | Reihenfolge Übergangsprüfung |
| `toolchain/workflows/full-sprint.md` | Überarbeitung | Phase 5.5 in `/implement` integrieren |
| `.claude/commands/implement.md` | Ergänzung | Preflight-Konsistenzprüfung |
| `.claude/commands/analyze.md` | Überarbeitung | optionaler Diagnosemodus |
| `toolchain/agents/orchestrator.md` | Ergänzung | Approval-Quelle und Hard-Stops |
| `.claude/commands/commands_summary.md` | Synchronisierung | geänderte Commands |
| `toolchain/agents/agents_summary.md` | Synchronisierung | geänderte Agentenregeln |
| `toolchain/templates/templates_summary.md` | nur falls Template geändert wird | Summary-Pflicht |
| `RELEASENOTES.md` | Ergänzung | Tool-Chain-Änderung |

### Konkrete Änderung

**Vorher:**

```text
Agent erstellt Artefakt → Nutzer gibt Artefakt frei → Status APPROVED
→ Nutzer startet Folge-Command → Gate → nächste Phase

/refine → /analyze → /implement
```

**Nachher:**

```text
Agent erstellt Artefakt im Status REVIEW
→ Nutzer startet Folge-Command
→ Command zeigt die zu bestätigenden Artefakte kompakt an
→ keine offenen BLOCKER/MAJOR:
     Aufruf gilt als Freigabe, Status APPROVED, Gate wird ausgeführt
→ offene BLOCKER/MAJOR:
     Hard-Stop; keine implizite Freigabe

/refine → /implement
             └─ führt Gate 5.5 als Preflight aus

/analyze bleibt optional für vorgezogene oder ad-hoc Drift-Prüfung.
```

Zusätzliche Schutzregeln:

1. Implizite Freigabe gilt nur für Artefakte im Status `REVIEW`, die der unmittelbar
   vorherigen Phase und dem aktuellen Sprint zugeordnet sind.
2. Der Command nennt IDs und Versionen vor der Statusänderung sichtbar.
3. Offene BLOCKER oder MAJOR verhindern Freigabe und Phasenwechsel.
4. `.phase` protokolliert `approval-source: transition-command` und den Commandnamen.
5. Rückläufe prüfen nur die benannten Fund-IDs plus notwendige Regressionen.

### Begründung

Die Änderung erhält alle Qualitätsprüfungen, entfernt aber doppelte Nutzerhandlungen. Der
Scopefund von Gate 5.5 wäre weiterhin vor jeder Implementierung erkannt worden. Testing und
Review bleiben unverändert stark.

## Alternativen (verworfen)

| Alternative | Warum verworfen |
|---|---|
| `/analyze` vollständig entfernen | würde wertvolle Cross-Artefakt-Prüfung verlieren |
| Alle Gates automatisch ohne sichtbare Bestätigung ausführen | macht Statusänderungen zu intransparent |
| Bestehenden Prozess unverändert lassen | ignoriert wiederkehrende Nutzerreibung |
| Nur weniger Artefakte erstellen | adressiert nicht die doppelte Freigabehandlung |

## Konsequenzen

**Positiv:**

- Weniger manuelle Bestätigungen und Phasenbefehle.
- Kein Verlust der Gate-5.5-Schutzwirkung.
- Klarere Semantik: Wer die nächste Phase startet, akzeptiert die sichtbaren Eingaben.
- Rückläufe werden auf tatsächliche Funde begrenzt.

**Risiken / Nebenwirkungen:**

- Ein versehentlich eingegebener Folge-Command könnte als Zustimmung interpretiert werden.
- Commands müssen REVIEW-Artefakte zuverlässig dem richtigen Sprint zuordnen.
- Bestehende Dokumentation und Summaries müssen konsistent aktualisiert werden.

**Mitigation:**

- sichtbare ID-/Versionszusammenfassung;
- Hard-Stop bei BLOCKER/MAJOR;
- keine implizite Freigabe bei mehrdeutiger Artefaktzuordnung;
- Audit-Eintrag in `.phase`.

## Umsetzungs-Checkliste

- [ ] Nutzer hat Änderung freigegeben.
- [ ] Betroffene Command-, Agenten-, Workflow- und Protokolldateien aktualisiert.
- [ ] Summary-Dateien synchronisiert.
- [ ] `RELEASENOTES.md` aktualisiert.
- [ ] Kompatibilitätsprüfung ausgeführt.
- [ ] Änderung in Sprint 2 erprobt.
- [ ] RETRO-000002 misst Nutzerinteraktionen und Rückläufe.
- [ ] Status dieses PC-Dokuments auf ACTIVE gesetzt.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-31 | DRAFT | Nach RETRO-000001 erstellt; wartet auf Nutzerfreigabe |

---

## Übergabe an den Nutzer

**Entscheidung erforderlich:** PC-000001 freigeben, ändern oder ablehnen.

Bei Freigabe ist der nächste Schritt die Umsetzung in der Tool Chain; erst danach sollte
Sprint 2 mit dem neuen Übergangsmodell gestartet werden.

---

*Erstellt von: AC-Agent | Datum: 2026-07-31*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Initialer Vorschlag | AC |
