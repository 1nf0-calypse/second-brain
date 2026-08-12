---
id: ADR-000006
title: Client-Konnektivität und externer Datenfluss
version: 1.0
status: APPROVED
author-agent: AR (Software Architect)
date: 2026-08-12
project: second-brain
based-on: REQ-000001 F-002, F-018–F-021; US-000001; US-000007; RM-000001; ADR-000001; ADR-000004; CON-000001
supersedes: —
superseded-by: —
---

# ADR-000006: Client-Konnektivität und externer Datenfluss

## Status

`APPROVED` — Stakeholder-Freigabe für einen nutzerverwalteten ChatGPT-Remote-/Tunnelpfad,
einen Mistral-Connector mit nutzerverwaltetem Credential-Modell und den unten begrenzten
externen Datenfluss am 2026-08-12.

## Kontext

US-000001 fordert MCP-Verbindungen für Claude, ChatGPT und Mistral ohne zusätzlichen
LLM-API-Key. US-000007 verlangt vor jedem externen Datenfluss einen konkreten,
bestätigbaren Hinweis. Die Constitution verlangt zugleich lokale dauerhafte Speicherung,
keine Authentifizierungsumgehung und MCP-first ohne Plugin-LLM-Key.

Der bestehende Sidecar implementiert einen lokalen `stdio`-MCP-Server für Claude Desktop.
Für Sprint 5 wurde die Client-Matrix erneut gegen aktuelle Primärdokumentation geprüft:

- Claude unterstützt lokale `stdio`-Server; die Dokumentation beschreibt lokale Prozesse
  ausdrücklich als passende Option für systemnahen Zugriff.
  Quelle: https://docs.anthropic.com/en/docs/mcp
- ChatGPT kann lokale MCP-Server nicht direkt verbinden. Für private/on-premises Endpunkte
  ist ein Secure MCP Tunnel erforderlich; Custom Apps mit Schreibaktionen sind zudem an
  Workspace- und Admin-Voraussetzungen gebunden.
  Quelle: https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta
- Mistral Connectors registrieren MCP-Server mit URL und verwenden Connector-berechtigte
  API-Keys; sie werden serverseitig ausgeführt. Mistral Vibe unterstützt zwar lokale
  `stdio`-Server, ist aber nicht als Le-Chat-Connector ohne Credential dokumentiert.
  Quellen: https://docs.mistral.ai/studio-api/connectors und
  https://docs.mistral.ai/vibe/code/cli/mcp-servers
- Für ChatGPT Business, Enterprise und Edu verwendet OpenAI Geschäftsdaten standardmäßig
  nicht zum Modelltraining; diese Aussage gilt nicht pauschal für individuelle Konten.
  Quelle: https://openai.com/business-data/

## Entscheidung

**Sprint 5 ergänzt zwei nutzerverwaltete Adapter, ohne eine projektbetriebene externe
Vault-Persistenz oder ein Plugin-Provider-Credential einzuführen:**

1. **ChatGPT:** Ein Remote-/Tunneladapter verbindet ausschließlich den lokalen Sidecar mit
   der von ChatGPT geforderten Remote-MCP-URL. Der Tunnel wird vom Nutzer bzw. dessen
   Workspace verwaltet; er veröffentlicht keine generische Dateisystem- oder
   Prozessfähigkeit. Zielplattform ist ChatGPT Business, Enterprise oder Edu mit den jeweils
   erforderlichen Admin-/Developer-Mode-Freigaben.
2. **Mistral:** Ein Mistral Connector verweist auf einen vom Nutzer verwalteten
   Remote-MCP-Endpunkt. Connector-Credentials werden nur beim Nutzer bzw. im Mistral-
   Workspace hinterlegt; Plugin und Sidecar speichern, lesen oder protokollieren sie nicht.
3. **Datenfluss:** Extern gehen nur nach einer einzelnen, sichtbaren Bestätigung: der
   gewählte Provider, der angegebene Zweck, die angefragte MCP-Operation, explizit
   ausgewählte Textauszüge und pseudonymisierte Quellen-IDs. Vollständige Vaults,
   Suchindizes, Anhänge/Binärdateien, Dateinamen oder Pfade, Credentials, Session-Secrets,
   Auditdaten und Diagnoselogs sind ausgeschlossen. Personenbezogene oder besonders
   schützenswerte Inhalte sind standardmäßig gesperrt; eine automatische Klassifikation wird
   nicht behauptet, deshalb bestätigt der Nutzer den sichtbaren Auszug vor jedem Transfer.

Der Sidecar vermittelt und erzwingt diesen Consent für jeden ausgehenden Adapter-Aufruf. Die
Quittung enthält Provider, Zweck, Datenkategorien, Quellen-IDs, Hinweis-/Policy-Version,
Zeitpunkt und Widerruf. Sie enthält niemals den übertragenen Inhalt selbst.

## Begründung

Eine lokale `stdio`-Verbindung bleibt die sicherste Basis. Die ausdrücklich freigegebenen
Remote-Adapter erweitern sie kontrolliert: Der Sidecar ist die einzige Stelle, die den
minimalen, bestätigten Payload an den Adapter übergibt. Dadurch ist Consent technisch
erzwingbar statt nur eine UI-Zusage. Die Grenzen entsprechen Constitution §2/§3/§6: keine
eigene externe Persistenz, keine Umgehung von Anbieteranmeldung und kein Plugin-LLM-Key.

Die Provider-Registry startet mit `ChatGPT Business/Enterprise/Edu` und `Mistral Connector`
als Produktnamen. Sie speichert nur geprüfte Hinweistexte, Quellen-URL und Prüfdatum. Für
ChatGPT-Businessdaten gilt laut OpenAI standardmäßig kein Modelltraining; für individuelle
ChatGPT-Konten und für Mistral darf dies nicht verallgemeinert werden. Der Consent zeigt
daher stets den konkreten Provider-Hinweis, Plan und das Prüfdatum, statt eine pauschale
Aufbewahrungszusage zu behaupten.

## Betrachtete Alternativen

### Lokaler `stdio`-Client (Claude Desktop) — ✓ Gewählt und bereits aktiv

**Vorteile:**

- Keine externe Produktpersistenz oder öffentliche Exponierung.
- Kein zusätzlicher Plugin-LLM-Key; bestehende Client-Anmeldung bleibt maßgeblich.

**Trade-off:**

- Erfüllt nicht die noch offenen ChatGPT- und Mistral-Anteile von US-000001.

### Öffentlicher oder getunnelter ChatGPT-MCP-Endpoint — ✓ Gewählt, nutzerverwaltet

**Vorteile:**

- Ermöglicht die von ChatGPT verlangte Remote-Konnektivität.

**Nachteile / akzeptierte Trade-offs:**

- Neue Netzwerk- und Angriffsgrenze, Workspace-/Admin-Abhängigkeit und Betriebspflichten.
- Erfordert Workspace-Admin-Freigabe, nachvollziehbare Tunnel-Konfiguration und pro
  Nutzer eine echte Kompatibilitätsabnahme.

### Verwalteter Mistral Connector — ✓ Gewählt, Credential beim Nutzer

**Vorteile:**

- Mistrals Connector-Modell kann Remote-MCP-Werkzeuge in Conversations und Agents nutzbar machen.

**Nachteile / akzeptierte Trade-offs:**

- Credential-Rotation und Workspace-Berechtigungen liegen beim Nutzer; das Produkt darf
  weder das Secret anfordern noch persistieren.

## Konsequenzen

### Positiv

- Kein stiller externer Vault-Datenfluss: jeder Adapter-Aufruf erhält eine frische,
  inhaltsfreie Consent-Quittung.
- Die bestehende Claude-Integration bleibt unverändert und testbar.
- Die Providergrenze ist als eigener Port testbar und verhindert einen direkten
  Netzwerkzugriff aus MCP- oder UI-Adaptern.

### Negativ / Trade-offs

- ChatGPT-Funktion hängt von Business/Enterprise/Edu, Admin-Freigabe und einem
  nutzerverwalteten Tunnel ab; eine Consumer-Unterstützung wird nicht zugesichert.
- Mistral-Funktion hängt von einem nutzerverwalteten Connector-Credential ab.
- Provider-Hinweise müssen vor jedem Release gegen ihre primären Quellen erneut geprüft
  werden; sie sind keine dauerhafte Garantie für Aufbewahrung oder Datenresidenz.

### Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigationsstrategie |
|---|---|---|---|
| Remote-Client wird als lokale Unterstützung vermarktet | Mittel | Hoch | Unterstützte Matrix ausschließlich aus dieser ADR und Tests ableiten. |
| Tunnel exponiert Vault-Daten oder Tools zu breit | Mittel | Hoch | Nur bestätigte Adapter-Operationen, kurzlebige Tunnel-Session, AuthN/AuthZ und Client-E2E. |
| Consent beschreibt unbekannte Provider-Aufbewahrung falsch | Mittel | Hoch | Kein Transfer ohne versionierte Provider-Registry mit Quelle und Prüfdatum. |
| Plan-/Admin-Voraussetzungen verhindern ChatGPT-Einsatz | Hoch | Mittel | Vor Feature-Commit echte Client-/Workspace-Compatibility-Prüfung durchführen. |

## Reversibilität

- [x] **Reversibel** — Eine später freigegebene Remote-Bridge wird als neuer Adapter hinter
  `providers` und einem neuen ADR ergänzt; der lokale `stdio`-Pfad bleibt unverändert.

## Implementierungshinweise

- Definiere einen `ProviderAdapter`-Port; allein dieses Modul darf nach erfolgreichem
  Consent Netzwerkverkehr auslösen. MCP-Gateway, UI und Retrieval erhalten keinen direkten
  Providerzugriff.
- Keine ChatGPT- oder Mistral-Einrichtung als „verbunden“ anzeigen, solange die konkrete
  Plan-/Transport-/Berechtigungs-Kombination einen echten Handshake bestanden hat.
- Jeder künftige vermittelte Provider-Aufruf muss eine versionierte Consent-Quittung mit
  Provider, Zweck, Datenkategorien, Policy-/Hinweis-Version, Zeitpunkt und Widerrufspfad
  erzeugen; der Sidecar erzwingt sie vor Netzwerkzugriff.
- Kein Client-Adapter darf Shell-, Prozess- oder generische Netzwerkfähigkeit als MCP-Tool
  exponieren. Vault-Inhalt und Provider-Antwort bleiben tainted data.
- Für einen Remote-Pfad sind neben Unit-/Integrationstests ein Threat Model und ein echter
  Client-E2E-Test pro unterstützter Plan-/Transportkombination Pflicht.

## Abhängige ADRs

| ADR | Beziehung |
|---|---|
| ADR-000001 | Bestehender lokaler MCP-Transport; Remote HTTP nur nach Kompatibilitätsprüfung. |
| ADR-000002 | Ein späterer Adapter bleibt im `providers`-Modul hinter einem Port. |
| ADR-000004 | Policy und Consent werden serverseitig erzwungen, sofern das Produkt den Transfer ausführt. |

## Code-Referenzen

| Pfad | Einordnung |
|---|---|
| `apps/sidecar/src/mcp-gateway/server.ts` | Bestehender lokaler `stdio`-MCP-Server. |
| `apps/sidecar/src/bootstrap/setup-service.ts` | Lokale Setup-/Konfigurationsausgabe. |
| `apps/obsidian-plugin/src/ui/setup-view.ts` | Kennzeichnet ChatGPT und Mistral derzeit korrekt als nicht enthalten. |

---

## Übergabe: AR → UX/BA+FE+BE

**Datum:** 2026-08-12  
**Von:** Software Architect (AR)  
**An:** UX Designer sowie Business Analyst, Frontend Developer und Backend Developer (UX/BA+FE+BE)  
**Nächster Befehl:** `/ux second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| ADR-000006 | APPROVED | `architecture/ADR-000006-client-connectivity-and-external-data-flow.md` | Verbindliche Adapter-, Consent- und Datenflussgrenze für Sprint 5. |
| RM-000001 | APPROVED | `requirements/RM-000001-roadmap.md` | Vorausplanung mit explizit freigegebenem Sprint-5-Scope. |

### Offene Fragen (vererbt)

Keine offene BLOCKER- oder MAJOR-Frage für die Architektur. Die konkreten kompatiblen
Client-Versionen und Provider-Hinweise werden als testbare Sprint-5-Matrix gepflegt.

### Nicht-Ziele

- Keine Consumer-ChatGPT-Unterstützung, keine Vollvault-Übertragung, keine automatische
  Datenklassifikation und keine Speicherung von Provider-Credentials im Produkt.

---

*Erstellt von: AR-Agent | Datum: 2026-08-12 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-12 | Client-/Transportanalyse und Consent-Grenze für Sprint 5 | AR |
