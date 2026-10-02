import type { AnalysisIssue } from '../types';

export const SAMPLE_INPUT_TEXT = `1. The system shall process incoming financial transaction payloads within 5 seconds under any load.
2. Under peak load periods exceeding 10,000 transactions/sec, response latency may degrade up to a maximum of 45 seconds.
3. User passwords must be exactly 8 characters in length and contain at least one special character and number.
4. User passwords shall contain a minimum of 12 characters to ensure compliance with SOC2 Type II security guidelines.
5. The application shall interface seamlessly with the legacy enterprise billing system.
6. The system shall generate a detailed audit log entry for every state modification and access attempt.
7. Audit records must be recorded in JSON format containing timestamp, actor ID, action verb, and checksum for every system change.
8. When an unexpected payment gateway timeout occurs, the system shall recover automatically.
9. All critical customer PII data must be encrypted using strong modern cryptographic algorithms.
10. Users may request account deletion at any time.`;

export const MOCK_ANALYSIS_ISSUES: AnalysisIssue[] = [
  {
    id: 'iss-1',
    reqCode: 'REQ-012',
    category: 'contradiction',
    categoryLabel: 'Contradiction',
    originalText: 'The system shall process incoming financial transaction payloads within 5 seconds under any load.',
    conflictingReqCode: 'REQ-018',
    issueDescription: 'Directly contradicts REQ-018 which allows response latency to degrade up to 45 seconds under peak load periods (>10k tps). "Under any load" cannot coexist with conditional 45s latency tolerance.',
    suggestedFix: 'The system shall process financial transaction payloads within 5.0 seconds under nominal load (<5,000 TPS), with a 99th percentile latency ceiling of 15.0 seconds during burst load up to 10,000 TPS.',
    severity: 'high'
  },
  {
    id: 'iss-2',
    reqCode: 'REQ-045',
    category: 'contradiction',
    categoryLabel: 'Contradiction',
    originalText: 'User passwords must be exactly 8 characters in length and contain at least one special character and number.',
    conflictingReqCode: 'REQ-049',
    issueDescription: 'Directly clashes with REQ-049 specifying a 12-character minimum for SOC2 compliance. An exact 8-character constraint makes 12-character minimum compliance mathematically impossible.',
    suggestedFix: 'User passwords shall be between 12 and 64 characters in length and require at least one uppercase letter, one lowercase letter, one number, and one approved symbol.',
    severity: 'high'
  },
  {
    id: 'iss-3',
    reqCode: 'REQ-077',
    category: 'ambiguous',
    categoryLabel: 'Ambiguous',
    originalText: 'The application shall interface seamlessly with the legacy enterprise billing system.',
    issueDescription: 'Vague qualifier "interface seamlessly" lacks technical boundaries. Omits protocol (SOAP, REST, gRPC, RPC), error handling, sync vs async batching, and schema sync mechanisms.',
    suggestedFix: 'The application shall ingest daily billing records from the AS400 billing server via secure SFTP batch XML files at 02:00 UTC, validating schema against Enterprise Billing XSD v3.2 with retry queues on network failure.',
    severity: 'medium'
  },
  {
    id: 'iss-4',
    reqCode: 'REQ-089',
    category: 'ambiguous',
    categoryLabel: 'Ambiguous',
    originalText: 'All critical customer PII data must be encrypted using strong modern cryptographic algorithms.',
    issueDescription: 'Subjective term "strong modern cryptographic algorithms" is ambiguous and legally unverifiable without specific algorithm, key length, and rotation interval designations.',
    suggestedFix: 'All customer PII (e.g., SSN, email, payment tokens) shall be encrypted at rest using AES-256-GCM with automated annual KMS key rotation, and in transit using TLS 1.3 with HSTS enabled.',
    severity: 'medium'
  },
  {
    id: 'iss-5',
    reqCode: 'REQ-112',
    category: 'incomplete',
    categoryLabel: 'Incomplete',
    originalText: 'When an unexpected payment gateway timeout occurs, the system shall recover automatically.',
    issueDescription: 'Lacks failure protocol, fallback transaction state machine, reversal/void mechanisms, idempotency keys, and notification SLAs to user or accounting teams.',
    suggestedFix: 'Upon encountering a payment gateway timeout (>10s), the system shall mark the transaction state as PENDING_RECONCILIATION, execute an idempotent status check via webhook within 30s, and if unresolved, initiate an automated void and alert the user with code ERR_GATEWAY_TIMEOUT.',
    severity: 'high'
  },
  {
    id: 'iss-6',
    reqCode: 'REQ-134',
    category: 'incomplete',
    categoryLabel: 'Incomplete',
    originalText: 'Users may request account deletion at any time.',
    issueDescription: 'Fails to specify data retention exceptions required by statutory tax/financial compliance laws (e.g. 7-year invoice preservation), deletion grace periods, or third-party sync cascades.',
    suggestedFix: 'Upon user account deletion request, personal profile data shall be soft-deleted within 24 hours and permanently purged after 30 days, while financial invoices and transaction ledgers are retained in anonymized cold storage for 7 years per regulatory compliance.',
    severity: 'medium'
  },
  {
    id: 'iss-7',
    reqCode: 'REQ-156',
    category: 'duplicate',
    categoryLabel: 'Duplicate',
    originalText: 'The system shall generate a detailed audit log entry for every state modification and access attempt.',
    conflictingReqCode: 'REQ-158',
    issueDescription: 'Redundant with REQ-158 ("Audit records must be recorded in JSON format containing timestamp, actor ID, action verb..."). Maintaining both creates sync divergence risk during future edits.',
    suggestedFix: 'Consolidate into single specification: "The system shall record an immutable JSON audit log for every state modification and authorization attempt, structured with UTC timestamp, actor ID, action verb, resource URI, client IP, and HMAC checksum."',
    severity: 'low'
  }
];
