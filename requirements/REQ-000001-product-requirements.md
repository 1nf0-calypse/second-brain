---
id: REQ-000001
title: Second Brain Product Requirements
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-30
project: second-brain
based-on: SB-000001, CON-000001
supersedes: —
superseded-by: —
---

# Requirements: Second Brain

## 1. Funktionale Anforderungen

### 1.1 Installation und Client-Anbindung

| ID | Anforderung | Priorität | US-Referenz |
|---|---|---|---|
| F-001 | Das Produkt muss als Obsidian-Plugin manuell installierbar und mit einer englischen Einrichtungsoberfläche konfigurierbar sein. | Must | US-000001 |
| F-002 | Das Produkt muss MCP-Verbindungen für Claude, ChatGPT und Mistral ohne zusätzlichen LLM-API-Key im Plugin ermöglichen; Client-Anmeldung oder Abonnement werden nicht umgangen. | Must | US-000001 |
| F-003 | Das Produkt soll bestehende Vaults erkennen und ohne erzwungene Migration zur Auswahl anbieten. | Should | US-000001 |

### 1.2 Lesen, Suche und Quellen

| ID | Anforderung | Priorität | US-Referenz |
|---|---|---|---|
| F-004 | Berechtigte MCP-Clients müssen Notizen, Ordner, Properties, Tags, Wiki-Links und Backlinks innerhalb des freigegebenen Vault-Kontexts lesen können. | Must | US-000002 |
| F-005 | Nutzer müssen Volltext- und semantische Suche über den lokalen Index ausführen können. | Must | US-000002 |
| F-006 | Such- und RAG-Ergebnisse sollen nachvollziehbare Quellenverweise auf Vault-Artefakte enthalten. | Should | US-000002 |
| F-007 | PDF-, Bild- und Anhangsinhalte sollen, soweit extrahierbar, auffindbar sein; nicht extrahierbare Inhalte werden erkennbar ausgewiesen. | Should | US-000002 |

### 1.3 Kontrollierte Mutationen

| ID | Anforderung | Priorität | US-Referenz |
|---|---|---|---|
| F-008 | Berechtigte MCP-Werkzeuge müssen Notizen, Properties und Beziehungen erstellen und ändern können; Löschungen sind gesondert kenntlich zu machen. | Must | US-000003 |
| F-009 | Human-in-the-Loop muss Standard sein und jede Mutation vor Ausführung mit verständlicher Vorschau explizit bestätigen lassen. | Must | US-000003 |
| F-010 | Human-on- und Human-out-of-the-Loop dürfen nur nach konkreter Warnung und bewusster Bestätigung aktiviert werden. | Must | US-000003 |
| F-011 | Jede automatische Mutation muss versioniert, verständlich protokolliert und einzeln rücksetzbar sein. | Must | US-000003 |
| F-012 | Das Produkt soll Export, Backup und Wiederherstellung des relevanten lokalen Zustands unterstützen. | Should | US-000003 |

### 1.4 Knowledge Graph und Exploration

| ID | Anforderung | Priorität | US-Referenz |
|---|---|---|---|
| F-013 | Das Produkt muss einen Knowledge Graph aus Wiki-Links, Backlinks, Tags, Properties und explizit erkannten Beziehungen bereitstellen. | Must | US-000004 |
| F-014 | Das Produkt soll einen visuellen Graphen, Wiki-Browser und globale Suche in Obsidian bereitstellen. | Should | US-000004 |

### 1.5 Indexierung und Wissenskompilierung

| ID | Anforderung | Priorität | US-Referenz |
|---|---|---|---|
| F-015 | Der lokale Index muss initial und danach inkrementell aktualisiert werden, ohne unveränderte Inhalte unnötig vollständig neu zu verarbeiten. | Must | US-000005 |
| F-016 | Nutzer müssen unstrukturierte Notizen kontrolliert in verknüpfte Wissensseiten überführen können. | Must | US-000006 |
| F-017 | Prompts und Vorlagen für die Wissenskompilierung müssen projektbezogen anpassbar sein. | Must | US-000006 |

### 1.6 Sicherheit und Datenschutz

| ID | Anforderung | Priorität | US-Referenz |
|---|---|---|---|
| F-018 | Vault-Inhalte sind als nicht vertrauenswürdige Daten zu behandeln und dürfen weder Berechtigungen erweitern noch Werkzeuganweisungen oder Systemaktionen auslösen. | Must | US-000007 |
| F-019 | MCP darf ausschließlich dokumentierte Vault-/Plugin-Funktionen mit explizitem Lese-/Schreib-Scope anbieten; Shell-, Prozess- und Codeausführung sind ausgeschlossen. | Must | US-000007 |
| F-020 | Vor dem ersten externen Datenfluss muss das Produkt Empfänger, Zweck, übertragene Datenkategorie und mögliche Anbieteraufbewahrung verständlich anzeigen und bestätigen lassen. | Must | US-000007 |
| F-021 | Vault-Inhalte und Indizes müssen dauerhaft lokal bleiben; externe Übertragung ist nur für die konkrete Verarbeitung beim bewusst gewählten Anbieter zulässig. | Must | US-000007 |

### 1.7 Änderungsverlauf und Erweiterungen

| ID | Anforderung | Priorität | US-Referenz |
|---|---|---|---|
| F-022 | Nutzer sollen ein detailliertes Änderungsprotokoll und verständliche Release-Notes-Sicht einsehen können. | Should | US-000008 |
| F-023 | Das System soll Integrationsgrenzen für eine spätere eigenständige `campaignworld`-MCP-Schnittstelle vorsehen, ohne MVP-Kopplung. | Should | US-000009 |
| F-024 | Die Android-Nutzung soll nach der Windows-Desktop-Basis unterstützt werden, wobei nicht verfügbare lokale Hintergrundfunktionen klar behandelt werden. | Should | US-000010 |

## 2. Nicht-funktionale Anforderungen

| ID | Kategorie | Anforderung | Messgröße / Zielwert |
|---|---|---|---|
| NF-001 | Datenintegrität | Originaldateien dürfen weder verloren gehen noch still überschrieben werden. | 0 Verluste/ stille Überschreibungen in unterstützten Test-Vaults |
| NF-002 | Bestätigung | Human-in-the-Loop bestätigt jede Schreib- und Löschoperation. | 100 % der Mutationen |
| NF-003 | Auditierbarkeit | Automatische Mutationen sind versioniert, zusammengefasst und einzeln rücksetzbar. | 100 % protokolliert; 100 % Rollback-Test bestanden |
| NF-004 | Security | Injection-Inhalte führen weder zu unerlaubten Aktionen noch zur Offenlegung außerhalb des freigegebenen Vault-Kontexts. | 0 Verstöße im versionierten Regressionsset |
| NF-005 | Least Privilege | Jedes MCP-Werkzeug besitzt dokumentierten Scope; keine beliebige Systemausführung. | 100 % Vertragsabdeckung |
| NF-006 | Datenschutz | Externer Datenfluss und Moduswechsel erfordern vorher einen konkreten Hinweis und bewusste Bestätigung. | 100 % der Erstaktivierungen/Wechsel |
| NF-007 | Lokalität | Das Projekt betreibt keinen externen dauerhaften Vault-Speicher. | 0 persistierte Vault-Inhalte außerhalb lokaler Speicher |
| NF-008 | Kompatibilität | Frühere unterstützte Daten- und Konfigurationsstände bleiben lesbar oder werden verlustfrei migriert. | 100 % der Versions-Fixtures |
| NF-009 | Plattform | Alle MVP-Abnahmetests bestehen unter Windows. | 100 % des MVP-Testsets |
| NF-010 | Kosten | Kernfunktionen verursachen keine projektseitigen laufenden Dienstkosten. | 0 verpflichtende kostenpflichtige Dienste |
| NF-011 | Nachvollziehbarkeit | Treffer nennen Quelle und Fundstelle, sofern technisch bestimmbar. | 100 % der textbasierten Suchtreffer |
| NF-012 | Bedienbarkeit | Ein technisch wenig versierter Obsidian-Nutzer erhält prüfbare Einrichtungsschritte und verständliche Fehlerhinweise. | Erfolgreicher geführter Installations-/Verbindungstest |
| NF-013 | Barrierearmut | Die minimale englische UI ist vollständig per Tastatur bedienbar und besitzt zugängliche Namen für interaktive Elemente. | 100 % der MVP-Kernabläufe |
| NF-014 | Lizenz | Fremde MIT-Hinweise bleiben erhalten und das Projekt enthält eine MIT-Lizenz mit noch zu klärendem Copyright Holder. | Lizenzprüfung vor Veröffentlichung |

## 3. Story Map

```text
Epic: Einstieg und Zugriff
  US-000001 (Must) Installation, Vault-Auswahl und MCP-Clients
  US-000002 (Must) Lesen, Suche, Quellen und Anhänge → US-000001

Epic: Sicheres Schreiben
  US-000003 (Must) Mutationen, Autonomiestufen, Audit und Wiederherstellung → US-000001

Epic: Wissensmodell
  US-000005 (Must) Lokale inkrementelle Indexierung → US-000001
  US-000004 (Must) Knowledge Graph und Exploration → US-000005
  US-000006 (Must) Wissenskompilierung und Vorlagen → US-000003, US-000005

Epic: Trust Boundary
  US-000007 (Must) Injection-Schutz und Datenflusstransparenz → querschnittlich, vor Release

Epic: Betrieb und Ausbau
  US-000008 (Should) Änderungsverlauf und Release-Sicht → US-000003
  US-000009 (Should) campaignworld-Integrationsgrenze → US-000002, US-000004
  US-000010 (Should) Android-Nutzung → Desktop-MVP
```

**Sprint-1-Kandidaten:** US-000001, US-000005, US-000002, US-000007, danach US-000003.

## 4. Edge Cases und Ausnahmeflüsse

| ID | Auslöser | Erwartetes Verhalten |
|---|---|---|
| EC-001 | Vault enthält Symlinks oder Pfade außerhalb des freigegebenen Roots | Zugriff verweigern oder explizit separat freigeben; niemals implizit folgen |
| EC-002 | Datei ändert sich zwischen Vorschau und Bestätigung | Mutation abbrechen, Konflikt zeigen, neue Vorschau verlangen |
| EC-003 | Vault-Inhalt formuliert Werkzeug- oder Systemanweisungen | Als Daten behandeln, kennzeichnen und ohne Berechtigungsauswirkung ignorieren |
| EC-004 | Index ist beschädigt oder veraltet | Sicheren Neuaufbau anbieten; Originaldateien unverändert lassen |
| EC-005 | Client trennt während Mutation | Atomaren Zustand herstellen oder sauber zurückrollen und protokollieren |
| EC-006 | Rollback-Ziel wurde extern verändert | Nicht überschreiben; Konflikt und Wiederherstellungsoptionen anzeigen |
| EC-007 | Binäranhang ist verschlüsselt, beschädigt oder nicht extrahierbar | Metadaten auffindbar halten und Extraktionsstatus ausweisen |
| EC-008 | Human-out-of-the-Loop erzeugt ungewöhnlich viele Mutationen | Schutzgrenze auslösen, Modus pausieren und Nutzer informieren |
| EC-009 | Externer Anbieter oder Datenhinweis ist unbekannt/veraltet | Externe Übertragung standardmäßig blockieren, bis ein bestätigbarer Hinweis vorliegt |
| EC-010 | Frühere Konfiguration ist unbekannter oder neuerer Version | Nicht destruktiv öffnen, Diagnose ausgeben, keine stille Downgrade-Migration |

## 5. Abhängigkeiten und externe Systeme

| System | Typ | Beschreibung | Verantwortlich |
|---|---|---|---|
| Obsidian Desktop | Host | Plugin, Vault-Zugriff und minimale UI | AR/FE |
| Claude, ChatGPT, Mistral | MCP-Clients | Authentifizierte Client-Verbindungen und optionale externe Verarbeitung | AR |
| Lokaler Hintergrundprozess | Produktkomponente | MCP, Indexierung und RAG; konkrete Umsetzung offen | AR |
| Obsidian Mobile Android | Zielplattform | Post-Desktop-Nutzung mit möglichen Plattformgrenzen | AR/FE |
| `campaignworld` | Spätere Integration | Eigenständige MCP-Grenze, keine MVP-Kopplung | AR |
| Optionale LLM-APIs | Extern | Nur mit eigenem Schlüssel und explizitem Datenflusshinweis | AR |

## 6. Glossar

| Begriff | Definition |
|---|---|
| Vault | Vom Nutzer freigegebener Obsidian-Dateibestand |
| Mutation | Erstellen, Ändern, Verschieben oder Löschen eines Vault-Artefakts bzw. seiner Beziehungen |
| Human-in-the-Loop | Jede Mutation wird vor Ausführung einzeln oder als klar abgegrenztes Paket bestätigt |
| Human-on-the-Loop | Automatische Mutationen laufen innerhalb bestätigter Grenzen und bleiben überwachbar/pausierbar |
| Human-out-of-the-Loop | Automatische Mutationen innerhalb vorab bestätigter Grenzen ohne laufende Einzelbestätigung |
| Wissenskompilierung | Kontrollierte Ableitung strukturierter, verlinkter Wissensseiten aus unstrukturierten Notizen |
| Freigegebener Vault-Kontext | Explizit erlaubter Datei-, Metadaten- und Werkzeug-Scope einer Verbindung |

## 7. Offene Fragen

| # | Frage | Verantwortlich | Kritikalität | Fällig bis | Status |
|---|---|---|---|---|---|
| 1 | Welche Client-Versionen und MCP-Transportarten bilden die erste verbindliche Kompatibilitätsmatrix? | Architect + Stakeholder | MAJOR | Architekturphase | OFFEN |
| 2 | Welche client-/anbieterbezogenen Hinweise zu Verarbeitung und Aufbewahrung müssen dynamisch oder dokumentarisch gepflegt werden? | PM/BA + Stakeholder | MAJOR | Vor MVP-Abnahme | OFFEN |
| 3 | Welche Mutations-Budgetgrenzen gelten je Autonomiestufe (Anzahl, Zeitraum, Löschungen)? | Architect + Stakeholder | MAJOR | Vor Freigabe von Human-on/out | OFFEN |
| 4 | Welcher Name ist als Copyright Holder in der MIT-Lizenz einzutragen? | Stakeholder | MINOR | Vor Veröffentlichung | OFFEN |
| 5 | Welche Dateitypen und OCR-Fähigkeiten gehören zur ersten Anhangssuche? | Stakeholder | MINOR | Refinement | OFFEN |

Keine offene Frage blockiert die Architekturphase; die Punkte 1 und 3 müssen vor dem jeweiligen Architektur- bzw. Autonomie-Vertrag entschieden werden.

## 8. Definition-of-Done-Selbstprüfung

- [x] Alle Must-Have-Features haben mindestens eine User Story.
- [x] Alle Should-Have-Features haben mindestens eine User Story.
- [x] Jede User Story enthält mindestens drei Given/When/Then-Szenarien.
- [x] Edge Cases und Fehlerszenarien sind dokumentiert.
- [x] Story Map und Abhängigkeiten sind eingetragen.
- [x] Nicht-funktionale Anforderungen sind messbar beschrieben.
- [x] Offene Fragen besitzen Verantwortliche, Kritikalität und Eskalationspfad.
- [x] Constitution-Prinzipien, Mindeststandards und Ausschlüsse sind eingehalten.
- [x] `requirements/INDEX.md` und Projekt-`INDEX.md` sind aktualisiert.
- [ ] Freigabe durch Stakeholder steht aus; Artefakte verbleiben in `REVIEW`.

---

## Übergabe: BA → AR

**Datum:** 2026-07-30  
**Von:** Business Analyst (BA)  
**An:** Software Architect (AR)  
**Nächster Befehl:** `/architect second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| REQ-000001 | REVIEW | `requirements/REQ-000001-product-requirements.md` | Vollständige Must-/Should-Abdeckung; Stakeholder-Freigabe ausstehend |
| US-000001–US-000010 | REVIEW | `requirements/` | Zehn geschnittene Stories mit Akzeptanzkriterien |

### Kritische Informationen für Empfänger

- Die Architektur muss Trust Boundaries zwischen Vault-Daten, MCP-Werkzeugen und externen KI-Anbietern explizit machen.
- Human-in-the-Loop ist Standard; automatische Modi benötigen Warnung, bestätigte Grenzen, Audit und Einzel-Rollback.
- Windows-Desktop und MCP-first sind MVP-priorisiert; konkrete Technologien wurden nicht vorweggenommen.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Erste Client-/Transport-Kompatibilitätsmatrix | REQ §7 | MAJOR | AR / Stakeholder |
| 2 | Mutations-Budgets je Autonomiestufe | REQ §7 | MAJOR | AR / Stakeholder |
| 3 | Anbieterhinweise und Pflegeweg | REQ §7 | MAJOR | PM / BA |

### Nicht-Ziele

- Keine Tech-Stack-, Protokoll- oder Speicherproduktentscheidung.
- Could-Haves wurden nicht in entwicklungsfertige Stories zerlegt.

### Empfehlungen

- Zuerst Sicherheitsgrenzen, Mutationsvertrag, lokales Persistenzmodell und Client-Adapter als ADRs entscheiden.
