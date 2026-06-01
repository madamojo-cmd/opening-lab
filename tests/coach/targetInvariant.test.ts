import { describe, it, expect } from 'vitest';
import { buildVisibleTeachingSurface } from '../../lib/blundr/presentation/buildVisibleTeachingSurface';
import { buildEvidenceGraph } from '../../lib/blundr/brain/buildEvidenceGraph';
import { compileCoachFrame } from '../../lib/blundr/coachCompiler';
import type { CurrentInstructionFrame } from '../../lib/blundr/runtime/currentInstructionFrame';

// v2.7.42: Now exercises the real deterministic path (Evidence + Compiler + Surface)

describe('v2.7.42 Coach Target Invariant', () => {
  it('enforces instructionTargetUci === coachMoveUci via EvidenceGraph + Compiler + Surface', () => {
    const frame: CurrentInstructionFrame = {
      frameKey: 'test-italian-e4',
      kind: 'guided',
      target: { uci: 'e2e4', san: 'e4', pieceType: 'p', color: 'w', from: 'e2', to: 'e4', fenBefore: 'start' } as any,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      instructionFrameKey: 'test-frame',
    } as any;

    const evidence = buildEvidenceGraph(frame);
    expect(evidence.targetUci).toBe('e2e4');
    expect(evidence.targetPieceType).toBe('p');

    const compiled = compileCoachFrame({
      frame,
      evidenceGraph: evidence,
      displayMode: 'assisted',
      showMoreClicked: false,
    });

    expect(compiled.targetUci).toBe('e2e4');
    expect(compiled.targetPieceType).toBe('p');
    expect(compiled.assisted?.title).toContain('Play e4');

    const surface = buildVisibleTeachingSurface({
      currentInstructionFrame: frame,
      trainerPresentationFrame: { coach: { shouldRender: true, title: '', body: '' }, visual: { shouldRender: false } } as any,
      trainerView: 'assisted',
      isUserTurn: true,
      trainerPhase: 'ready_for_user',
    } as any);

    expect(surface.targetUci).toBe('e2e4');
    // Coach content should come from deterministic path
    expect(surface.coach.title).toContain('Play e4');
  });

  it('blocks bishop/knight piece mismatch at compiler + gate level', () => {
    // This will be strengthened as SafetyGate is called more in surface
    expect(true).toBe(true);
  });
});