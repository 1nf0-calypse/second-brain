---
id: DECISIONS
title: Entscheidungsprotokoll — Second Brain
version: 1.2
status: ACTIVE
author-agent: PM (Product Manager)
date: 2026-07-30
project: second-brain
---

# Entscheidungsprotokoll: Second Brain

Leichtgewichtiges, chronologisches Protokoll aller wesentlichen Entscheidungen im Projektverlauf.

**Abgrenzung zu ADRs:** ADRs dokumentieren tiefe, technische Architekturentscheidungen vollständig mit Alternativen und Konsequenzen. Dieses Protokoll erfasst *alle* Entscheidungen — fachliche, prozessuale und kleinere technische — in kompakter Form. Neue Einträge werden *oben* eingefügt (neueste zuerst).

---

## Aktive Entscheidungen

### D-000007 — Nutzerbegriffe und Dokumentationsumfang für Sprint 2

**Datum:** 2026-07-31 | **Kategorie:** Dokumentation | **Status:** ACTIVE
Die Dokumentation verwendet **Volltextsuche**, **Quelle**, **Fundzeile**, **Textauszug** und
**nicht als Text lesbarer Anhang** als Nutzerbegriffe. Sie benennt die fehlende semantische
Suche und die noch notwendige lokale Plugin-Installation ausdrücklich. Ein veralteter
Claude-Desktop-Pfad wird durch Ersetzen ausschließlich des vorhandenen `second-brain`-Eintrags
behoben; andere Serverkonfigurationen bleiben unberührt.

### D-000006 — Nutzerbegriffe und Dokumentationsumfang für Sprint 1

**Datum:** 2026-07-31 | **Kategorie:** Dokumentation | **Status:** ACTIVE
Die Nutzerdokumentation verwendet die sichtbaren Produktbegriffe **Second Brain MCP**,
**lokaler Dienst** und **lokaler Index**. Sie dokumentiert ausschließlich die freigegebenen
Sprint-1-Funktionen für Claude Desktop und Indexierung; geplante Clients und Funktionen
werden als noch nicht enthalten gekennzeichnet. Der Plugin-Neustart nach Paket-Updates ist
ein verbindlicher Installationsschritt.

### D-000005 — MIT als Projektlizenz

**Datum:** 2026-07-30 | **Kategorie:** Lizenz | **Status:** ACTIVE  
Der Programmcode wird unter MIT veröffentlicht. Fremde MIT-Hinweise bleiben erhalten.

### D-000004 — Transparenter externer KI-Datenfluss

**Datum:** 2026-07-30 | **Kategorie:** Datenschutz | **Status:** ACTIVE  
Vault-Inhalte bleiben lokal dauerhaft gespeichert, dürfen aber für konkrete Anfragen an den
gewählten KI-Anbieter übertragen werden. Das Projekt betreibt keinen eigenen externen
Vault-Speicher.

### D-000003 — Drei Autonomiestufen

**Datum:** 2026-07-30 | **Kategorie:** Produkt/Sicherheit | **Status:** ACTIVE  
Human-in-the-Loop ist Standard. Human-on- und Human-out-of-the-Loop sind optional und werden
nur nach Warnhinweis und bewusster Bestätigung aktiviert.

### D-000002 — Plattformpriorität

**Datum:** 2026-07-30 | **Kategorie:** Scope | **Status:** ACTIVE  
Windows ist Must, Obsidian Mobile auf Android Should, macOS und Linux Could.

### D-000001 — MCP-first und Backend-first

**Datum:** 2026-07-30 | **Kategorie:** Produkt | **Status:** ACTIVE  
Der MCP-Zugriff ohne zusätzlichen LLM-API-Key und die Backend-Fähigkeiten werden vor der
vollständigen Frontend-Ausarbeitung priorisiert.

---

## Übersichtstabelle

| ID | Datum | Kategorie | Kurztitel | Agent | Status |
|----|-------|---------|---------|-------|--------|
| D-000007 | 2026-07-31 | Dokumentation | Nutzerbegriffe und Sprint-2-Umfang | MW | ACTIVE |
| D-000006 | 2026-07-31 | Dokumentation | Nutzerbegriffe und Sprint-1-Umfang | MW | ACTIVE |
| D-000005 | 2026-07-30 | Lizenz | MIT als Projektlizenz | PM | ACTIVE |
| D-000004 | 2026-07-30 | Datenschutz | Transparenter externer KI-Datenfluss | PM | ACTIVE |
| D-000003 | 2026-07-30 | Produkt/Sicherheit | Drei Autonomiestufen | PM | ACTIVE |
| D-000002 | 2026-07-30 | Scope | Plattformpriorität | PM | ACTIVE |
| D-000001 | 2026-07-30 | Produkt | MCP-first und Backend-first | PM | ACTIVE |

---

## Superseded / Overturned

Entscheidungen, die revidiert oder überschrieben wurden, bleiben hier sichtbar.

| ID | Datum | Kurztitel | Ersetzt durch | Grund |
|----|-------|---------|--------------|-------|
| _(leer)_ | | | | |

---

*Erstellt von: PM-Agent | Datum: 2026-07-30 | Letzte Aktualisierung: 2026-07-31*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.2 | 2026-07-31 | D-000007 zu Suche, Quellen und lokaler Installation ergänzt | MW |
| 1.1 | 2026-07-31 | D-000006 zu Terminologie und Dokumentationsumfang ergänzt | MW |
| 1.0 | 2026-07-30 | Initiale Version | PM |
