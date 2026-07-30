---
id: CON-000001
title: Projekt-Constitution — Second Brain
version: 1.0
status: APPROVED
author-agent: PM (Product Manager)
date: 2026-07-30
project: second-brain
based-on: SB-000001
supersedes: —
superseded-by: —
---

# Projekt-Constitution: Second Brain

> **Ablage:** `projects/second-brain/discovery/CON-000001-second-brain.md`

---

## 1. Zweck dieses Dokuments

Diese Constitution legt fest, was in diesem Projekt **nicht zur Debatte steht**. Sie enthält
keine Tech-Stack-Entscheidung und keine Feature-Priorisierung. Ab Status `APPROVED` ist sie
für alle Folgephasen bindend.

---

## 2. Nicht verhandelbare Prinzipien

| # | Prinzip | Begründung |
|---|---|---|
| 1 | Human-in-the-Loop ist der Standard für jede Mutation; Human-on- und Human-out-of-the-Loop werden nur nach expliziter Warnung und bewusster Bestätigung aktiviert. | Schreibzugriff ist Kernnutzen, darf aber nicht unbemerkt Daten verändern. |
| 2 | MCP darf ausschließlich klar definierte, berechtigte Vault-/Plugin-Funktionen ausführen; beliebige Shell-, Prozess- oder Codeausführung ist ausgeschlossen. | Eine Prompt Injection darf nicht vom Wissenszugriff zur vollständigen Systemkompromittierung eskalieren. |
| 3 | Vault-Inhalte und Projektindizes werden durch das Produkt ausschließlich lokal dauerhaft gespeichert. Externe Übertragung erfolgt nur an einen bewusst gewählten KI-Anbieter und wird vorher transparent gemacht. | Private Projektdaten sollen nicht in einer eigenen externen Infrastruktur dupliziert werden. |
| 4 | Bestehende Vaults bleiben ohne erzwungene Migration und ohne Verlust ihrer Originaldateien nutzbar. | Das Plugin ergänzt Obsidian und darf den bestehenden Wissensbestand nicht vereinnahmen. |
| 5 | Daten und Konfigurationen ab MVP bleiben für spätere Versionen lesbar oder werden verlustfrei migriert. | Der perfekte Launch verlangt dauerhafte Rückwärtskompatibilität und schützt den investierten Wissensbestand. |
| 6 | MCP-first-Nutzung funktioniert ohne zusätzlichen LLM-API-Key im Plugin; direkte API-Keys bleiben optional. | Das Produkt soll bestehende KI-Abonnements und Client-Verbindungen nutzen, ohne Anbieter-Authentifizierung zu umgehen. |
| 7 | Das Projekt ist Open Source unter MIT; übernommene Lizenz- und Urheberhinweise bleiben erhalten. | Offenheit und kompatible Wiederverwendung sind ausdrückliche Stakeholder-Vorgaben. |

---

## 3. Qualitäts-Mindeststandards

| Dimension | Mindeststandard | Prüfmethode |
|---|---|---|
| Datenintegrität | 0 verlorene oder stillschweigend überschriebene Originaldateien in allen unterstützten Test-Vault-Szenarien | Automatisierte Integrations- und Wiederherstellungstests |
| Human-in-the-Loop | 100 % der Schreib- und Löschoperationen verlangen vor Ausführung eine explizite Bestätigung | MCP-/UI-Sicherheitstests |
| Automatische Mutationen | 100 % der Human-on/out-of-the-Loop-Mutationen sind detailliert versioniert, verständlich zusammengefasst und einzeln rücksetzbar | Audit-Log- und Rollback-Tests |
| Prompt-Injection-Schutz | 0 unerlaubte Aktionen und 0 Offenlegungen außerhalb des freigegebenen Vault-Kontexts im versionierten Injection-Regressionsset | Security-Testset in jedem Release |
| Berechtigungsgrenzen | Keine MCP-Funktion bietet beliebige Shell-, Prozess- oder Codeausführung; jede Funktion hat dokumentierten Lese-/Schreib-Scope | API-Vertragsprüfung und Code Review |
| Datenschutztransparenz | Vor erstem externen Datenfluss und vor Wechsel weg von Human-in-the-Loop erscheint ein konkreter Warnhinweis mit bewusster Bestätigung | UI-/E2E-Test |
| Rückwärtskompatibilität | 100 % der unterstützten früheren Daten- und Konfigurations-Fixtures sind direkt lesbar oder verlustfrei migrierbar | Versionsmatrix und Migrationstests |
| Plattform | Alle MVP-Abnahmetests bestehen unter Windows; Android-Abnahmetests sind Voraussetzung für die Freigabe der Mobile-Funktion | Plattform-CI plus manueller Plugin-Test |
| Wiederkehrende Kosten | Kernfunktionen verursachen keine projektseitigen laufenden Dienstkosten; kostenpflichtige direkte LLM-APIs sind optional | Architektur- und Release-Review |

---

## 4. Harte Ausschlüsse / Verbotene Praktiken

- Keine beliebige Shell-, Prozess- oder Codeausführung über MCP.
- Keine Umgehung von Anmeldung, Abonnement, API-Schutz oder Nutzungsbedingungen eines
  KI-Anbieters.
- Keine dauerhafte Speicherung von Vault-Inhalten auf einer vom Projekt betriebenen
  externen Infrastruktur.
- Keine stillen Schreib- oder Löschoperationen im Human-in-the-Loop-Modus.
- Keine automatische Mutation ohne versioniertes Protokoll und prüfbaren Rollback.
- Keine Aktivierung von Human-on/out-of-the-Loop ohne expliziten Warnhinweis und Bestätigung.
- Keine erzwungene proprietäre Vault-Migration.
- Keine rückwärtsinkompatible Daten- oder Konfigurationsänderung ohne verlustfreie Migration.
- Keine Entfernung fremder MIT-Copyright- oder Lizenzhinweise.

---

## 5. Geltungsbereich

Diese Constitution gilt für das gesamte Projekt `second-brain` über alle Sprints hinweg. Sie
hat Vorrang vor Bequemlichkeits- oder Geschwindigkeitsargumenten einzelner Agenten und vor
abweichenden Aussagen in späteren Artefakten, solange der Nutzer keine dokumentierte Ausnahme
freigibt.

---

## 6. Änderungsverfahren

1. Änderungsvorschlag mit Begründung dokumentieren.
2. Explizite Nutzer-Freigabe einholen.
3. Major-Version erhöhen.
4. Änderung in `DECISIONS.md` protokollieren.
5. Betroffene Agenten und Artefakte im nächsten Handoff benennen.

---

## 7. Konfliktregel

Bei einem Konflikt mit dieser Constitution:

1. Konflikt weder stillschweigend korrigieren noch ignorieren.
2. Als offene Frage mit Kritikalität `BLOCKER` dokumentieren.
3. An PM eskalieren; nur PM kann mit Nutzer-Freigabe eine Ausnahme oder Änderung umsetzen.
4. Nicht betroffene Arbeit fortsetzen.

---

## Übergabe: PM → BA

**Datum:** 2026-07-30  
**Von:** Product Manager (PM)  
**An:** Business Analyst (BA)  
**Nächster Befehl:** `/ba second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| CON-000001 | APPROVED | `projects/second-brain/discovery/CON-000001-second-brain.md` | Für alle Folgephasen bindend |
| SB-000001 | APPROVED | `projects/second-brain/discovery/SB-000001-second-brain.md` | Produktumfang, MVP, Priorisierung und Risiken |

### Kritische Informationen für Empfänger

- Sicherheitsgrenzen gelten in allen drei Autonomiestufen.
- Produktweiter MoSCoW-Scope und MVP sind getrennt.
- Datenübertragung an gewählte KI-Anbieter ist zulässig, eigene externe Persistenz nicht.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Client-Versionen und MCP-Transportarten | SB-000001 §9 | MAJOR | Architect / Stakeholder |
| 2 | Anbieterbezogene Datenschutzhinweise | SB-000001 §9 | MAJOR | BA / PM |

### Nicht-Ziele (explizit ausgeschlossen)

- Diese Constitution entscheidet keinen Tech-Stack.
- Diese Constitution priorisiert keine Features.

### Empfehlungen

- Akzeptanzkriterien für Berechtigungsgrenzen, Moduswechsel, Rollback und Datenfluss zuerst
  präzisieren.

---

*Erstellt von: PM-Agent | Datum: 2026-07-30 | Version: 1.0*
*Ablage: projects/second-brain/discovery/CON-000001-second-brain.md*

---

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-30 | Initiale, vom Stakeholder im Interview freigegebene Version | PM |
