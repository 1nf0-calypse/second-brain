---
name: coding-toolchain
description: Run this project's Claude-first development toolchain in Codex. Use for /kickoff, /status, /sprint, /ba, /architect, /ux, /refine, /analyze, /implement, /test-plan, /test-run, /review, /manual, /hotfix, /spike, /converge, /retro, /health-check, /coach, and /impediment.
---

# Coding Toolchain (project adapter)

Codex does not support repository-defined bare slash commands. Treat a requested Claude
command as a Toolchain command when it is written naturally or passed explicitly after this
skill, for example:

```text
$coding-toolchain /ba
$coding-toolchain /architect
$coding-toolchain /test-plan
```

Resolve the Toolchain root from `toolchain-path` in the project-root `.toolchain.yml`.
Resolve a relative value against the project root.

Then read and follow, completely and in this order:

1. `<toolchain-root>/CLAUDE.md`
2. `<toolchain-root>/.claude/commands/<command>.md`
3. `<toolchain-root>/toolchain/agents/_base-agent.md`
4. every role, workflow, protocol, template, and project artifact referenced by the command

The current repository is the target project. Derive its project name from `.toolchain.yml`;
do not require the user to repeat it. Preserve all gates, handoffs, lifecycle rules,
Definition-of-Done checks, `INDEX.md` updates, and `.phase` transitions from the canonical
Toolchain sources.

If `toolchain-path` or a required canonical source cannot be resolved, stop before changing
artifacts and report the exact missing path.
