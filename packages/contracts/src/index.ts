// Beschreibung: Versionierte Laufzeitverträge für Setup, Indexierung und lokale Suche.
// Artefakte:    US-000011; US-000005; US-000012; ADR-000001; ADR-000004
// Agent:        BE — 2026-07-31
import { z } from 'zod';

export const CONTRACT_VERSION = '1.0.0';

export const ErrorCodeSchema = z.enum([
  'INVALID_VAULT',
  'PATH_OUTSIDE_VAULT',
  'CONTRACT_MISMATCH',
  'SIDECAR_OFFLINE',
  'CONNECTION_TIMEOUT',
  'INDEX_CORRUPT',
  'INVALID_QUERY',
  'FILE_NOT_FOUND'
]);

export const ErrorResponseSchema = z.object({
  level: z.literal('error'),
  code: ErrorCodeSchema,
  message: z.string().min(1)
}).strict();

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

export const ExtractionStatusSchema = z.enum(['extracted', 'not_extracted']);

export const SearchRequestSchema = z.object({
  query: z.string().trim().min(1).max(500),
  limit: z.number().int().min(1).max(50).default(20)
}).strict();

export const SearchResultSchema = z.object({
  relativePath: z.string().min(1),
  line: z.number().int().positive().nullable(),
  snippet: z.string(),
  matchType: z.literal('full-text'),
  extractionStatus: ExtractionStatusSchema,
  score: z.number()
}).strict();

export const SearchResponseSchema = z.object({
  query: z.string(),
  semanticAvailable: z.literal(false),
  message: z.literal(
    'Semantic search is unavailable. Showing full-text results only.'
  ),
  results: z.array(SearchResultSchema)
}).strict();

export const ReadNoteRequestSchema = z.object({
  relativePath: z.string().trim().min(1),
  line: z.number().int().positive().optional()
}).strict();

export const ReadNoteResponseSchema = z.object({
  relativePath: z.string().min(1),
  content: z.string(),
  requestedLine: z.number().int().positive().nullable(),
  extractionStatus: z.literal('extracted')
}).strict();

export type SetupRequest = z.infer<typeof SetupRequestSchema>;
export type SetupResponse = z.infer<typeof SetupResponseSchema>;
export type IndexStatus = z.infer<typeof IndexStatusSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type ReadNoteRequest = z.infer<typeof ReadNoteRequestSchema>;
export type ReadNoteResponse = z.infer<typeof ReadNoteResponseSchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
