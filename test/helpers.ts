import assert from 'node:assert'
import { toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { NormalizeResult } from '../src/types';

export function assertMatchCloseTo(
  received: NormalizeResult,
  expected: Partial<NormalizeResult>,
) {
  const result = toMatchCloseTo(received, expected)
  assert.ok(result.pass, result.message())
}
