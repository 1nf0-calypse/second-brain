// Beschreibung: Zentrale Lint-Konfiguration für das TypeScript-Workspace.
// Artefakte:    US-000011; ADR-000001
// Agent:        BE — 2026-07-30
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'testing/system-vault/.obsidian/plugins/**',
      'testing/system-vault/.second-brain/**',
      'eslint.config.js',
      'scripts/**/*.mjs',
      'tests/performance/**/*.mjs'
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.base.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }]
    }
  }
);
