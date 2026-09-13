import { promises as fs } from 'fs';
import { FileMetric } from './scanner.js';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditIssue {
  ruleId: string;
  ruleName: string;
  severity: Severity;
  filePath: string;
  relativePath: string;
  line: number;
  snippet: string;
  recommendation: string;
}

export interface AuditReport {
  timestamp: string;
  totalScannedFiles: number;
  totalIssues: number;
  countsBySeverity: Record<Severity, number>;
  issues: AuditIssue[];
}

interface Rule {
  id: string;
  name: string;
  severity: Severity;
  pattern: RegExp;
  recommendation: string;
  applicableExtensions?: string[];
}

const AUDIT_RULES: Rule[] = [
  // Secrets & Credentials
  {
    id: 'SEC001',
    name: 'Hardcoded OpenAI API Key',
    severity: 'critical',
    pattern: /sk-[a-zA-Z0-9]{32,64}/,
    recommendation: 'Move the API key to environment variables or secret store. Never commit raw keys.',
  },
  {
    id: 'SEC002',
    name: 'Hardcoded AWS Access Key',
    severity: 'critical',
    pattern: /AKIA[0-9A-Z]{16}/,
    recommendation: 'Use AWS IAM roles or environment variables (AWS_ACCESS_KEY_ID).',
  },
  {
    id: 'SEC003',
    name: 'Generic Private Key Block',
    severity: 'critical',
    pattern: /-----BEGIN (RSA|EC|OPENSSH|DSA|PGP) PRIVATE KEY-----/,
    recommendation: 'Remove private key file from repository and rotate immediately.',
  },
  {
    id: 'SEC004',
    name: 'Hardcoded Password / Secret Variable',
    severity: 'high',
    pattern: /(?:password|passwd|secret|api_key|apikey|auth_token)\s*[:=]\s*["'][^"'\s]{8,}["']/i,
    recommendation: 'Ensure credentials are not committed to source control. Use .env files with .gitignore.',
  },
  // Dangerous Code Patterns
  {
    id: 'SMELL001',
    name: 'Dangerous eval Call', // audit-ignore
    severity: 'high',
    pattern: /\beval\s*\(/, // audit-ignore
    recommendation: 'Avoid dynamic execution via dynamic evaluators. Use structured JSON parsers or safe AST interpreters.', // audit-ignore
    applicableExtensions: ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'],
  },
  {
    id: 'SMELL002',
    name: 'Unrestricted Child Process Execution',
    severity: 'medium',
    pattern: /\b(?:exec|execSync)\s*\(\s*[`'"][^`'"]*\$\{/, // audit-ignore
    recommendation: 'Avoid string interpolation inside exec(). Use execFile or spawn with explicit argument arrays to prevent shell injection.',
    applicableExtensions: ['.js', '.ts', '.mjs'],
  },
  {
    id: 'SMELL003',
    name: 'Insecure Math.random for Cryptography',
    severity: 'medium',
    pattern: /crypto.*Math\.random\(\)|Math\.random\(\).*token|password.*Math\.random\(\)/i, // audit-ignore
    recommendation: 'Use crypto.randomBytes() or crypto.getRandomValues() for cryptographic security.',
    applicableExtensions: ['.js', '.ts', '.jsx', '.tsx'],
  },
  {
    id: 'SMELL004',
    name: 'Prototype Pollution Vulnerability',
    severity: 'high',
    pattern: /__proto__|constructor\s*\[\s*['"]prototype['"]\s*\]/, // audit-ignore
    recommendation: 'Sanitize object keys or use Object.create(null) to protect against prototype pollution attacks.',
    applicableExtensions: ['.js', '.ts', '.jsx', '.tsx'],
  },
];

export async function auditFiles(files: FileMetric[]): Promise<AuditReport> {
  const issues: AuditIssue[] = [];
  const severityCounts: Record<Severity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  for (const file of files) {
    if (file.isBinary) continue;

    let content = '';
    try {
      content = await fs.readFile(file.filePath, 'utf-8');
    } catch {
      continue;
    }

    const lines = content.split(/\r?\n/);

    for (const rule of AUDIT_RULES) {
      if (
        rule.applicableExtensions &&
        !rule.applicableExtensions.includes(file.extension)
      ) {
        continue;
      }

      for (let i = 0; i < lines.length; i++) {
        const lineContent = lines[i];
        if (rule.pattern.test(lineContent)) {
          // avoid flagging rules themselves or test fixtures with explicit test comments
          if (lineContent.includes('// audit-ignore') || lineContent.includes('// test-fixture')) {
            continue;
          }

          issues.push({
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            filePath: file.filePath,
            relativePath: file.relativePath,
            line: i + 1,
            snippet: lineContent.trim().substring(0, 100),
            recommendation: rule.recommendation,
          });

          severityCounts[rule.severity] += 1;
        }
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    totalScannedFiles: files.filter((f) => !f.isBinary).length,
    totalIssues: issues.length,
    countsBySeverity: severityCounts,
    issues,
  };
}
