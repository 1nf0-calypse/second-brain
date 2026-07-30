---
id: ADR-000004
title: Sicherheits- und Mutationsmodell
version: 1.0
status: APPROVED
author-agent: AR (Software Architect)
date: 2026-07-30
project: second-brain
based-on: REQ-000001, CON-000001
supersedes: —
superseded-by: —
---

# ADR-000004: Sicherheits- und Mutationsmodell

## Entscheidung

**Capability-basierte Werkzeuge, serverseitige Policy Enforcement und
Prepare/Confirm/Commit sind verpflichtend.**

Mutationen tragen Vault-ID, normalisierten relativen Pfad, erwarteten Content-Hash, Diff,
Modus, Policy-Snapshot und Idempotency Key. Human-in erzeugt ein kurzlebiges Confirmation
Token; Commit akzeptiert nur unveränderten Hash und Scope. Human-on/out nutzen versionierte
Policies mit Mutationsbudgets. Vor dem atomaren Dateiersatz entsteht ein Audit-/Rollback-Paket.

## Betrachtete Alternativen

- Clientseitige Bestätigung allein — abgelehnt: umgehbar und clientabhängig.
- Git als einziges Journal — abgelehnt: Vaults sind nicht zwingend Git-Repositories.
- Policy + Journal + optionaler Git-Adapter — gewählt: erzwingbar und vault-unabhängig.

## Konsequenzen

Provider- und Vault-Text sind tainted. Keine generischen Dateisystem-/Command-Tools.
Pfadnormalisierung blockiert Traversal, Symlink-Escapes und fremde Roots. Löschen ist eine
eigene Capability.

## Reversibilität

- [x] **Schwer reversibel** — Auditformat und Confirmation-Protokoll werden öffentliche Verträge.

## Implementierungshinweise

Tests für Injection, confused deputy, TOCTOU, Replay, Symlink Escape, Unicode Path Spoofing,
oversized payload, Loopback-CSRF und Secret Leakage.

---

## Übergabe: AR → UX/FE/BE

**Nächster Befehl:** `/ux second-brain`.
