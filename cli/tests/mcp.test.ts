import { test } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { MCP_TOOLS, executeTool } from '../src/mcp/tools.js';
import { DEFAULT_CONFIG } from '../src/utils/config.js';

test('mcp - exposes standard tool definitions', () => {
  assert.strictEqual(MCP_TOOLS.length, 3, 'Should expose exactly 3 MCP tools');
  const toolNames = MCP_TOOLS.map((t) => t.name);
  assert.ok(toolNames.includes('magetool_inspect_repo'));
  assert.ok(toolNames.includes('magetool_audit_security'));
  assert.ok(toolNames.includes('magetool_pr_review'));
});

test('mcp - executes magetool_inspect_repo tool cleanly', async () => {
  const result = await executeTool(
    'magetool_inspect_repo',
    { directory: path.resolve('./src') },
    DEFAULT_CONFIG,
    process.cwd()
  );

  assert.ok(result.totalFiles > 0, 'Inspected files count should be > 0');
  assert.ok(result.totalLines > 0, 'Inspected lines count should be > 0');
});
