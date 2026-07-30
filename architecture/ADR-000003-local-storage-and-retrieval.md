---
id: ADR-000003
title: Lokale Datenhaltung und hybride Suche
version: 1.0
status: APPROVED
author-agent: AR (Software Architect)
date: 2026-07-30
project: second-brain
based-on: REQ-000001, ADR-000001
supersedes: —
superseded-by: —
---

# ADR-000003: Lokale Datenhaltung und hybride Suche

## Entscheidung

**SQLite ist der abgeleitete lokale Store; FTS5 liefert Volltextsuche, ein austauschbarer
Vector-Port semantische Suche und Reciprocal Rank Fusion kombiniert Resultate.**

Der Vault bleibt Source of Truth. SQLite hält Fingerprints, Chunks, Metadaten, Graphkanten,
Embedding-Versionen und Audit-Journal. Der Index ist reproduzierbar. Eine native
Vector-Extension wird erst nach Windows-Packaging- und Lizenzprüfung festgelegt.

Quelle: [SQLite FTS5](https://www.sqlite.org/fts5.html).

## Betrachtete Alternativen

- Externe Vector DB — abgelehnt: Dienst-, Datenschutz- und Kostenkonflikt.
- Nur In-Memory — abgelehnt: langsamer Neustart und kein dauerhaftes Audit.
- SQLite + Ports — gewählt: lokal, transaktional und austauschbar.

## Konsequenzen

Volltext ist verbindlich; semantische Suche darf bei Inkompatibilität sichtbar degradieren.
Backups trennen Vault, reproduzierbaren Index und nicht beliebig verwerfbares Audit.

## Reversibilität

- [x] **Reversibel** — Index ist abgeleitet; Audit benötigt Migration.

## Implementierungshinweise

WAL, Foreign Keys und Integritätsprüfung; parametrisierte Queries; keine Rohinhalte in Logs.

---

## Übergabe: AR → FE/BE

**Nächster Befehl:** `/refine second-brain 1`.
