import { test } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { generatePRReview } from '../src/core/reviewer.js';
import { DEFAULT_CONFIG } from '../src/utils/config.js';

test('reviewer - generates a markdown review report', async () => {
  const targetDir = path.resolve('.');
  const mockDiff = `
diff --git a/test.ts b/test.ts
--- a/test.ts
+++ b/test.ts
@@ -1,3 +1,4 @@
+const safe = true;
`;
  const review = await generatePRReview(targetDir, DEFAULT_CONFIG, mockDiff);

  assert.ok(review.score >= 0 && review.score <= 100, 'Score should be between 0 and 100');
  assert.ok(review.markdown.includes('MageTool Automated Code Review Report'), 'Report should include title');
  assert.ok(review.markdown.includes('Repository Health Score'), 'Report should include health score table');
});
