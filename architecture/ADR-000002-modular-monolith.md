---
id: ADR-000002
title: Modularer Monolith mit zwei Prozessgrenzen
version: 1.0
status: APPROVED
author-agent: AR (Software Architect)
date: 2026-07-30
project: second-brain
based-on: REQ-000001, ADR-000001
supersedes: —
superseded-by: —
---

# ADR-000002: Modularer Monolith mit zwei Prozessgrenzen

## Entscheidung

**Ein modularer Monolith im Sidecar plus schlankes Obsidian-Plugin.** Module:
`mcp-gateway`, `policy`, `vault`, `indexing`, `retrieval`, `graph`, `mutations`, `audit`,
`providers`, `contracts`. Zugriff ausschließlich über Ports.

Dies weicht begründet vom Microservices-Default ab: privater Einzelnutzer, ausschließlich
lokale Bereitstellung, keine Ops-Kapazität und gemeinsame SQLite-Transaktionen. Die
Plugin/Sidecar-Prozessgrenze isoliert UI und Hintergrundarbeit ohne verteiltes System.

## Betrachtete Alternativen

- Microservices — abgelehnt: unnötige Deployments, Ports und Distributed Transactions.
- Single Process — abgelehnt: koppelt MCP/Indexierung an Obsidian.
- Modularer Sidecar + Plugin — gewählt: klare Grenzen bei geringem Betriebsaufwand.

## Konsequenzen

Dependency-Tests erzwingen Modulgrenzen. Extraktion bleibt möglich, falls später
Mehrbenutzerbetrieb oder unabhängige Skalierung entsteht.

## Reversibilität

- [x] **Reversibel** — Module können hinter stabilen Ports extrahiert werden.

## Implementierungshinweise

Keine Zyklen; Domain-Module kennen weder Obsidian noch MCP SDK.

---

## Übergabe: AR → FE/BE

**Nächster Befehl:** `/refine second-brain 1`.
