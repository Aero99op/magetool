import { execSync } from 'child_process';
import { AuditReport, auditFiles } from './audit.js';
import { ScanResult, scanRepository } from './scanner.js';
import { MageConfig } from '../utils/config.js';

export interface ReviewFinding {
  type: 'security' | 'architecture' | 'hygiene';
  message: string;
  file?: string;
  line?: number;
}

export interface ReviewReport {
  summary: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  findings: ReviewFinding[];
  score: number; // 0 to 100
  markdown: string;
}

export async function generatePRReview(
  repoDir: string,
  config: MageConfig,
  diffInput?: string
): Promise<ReviewReport> {
  let gitDiff = diffInput || '';

  if (!gitDiff) {
    try {
      gitDiff = execSync('git diff HEAD~1..HEAD', {
        cwd: repoDir,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch {
      try {
        gitDiff = execSync('git diff HEAD', {
          cwd: repoDir,
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'ignore'],
        });
      } catch {
        gitDiff = '';
      }
    }
  }

  const scanResult: ScanResult = await scanRepository(repoDir, config);
  const auditReport: AuditReport = await auditFiles(scanResult.files);

  const findings: ReviewFinding[] = [];

  for (const issue of auditReport.issues) {
    findings.push({
      type: 'security',
      message: `[${issue.severity.toUpperCase()}] ${issue.ruleName}: ${issue.snippet}`,
      file: issue.relativePath,
      line: issue.line,
    });
  }

  // Parse git diff stats if available
  let additions = 0;
  let deletions = 0;
  const changedFilePaths = new Set<string>();

  if (gitDiff) {
    const lines = gitDiff.split('\n');
    for (const l of lines) {
      if (l.startsWith('+++ b/')) {
        changedFilePaths.add(l.substring(6));
      } else if (l.startsWith('+') && !l.startsWith('+++')) {
        additions++;
      } else if (l.startsWith('-') && !l.startsWith('---')) {
        deletions++;
      }
    }
  }

  // Calculate health score
  let score = 100;
  score -= auditReport.countsBySeverity.critical * 25;
  score -= auditReport.countsBySeverity.high * 15;
  score -= auditReport.countsBySeverity.medium * 5;
  score -= auditReport.countsBySeverity.low * 2;
  score = Math.max(0, Math.min(100, score));

  // Build Markdown PR comment
  const mdParts: string[] = [
    `## 🧙‍♂️ MageTool Automated Code Review Report`,
    ``,
    `| Metric | Value |`,
    `| :--- | :--- |`,
    `| **Repository Health Score** | **${score}/100** ${score >= 80 ? '🟢 Pass' : score >= 50 ? '🟡 Needs Attention' : '🔴 Critical Issues'} |`,
    `| **Total Scanned Files** | \`${scanResult.totalFiles}\` |`,
    `| **Total Lines of Code** | \`${scanResult.totalLines}\` |`,
    `| **Security Vulnerabilities** | \`${auditReport.totalIssues}\` (Crit: ${auditReport.countsBySeverity.critical}, High: ${auditReport.countsBySeverity.high}) |`,
    `| **Diff Changes** | +${additions} / -${deletions} across ${changedFilePaths.size} files |`,
    ``,
  ];

  if (findings.length > 0) {
    mdParts.push(`### ⚠️ Findings & Recommendations`);
    for (const f of findings.slice(0, 10)) {
      mdParts.push(`* **[${f.type.toUpperCase()}]** ${f.file ? `\`${f.file}${f.line ? `:${f.line}` : ''}\`: ` : ''}${f.message}`);
    }
    if (findings.length > 10) {
      mdParts.push(`* *... and ${findings.length - 10} additional findings.*`);
    }
    mdParts.push(``);
  } else {
    mdParts.push(`### ✅ No Critical Vulnerabilities or Smells Detected`);
    mdParts.push(`Code passes repository hygiene and security thresholds.`);
    mdParts.push(``);
  }

  mdParts.push(`---`);
  mdParts.push(`*Generated autonomously by [MageTool](https://github.com/Wolvestorm11/magetool) • Open Source Developer Intelligence*`);

  return {
    summary: `Repository Health: ${score}/100 with ${findings.length} findings across ${scanResult.totalFiles} files.`,
    filesChanged: changedFilePaths.size,
    additions,
    deletions,
    findings,
    score,
    markdown: mdParts.join('\n'),
  };
}
