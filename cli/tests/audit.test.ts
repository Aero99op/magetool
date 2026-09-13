import { test } from 'node:test';
import assert from 'node:assert';
import { auditFiles } from '../src/core/audit.js';

test('audit - cleanly audits clean files without false positives', async () => {
  const cleanFiles = [
    {
      filePath: './src/index.ts',
      relativePath: 'src/index.ts',
      extension: '.ts',
      sizeBytes: 1000,
      lines: 50,
      isBinary: false,
    },
  ];

  const report = await auditFiles(cleanFiles);
  assert.strictEqual(report.countsBySeverity.critical, 0, 'No critical vulnerabilities in clean code');
  assert.ok(report.timestamp, 'Report should have timestamp');
});
