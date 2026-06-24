#!/usr/bin/env node
import fs from "node:fs";

const [,, file, stage, expectedOpening] = process.argv;

if (!file || !stage) {
  console.error(`
Usage:
  node scripts/verify-copy-everything.mjs <copy-everything.json> <stage> [expectedOpening]

Stages:
  start
  ply6
  ply12
  post_continue
  continuation

Examples:
  node scripts/verify-copy-everything.mjs qa/browser-copy-everything/italian-white-ply12.json ply12 italian-white
  node scripts/verify-copy-everything.mjs qa/browser-copy-everything/italian-white-post-continue.json post_continue italian-white
`);
  process.exit(2);
}

const raw = fs.readFileSync(file, "utf8").trim();
const data = JSON.parse(raw);

function get(obj, path) {
  return path.split(".").reduce((acc, key) => acc == null ? undefined : acc[key], obj);
}

function first(...values) {
  return values.find(v => v !== undefined && v !== null);
}

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

const failures = [];
const warnings = [];

function check(condition, message, details = undefined) {
  if (!condition) failures.push(details ? `${message}: ${details}` : message);
}

function warn(condition, message, details = undefined) {
  if (!condition) warnings.push(details ? `${message}: ${details}` : message);
}

function valueAt(...paths) {
  return first(...paths.map(p => get(data, p)));
}

const openingId = valueAt(
  "runtime.selectedOpeningId",
  "frame.selectedOpeningId",
  "frame.openingIdentity.selectedOpeningId",
  "openingIdentity.selectedOpeningId"
);

const currentPly = valueAt(
  "frame.currentPly",
  "frame.stage2OpeningCurrentPly",
  "stage2OpeningCurrentPly"
);

const trainingMode = valueAt("frame.trainingMode", "trainingMode");
const criticalIssues = [
  ...asArray(data.criticalIssues),
  ...asArray(get(data, "health.criticalIssues")),
  ...asArray(get(data, "featureTrace.criticalIssues")),
];

const allText = JSON.stringify(data);
const dirtyCastling = allText.match(/\b(e1h1|e1a1|e8h8|e8a8)\b/g) || [];

function commonChecks() {
  if (expectedOpening) {
    check(openingId === expectedOpening, "Wrong openingId", `expected ${expectedOpening}, got ${openingId}`);
  }

  check(dirtyCastling.length === 0, "Dirty castling UCI exposed", [...new Set(dirtyCastling)].join(", "));

  const liveLichessCalled = valueAt("runtime.liveLichessCalled", "liveLichessCalled");
  if (liveLichessCalled !== undefined) {
    check(liveLichessCalled === false, "liveLichessCalled must be false", String(liveLichessCalled));
  }

  check(criticalIssues.length === 0, "criticalIssues must be empty", JSON.stringify([...new Set(criticalIssues)]));
}

function checkStart() {
  commonChecks();

  const eligibleCount = valueAt("runtime.lineSelectionEligibleCount", "lineSelectionEligibleCount");
  const plyLength = valueAt("runtime.selectedRuntimeLinePlyLength", "frame.selectedRuntimeLinePlyLength", "selectedRuntimeLinePlyLength");
  const seq = valueAt("runtime.selectedRuntimeLinePlaySequenceUci", "selectedRuntimeLinePlaySequenceUci");

  check(Number(eligibleCount) > 1, "lineSelectionEligibleCount should be > 1", String(eligibleCount));
  check(Number(plyLength) === 12, "selectedRuntimeLinePlyLength should be 12", String(plyLength));
  check(Array.isArray(seq) && seq.length === 12, "selectedRuntimeLinePlaySequenceUci should have 12 moves", Array.isArray(seq) ? String(seq.length) : typeof seq);
}

function checkPly6() {
  commonChecks();

  const depthReached = valueAt("frame.stage2OpeningDepthReached", "stage2OpeningDepthReached");
  const terminalProven = valueAt("frame.terminalProof.proven", "terminalProof.proven");
  const continueRendered = valueAt("frame.continueFromHereButtonRendered", "continueFromHereButtonRendered");
  const branchRendered = valueAt("frame.branchTransitionSurfaceRendered", "branchTransitionSurfaceRendered");

  check(Number(currentPly) === 6, "currentPly should be 6", String(currentPly));
  check(trainingMode === "restricted", "trainingMode should be restricted", String(trainingMode));
  check(depthReached === false || depthReached === undefined, "stage2OpeningDepthReached should be false", String(depthReached));
  check(terminalProven === false, "terminalProof.proven should be false", String(terminalProven));
  check(continueRendered === false, "continueFromHereButtonRendered should be false", String(continueRendered));
  check(branchRendered === false, "branchTransitionSurfaceRendered should be false", String(branchRendered));
}

function checkPly12() {
  commonChecks();

  const depthReached = valueAt("frame.stage2OpeningDepthReached", "stage2OpeningDepthReached");
  const terminalProven = valueAt("frame.terminalProof.proven", "terminalProof.proven");
  const lineCurrentPly = valueAt("frame.terminalProof.selectedRuntimeLineCurrentPly", "runtime.selectedRuntimeLineCurrentPly", "selectedRuntimeLineCurrentPly");
  const lineExhausted = valueAt("frame.terminalProof.selectedRuntimeLineExhausted", "runtime.selectedRuntimeLineExhausted", "selectedRuntimeLineExhausted");
  const allowContinue = valueAt("frame.finalSurfaceAuthority.continueFromHereAllowedByTerminalProof", "finalSurfaceAuthority.continueFromHereAllowedByTerminalProof");
  const continueRendered = valueAt("frame.continueFromHereButtonRendered", "continueFromHereButtonRendered");
  const continueAvailable = valueAt("frame.continueFromHereAvailable", "continueFromHereAvailable");
  const branchRendered = valueAt("frame.branchTransitionSurfaceRendered", "branchTransitionSurfaceRendered");

  check(Number(currentPly) === 12, "currentPly should be 12", String(currentPly));
  check(trainingMode === "restricted", "trainingMode should remain restricted before click", String(trainingMode));
  check(depthReached === true || depthReached === undefined, "stage2OpeningDepthReached should be true", String(depthReached));
  check(terminalProven === true, "terminalProof.proven should be true", String(terminalProven));
  check(Number(lineCurrentPly) === 12, "selectedRuntimeLineCurrentPly should be 12", String(lineCurrentPly));
  check(lineExhausted === true, "selectedRuntimeLineExhausted should be true", String(lineExhausted));
  check(allowContinue === true, "continueFromHereAllowedByTerminalProof should be true", String(allowContinue));
  check(continueRendered === true, "continueFromHereButtonRendered should be true", String(continueRendered));
  check(continueAvailable === true, "continueFromHereAvailable should be true", String(continueAvailable));
  check(branchRendered === true, "branchTransitionSurfaceRendered should be true", String(branchRendered));

  const forbidden = [
    "selected_line_cursor_unknown",
    "instruction_target_missing_on_teaching_frame",
    "user_turn_missing_instruction_target",
    "ready_for_user_without_target",
    "exhausted_line_without_branch_complete_surface",
  ];
  for (const s of forbidden) {
    check(!allText.includes(s), `Old failure marker still present: ${s}`);
  }
}

function checkPostContinue() {
  commonChecks();

  const clicked = valueAt("frame.continueFromHereClicked", "continueFromHereClicked");
  const handled = valueAt("frame.continueFromHereClickHandled", "continueFromHereClickHandled");
  const blockedReason = valueAt("frame.continueFromHereClickBlockedReason", "continueFromHereClickBlockedReason");
  const explicit = valueAt("frame.userExplicitlyEnteredContinuation", "userExplicitlyEnteredContinuation");
  const sessionId = valueAt("frame.continuationSessionId", "continuationSessionId");

  const maiaEnabled = valueAt("maiaContinuationEnabled", "frame.maiaContinuationEnabled", "featureTrace.maiaContinuationEnabled");
  const maiaStatus = valueAt("maiaContinuationStatus", "frame.maiaContinuationStatus", "featureTrace.maiaContinuationStatus");
  const maiaError = valueAt("maiaContinuationError", "frame.maiaContinuationError", "featureTrace.maiaContinuationError");

  check(clicked === true, "continueFromHereClicked should be true", String(clicked));
  check(handled === true, "continueFromHereClickHandled should be true", String(handled));
  check(blockedReason === null || blockedReason === undefined, "continueFromHereClickBlockedReason should be null", String(blockedReason));
  check(explicit === true, "userExplicitlyEnteredContinuation should be true", String(explicit));
  check(trainingMode === "continuation", "trainingMode should be continuation", String(trainingMode));
  check(Boolean(sessionId), "continuationSessionId should be non-null", String(sessionId));

  check(maiaEnabled === true, "maiaContinuationEnabled should be true", String(maiaEnabled));
  check(["loading", "ready", "error"].includes(maiaStatus), "maiaContinuationStatus should be loading, ready, or error", String(maiaStatus));
  if (maiaStatus === "error") {
    check(Boolean(maiaError), "maiaContinuationError must be non-null when status is error", String(maiaError));
  }

  warn(
    allText.includes("fenDidNotReset") ||
    allText.includes("moveHistoryDidNotReset") ||
    allText.includes("continuationDoesNotReset") ||
    !allText.includes("starting position"),
    "Manually confirm FEN and moveHistory did not reset by comparing pre-click and post-click JSON."
  );
}

function checkContinuation() {
  commonChecks();

  const maiaUsed = valueAt("maiaOpponentProviderUsed", "frame.maiaOpponentProviderUsed", "featureTrace.maiaOpponentProviderUsed");
  const maiaLast = valueAt("maiaOpponentLastMoveUci", "frame.maiaOpponentLastMoveUci", "featureTrace.maiaOpponentLastMoveUci");
  const runtimeOpponentSource = valueAt(
    "runtimeBook.opponentReplyAuthoritySource",
    "frame.runtimeBook.opponentReplyAuthoritySource"
  );

  check(trainingMode === "continuation", "trainingMode should be continuation", String(trainingMode));
  warn(maiaUsed === true, "After Maia opponent reply, maiaOpponentProviderUsed should be true", String(maiaUsed));
  warn(Boolean(maiaLast), "After Maia opponent reply, maiaOpponentLastMoveUci should be non-null", String(maiaLast));
  check(runtimeOpponentSource !== "local_runtime_package", "restricted runtimeBook should not drive continuation opponent reply", String(runtimeOpponentSource));
}

switch (stage) {
  case "start": checkStart(); break;
  case "ply6": checkPly6(); break;
  case "ply12": checkPly12(); break;
  case "post_continue": checkPostContinue(); break;
  case "continuation": checkContinuation(); break;
  default:
    console.error(`Unknown stage: ${stage}`);
    process.exit(2);
}

console.log(`\n=== ${file} :: ${stage} ${expectedOpening || ""} ===`);

if (warnings.length) {
  console.log("\nWARNINGS:");
  for (const w of warnings) console.log(`  - ${w}`);
}

if (failures.length) {
  console.error("\nFAIL:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log("\nPASS");
