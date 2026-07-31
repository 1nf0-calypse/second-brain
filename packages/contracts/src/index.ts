// Beschreibung: Versionierte Laufzeitverträge für Setup, Status und Indexierung.
// Artefakte:    US-000011; US-000005; ADR-000001; ADR-000004
// Agent:        BE — 2026-07-30
import { z } from 'zod';

export const CONTRACT_VERSION = '1.0.0';

export const ErrorCodeSchema = z.enum([
  'INVALID_VAULT',
  'PATH_OUTSIDE_VAULT',
  'CONTRACT_MISMATCH',
  'SIDECAR_OFFLINE',
  'CONNECTION_TIMEOUT',
  'INDEX_CORRUPT'
]);

export const SetupRequestSchema = z.object({
  contractVersion: z.literal(CONTRACT_VERSION),
  client: z.literal('claude-desktop'),
  vaultRoot: z.string().min(1)
}).strict();

export const SetupResponseSchema = z.object({
  contractVersion: z.literal(CONTRACT_VERSION),
  client: z.literal('claude-desktop'),
  capability: z.literal('setup:read'),
  vaultReady: z.boolean(),
  message: z.string()
}).strict();

export const IndexStatusSchema = z.object({
  state: z.enum(['idle', 'scanning', 'ready', 'error']),
  indexedFiles: z.number().int().nonnegative(),
  changedFiles: z.number().int().nonnegative(),
  deletedFiles: z.number().int().nonnegative(),
  originalFilesUnchanged: z.literal(true),
  message: z.string()
}).strict();

export type SetupRequest = z.infer<typeof SetupRequestSchema>;
export type SetupResponse = z.infer<typeof SetupResponseSchema>;
export type IndexStatus = z.infer<typeof IndexStatusSchema>;
