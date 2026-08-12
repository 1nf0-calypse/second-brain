---
id: UX-000003
title: Remote-Client-Setup und Datenfluss-Consent
version: 1.0
status: APPROVED
author-agent: UX (UX Designer)
date: 2026-08-12
project: second-brain
based-on: US-000001, US-000007, RM-000001, ADR-000006, CON-000001
supersedes: —
superseded-by: —
---

# UX-000003: Remote-Client-Setup und Datenfluss-Consent

## Scope

Diese Spezifikation ergänzt UX-000001 für Sprint 5. Sie gestaltet ausschließlich die
nutzerverwaltete Einrichtung von ChatGPT Business/Enterprise/Edu und Mistral Connector sowie
den einzelnen, minimierten Transfer. Claude Desktop bleibt unverändert lokal.

**Abgedeckte Stories:** US-000001 und US-000007  
**Accessibility:** WCAG 2.2 AA; alle Schritte sind tastaturbedienbar und besitzen sichtbaren
Fokus, programmgesteuerte Namen und Statusansagen.

## Informationsarchitektur

```text
Second Brain → Settings → MCP clients
  ├─ Claude Desktop (local · connected)
  ├─ ChatGPT (remote tunnel · setup / unavailable / connected)
  └─ Mistral (connector · setup / unavailable / connected)

Second Brain → External data review
  ├─ Provider and account prerequisites
  ├─ Exact purpose and requested operation
  ├─ Selected text excerpts and source IDs
  ├─ Excluded data statement
  └─ One-time confirm / cancel
```

## Journey 1: Remote-Client einrichten

| Schritt | Nutzeraktion | Systemreaktion | Zustand |
|---:|---|---|---|
| 1 | `Set up ChatGPT` oder `Set up Mistral` wählen | Produkt zeigt Transport, benötigten Plan, Nutzerverantwortung und ausgeschlossene Daten | Prerequisites |
| 2 | Voraussetzungen bestätigen | Für ChatGPT: nutzerverwaltete Tunnel-URL; für Mistral: Connector-URL. Keine Secret-Eingabe im Plugin. | Endpoint ready |
| 3 | `Test connection` wählen | Sidecar prüft nur Endpoint, authentifizierten Handshake, Tool-Manifest und erlaubte Scopes | Checking |
| 4 | Handshake besteht | Provider, Plan, überprüftes Datum und erlaubte Fähigkeiten werden angezeigt | Connected |
| 5 | Handshake scheitert oder Scopes sind breiter als erwartet | Verbindung bleibt deaktiviert; Diagnose nennt keine Secrets und bietet keine Umgehung | Unavailable |

**Abbruch:** `Cancel setup` speichert weder Endpoint noch Credential im Plugin.  
**Widerruf:** `Disconnect` widerruft die lokale Freigabe, löscht die lokale Endpoint-Referenz
und erklärt, dass Connector-/Tunnel-Credentials beim jeweiligen Nutzer-Workspace getrennt
widerrufen werden müssen.

## Journey 2: Externen Datenfluss einzeln bestätigen

| Schritt | Nutzeraktion | Systemreaktion | Zustand |
|---:|---|---|---|
| 1 | Ein Provider-Adapter fordert einen Transfer an | Sidecar erzeugt eine noch nicht ausführbare Consent-Vorschau | Review required |
| 2 | Nutzer prüft Provider, Zweck, Operation und Auszüge | Die Ansicht zeigt ausschließlich den tatsächlich zu übertragenden Text sowie pseudonymisierte Quellen-IDs | Payload review |
| 3 | Nutzer prüft Ausschlüsse | UI bestätigt: kein Vollvault, Index, Anhang, Pfad/Dateiname, Credential, Secret, Audit- oder Diagnosedatum | Data minimization |
| 4 | Nutzer aktiviert `I reviewed the exact data above` | Primäraktion wird aktiv; ohne Haken bleibt sie deaktiviert | Ready to confirm |
| 5 | `Allow this transfer once` wählen | Sidecar prüft den frischen Policy-/Hinweisstand und erzeugt eine inhaltsfreie Quittung | Sending |
| 6 | Transfer endet | Ergebnis zeigt Provider, Zeitpunkt, Quittungs-ID und `Disconnect provider`; der Inhalt wird nicht in der Quittung wiederholt | Complete / error |

**Abbruch:** `Cancel` verwirft die Vorschau und sendet nichts.  
**Veraltete Policy:** Hat sich Provider-Hinweis oder Payload geändert, ist die alte
Bestätigung ungültig; nur `Review updated data` oder `Cancel` bleibt verfügbar.

## UI-Zustände und Fehlerfälle

| Zustand | Sichtbarer Inhalt | Erlaubte Aktion |
|---|---|---|
| Local only | ChatGPT/Mistral als nicht eingerichtet; Claude lokal markiert | Setup starten |
| Plan unavailable | Exakte Plan-/Admin-Voraussetzung; keine Marketingbehauptung | Voraussetzungen prüfen |
| Credential required | Erklärung, dass Credential nur beim Provider hinterlegt wird | Provider-Setup öffnen, zurück |
| Scope mismatch | Erwartete und gefundene Tool-Scopes getrennt | Verbindung nicht aktivieren |
| Consent required | Vollständige Payload, Zweck und Ausschlüsse | Einmal erlauben, abbrechen |
| Consent stale | Grund der Ungültigkeit und aktualisierte Payload | Neu prüfen, abbrechen |
| Sending | Provider und Zeitpunkt; keine Doppelübermittlung | Abbruch nur vor Netzwerkstart |
| Error | Keine Erfolgssprache; Quittung nur bei tatsächlichem Versand | Details ohne Geheimnisse, erneut prüfen |
| Disconnected | Lokale Referenz entfernt; externe Widerrufshinweise | Setup starten |

## Verbindliche Microcopy

Alle sichtbaren Texte sind Englisch.

| Kontext | Text |
|---|---|
| ChatGPT Voraussetzungen | `ChatGPT requires a workspace-managed remote MCP connection. Your local server is not connected directly.` |
| Mistral Voraussetzungen | `Mistral uses a connector managed in your Mistral workspace. Second Brain never stores its credential.` |
| Datenminimierung | `Only the text and source IDs shown below can be sent. Your vault, index, attachments, file names, paths, secrets, audit log, and diagnostics are excluded.` |
| Sensible Inhalte | `Do not send personal or sensitive information. Second Brain cannot classify your text reliably.` |
| Einzelbestätigung | `I reviewed the exact data above.` |
| Primäraktion | `Allow this transfer once` |
| Abbruch | `Cancel — do not send data` |
| Veraltet | `This review is no longer valid because the data or provider policy changed.` |
| Erfolgszustand | `Transfer completed. Confirmation receipt {receiptId} contains no note content.` |
| Fehler | `Nothing was sent. Check the provider setup or review the data again.` |
| Widerruf | `Disconnect this provider` |

## Accessibility- und Interaktionsregeln

- Der Review-Dialog setzt den Fokus auf die Überschrift `Review external data`; Tastaturfokus
  folgt Provider → Zweck → Daten → Ausschlüsse → Checkbox → Aktionen.
- Auszüge stehen in einer lesbaren, selektierbaren Textregion; Quelle ist als technische,
  pseudonymisierte ID beschriftet, nicht allein über Farbe.
- Die Checkbox und die deaktivierte Primäraktion besitzen erklärende zugängliche Namen.
- `Sending`, `Complete`, `Error` und `Consent stale` werden über eine `aria-live`-Region
  angekündigt; der Fokus springt nicht während der Übertragung.
- Die Aktion zum Öffnen eines externen Provider-Setups nennt im zugänglichen Namen den
  Provider und weist auf das Verlassen von Second Brain hin.

## Nicht-Ziele

- Consumer-ChatGPT, automatische Datenklassifikation, dauerhafte Provider-Freigaben,
  Vollvault-Synchronisation und Credential-Eingabe/-Speicherung im Plugin.
- Ausführung von Schreibaktionen ohne die bestehende Human-in-the-Loop-Mutationsvorschau.

## Definition of Done

- [x] Alle fünf verpflichtenden Datenflussinformationen sind vor Freigabe sichtbar.
- [x] Payload-Änderung und Provider-Hinweiswechsel invalidieren die Bestätigung.
- [x] Setup-, Verbindungs-, Fehler- und Widerrufspfad sind definiert.
- [x] Englische Microcopy und WCAG-2.2-AA-Interaktion sind festgelegt.
- [x] Kein Flow widerspricht ADR-000006 oder Constitution-Abschnitten 2–4.

---

## Übergabe: UX → BA+FE+BE

**Datum:** 2026-08-12  
**Von:** UX Designer (UX)  
**An:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)  
**Nächster Befehl:** `/refine second-brain 5`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| UX-000003 | APPROVED | `ux/UX-000003-remote-client-consent.md` | Setup, Consent, Fehler- und Widerrufspfad für beide Adapter. |
| ADR-000006 | APPROVED | `architecture/ADR-000006-client-connectivity-and-external-data-flow.md` | Verbindliche technische und Datenflussgrenze. |

### Kritische Informationen für Empfänger

- Die Primäraktion bleibt bis zur Checkbox deaktiviert und darf nur einen Transfer freigeben.
- Beim Transfer darf weder der vollständige Vault noch ein Provider-Credential in UI, Logs
  oder Auditquittung erscheinen.

### Offene Fragen (vererbt)

Keine offenen BLOCKER- oder MAJOR-Fragen für das UX-Design.

---

*Erstellt von: UX-Agent | Datum: 2026-08-12 | Version: 1.0*
