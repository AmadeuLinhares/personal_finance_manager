import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';

/*
 * Tailwind v4 generates spacing utilities for integer multipliers and `.5`, and
 * for nothing else. `px-2.6` and `gap-2.2` are not errors and not warnings —
 * they compile to no CSS at all, and the component silently loses its padding.
 *
 * This system's step is 4.6px, which invites exactly that mistake: 2.2 and 2.6
 * look like legitimate members of a 4.6px scale. They are not. The rule is the
 * one theme.css already states — whole steps, halves at most.
 */
const SPACING_UTILITY =
  /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|size|w|h)-\d+\.\d+\b/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith('.tsx') ? [path] : [];
  });
}

test('every spacing utility is a step Tailwind actually generates', () => {
  const offenders: string[] = [];

  for (const path of sourceFiles('src')) {
    const lines = readFileSync(path, 'utf8').split('\n');
    lines.forEach((line, index) => {
      for (const match of line.match(SPACING_UTILITY) ?? []) {
        if (!match.endsWith('.5')) {
          offenders.push(`${path}:${String(index + 1)} ${match}`);
        }
      }
    });
  }

  assert.deepEqual(
    offenders,
    [],
    `These classes produce no CSS. Snap them to a whole step or a .5:\n${offenders.join('\n')}`,
  );
});
