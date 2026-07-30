---
id: UX-000002
title: Claude Desktop Setup Slice
version: 1.0
status: APPROVED
author-agent: UX (UX Designer)
date: 2026-07-30
project: second-brain
based-on: US-000011, UX-000001, ADR-000001, ADR-000004
supersedes: —
superseded-by: —
---

# UX-Spec: Claude Desktop Setup Slice

## 1. Scope

**Abgedeckte User Story:** US-000011  
**Ergänzt:** UX-000001 Journey 1 sowie die Setup-Microcopy  
**Primäre Nutzungsgruppe:** Windows-Nutzer von Claude Desktop  
**Nutzungskontext:** Obsidian Desktop unter Windows  
**Sprache:** Englisch  
**Design-System:** Native Obsidian-Komponenten gemäß ADR-000001  
**Accessibility:** WCAG 2.2 AA

Diese Spezifikation ergänzt UX-000001 ausschließlich um die explizite Zuordnung des
Claude-Desktop-Sprint-Slices. ChatGPT und Mistral erscheinen nicht als implementierte oder
auswählbare Sprint-1-Clients.

## 2. Journey: Claude Desktop lokal verbinden

**Startpunkt:** Obsidian Settings → Second Brain → `Start setup`  
**Ziel:** Vault sicher freigeben, lokalen Sidecar prüfen und Claude Desktop verbinden.

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---|---|---|---|
| 1 | `Start setup` wählen | Lokale Persistenz, benötigte Komponenten und Nicht-Ziele werden erklärt | Overview |
| 2 | Vault-Pfad wählen | Lesbarkeit, Obsidian-Struktur und Root-Grenze werden ohne Mutation geprüft | Validating |
| 3 | Validierten Vault bestätigen | UI bestätigt ausdrücklich, dass keine Datei verschoben oder geändert wurde | Vault ready |
| 4 | `Check local service` wählen | Sidecar, Protokollversion und lokale `stdio`-Fähigkeit werden geprüft | Service ready oder error |
| 5 | `Show Claude Desktop steps` wählen | Versionsbezogene Konfigurationsschritte und Zielpfad erscheinen | Instructions |
| 6 | Konfiguration außerhalb Obsidian anwenden und zurückkehren | UI wartet nicht blind, sondern bietet aktiven Verbindungstest | Ready to test |
| 7 | `Test Claude Desktop connection` wählen | Read-only Handshake prüft Client, Vertrag und Vault-Scope | Testing |
| 8 | Erfolgreichen Test abschließen | Home zeigt `Claude Desktop connected` und Human-in-the-loop | Success |

**Abbruchpunkte:** `Save and exit setup` ist in jedem nicht laufenden Schritt verfügbar.
Validierte lokale Einstellungen bleiben erhalten. Abbruch löst keine Indexierung oder
Vault-Mutation aus.

## 3. Fehler- und Recovery-Flows

| Fehler | Erkennung | Verbindliche Reaktion | Recovery |
|---|---|---|---|
| Kein lesbarer Vault | Pfadvalidierung | Keine Dateien lesen oder ändern; Grund nennen | `Choose another folder` |
| Traversal/Symlink außerhalb Root | Normalisierung und Realpath-Prüfung | Zugriff blockieren; fremden Inhalt nicht anzeigen | `Review vault folder` |
| Sidecar fehlt | Service-Check | MCP- und Indexaktionen deaktivieren | `View local service setup` |
| Vertragsversion inkompatibel | Handshake | Kein Fallback auf unversionierte Nachrichten | `View compatibility details` |
| Claude Desktop nicht erkannt | Verbindungstest | Keine erfolgreiche Verbindung behaupten | `Review Claude Desktop steps` |
| Test-Timeout | Verbindungstest | Zustand bleibt `Not connected`; keine automatische Wiederholung | `Try again` |
| Client trennt während Test | Handshake | Test als fehlgeschlagen markieren; Vault unverändert | `Try again` |
| Unbekannter Client | Clientkennung | Nicht als Claude Desktop behandeln | `Use a supported client` |

## 4. View: Claude Desktop Setup

```text
┌─ Set up Second Brain ───────────────────────┐
│ Step 1  Vault                 Ready         │
│ Step 2  Local service         Ready         │
│ Step 3  Claude Desktop        Not connected │
├─────────────────────────────────────────────┤
│ Claude Desktop                              │
│ 1. Open the configuration location…         │
│ 2. Add the generated local server entry…    │
│ 3. Restart or reload Claude Desktop…         │
│                                             │
│ [Copy configuration] [Test connection]      │
├─────────────────────────────────────────────┤
│ [Save and exit setup]                       │
└─────────────────────────────────────────────┘
```

Die tatsächlich generierte Konfiguration wird getrennt von der Anleitung dargestellt,
maskiert keine Pfade und besitzt eine eigene `Copy configuration`-Aktion. Nach dem Kopieren
meldet die UI nur `Copied`, nicht `Connected`.

## 5. UI-Zustände

| State | Auslöser | Darstellung | Nutzeraktion |
|---|---|---|---|
| Initial/empty | Kein Setup begonnen | Zweck, lokale Datenhaltung und `Start setup` | Setup starten |
| Validating | Vault-/Service-Prüfung | Determinierter Textstatus; Controls für denselben Schritt gesperrt | Sicher abbrechen, falls unterstützt |
| Ready | Schritt erfolgreich geprüft | Text, Icon und Zeitpunkt; nicht nur Farbe | Nächster Schritt |
| Instructions | Claude-Schritte geöffnet | Nummerierte Anleitung plus generierte Konfiguration | Kopieren, testen |
| Testing/loading | Verbindungstest läuft | `Testing Claude Desktop connection…` via Live-Region | Keine Doppelübermittlung |
| Success | Handshake und Scope gültig | `Claude Desktop connected` plus Vertragsversion | Setup abschließen |
| Error | Prüfschritt fehlgeschlagen | Ursache, unveränderter Vault-Zustand und Recovery | Korrigieren, erneut testen |
| Offline | Sidecar nicht erreichbar | Nachfolgende Schritte deaktiviert mit Erklärung | Service-Setup öffnen |

## 6. Verbindliche Microcopy

| Kontext | Text |
|---|---|
| Titel | `Set up Second Brain` |
| Lokale Daten | `Your vault and index stay on this device.` |
| Vault-Erfolg | `Vault ready. No files were moved or changed.` |
| Vault-Fehler | `This folder is not a readable Obsidian vault. Choose another folder. No files were changed.` |
| Root-Verstoß | `This path leaves the vault you approved. Access was blocked.` |
| Sidecar fehlt | `The local service is not available. Set it up before connecting Claude Desktop.` |
| Anleitung öffnen | `Show Claude Desktop steps` |
| Konfiguration kopieren | `Copy configuration` |
| Kopierbestätigung | `Configuration copied. Claude Desktop is not connected yet.` |
| Test starten | `Test Claude Desktop connection` |
| Test läuft | `Testing Claude Desktop connection…` |
| Erfolg | `Claude Desktop connected with read-only setup access.` |
| Versionsfehler | `Claude Desktop and the local service use incompatible contract versions.` |
| Timeout | `Claude Desktop did not respond in time. Review the setup steps and try again.` |
| Kein API-Key | `Second Brain does not require an additional LLM API key for this connection.` |
| Andere Clients | `ChatGPT and Mistral are not included in this Sprint 1 setup.` |
| Abbruch | `Save and exit setup` |

## 7. Accessibility und Pane-Verhalten

- WCAG 2.2 AA; vollständige Tastaturbedienung ohne Drag-only-Schritte.
- Schrittstatus verwendet Text und Symbol zusätzlich zu Farbe.
- Fokus wechselt nach Fehlern auf die Fehlerüberschrift und nach Erfolg auf die
  Statusüberschrift des abgeschlossenen Schritts.
- Teststatus wird über eine zurückhaltende `aria-live`-Region angekündigt.
- Kopieren ist als beschrifteter Button verfügbar; Codeblock bleibt auswählbar.
- Bei 320–479 px werden Schritte untereinander gezeigt; Anleitung und Konfiguration
  werden nacheinander statt zweispaltig dargestellt.
- Bei 200 % Zoom gehen weder Recovery-Aktion noch Statusinformation verloren.
- Animationen sind nicht erforderlich; `prefers-reduced-motion` wird respektiert.

## 8. Abgrenzung zu anderen Clients

| Client | Darstellung in Sprint 1 |
|---|---|
| Claude Desktop | Vollständig interaktiv gemäß dieser Spezifikation |
| ChatGPT | Kein Setup-Control; nur sachlicher Hinweis `Not included in this Sprint 1 setup` |
| Mistral | Kein Setup-Control; nur sachlicher Hinweis `Not included in this Sprint 1 setup` |

Diese Darstellung macht den Produktscope nicht zu einem Won't-have. Sie verhindert lediglich,
dass nicht implementierte Kompatibilität als verfügbar erscheint.

## 9. Offene Fragen

Keine UX-BLOCKER für US-000011.

| # | Frage | Verantwortlich | Kritikalität | Status |
|---|---|---|---|---|
| 1 | Exakter, versionsabhängiger Claude-Desktop-Konfigurationspfad | BE/QA | MAJOR | Im Vertrag/Fixture zu ermitteln |
| 2 | DXT-Paket als späterer Distributionsweg | AR/PM | MINOR | Nicht Teil von Sprint 1 |

## 10. Definition-of-Done-Selbstprüfung

- [x] US-000011 explizit referenziert.
- [x] Primary Journey und Abbruchpunkte dokumentiert.
- [x] Empty, loading, success, error und offline beschrieben.
- [x] Acht konkrete Fehler-/Recovery-Flows dokumentiert.
- [x] Verbindliche englische Microcopy vollständig.
- [x] WCAG 2.2 AA und schmales Pane-Verhalten definiert.
- [x] ChatGPT und Mistral nicht fälschlich als verfügbar dargestellt.
- [x] Constitution und ADR-000001/ADR-000004 eingehalten.
- [x] `ux/INDEX.md` und Projekt-`INDEX.md` aktualisiert.
- [x] Stakeholder-Freigabe am 2026-07-30 erteilt; Status ist `APPROVED`.

---

## Übergabe: UX → Refinement

**Datum:** 2026-07-30  
**Von:** UX Designer (UX)  
**An:** Business Analyst, Frontend- und Backend-Agenten (BA, FE, BE)  
**Nächster Befehl:** `/refine second-brain 1`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| UX-000002 | APPROVED | `ux/UX-000002-claude-desktop-setup-slice.md` | Explizite UX-Abdeckung für US-000011 |
| UX-000001 | APPROVED | `ux/UX-000001-mvp-interaction-design.md` | Unveränderte übergreifende MVP-Spezifikation |

### Kritische Informationen für Empfänger

- SP-000001 soll US-000001 durch US-000011 ersetzen.
- Die Schätzung ist für den engeren Story-Schnitt neu zu bestätigen.
- ChatGPT und Mistral sind nicht als Sprint-1-fertig darzustellen.

### Offene Fragen (vererbt)

Keine BLOCKER-Frage für Refinement.

### Nicht-Ziele

Keine Änderung an UX-000001, keine Suche, Mutationen oder zusätzlichen Client-Flows.

### Empfehlungen

Die vorhandenen Setup-Subtasks können übernommen werden, müssen aber ausschließlich
US-000011 als abgeschlossene Story referenzieren.
