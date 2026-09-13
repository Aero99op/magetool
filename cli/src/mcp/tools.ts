import { scanRepository } from '../core/scanner.js';
import { auditFiles } from '../core/audit.js';
import { generatePRReview } from '../core/reviewer.js';
import { MageConfig } from '../utils/config.js';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'magetool_inspect_repo',
    description: 'Inspect repository topology, file distribution, languages, and lines of code.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Absolute or relative path to the repository directory to inspect.',
        },
      },
    },
  },
  {
    name: 'magetool_audit_security',
    description: 'Audit repository code for leaked credentials, API keys, and dangerous security code smells.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Path to repository directory to audit.',
        },
      },
    },
  },
  {
    name: 'magetool_pr_review',
    description: 'Generate an automated, comprehensive markdown PR code review report.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Repository directory path.',
        },
        diff: {
          type: 'string',
          description: 'Optional raw git diff string to review.',
        },
      },
    },
  },
];

export async function executeTool(
  toolName: string,
  args: Record<string, any>,
  config: MageConfig,
  currentCwd: string
): Promise<any> {
  const targetDir = args.directory || currentCwd;

  switch (toolName) {
    case 'magetool_inspect_repo': {
      const result = await scanRepository(targetDir, config);
      return {
        rootDirectory: result.rootDirectory,
        totalFiles: result.totalFiles,
        totalLines: result.totalLines,
        totalSizeBytes: result.totalSizeBytes,
        extensions: result.extensionStats,
        scanDurationMs: result.scanDurationMs,
      };
    }
    case 'magetool_audit_security': {
      const scan = await scanRepository(targetDir, config);
      const audit = await auditFiles(scan.files);
      return audit;
    }
    case 'magetool_pr_review': {
      const review = await generatePRReview(targetDir, config, args.diff);
      return review;
    }
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
