---
id: DOC-000006
title: Remote-Provider und einmalige Datenfreigabe
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-08-13
project: second-brain
based-on: US-000001, US-000007, UX-000003, RV-000006
supersedes: —
superseded-by: —
ablage: projects/second-brain/docs/
---

# Remote-Provider und einmalige Datenfreigabe

## Was dieses Feature tut

Second Brain verbindet den aktuell geöffneten Obsidian-Vault mit einem von dir verwalteten Remote-Provider und sendet nur einen von dir einzeln geprüften Textauszug.

## Voraussetzungen

- Second Brain ist im aktuell geöffneten Desktop-Vault installiert.
- Für den lokalen Teil ist keine zusätzliche LLM-API-Key-Eingabe in Second Brain nötig.
- Für einen Remote-Transfer benötigst du einen gültigen HTTPS-MCP-Endpoint in deinem ChatGPT-Business-, Enterprise- oder Edu-Workspace oder in deinem Mistral-Workspace. Zugangsdaten und die Freigabe des Connectors verwaltest du dort, nicht in Second Brain.

## Lokales Setup prüfen

1. Öffne in Obsidian die Ansicht **Set up Second Brain**. → Unter **Current Obsidian vault folder** erscheint der Pfad des aktuell geöffneten Vaults.
2. Prüfe den angezeigten Pfad. Das Feld ist absichtlich nicht bearbeitbar. → Second Brain verwendet genau diesen geöffneten Vault; keine Dateien werden verschoben oder geändert.
3. Wähle **Test local service**. → Bei Erfolg erscheint die Meldung, dass der lokale Dienst bereit ist.
4. Wähle bei Bedarf **Copy configuration** und füge den gezeigten `mcpServers`-Eintrag in Claude Desktop unter **Settings → Developer → Edit Config** in das vorhandene oberste JSON-Objekt ein. → Claude Desktop kann den lokalen Dienst nach seinem eigenen Neustart verwenden.

[SCREENSHOT: Die Setup-Ansicht zeigt den schreibgeschützten Pfad des geöffneten Vaults und die Schaltfläche "Test local service".]

## Remote-Provider verbinden

1. Scrolle in derselben Ansicht zu **Remote client connection**. → Die Auswahl **Provider** zeigt ChatGPT Business, Enterprise, or Edu sowie Mistral Connector.
2. Wähle deinen Provider und öffne bei Bedarf **Open current provider setup guidance**. → Die Anleitung des Providers öffnet sich außerhalb von Second Brain.
3. Trage unter **User-managed HTTPS endpoint** die HTTPS-Adresse deines bereits eingerichteten Endpoints ein. → **Inspect remote configuration** wird aktiv.
4. Wähle **Inspect remote configuration**. → Second Brain prüft Verbindung, MCP-Manifest und die erwarteten eingeschränkten Scopes `read:notes` und `consent:once`; dabei werden weder Vault-Inhalte noch Zugangsdaten übertragen.
5. Lies die Statusmeldung. → Erst bei erfolgreicher Prüfung kann ein einmaliger Transfer vorbereitet werden.

**Problem: Die Endpoint-Prüfung schlägt fehl.**
Prüfe zuerst, ob die Adresse mit `https://` beginnt und in deinem Provider-Workspace erreichbar ist. Richte dort den Connector und dessen eingeschränkte Scopes ein. Second Brain kann keinen lokalen Server direkt in einen externen Provider einbinden und speichert keine Provider-Zugangsdaten.

## Einen Textauszug einmalig erlauben

1. Gehe zu **Review external data**. → Du siehst Zweck, Operation und die erlaubten Datenkategorien vor den Eingabefeldern.
2. Gib eine pseudonyme Quell-ID mit mindestens acht Zeichen und den exakten Textauszug ein. → Nur diese beiden Werte sind Teil der möglichen Übertragung. Vault, Index, Anhänge, Dateinamen, Pfade, Secrets, Audit-Log und Diagnosedaten bleiben ausgeschlossen.
3. Lies beide Werte vollständig und setze **I reviewed the exact data above.** → Second Brain bereitet genau diese Daten lokal für eine einmalige Bestätigung vor. Ändert sich Provider, Endpoint, Quell-ID oder Text, wird die Prüfung zurückgesetzt.
4. Wähle nach erfolgreicher Endpoint-Prüfung **Allow this transfer once**. → Der vorbereitete Textauszug wird genau einmal gesendet; anschließend erscheint eine inhaltsfreie Bestätigungsquittung.
5. Wähle bei Zweifel **Cancel — do not send data**. → Eingaben und vorbereitete Bestätigung werden verworfen; es wird nichts übertragen.

[SCREENSHOT: Der Bereich "Review external data" zeigt Zweck, ausgeschlossene Kategorien, die exakte Quell-ID und den Textauszug sowie die angekreuzte Checkbox vor der Einmalfreigabe.]

## Verbindung lokal trennen

1. Wähle **Disconnect this provider**. → Second Brain entfernt die lokale Verbindung und die zugehörige inhaltsfreie Quittung.
2. Widerrufe bei Bedarf den Connector oder ein Tunnel-Zugangstoken zusätzlich im Workspace deines Providers. → Der externe Zugang wird dort getrennt; Second Brain besitzt dafür keine Zugangsdaten.

## Tipps und Hinweise

- Sende keine persönlichen oder sensiblen Informationen. Second Brain kann die Sensitivität des Textes nicht zuverlässig erkennen.
- Die explizite Prüfung ist absichtlich nicht optional: Jeder Text oder Endpoint-Wechsel erfordert eine neue Einmalfreigabe.
- Für eine reine lokale Nutzung musst du keinen Remote-Provider einrichten.

## Häufige Fragen zu diesem Feature

**Warum kann ich den Vault-Pfad nicht eingeben?**
Second Brain verwendet den Pfad des Vaults, der gerade in Obsidian geöffnet ist. Dadurch kann der lokale Dienst nicht versehentlich auf einen anderen Ordner zeigen.

**Warum ist "Allow this transfer once" deaktiviert?**
Prüfe den HTTPS-Endpoint, die erfolgreiche Endpoint-Prüfung, die Quell-ID, den Textauszug und die Checkbox. Jede Änderung an diesen Daten verlangt eine neue Prüfung.

**Kann ich den Transfer später erneut ausführen?**
Ja, aber nur mit einer neuen Prüfung und einer neuen Einmalfreigabe. Eine frühere Bestätigungsquittung enthält keinen Notiztext und kann nicht erneut verwendet werden.

---

*Erstellt von: MW-Agent | Datum: 2026-08-13 | Version: 1.0 | Ablage: `projects/second-brain/docs/`*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-13 | Initiale Anleitung für Remote-Provider, automatischen Vault-Pfad und Einmal-Consent | MW |
