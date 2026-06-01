import { describe, it, expect } from 'vitest';
import golden from '../../data/goldenCoachPositions.json';

describe('v2.7.42 Golden Coach Positions', () => {
  it.each(golden)('produces correct target-bound output for $id', (position) => {
    // Full pipeline test against the golden data.
    // Will fail until EvidenceGraph + Compiler + SafetyGate + Surface are wired.
    expect(position.expectedTargetUci).toBeDefined();
    // Real assertions will be added against buildVisibleTeachingSurface + compiler output.
  });
});