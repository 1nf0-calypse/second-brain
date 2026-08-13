---
id: RN-000005
title: Release Notes — Sprint 5
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-08-13
project: second-brain
based-on: RV-000006, US-000001, US-000007
supersedes: —
superseded-by: —
ablage: projects/second-brain/docs/
---

# Release Notes — Sprint 5

## Neu

- **Remote-Provider mit klarer Prüfung** — ChatGPT Business, Enterprise oder Edu und Mistral Connector können über einen selbst verwalteten HTTPS-MCP-Endpoint geprüft werden. Siehe [Anleitung](DOC-000006-remote-provider-und-einmal-consent.md).
- **Einmalige Datenfreigabe** — Ein Textauszug wird erst nach sichtbarer Prüfung der exakten Quell-ID und des Textes sowie einer ausdrücklichen Checkbox einmalig übertragen.

## Geändert

- **Aktueller Vault automatisch verwendet** — Die Setup-Ansicht zeigt den gerade in Obsidian geöffneten Vault als nicht bearbeitbaren Pfad. Ein manueller Pfadeintrag ist nicht mehr erforderlich.
- **Strengere Freigabe** — Jede Änderung an Provider, Endpoint, Quell-ID oder Text setzt die vorbereitete Freigabe zurück.

## Behoben

- Eine Transferfreigabe ist nun auch über getrennte lokale Sidecar-Prozesse hinweg an genau den geprüften Text und Endpoint gebunden und kann nicht wiederverwendet werden.
- Die Bestätigungs-Checkbox ist im Obsidian-Dark-Theme klar erkennbar und per Tastatur erreichbar.

## Bekannte Einschränkungen

- Ein produktiver Remote-Transfer benötigt weiterhin einen gültigen, vom Nutzer verwalteten HTTPS-MCP-Endpoint mit den erwarteten eingeschränkten Scopes.
- Second Brain richtet keine Provider-Zugangsdaten, Connectoren oder öffentliche Tunnel ein und kann sie nicht widerrufen; das geschieht im jeweiligen Provider-Workspace.

---

*Erstellt von: MW-Agent | Datum: 2026-08-13 | Version: 1.0 | Ablage: `projects/second-brain/docs/`*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-13 | Initiale Release Notes für Sprint 5 | MW |
