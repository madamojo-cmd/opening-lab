import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

export function testStage2NoUnsafePerformanceSplit(): void {
  const pageSource = fs.readFileSync(path.join(REPO_ROOT, "app", "page.tsx"), "utf8");
  const homeSection = pageSource.match(/activeTab==="home"&&<section[\s\S]*?<\/section>/)?.[0] ?? "";
  const repertoireSection = pageSource.match(/activeTab==="repertoire"&&<section[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.equal(
    /from\s+["']@\/components\/coach\/CoachCard["']/.test(pageSource),
    false,
    "app_page_unsafe_static_coach_card_import",
  );
  assert.equal(
    /const\s+CoachCard\s*=\s*dynamic\([\s\S]*?import\(\s*["']@\/components\/coach\/CoachCard["']\s*\)[\s\S]*?mod\.CoachCard[\s\S]*?ssr:\s*false[\s\S]*?loading:\s*\(\)\s*=>\s*null[\s\S]*?\)/.test(pageSource),
    true,
    "app_page_missing_lazy_coach_card_split",
  );
  assert.equal(
    /from\s+["']@\/lib\/blundr\/openings\/runtimeLineBodyLoader["']/.test(pageSource),
    true,
    "app_page_missing_static_runtime_line_loader_import",
  );
  assert.equal(
    /loadStage2RuntimeTrainableRepertoires\b/.test(pageSource),
    false,
    "app_page_unsafe_all_runtime_body_loader_reference",
  );
  assert.equal(
    /countPositions\s*\(/.test(pageSource),
    false,
    "app_page_unsafe_render_time_count_positions_call",
  );
  assert.equal(
    /loadStage2RuntimeTrainableRepertoire\b/.test(pageSource),
    true,
    "app_page_missing_selected_runtime_body_loader_reference",
  );
  assert.equal(
    /runtimeLines\/[^"']+\.generated/.test(pageSource),
    false,
    "app_page_unsafe_runtime_line_body_import",
  );
  assert.equal(
    /from\s+["']@\/lib\/blundr\/openings\/runtimeTrainableRepertoires["']/.test(pageSource),
    false,
    "app_page_unsafe_runtime_trainable_static_import",
  );
  assert.equal(
    /import\(\s*["']@\/lib\/blundr\/openings\/runtimeTrainableRepertoires["']\s*\)/.test(pageSource),
    false,
    "app_page_unsafe_runtime_trainable_dynamic_import",
  );
  assert.equal(
    /import\(\s*["']@\/lib\/blundr\/openings\/adaptiveOpeningIdentity["']\s*\)/.test(pageSource),
    false,
    "app_page_unsafe_adaptive_opening_identity_dynamic_import",
  );
  assert.equal(
    /const\s+BlundrDiagnosticsPanel\s*=\s*dynamic\([\s\S]*?import\(\s*["']@\/components\/debug\/BlundrDiagnosticsPanel["']\s*\)[\s\S]*?mod\.BlundrDiagnosticsPanel[\s\S]*?ssr:\s*false[\s\S]*?loading:\s*\(\)\s*=>\s*null[\s\S]*?\)/.test(pageSource),
    true,
    "app_page_missing_lazy_diagnostics_split",
  );
  assert.equal(
    /from\s+["']@\/lib\/blundr\/debug\/trainerDebugCollector["']/.test(pageSource),
    false,
    "app_page_unsafe_static_trainer_debug_collector_import",
  );
  assert.equal(
    /from\s+["']@\/lib\/blundr\/debug\/trainerDebugSnapshot["']/.test(pageSource),
    false,
    "app_page_unsafe_static_trainer_debug_snapshot_import",
  );
  assert.equal(
    /from\s+["']@\/lib\/blundr\/debug\/buildStage2FeatureTrace["']/.test(pageSource),
    false,
    "app_page_unsafe_static_stage2_feature_trace_import",
  );
  assert.equal(
    /from\s+["']@\/lib\/blundr\/debug\/buildTrainerFrameResolution["']/.test(pageSource),
    false,
    "app_page_unsafe_static_trainer_frame_resolution_import",
  );
  assert.equal(
    /from\s+["']@\/lib\/blundr\/maia\/maiaRuntimeConfig["']/.test(pageSource),
    false,
    "app_page_unsafe_static_maia_runtime_config_import",
  );
  assert.equal(
    /from\s+["']@\/lib\/blundr\/maia\/maiaLc0RuntimeAdapter["']/.test(pageSource),
    false,
    "app_page_unsafe_static_maia_runtime_adapter_import",
  );
  assert.equal(
    /import\(\s*["']@\/lib\/blundr\/debug\/trainerDebugCollector["']\s*\)/.test(pageSource),
    true,
    "app_page_missing_lazy_trainer_debug_collector_import",
  );
  assert.equal(
    /runtimeOpeningSelection\s*=\s*useMemo\(/.test(pageSource),
    true,
    "app_page_missing_runtime_opening_selection_usememo",
  );
  assert.equal(
    homeSection.includes("buildOpeningTree("),
    false,
    "app_page_home_section_unsafe_tree_building",
  );
  assert.equal(
    repertoireSection.includes("buildOpeningTree("),
    false,
    "app_page_repertoire_section_unsafe_tree_building",
  );
  assert.equal(
    /getRepertoirePositionCount\s*\(/.test(pageSource),
    true,
    "app_page_missing_catalog_metadata_position_helper",
  );
  assert.equal(
    // The initial selection is seeded from the canonical selected repertoire before the runtime catalog is hydrated.
    /useState<RuntimeWeightedTrainingLineSelection \| null>\(\(\)=>buildRuntimeTrainingLineSelection\(initialSelectedRepertoireId,\[\],runtimeTrainingSessionId\)\)/.test(pageSource),
    true,
    "app_page_missing_initial_runtime_training_line_selection",
  );
}

testStage2NoUnsafePerformanceSplit();
console.log("stage2NoUnsafePerformanceSplit ok");
