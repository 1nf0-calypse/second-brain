---
id: ADR-000005
title: Branching- und Release-Strategie
version: 1.0
status: APPROVED
author-agent: AR (Software Architect)
date: 2026-07-30
project: second-brain
based-on: REQ-000001, WF-FULL-SPRINT
supersedes: —
superseded-by: —
---

# ADR-000005: Branching- und Release-Strategie

## Entscheidung

**Trunk-based Development mit kurzlebigem `feature/sprint-N` im verpflichtenden
Sprint-Worktree; `--no-ff`-Merge nach Review/Dokumentation; annotierter SemVer-Tag.**

`main` bleibt releasbar. Erster Release: `v0.1.0`. Artefakte: Plugin, Sidecar, Checksums,
SBOM und Third-Party Notices.

## Betrachtete Alternativen

- GitFlow — abgelehnt: unnötige langfristige Branches.
- Direkt auf main — abgelehnt: schwache Isolation und Reviewbarkeit.
- Sprint-Branch — gewählt: klare Isolation und einfache Historie.

## Reversibilität

- [x] **Reversibel** — Änderung durch neues ADR.

## Implementierungshinweise

Keine privaten Vault-Daten committen. Push und Worktree-Cleanup bleiben bestätigungspflichtig.

---

## Übergabe: AR → ORCH

**Nächster Befehl:** `/ux second-brain`.
