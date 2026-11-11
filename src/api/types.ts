// Types mirrored from the backend's Pydantic schemas (trace2pr/api/schemas/*.py).
// Keep these in sync with the backend — they are the single source of truth
// for what every `src/api/*` function returns.

// ---- common.py ----

export type AlertSource = 'datadog' | 'cloudwatch' | 'sentry' | 'pagerduty' | 'grafana' | 'generic';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'new' | 'acknowledged' | 'processing' | 'resolved' | 'dismissed';
export type IncidentStatus = 'open' | 'analyzing' | 'fixing' | 'pr_created' | 'resolved' | 'escalated';
export type FixStatus =
  | 'queued'
  | 'sandbox_creating'
  | 'cloning'
  | 'analyzing'
  | 'fixing'
  | 'testing'
  | 'pr_creating'
  | 'completed'
  | 'failed'
  | 'cancelled';
export type PRStatus = 'draft' | 'open' | 'merged' | 'closed' | 'changes_requested';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// ---- alerts.py ----

export interface AlertDetail {
  id: string;
  title: string;
  description: string | null;
  source: AlertSource;
  severity: Severity;
  service: string;
  raw_payload: Record<string, unknown>;
  status: AlertStatus;
  created_at: string;
  updated_at: string;
  incident_id: string | null;
}

export type AlertListResponse = PaginatedResponse<AlertDetail>;

export interface AlertStats {
  total_alerts: number;
  by_severity: Record<string, number>;
  by_status: Record<string, number>;
}

export interface AlertListParams {
  source?: AlertSource;
  severity?: Severity;
  status?: AlertStatus;
  service?: string;
  since?: string;
  page?: number;
  per_page?: number;
}

// ---- incidents.py ----

export interface IncidentDetail {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  service: string;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  alert_ids: string[];
  report_id: string | null;
  fix_job_id: string | null;
  pr_id: string | null;
  source?: string | null;
  environment?: string | null;
  repository?: string | null;
  release?: string | null;
  /** Deployed git SHA; null means the commit is unknown. */
  commit_sha?: string | null;
  error_group?: ErrorGroupSummary | null;
}

export interface ErrorGroupSummary {
  id: string;
  fingerprint: string;
  exception_type: string | null;
  occurrences: number;
  first_seen: string;
  last_seen: string;
  status: 'active' | 'resolved' | 'ignored';
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  severity: Severity;
  service: string;
  alert_ids?: string[];
}

export interface UpdateIncidentRequest {
  status?: IncidentStatus;
  severity?: Severity;
}

export interface TimelineEvent {
  id: string;
  incident_id: string;
  event_type: string;
  message: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface TimelineResponse {
  events: TimelineEvent[];
}

// ---- analysis.py ----

export interface SuspectedFile {
  path: string;
  reason: string;
  confidence_score: number;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  service: string;
}

export interface CommitInfo {
  sha: string;
  author: string;
  message: string;
  date: string;
}

export interface Evidence {
  logs: LogEntry[];
  commits: CommitInfo[];
  traces: Record<string, unknown>[];
}

export interface DiagnosticReport {
  id: string;
  incident_id: string;
  summary: string;
  root_cause_hypothesis: string;
  suspected_files: SuspectedFile[];
  evidence: Evidence;
  created_at: string;
}

export interface AnalysisJob {
  id: string;
  incident_id: string;
  status: string;
  created_at: string;
  report: DiagnosticReport | null;
}

// ---- fixer.py ----

export interface FileDiff {
  status?: string | null;
  file_path: string;
  diff: string;
  additions: number;
  deletions: number;
}

export interface DiffResponse {
  files: FileDiff[];
  total_additions: number;
  total_deletions: number;
}

export interface TestFailure {
  test_name: string;
  file_path: string;
  error_message: string;
}

export interface TestResults {
  passed: number;
  failed: number;
  skipped: number;
  failures: TestFailure[];
}

export interface ReproTest {
  test_ids: string[];
  failed_on_baseline: boolean;
  passes_with_fix: boolean;
}

export interface FixAttempt {
  id: string;
  job_id: string;
  attempt_number: number;
  status: 'running' | 'succeeded' | 'failed' | string;
  created_at: string;
  completed_at: string | null;
  diff: DiffResponse | null;
  tests: TestResults | null;
  summary: string | null;
  failure_reason: string | null;
  repro_test: ReproTest | null;
  guardrail_violations: string[];
  setup: { language?: string; test_cmd?: string; baseline?: { passed: number; failed: number } } | null;
  timings: Record<string, number>;
  cost_usd: number;
}

export interface FixJobDetail {
  id: string;
  incident_id: string;
  status: FixStatus;
  created_at: string;
  updated_at: string;
  attempts: FixAttempt[];
  repository: string | null;
  commit_sha: string | null;
  cost_usd: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface TranscriptTurn {
  role: 'assistant' | 'tool' | 'system' | string;
  content: string;
  timestamp: string;
  tool_calls: { id?: string; name: string; input: Record<string, unknown> }[] | null;
  is_error?: boolean | null;
}

export interface Transcript {
  job_id: string;
  turns: TranscriptTurn[];
}

// ---- sandbox.py ----

export interface SandboxTemplate {
  id: string;
  name: string;
  description: string;
  base_image: string;
}

export interface SandboxInstance {
  id: string;
  template_id: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export interface ResourceUsage {
  cpu_percent: number;
  memory_mb: number;
  disk_mb: number;
}

export interface CreateSandboxRequest {
  template_id: string;
  timeout_seconds?: number;
}

export interface ExecRequest {
  command: string;
  cwd?: string;
  timeout?: number;
}

export interface ExecResult {
  exit_code: number;
  stdout: string;
  stderr: string;
}

// ---- prs.py ----

export interface CICheck {
  name: string;
  status: string;
  conclusion: string | null;
  url: string;
}

export interface CIStatus {
  state: string;
  checks: CICheck[];
}

export interface PRDetail {
  id: string;
  provider_pr_id: string;
  incident_id: string;
  title: string;
  url: string;
  status: PRStatus;
  created_at: string;
  updated_at: string;
  ci_status: CIStatus | null;
  repository: string | null;
  number: number | null;
  branch: string | null;
  fix_job_id: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
}

export interface PRStats {
  total_prs: number;
  merged_prs: number;
  average_merge_time_minutes: number;
}

// ---- knowledge.py ----

export interface PastIncident {
  id: string;
  title: string;
  resolution_summary: string;
  created_at: string;
  similarity_score: number | null;
}

export interface PastFix {
  id: string;
  description: string;
  diff_summary: string;
  created_at: string;
  similarity_score: number | null;
}

export interface SearchResults {
  incidents: PastIncident[];
  fixes: PastFix[];
}

export interface KBStats {
  total_incidents_indexed: number;
  total_fixes_indexed: number;
  last_updated: string;
}

// ---- integrations.py ----

export type IntegrationCategory = 'observability' | 'incident' | 'vcs' | 'cloud';

export interface Integration {
  id: string;
  user_id: string;
  service: string;
  category: string;
  status: string;
  config: Record<string, unknown>;
  composio_connection_id?: string | null;
  composio_entity_id?: string | null;
  verified_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  /** Where this monitoring tool should send alerts (null for GitHub). */
  webhook_url?: string | null;
}

export interface GitHubRepo {
  full_name: string;
  owner?: string;
  owner_avatar_url?: string | null;
  description?: string | null;
  language?: string | null;
  default_branch: string;
  private: boolean;
  pushed_at?: string | null;
  html_url?: string | null;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
}

/** What a monitoring tool reports errors under (Sentry project, Datadog service, CloudWatch alarm). */
export interface MonitoredService {
  /** The service name errors arrive with: what a repo mapping matches on. */
  key: string;
  name: string;
  detail: string | null;
  group: string | null;
}

export interface MonitoredServices {
  service: string;
  items: MonitoredService[];
  accounts: string[];
  create_url: string | null;
}
export interface IntegrationCatalogItem {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  logo_url?: string | null;
  oauth_supported: boolean;
  required_fields: string[];
  /** oauth: Composio OAuth. api_key: Composio's hosted key form. credentials: a form in Trace2PR. */
  auth_method: 'oauth' | 'api_key' | 'credentials';
  credential_fields: CredentialField[];
}

export interface CredentialField {
  name: string;
  label: string;
  secret: boolean;
  required: boolean;
  placeholder?: string | null;
  help?: string | null;
}

export interface ConnectResponse {
  success: boolean;
  redirect_url?: string;
  connection_id?: string;
  entity_id?: string;
  error?: string;
}

export interface StatusResponse {
  connected: boolean;
  connection_id?: string;
  status?: string;
  auth_config?: Record<string, unknown>;
  error?: string;
}

// ---- settings.py ----

export interface SettingsResponse {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  theme: 'system' | 'light' | 'dark';
  notifications: Record<string, boolean>;
}

// ---- health.py ----

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error' | 'not_configured';
  details: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  supabase: HealthCheckResult;
  redis: HealthCheckResult;
  e2b: HealthCheckResult;
  composio: HealthCheckResult;
}

// ---- webhooks.py ----

// =============================================
// Repo mappings
// =============================================

export type RepoLanguage = 'python' | 'javascript' | 'typescript' | 'java';
/** The tool a mapping's service name comes from; null matches any tool. */
export type MappingSource = 'sentry' | 'datadog' | 'cloudwatch' | 'sdk';

export interface RepoMappingInput {
  service: string;
  repository: string;
  source?: MappingSource | null;
  default_branch: string;
  language: RepoLanguage | null;
  install_cmd: string | null;
  test_cmd: string | null;
  auto_fix: boolean;
  enabled: boolean;
}

export interface RepoMapping extends RepoMappingInput {
  id: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// Triage
// =============================================

export type TriageDecisionKind = 'fix' | 'needs_review' | 'skip';
export type TriageCategory = 'code_bug' | 'config' | 'infra' | 'dependency' | 'flaky' | 'unknown';

export interface TriageDecision {
  id: string;
  incident_id: string;
  decision: TriageDecisionKind;
  rules_passed: boolean;
  failed_rules: { rule: string; detail: string }[];
  category: TriageCategory | null;
  fixable: boolean | null;
  confidence: number | null;
  reason: string | null;
  suspected_location: string | null;
  model: string | null;
  cost_usd: number;
  created_at: string;
}

export interface OnboardingStatus {
  completed: boolean;
  steps: { github: boolean; repos: boolean; monitoring: boolean };
  repo_mappings: { service: string; repository: string }[];
  monitoring: { service: string; webhook_url: string | null }[];
}
