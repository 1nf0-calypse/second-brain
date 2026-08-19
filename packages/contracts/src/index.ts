// Beschreibung: Versionierte Laufzeitverträge für Setup, Suche, Beziehungen und Mutationen.
// Artefakte:    US-000011; US-000005; US-000012; US-000013; US-000014; US-000017; ADR-000001; ADR-000004; ADR-000007
// Agent:        BE — 2026-08-15
import { z } from 'zod';

export * from './compilation.js';

export const CONTRACT_VERSION = '3.0.0';

export const ErrorCodeSchema = z.enum([
  'INVALID_VAULT',
  'PATH_OUTSIDE_VAULT',
  'CONTRACT_MISMATCH',
  'SIDECAR_OFFLINE',
  'CONNECTION_TIMEOUT',
  'INDEX_CORRUPT',
  'INVALID_QUERY',
  'FILE_NOT_FOUND',
  'MUTATION_CONFLICT',
  'MUTATION_WRITE_FAILED',
  'CONFIRMATION_INVALID',
  'AUTONOMY_NOT_ACTIVE',
  'AUTONOMY_BUDGET_EXHAUSTED',
  'PROVIDER_NOT_APPROVED',
  'PROVIDER_SCOPE_MISMATCH',
  'CONSENT_REQUIRED',
  'CONSENT_EXPIRED',
  'COMPILATION_INVALID_SOURCE',
  'COMPILATION_INVALID_TARGET',
  'COMPILATION_TEMPLATE_NOT_FOUND',
  'COMPILATION_DRIFT',
  'CONFIRMATION_EXPIRED',
  'CONFIRMATION_ALREADY_DECIDED',
  'PENDING_CAPACITY_REACHED',
  'IDEMPOTENCY_CONFLICT'
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

export const ProviderIdSchema = z.enum(['chatgpt', 'mistral']);
export const DataCategorySchema = z.enum(['text-excerpt', 'pseudonymous-source-id']);
export const ProviderEndpointSchema = z.string().url().startsWith('https://').refine((value) => {
  const endpoint = new URL(value);
  return endpoint.username.length === 0 && endpoint.password.length === 0;
}, 'Provider credentials must not be embedded in the endpoint URL.');
export const ProviderConfigurationSchema = z.object({
  provider: ProviderIdSchema,
  endpoint: ProviderEndpointSchema,
  sourceUrl: z.string().url(),
  reviewedAt: z.string().datetime(),
  policyVersion: z.string().min(1),
  allowedCategories: z.array(DataCategorySchema).min(1)
}).strict();
export const ProviderHandshakeRequestSchema = z.object({
  contractVersion: z.literal(CONTRACT_VERSION),
  provider: ProviderIdSchema,
  endpoint: ProviderEndpointSchema,
  expectedScope: z.array(z.enum(['read:notes', 'consent:once'])).min(1)
}).strict();
export const ProviderHandshakeResponseSchema = z.object({
  contractVersion: z.literal(CONTRACT_VERSION),
  provider: ProviderIdSchema,
  endpoint: ProviderEndpointSchema,
  connected: z.boolean(),
  configured: z.boolean(),
  scopes: z.array(z.string().trim().min(1).max(100).regex(/^[a-z0-9:_-]+$/)).max(50),
  message: z.string()
}).strict();
export const ConsentPrepareRequestSchema = z.object({
  provider: ProviderIdSchema,
  purpose: z.string().trim().min(1).max(200),
  operation: z.literal('read:notes'),
  policyVersion: z.string().min(1),
  excerpts: z.array(z.object({
    text: z.string().min(1).max(20_000),
    sourceId: z.string().regex(/^[a-zA-Z0-9_-]{8,128}$/)
  }).strict()).min(1).max(20)
}).strict();
export const ConsentPreviewSchema = z.object({
  provider: ProviderIdSchema,
  purpose: z.string(),
  operation: z.string(),
  categories: z.array(DataCategorySchema),
  payloadHash: z.string().length(64),
  policyVersion: z.string(),
  excerpts: z.array(z.object({ text: z.string(), sourceId: z.string() }).strict()).min(1),
  confirmationToken: z.string().uuid(),
  expiresAt: z.string().datetime()
}).strict();
export const ConsentConfirmRequestSchema = z.object({
  confirmationToken: z.string().uuid()
}).strict();
export const ConsentReceiptSchema = z.object({
  receiptId: z.string().uuid(),
  provider: ProviderIdSchema,
  purpose: z.string(),
  operation: z.string(),
  categories: z.array(DataCategorySchema),
  sourceIds: z.array(z.string()),
  payloadHash: z.string().length(64),
  policyVersion: z.string(),
  confirmedAt: z.string().datetime(),
  revokedAt: z.string().datetime().nullable()
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

export const RelationshipTypeSchema = z.enum(['wiki-link', 'tag', 'property']);
export const RelationshipDirectionSchema = z.enum(['outgoing', 'incoming']);
export const RelationshipTargetKindSchema = z.enum(['note', 'tag', 'property']);

export const RelationshipSchema = z.object({
  type: RelationshipTypeSchema,
  direction: RelationshipDirectionSchema,
  target: z.object({
    kind: RelationshipTargetKindSchema,
    id: z.string().min(1),
    label: z.string().min(1),
    relativePath: z.string().min(1).nullable()
  }).strict(),
  source: z.object({
    relativePath: z.string().min(1),
    line: z.number().int().positive().nullable(),
    property: z.string().min(1).nullable()
  }).strict()
}).strict();

export const RelationshipQueryRequestSchema = z.object({
  relativePath: z.string().trim().min(1),
  limit: z.number().int().min(1).max(200).default(100)
}).strict();

export const RelationshipQueryResponseSchema = z.object({
  relativePath: z.string().min(1),
  readOnly: z.literal(true),
  relationships: z.array(RelationshipSchema)
}).strict();

export const NodeDetailRequestSchema = z.object({
  relativePath: z.string().trim().min(1)
}).strict();

export const NodeDetailResponseSchema = z.object({
  relativePath: z.string().min(1),
  title: z.string().min(1),
  extractionStatus: ExtractionStatusSchema,
  outgoingCount: z.number().int().nonnegative(),
  incomingCount: z.number().int().nonnegative(),
  readOnly: z.literal(true)
}).strict();

export const MutationActionSchema = z.enum(['create', 'update', 'rollback']);
export const MutationPrepareRequestSchema = z.object({
  relativePath: z.string().trim().min(1),
  content: z.string().max(2_000_000)
}).strict();
export const MutationPreviewSchema = z.object({
  token: z.string().uuid(),
  action: MutationActionSchema,
  relativePath: z.string().min(1),
  beforeHash: z.string().length(64).nullable(),
  afterHash: z.string().length(64),
  diff: z.string(),
  expiresAt: z.string().datetime(),
  readOnly: z.literal(true)
}).strict();
export const MutationConfirmRequestSchema = z.object({
  token: z.string().uuid()
}).strict();
export const MutationResultSchema = z.object({
  auditId: z.string().uuid(),
  action: MutationActionSchema,
  relativePath: z.string().min(1),
  beforeHash: z.string().length(64).nullable(),
  afterHash: z.string().length(64).nullable(),
  changed: z.literal(true)
}).strict();
export const RollbackPrepareRequestSchema = z.object({
  auditId: z.string().uuid()
}).strict();

export const AutonomyModeSchema = z.enum(['human-in', 'human-on', 'human-out']);
export const AutonomyActivationRequestSchema = z.object({
  mode: z.enum(['human-on', 'human-out']),
  reviewed: z.literal(true)
}).strict();
export const AutonomyStatusSchema = z.object({
  mode: AutonomyModeSchema,
  active: z.boolean(),
  paused: z.boolean(),
  usedMutations: z.number().int().min(0).max(60),
  remainingMutations: z.number().int().min(0).max(60),
  activatedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
  message: z.string()
}).strict();
export const AutonomousMutationRequestSchema = z.object({
  relativePath: z.string().trim().min(1),
  content: z.string().max(2_000_000)
}).strict();

export const TemplateVersionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  version: z.number().int().positive(),
  content: z.string().min(1).max(100_000),
  hash: z.string().length(64),
  createdAt: z.string().datetime()
}).strict();
export const TemplatePrepareRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  content: z.string().min(1).max(100_000)
}).strict();
export const TemplatePreviewSchema = TemplateVersionSchema.extend({
  token: z.string().uuid(),
  readOnly: z.literal(true)
}).strict();
export const TemplateConfirmRequestSchema = z.object({ token: z.string().uuid() }).strict();
export const CompilationSourceSchema = z.object({
  relativePath: z.string().trim().min(1),
  expectedHash: z.string().length(64).optional()
}).strict();
export const CompilationPrepareRequestSchema = z.object({
  targetPath: z.string().trim().min(1),
  content: z.string().min(1).max(2_000_000),
  sources: z.array(CompilationSourceSchema).min(1).max(20),
  templateId: z.string().uuid(),
  templateVersion: z.number().int().positive(),
  templateHash: z.string().length(64)
}).strict();
export const CompilationPreviewSchema = MutationPreviewSchema.extend({
  sources: z.array(CompilationSourceSchema.extend({ hash: z.string().length(64) })).min(1),
  template: TemplateVersionSchema.pick({ id: true, name: true, version: true, hash: true }),
  warnings: z.array(z.enum(['untrusted-instruction-like-content', 'potentially-contradictory-sources']))
}).strict();
export const HistoryEntrySchema = z.object({
  auditId: z.string().uuid(),
  action: MutationActionSchema,
  relativePath: z.string().min(1),
  createdAt: z.string().datetime(),
  status: z.enum(['success', 'incomplete']),
  rollbackStatus: z.enum(['available', 'rolled-back', 'blocked']),
  summary: z.string().min(1)
}).strict();
export const HistoryResponseSchema = z.object({ entries: z.array(HistoryEntrySchema) }).strict();

export type SetupRequest = z.infer<typeof SetupRequestSchema>;
export type SetupResponse = z.infer<typeof SetupResponseSchema>;
export type ProviderId = z.infer<typeof ProviderIdSchema>;
export type ProviderConfiguration = z.infer<typeof ProviderConfigurationSchema>;
export type ProviderHandshakeRequest = z.infer<typeof ProviderHandshakeRequestSchema>;
export type ProviderHandshakeResponse = z.infer<typeof ProviderHandshakeResponseSchema>;
export type ConsentPrepareRequest = z.infer<typeof ConsentPrepareRequestSchema>;
export type ConsentPreview = z.infer<typeof ConsentPreviewSchema>;
export type ConsentConfirmRequest = z.infer<typeof ConsentConfirmRequestSchema>;
export type ConsentReceipt = z.infer<typeof ConsentReceiptSchema>;
export type IndexStatus = z.infer<typeof IndexStatusSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type ReadNoteRequest = z.infer<typeof ReadNoteRequestSchema>;
export type ReadNoteResponse = z.infer<typeof ReadNoteResponseSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type RelationshipQueryRequest = z.infer<typeof RelationshipQueryRequestSchema>;
export type RelationshipQueryResponse = z.infer<typeof RelationshipQueryResponseSchema>;
export type NodeDetailRequest = z.infer<typeof NodeDetailRequestSchema>;
export type NodeDetailResponse = z.infer<typeof NodeDetailResponseSchema>;
export type MutationPrepareRequest = z.infer<typeof MutationPrepareRequestSchema>;
export type MutationPreview = z.infer<typeof MutationPreviewSchema>;
export type MutationConfirmRequest = z.infer<typeof MutationConfirmRequestSchema>;
export type MutationResult = z.infer<typeof MutationResultSchema>;
export type RollbackPrepareRequest = z.infer<typeof RollbackPrepareRequestSchema>;
export type AutonomyMode = z.infer<typeof AutonomyModeSchema>;
export type AutonomyActivationRequest = z.infer<typeof AutonomyActivationRequestSchema>;
export type AutonomyStatus = z.infer<typeof AutonomyStatusSchema>;
export type AutonomousMutationRequest = z.infer<typeof AutonomousMutationRequestSchema>;
export type TemplateVersion = z.infer<typeof TemplateVersionSchema>;
export type TemplatePrepareRequest = z.infer<typeof TemplatePrepareRequestSchema>;
export type TemplatePreview = z.infer<typeof TemplatePreviewSchema>;
export type CompilationPrepareRequest = z.infer<typeof CompilationPrepareRequestSchema>;
export type CompilationPreview = z.infer<typeof CompilationPreviewSchema>;
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;
export type HistoryResponse = z.infer<typeof HistoryResponseSchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
