import path from 'path';
import { loadConfig, initConfig } from './utils/config.js';
import { colors, style, createBanner, drawTable, formatBytes } from './utils/format.js';
import { scanRepository } from './core/scanner.js';
import { auditFiles } from './core/audit.js';
import { generatePRReview } from './core/reviewer.js';
import { startMCPServer } from './mcp/server.js';

export async function runCLI(args: string[]): Promise<void> {
  const cwd = process.cwd();
  const config = await loadConfig(cwd);

  const command = args[0] || 'help';

  switch (command) {
    case 'init': {
      console.log(createBanner('MageTool Initializer', 'Generating .magetool.json config'));
      const filePath = await initConfig(cwd);
      console.log(`\n${style('✔', colors.green, colors.bold)} Configuration generated at ${style(filePath, colors.cyan)}`);
      break;
    }

    case 'inspect': {
      const targetDir = args[1] ? path.resolve(cwd, args[1]) : cwd;
      console.log(createBanner('MageTool Codebase Inspector', `Target: ${targetDir}`));

      const result = await scanRepository(targetDir, config);

      console.log(`\n${style('Repository Summary:', colors.bold, colors.magenta)}`);
      console.log(`  • Total Files:        ${style(result.totalFiles, colors.cyan, colors.bold)}`);
      console.log(`  • Total Lines:        ${style(result.totalLines, colors.cyan, colors.bold)}`);
      console.log(`  • Total Size:         ${style(formatBytes(result.totalSizeBytes), colors.cyan, colors.bold)}`);
      console.log(`  • Duration:           ${style(result.scanDurationMs + 'ms', colors.dim)}`);

      const extHeaders = ['Extension', 'Files', 'Lines of Code', 'Size'];
      const extRows = Object.entries(result.extensionStats)
        .sort((a, b) => b[1].lines - a[1].lines)
        .slice(0, 10)
        .map(([ext, stats]) => [
          ext,
          stats.count,
          stats.lines.toLocaleString(),
          formatBytes(stats.sizeBytes),
        ]);

      if (extRows.length > 0) {
        console.log(`\n${style('Top Language Extensions:', colors.bold)}`);
        console.log(drawTable(extHeaders, extRows));
      }
      break;
    }

    case 'audit': {
      const targetDir = args[1] ? path.resolve(cwd, args[1]) : cwd;
      console.log(createBanner('MageTool Security & Code Smell Auditor', `Target: ${targetDir}`));

      const scanResult = await scanRepository(targetDir, config);
      const auditReport = await auditFiles(scanResult.files);

      console.log(`\n${style('Audit Findings:', colors.bold, colors.magenta)}`);
      console.log(`  • Critical: ${style(auditReport.countsBySeverity.critical, auditReport.countsBySeverity.critical > 0 ? colors.red : colors.green, colors.bold)}`);
      console.log(`  • High:     ${style(auditReport.countsBySeverity.high, auditReport.countsBySeverity.high > 0 ? colors.red : colors.green, colors.bold)}`);
      console.log(`  • Medium:   ${style(auditReport.countsBySeverity.medium, auditReport.countsBySeverity.medium > 0 ? colors.yellow : colors.green, colors.bold)}`);
      console.log(`  • Low:      ${style(auditReport.countsBySeverity.low, colors.dim)}`);

      if (auditReport.issues.length > 0) {
        console.log(`\n${style('Issue Breakdown:', colors.bold)}`);
        const headers = ['Rule ID', 'Severity', 'File', 'Line', 'Snippet'];
        const rows = auditReport.issues.slice(0, 15).map((iss) => [
          iss.ruleId,
          iss.severity.toUpperCase(),
          iss.relativePath,
          iss.line,
          iss.snippet.substring(0, 40),
        ]);
        console.log(drawTable(headers, rows));
      } else {
        console.log(`\n${style('✔ Zero security vulnerabilities detected!', colors.green, colors.bold)}`);
      }
      break;
    }

    case 'review': {
      const targetDir = args[1] ? path.resolve(cwd, args[1]) : cwd;
      console.log(createBanner('MageTool Automated PR Reviewer', `Analyzing ${targetDir}`));

      const review = await generatePRReview(targetDir, config);
      console.log('\n' + review.markdown);
      break;
    }

    case 'serve': {
      // Stdio MCP server mode for AI agents
      startMCPServer(config, cwd);
      break;
    }

    case '-v':
    case '--version':
    case 'version': {
      console.log(`magetool v${config.version}`);
      break;
    }

    case '-h':
    case '--help':
    case 'help':
    default: {
      console.log(createBanner('MageTool CLI', 'AI Agent & Developer Workflow Suite'));
      console.log(`
${style('USAGE:', colors.bold, colors.cyan)}
  magetool <command> [options]

${style('COMMANDS:', colors.bold, colors.cyan)}
  ${style('inspect', colors.green)} [dir]     Deeply inspect codebase topology, file counts, and LOC
  ${style('audit', colors.green)}   [dir]     Audit codebase for secrets, leaked keys, and security smells
  ${style('review', colors.green)}  [dir]     Generate automated GitHub PR markdown review comment
  ${style('serve', colors.green)}           Start stdio Model Context Protocol (MCP) server for agents
  ${style('init', colors.green)}            Generate default .magetool.json configuration file
  ${style('help', colors.green)}            Show this help dialog
  ${style('version', colors.green)}         Display current version

${style('EXAMPLES:', colors.bold, colors.cyan)}
  magetool inspect ./src
  magetool audit .
  magetool review .
  magetool serve

${style('DOCUMENTATION:', colors.dim)} https://github.com/Wolvestorm11/magetool
`);
      break;
    }
  }
}
