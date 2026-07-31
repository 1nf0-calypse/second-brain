// Beschreibung: Definiert Test- und Coverage-Gates für die testbaren Kernmodule.
// Artefakte:    US-000011; US-000005; US-000012; ADR-000001
// Agent:        QA — 2026-07-31
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['tests/e2e/**/*.spec.ts', 'node_modules/**', '.worktrees/**'],
    coverage: {
      provider: 'v8',
      include: [
        'packages/{contracts,domain}/src/**/*.ts',
        'apps/sidecar/src/{bootstrap/setup-service,errors,indexing,policy,relationships,search}/**/*.ts',
        'apps/obsidian-plugin/src/ipc/{setup-client,search-client}.ts',
        'apps/obsidian-plugin/src/ui/presentation.ts'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      },
      reporter: ['text', 'json-summary']
    }
  }
});
