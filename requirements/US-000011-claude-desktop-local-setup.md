---
id: US-000011
title: Claude Desktop lokal einrichten
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-30
project: second-brain
based-on: REQ-000001 F-001, F-002, F-003; delivery-slice-of US-000001
epic: Einstieg und Zugriff
priority: Must
sprint: 1
supersedes: —
superseded-by: —
---

# US-000011: Claude Desktop lokal einrichten

## User Story

**Als** Windows-Nutzer von Claude Desktop  
**möchte ich** Second Brain lokal installieren, meinen bestehenden Vault freigeben und
Claude Desktop per MCP verbinden  
**damit** ich den ersten unterstützten Client ohne Vault-Migration und ohne zusätzlichen
LLM-API-Key im Plugin verwenden kann.

## Kontext und Abgrenzung

Diese Story ist ein lieferbarer Sprint-Slice der produktweiten US-000001. Sie erfüllt den
Claude-Desktop-Anteil von REQ-000001 F-002, schließt F-002 aber ausdrücklich nicht ab.
ChatGPT und Mistral bleiben über US-000001 verbindlicher Produktscope und benötigen eigene
lieferbare Client-Slices, bevor F-002 als vollständig umgesetzt gilt.

**Stakeholder-Freigabe:** Erteilt am 2026-07-30.

## Akzeptanzkriterien

### Szenario 1: Geführte lokale Einrichtung

```text
GEGEBEN das Plugin wurde unter Windows manuell installiert
UND Claude Desktop ist als unterstützter lokaler Client verfügbar
WENN ich die englische Ersteinrichtung öffne, einen bestehenden Vault auswähle
UND die angezeigten Claude-Desktop-Schritte ausführe
DANN wird die lokale MCP-Verbindung erfolgreich geprüft
UND keine Originaldatei wird migriert oder verändert
```

### Szenario 2: Kein zusätzlicher Plugin-API-Key

```text
GEGEBEN Claude Desktop ist bereits entsprechend seiner eigenen Bedingungen authentifiziert
WENN ich die lokale MCP-first-Verbindung einrichte
DANN verlangt Second Brain keinen zusätzlichen LLM-API-Key
UND die Oberfläche behauptet keine Umgehung von Anmeldung, Abonnement oder Client-Schutz
```

### Szenario 3: Ungültiger Vault oder inkompatibler Client-Vertrag

```text
GEGEBEN der gewählte Pfad ist kein lesbarer Vault
ODER Claude Desktop und der lokale Sidecar verwenden inkompatible Vertragsversionen
WENN die Einrichtung validiert wird
DANN bleibt der Vault unverändert
UND ich erhalte eine konkrete Diagnose und einen sicheren Korrekturschritt
```

### Szenario 4: Zugriff außerhalb des Vault-Roots

```text
GEGEBEN die lokale Verbindung ist eingerichtet
WENN ein Pfad über Traversal, Symlink oder absoluten Fremdpfad außerhalb des freigegebenen
Vault-Roots aufgelöst würde
DANN wird der Zugriff verweigert
UND es werden keine Inhalte außerhalb des freigegebenen Roots offengelegt
```

## Nicht-Ziele dieser Story

- ChatGPT- oder Mistral-Kompatibilität; diese bleiben Bestandteil der produktweiten
  US-000001 und werden als eigene Client-Slices geplant.
- Direkter LLM-API-Zugriff mit eigenem Schlüssel.
- Veröffentlichung im Obsidian- oder Claude-Extension-Verzeichnis.
- Lesen, Suche, Graph, Mutationen oder Wissenskompilierung.

## Abhängigkeiten

| Typ | Referenz | Beschreibung |
|---|---|---|
| Delivery-Slice von | US-000001 | US-000001 bleibt offen, bis alle verbindlichen Client-Anteile geliefert sind |
| ADR | ADR-000001 | TypeScript, lokaler Node-Sidecar und MCP-`stdio` |
| ADR | ADR-000004 | Capability- und Vault-Scope-Grenzen |
| UX | UX-000001 Journey 1 | Bestehender Setup-, Fehler- und Offline-Flow; explizite US-000011-Zuordnung noch durch UX zu ergänzen |

## Technische Notizen

**Frontend-Aufwand:** Im Refinement neu zu bestätigen  
**Backend-Aufwand:** Im Refinement neu zu bestätigen  
**Besondere Risiken:** Claude-Desktop-Packaging und Konfigurationsweg sind
versionsabhängig; Vertrag und Anleitung müssen getrennt testbar bleiben.

## Definition of Done

- [ ] Alle Akzeptanzkriterien implementiert und verifiziert.
- [ ] Windows-E2E-Nachweis mit synthetischem Test-Vault.
- [ ] Keine Vault-Migration oder Änderung während Setup und Verbindungstest.
- [ ] Scope-, Symlink- und Vertragsversionsfehler getestet.
- [ ] UX-000001 referenziert US-000011 explizit.
- [ ] API-/MCP-Vertrag und Installationsdokumentation aktualisiert.
- [ ] Code Review abgeschlossen und kein offener BLOCKER-Bug.

---

## Übergabe: BA → UX/Refinement

**Datum:** 2026-07-30  
**Von:** Business Analyst (BA)  
**An:** UX Designer sowie Refinement-Team (UX, BA, FE, BE)  
**Nächster Befehl:** `/ux second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| US-000011 | APPROVED | `requirements/US-000011-claude-desktop-local-setup.md` | Lieferbarer Claude-Desktop-Slice für Sprint 1 |
| US-000001 | APPROVED | `requirements/US-000001-installation-and-mcp-setup.md` | Produktweite Umbrella-Story bleibt unverändert |

### Kritische Informationen für Empfänger

- US-000011 schließt REQ F-002 nicht vollständig ab.
- ChatGPT und Mistral bleiben verbindlicher späterer Scope.
- SP-000001 darf nach Freigabe US-000011 statt US-000001 als Commit-Story führen.

### Offene Fragen (vererbt)

Keine BLOCKER-Frage für die fachliche Freigabe von US-000011.

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Konkrete spätere ChatGPT- und Mistral-Slices | REQ F-002 | MAJOR | BA / AR / Stakeholder |

### Nicht-Ziele

Keine Änderung oder Abschwächung von REQ-000001 F-002 und US-000001.

### Empfehlungen

UX-000001 minimal um die explizite US-000011-Zuordnung ergänzen; danach SP-000001 im
Refinement von US-000001 auf US-000011 umstellen und Gate 5.5 erneut ausführen.
