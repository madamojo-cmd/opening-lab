import assert from "node:assert/strict";
import test from "node:test";
import { resolveLearningAttemptAuthority } from "../learningAttemptAuthority";
test("spoofed correct type cannot override the played move",()=>assert.deepEqual(resolveLearningAttemptAuthority({expectedMoveUci:"e2e4",playedMoveUci:"d2d4",requestedType:"move_correct",serverNow:"2026-08-06T00:00:00.000Z"}),{ok:true,taxonomy:"move_incorrect",correct:false,occurredAt:"2026-08-06T00:00:00.000Z"}));
test("reveal is not correctness and uses server receipt time",()=>assert.deepEqual(resolveLearningAttemptAuthority({expectedMoveUci:"e2e4",playedMoveUci:"e2e4",requestedType:"cue_revealed",serverNow:"2026-08-06T00:00:00.000Z"}),{ok:true,taxonomy:"cue_revealed",correct:false,occurredAt:"2026-08-06T00:00:00.000Z"}));
test("invalid UCI is rejected",()=>assert.deepEqual(resolveLearningAttemptAuthority({expectedMoveUci:"e2e4",playedMoveUci:"bad",requestedType:"move_correct",serverNow:"now"}),{ok:false,error:"invalid_played_move"}));
