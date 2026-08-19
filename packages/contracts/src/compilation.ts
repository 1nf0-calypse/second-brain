// Beschreibung: Contract-3-Laufzeitverträge für MCP-first Compilation Inbox, Decisions und History.
// Artefakte:    US-000017; US-000016; US-000008; ADR-000007
// Agent:        BE — 2026-08-15
import { z } from 'zod';

export const COMPILATION_CONTRACT_VERSION = '3.0.0' as const;
export const MAX_COMPILATION_CONTENT_BYTES = 2_000_000;
export const MAX_COMPILATION_SOURCES = 20;

const RelativeMarkdownPathSchema = z.string().trim().min(1).max(1_024)
  .refine((path) => !/^(?:[a-z]:[\\/]|[\\/])/iu.test(path), 'Path must be vault-relative.')
  .refine((path) => !path.split(/[\\/]/u).includes('..'), 'Path traversal is not allowed.')
  .refine((path) => path.toLowerCase().endsWith('.md'), 'Path must identify one Markdown file.');

export const CompilationStateSchema = z.enum([
  'pending', 'applying', 'confirmed', 'rejected', 'failed', 'incomplete', 'conflicted', 'expired'
]);
export const CompilationWarningSchema = z.enum([
  'untrusted-instruction-like-content', 'potentially-contradictory-sources'
]);
export const CompilationErrorCodeSchema = z.enum([
  'COMPILATION_INVALID_SOURCE',
  'COMPILATION_INVALID_TARGET',
  'COMPILATION_TEMPLATE_NOT_FOUND',
  'COMPILATION_DRIFT',
  'CONFIRMATION_EXPIRED',
  'CONFIRMATION_ALREADY_DECIDED',
  'PENDING_CAPACITY_REACHED',
  'IDEMPOTENCY_CONFLICT'
]);
export const SubmittedCompilationSourceSchema = z.object({
  relativePath: RelativeMarkdownPathSchema,
  expectedHash: z.string().length(64)
}).strict();
export const CompilationTemplateReferenceSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().positive(),
  hash: z.string().length(64)
}).strict();
export const CompilationSubmitRequestSchema = z.object({
  contractVersion: z.literal(COMPILATION_CONTRACT_VERSION),
  clientRequestId: z.string().trim().min(1).max(128).regex(/^[a-zA-Z0-9._:-]+$/u),
  target: z.object({
    relativePath: RelativeMarkdownPathSchema,
    content: z.string().min(1).max(MAX_COMPILATION_CONTENT_BYTES)
  }).strict(),
  sources: z.array(SubmittedCompilationSourceSchema).min(1).max(MAX_COMPILATION_SOURCES),
  template: CompilationTemplateReferenceSchema.nullable().default(null)
}).strict().superRefine((request, context) => {
  if (new Set(request.sources.map((source) => source.relativePath.toLowerCase())).size !== request.sources.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['sources'], message: 'Sources must be unique.' });
  }
  if (request.sources.some((source) => source.relativePath.toLowerCase() === request.target.relativePath.toLowerCase())) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['sources'], message: 'Target cannot also be a source.' });
  }
});
export const CompilationSubmissionSchema = z.object({
  pendingId: z.string().uuid(),
  state: z.literal('pending'),
  revision: z.number().int().positive(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime()
}).strict();
export const CompilationStatusRequestSchema = z.object({ pendingId: z.string().uuid() }).strict();
export const CompilationStatusSchema = z.object({
  pendingId: z.string().uuid(),
  state: CompilationStateSchema,
  revision: z.number().int().positive(),
  errorCode: CompilationErrorCodeSchema.nullable(),
  decidedAt: z.string().datetime().nullable()
}).strict();
export const PendingCompilationSummarySchema = z.object({
  count: z.number().int().nonnegative().max(50),
  revision: z.number().int().nonnegative(),
  oldestExpiresAt: z.string().datetime().nullable()
}).strict();
export const PendingCompilationListRequestSchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(50).default(50)
}).strict();
export const PendingCompilationListItemSchema = z.object({
  pendingId: z.string().uuid(),
  revision: z.number().int().positive(),
  targetPath: RelativeMarkdownPathSchema,
  clientName: z.string().min(1),
  sourceCount: z.number().int().min(1).max(MAX_COMPILATION_SOURCES),
  warningCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime()
}).strict();
export const PendingCompilationListSchema = z.object({
  items: z.array(PendingCompilationListItemSchema),
  nextCursor: z.string().datetime().nullable()
}).strict();
export const PendingCompilationDetailRequestSchema = z.object({ pendingId: z.string().uuid() }).strict();
export const PendingCompilationDetailSchema = z.object({
  pendingId: z.string().uuid(),
  revision: z.number().int().positive(),
  state: CompilationStateSchema,
  clientName: z.string().min(1),
  targetPath: RelativeMarkdownPathSchema,
  beforeHash: z.string().length(64).nullable(),
  afterHash: z.string().length(64),
  content: z.string(),
  diff: z.string(),
  sources: z.array(z.object({ relativePath: RelativeMarkdownPathSchema, hash: z.string().length(64) }).strict()),
  template: CompilationTemplateReferenceSchema.nullable(),
  warnings: z.array(CompilationWarningSchema),
  decisionToken: z.string().uuid(),
  decisionExpiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime()
}).strict();
export const CompilationDecisionRequestSchema = z.object({
  pendingId: z.string().uuid(),
  revision: z.number().int().positive(),
  decision: z.enum(['confirm', 'reject']),
  decisionToken: z.string().uuid()
}).strict();
export const CompilationDecisionResultSchema = z.object({
  pendingId: z.string().uuid(),
  state: z.enum(['confirmed', 'rejected', 'failed', 'incomplete', 'conflicted', 'expired']),
  revision: z.number().int().positive(),
  auditId: z.string().uuid().nullable(),
  decidedAt: z.string().datetime()
}).strict();

export const TemplateWriteRequestSchema = z.object({
  templateId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  content: z.string().min(1).max(100_000),
  expectedLatestVersion: z.number().int().nonnegative().default(0)
}).strict();
export const StoredTemplateVersionSchema = z.object({
  id: z.string().uuid(), name: z.string().min(1), version: z.number().int().positive(),
  hash: z.string().length(64), content: z.string(), createdAt: z.string().datetime()
}).strict();
export const TemplateListRequestSchema = z.object({
  cursor: z.string().uuid().optional(), limit: z.number().int().min(1).max(100).default(100)
}).strict();
export const TemplateListSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(), name: z.string().min(1), latestVersion: z.number().int().positive(),
    versions: z.array(z.object({ version: z.number().int().positive(), hash: z.string().length(64), createdAt: z.string().datetime() }).strict())
  }).strict()),
  nextCursor: z.string().uuid().nullable()
}).strict();
export const TemplateReadRequestSchema = z.object({ id: z.string().uuid(), version: z.number().int().positive() }).strict();

export const OperationStatusSchema = z.enum([
  'pending', 'applying', 'success', 'rejected', 'failed', 'incomplete', 'conflicted', 'expired'
]);
export const RollbackStatusSchema = z.enum(['not-applicable', 'available', 'rolled-back', 'blocked']);
export const OperationHistoryRequestSchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(200).default(50)
}).strict();
export const OperationHistoryEntrySchema = z.object({
  operationId: z.string().uuid(),
  kind: z.enum(['compilation', 'mutation', 'rollback']),
  targetPath: RelativeMarkdownPathSchema,
  status: OperationStatusSchema,
  rollbackStatus: RollbackStatusSchema,
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
  errorCode: CompilationErrorCodeSchema.nullable(),
  auditId: z.string().uuid().nullable()
}).strict();
export const OperationHistorySchema = z.object({
  entries: z.array(OperationHistoryEntrySchema),
  nextCursor: z.string().datetime().nullable()
}).strict();

export type CompilationState = z.infer<typeof CompilationStateSchema>;
export type CompilationErrorCode = z.infer<typeof CompilationErrorCodeSchema>;
export type CompilationSubmitRequest = z.infer<typeof CompilationSubmitRequestSchema>;
export type CompilationSubmission = z.infer<typeof CompilationSubmissionSchema>;
export type CompilationStatus = z.infer<typeof CompilationStatusSchema>;
export type PendingCompilationSummary = z.infer<typeof PendingCompilationSummarySchema>;
export type PendingCompilationList = z.infer<typeof PendingCompilationListSchema>;
export type PendingCompilationDetail = z.infer<typeof PendingCompilationDetailSchema>;
export type CompilationDecisionRequest = z.infer<typeof CompilationDecisionRequestSchema>;
export type CompilationDecisionResult = z.infer<typeof CompilationDecisionResultSchema>;
export type StoredTemplateVersion = z.infer<typeof StoredTemplateVersionSchema>;
export type OperationHistory = z.infer<typeof OperationHistorySchema>;
