---
id: SP-000006
title: Sprint 5 Backlog — Remote-Clients und Datenfluss-Consent
version: 1.0
status: APPROVED
author: BA+FE+BE
date: 2026-08-12
project: second-brain
sprint: 5
based-on: [REQ-000001, RM-000001, US-000001, US-000007, UX-000003, ADR-000001, ADR-000004, ADR-000006, CON-000001]
supersedes: —
superseded-by: —
---

# SP-000006: Sprint 5 — Remote-Clients und Datenfluss-Consent

## Sprint-Ziel

Nutzer können einen freigegebenen ChatGPT-Remote-/Tunnelpfad oder einen Mistral-Connector
einrichten und jeden minimierten externen Datenfluss sichtbar prüfen und einmalig bestätigen.
Ohne gültige Bestätigung darf kein Provideraufruf erfolgen.

**Zeitraum:** 2026-08-12 bis 2026-08-26 (14 Tage)  
**Kapazität:** 26 SP — Produktumfang 21 SP, verpflichtende Sicherheits- und
Kompatibilitätsqualität 5 SP.

## Verbindlicher Backlog

| Story | Arbeitspaket | Zuständigkeit | SP | Akzeptanzbeleg |
|---|---|---:|---:|---|
| US-000001 | Versionierte Endpoint-, Handshake- und Manifest-Verträge bereitstellen. | BE | 2 | Vertrags- und Negativtests |
| US-000001 | `ProviderAdapter`-Port und allowlisteten ChatGPT-Remote-/Tunneladapter implementieren. | BE | 3 | Kein anderer Produktpfad eröffnet Netzwerkzugriff |
| US-000001 | Mistral-Connector-URL anbinden; Credentials weder lesen noch speichern. | BE | 2 | Credential-freier Contract-Test |
| US-000001 | Handshake mit Plan, Scope, Diagnose und Disconnect implementieren. | BE | 2 | Erfolgs-, Scope-Fehler- und Disconnect-Test |
| US-000001 | Native Einstellungen für Voraussetzungen, Endpoint-Test, Scope-Abweichung und Trennen umsetzen. | FE | 3 | Headed E2E beider Setup-Pfade |
| US-000001 | Status- und Fehlerzustände per Tastatur und Screenreader zugänglich machen. | FE | 1 | Fokus- und ARIA-Test |
| US-000007 | Provider-Registry mit Quelle, Prüfdatum und zulässigen Datenkategorien führen. | BE | 2 | Schema- und Ablaufdatumstest |
| US-000007 | Prepare-/Confirm-Contract mit Payload-Hash, Policy-Version und Einmal-Token implementieren. | BE | 2 | Bindungs- und Replay-Test |
| US-000007 | Serverseitige Payload-Allowlist und Netzwerk-Gate im `ProviderAdapter` erzwingen. | BE | 2 | Ausgeschlossene Daten bleiben nachweislich ausgehend leer |
| US-000007 | Inhaltsfreie Quittung, Staleness-Prüfung und Widerruf implementieren. | BE | 1 | Stale-/Revoke-Test |
| US-000007 | Review-Dialog mit sichtbarem Payload, Checkbox, Einmalbestätigung, Fehler und Widerruf umsetzen. | FE | 1 | Headed E2E und Screenshot |
| Q5-001 | Threat-Model und Negativmatrix für Endpoint, Scope, Payload und Consent ausführen. | BA+BE | 2 | Dokumentierter PASS je Negativfall |
| Q5-002 | Consent-, Payload-Minimierungs- und Netzwerk-Contract-Tests ergänzen. | BE | 2 | Automatisierte Regression |
| Q5-003 | Headed Playwright-Test für Tastatur, Fokus und Einmalbestätigung ergänzen. | FE | 1 | Versionierter E2E-Report |

## Voraussetzungen und Schnittstellen

| Voraussetzung | Status | Umgang im Sprint |
|---|---|---|
| RM-000001, ADR-000006 und UX-000003 | APPROVED | Verbindliche fachliche, technische und UX-Grenze |
| Bestehende Claude-Desktop-Regression | verfügbar | Darf durch Adapter-Änderungen nicht regressieren |
| ChatGPT Business/Enterprise/Edu mit durch Admin aktivierter Developer Mode | extern | Erforderlich für reale ChatGPT-E2E-Abnahme, nicht für lokale Contract-/UI-Tests |
| Nutzerverwalteter ChatGPT-Tunnel und Mistral-Connector-Endpoint | extern | Vor realer Verbindung durch Nutzer einzurichten |
| Aktuelle Providerquelle und Prüfdatum | geplant | Registry verweigert abgelaufene oder fehlende Freigaben |

## Nicht-Ziele und Sicherheitsgrenzen

- Keine Consumer-ChatGPT-Pläne, keine automatische Tunnelbereitstellung und keine
  Speicherung oder Übertragung von Credentials durch Produktcode.
- Kein Vollvault, Index, Anhang/Binärdaten, Dateiname/-pfad, Geheimnis, Audit-/Diagnosedaten
  oder sensibler Inhalt im Providerpayload.
- Erlaubt sind ausschließlich einzeln bestätigte, minimale Textexzerpte samt Zweck,
  Operation, Datenkategorie und pseudonymer Quell-ID.
- Nur `ProviderAdapter` darf Netzwerkaufrufe ausführen; jede Änderung an Provider, Zweck,
  Operation, Kategorie, Payload-Hash oder Policy-Version macht die Einmalbestätigung ungültig.

## Definition of Ready

| Kriterium | Ergebnis |
|---|---|
| Story, Priorität und Abnahmekriterien eindeutig | PASS — US-000001 und US-000007 |
| Datenfluss- und Credential-Grenze entschieden | PASS — ADR-000006 |
| Setup, Consent, Fehler und Widerruf spezifiziert | PASS — UX-000003 |
| Abhängigkeiten, Risiken und externe Vorbedingungen sichtbar | PASS — Tabelle oben |
| Aufwand geschätzt und Sprintziel kapazitiv plausibel | PASS — 26 SP |

## Qualitäts- und Abnahmekriterien

1. Handshake zeigt nur erwarteten Endpoint und Scope; Scope-Mismatch, Netzwerkfehler und
   Disconnect bleiben verständlich und ohne Geheimnisse diagnostizierbar.
2. Vor `Confirm` wird der tatsächlich übertragene Minimalpayload samt Provider, Zweck,
   Operation und Kategorien angezeigt; `Confirm` bindet exakt dessen Hash und Policy-Version.
3. Ohne gültiges Einmal-Token, nach Payloadänderung, nach Ablauf oder nach Widerruf ist der
   Aufruf gesperrt. Die Quittung enthält keinen Inhalt.
4. Tests beweisen, dass ausgeschlossene Datenkategorien den `ProviderAdapter` nicht verlassen
   und kein anderer Modulpfad Netzwerkzugriff besitzt.
5. Die zwei Setup-Pfade und der Consent-/Widerrufspfad bestehen headed, per Tastatur und mit
   prüfbaren Fokus- sowie ARIA-Zuständen.

## Risiken und Entscheidungen

| Risiko | Wirkung | Maßnahme | Status |
|---|---|---|---|
| Externe Arbeitsbereichs- oder Adminvoraussetzung fehlt | Reale Provider-E2E verzögert | Verträge, Negativtests und UI lokal abschließen; reale Abnahme als externe Voraussetzung markieren | offen, nicht blockierend |
| Provider-/Policy-Änderung | Unzulässige Übertragung | Quelle und Prüfdatum registry-gebunden prüfen; bei Unklarheit sperren | mitigiert |
| Consent driftet vom gesendeten Payload ab | Sicherheitsverletzung | Payload-Hash und Policy-Version serverseitig binden | mitigiert |

## Roadmap-Abgleich

RM-000001 plante für US-000001 und US-000007 21 SP. Die verbindlichen Sicherheits-,
Negativ- und Accessibility-Abnahmen ergänzen 5 SP; der aktualisierte Sprintumfang beträgt
damit 26 SP und ist als Ist-Abweichung in RM-000001 dokumentiert.

## Definition of Done

- [x] Zwei priorisierte Stories samt vollständigen Arbeitspaketen und Schätzung geplant.
- [x] Sicherheitsgrenzen, Datenkategorien, Consent-Bindung und externe Vorbedingungen konkret.
- [x] Automatisierte Contract-/Negativtests und headed E2E-Abnahme eingeplant.
- [x] Abhängigkeiten, Risiken, Nicht-Ziele und Roadmap-Abweichung dokumentiert.
- [x] Sprint-Index, Root-Index und Projektboard-Übergang vorbereitet.

## Handoff

**Status:** APPROVED — Gate 5.5 bestanden; Implementierung im Sprint-5-Worktree.
**Nächster Command:** `/implement all second-brain`

