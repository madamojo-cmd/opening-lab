# Package 14B.4 Command Log

## npm run build

~~~

> blundr-v2-7-professional-repair@2.7.3 build
> next build

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...

-----
[1m[31mFATAL[39m[0m: An unexpected Turbopack error occurred. A panic log has been written to /tmp/next-panic-c86c396a61a12d247f6a54cadaffd2d7.log.

To help make Turbopack better, report this error by clicking here: https://bugs.nextjs.org/search?category=turbopack-error-report&title=Turbopack%20Error%3A%20Failed%20to%20write%20app%20endpoint%20%2Fpage&body=Turbopack%20version%3A%20%60ee6e79b1%60%0ANext.js%20version%3A%20%600.0.0%60%0A%0AError%20message%3A%0A%60%60%60%0AFailed%20to%20write%20app%20endpoint%20%2Fpage%0A%0ACaused%20by%3A%0A-%20%5Bproject%5D%2Fapp%2Fglobals.css%20%5Bapp-client%5D%20%28css%29%0A-%20creating%20new%20process%0A-%20binding%20to%20a%20port%0A-%20Operation%20not%20permitted%20%28os%20error%201%29%0A%0ADebug%20info%3A%0A-%20Execution%20of%20get_all_written_entrypoints_with_issues_operation%20failed%0A-%20Execution%20of%20EntrypointsOperation%3A%3Anew%20failed%0A-%20Execution%20of%20all_entrypoints_write_to_disk_operation%20failed%0A-%20Execution%20of%20output_assets_operation%20failed%0A-%20Execution%20of%20%3CAppEndpoint%20as%20Endpoint%3E%3A%3Aoutput%20failed%0A-%20Failed%20to%20write%20app%20endpoint%20%2Fpage%0A-%20Execution%20of%20AppEndpoint%3A%3Aoutput%20failed%0A-%20Execution%20of%20whole_app_module_graph_operation%20failed%0A-%20Execution%20of%20%2AProject%3A%3Aget_all_additional_entries%20failed%0A-%20Execution%20of%20ModuleGraph%3A%3Afrom_single_graph_without_unused_references%20failed%0A-%20Execution%20of%20ModuleGraph%3A%3Acreate%20failed%0A-%20Execution%20of%20SingleModuleGraph%3A%3Anew_with_entries%20failed%0A-%20%5Bproject%5D%2Fapp%2Fglobals.css%20%5Bapp-client%5D%20%28css%29%0A-%20Execution%20of%20primary_chunkable_referenced_modules%20failed%0A-%20Execution%20of%20%3CCssModule%20as%20Module%3E%3A%3Areferences%20failed%0A-%20Execution%20of%20parse_css%20failed%0A-%20Execution%20of%20%3CPostCssTransformedAsset%20as%20Asset%3E%3A%3Acontent%20failed%0A-%20Execution%20of%20PostCssTransformedAsset%3A%3Aprocess%20failed%0A-%20Execution%20of%20evaluate_webpack_loader%20failed%0A-%20creating%20new%20process%0A-%20binding%20to%20a%20port%0A-%20Operation%20not%20permitted%20%28os%20error%201%29%0A%60%60%60&labels=Turbopack,Turbopack%20Panic%20Backtrace
-----


> Build error occurred
Error [TurbopackInternalError]: Failed to write app endpoint /page

Caused by:
- [project]/app/globals.css [app-client] (css)
- creating new process
- binding to a port
- Operation not permitted (os error 1)

Debug info:
- Execution of get_all_written_entrypoints_with_issues_operation failed
- Execution of EntrypointsOperation::new failed
- Execution of all_entrypoints_write_to_disk_operation failed
- Execution of output_assets_operation failed
- Execution of <AppEndpoint as Endpoint>::output failed
- Failed to write app endpoint /page
- Execution of AppEndpoint::output failed
- Execution of whole_app_module_graph_operation failed
- Execution of *Project::get_all_additional_entries failed
- Execution of ModuleGraph::from_single_graph_without_unused_references failed
- Execution of ModuleGraph::create failed
- Execution of SingleModuleGraph::new_with_entries failed
- [project]/app/globals.css [app-client] (css)
- Execution of primary_chunkable_referenced_modules failed
- Execution of <CssModule as Module>::references failed
- Execution of parse_css failed
- Execution of <PostCssTransformedAsset as Asset>::content failed
- Execution of PostCssTransformedAsset::process failed
- Execution of evaluate_webpack_loader failed
- creating new process
- binding to a port
- Operation not permitted (os error 1)
    at <unknown> (TurbopackInternalError: Failed to write app endpoint /page) {
  type: 'TurbopackInternalError',
  location: undefined
}
~~~

## node --import tsx tests/coach/debugPageCrashRegression.test.ts

~~~
~~~

## node --import tsx tests/coach/debugPanelResilience.test.ts

~~~
~~~

## node --import tsx tests/coach/continuationNoTargetStatus.test.ts

~~~
~~~

## node --import tsx tests/coach/continuationCandidateLifecycle.test.ts

~~~
~~~

## node --import tsx tests/coach/opponentTurnInputGuard.test.ts

~~~
~~~

## node --import tsx tests/coach/trainerRuntimeState.test.ts

~~~
~~~

## node --import tsx tests/coach/continuationEntryStateMachine.test.ts

~~~
~~~

## node --import tsx tests/coach/branchCompleteSecondRun.test.ts

~~~
~~~

## node --import tsx tests/coach/restrictedOpponentTurnBranchComplete.test.ts

~~~
~~~

## node --import tsx tests/coach/maiaAppliedMoveLegality.test.ts

~~~
~~~

## node --import tsx tests/coach/maiaContinuationProvider.test.ts

~~~
maiaContinuationProvider ok
~~~

## node --import tsx tests/coach/maiaRuntimeAdapter.test.ts

~~~
maiaRuntimeAdapter ok
~~~

## node --import tsx tests/coach/maiaApiRoute.test.ts

~~~
maiaApiRoute ok
~~~

## node --import tsx tests/coach/continuationFlowStability.test.ts

~~~
continuationFlowStability ok
~~~

## node --import tsx tests/coach/browserContract.test.ts

~~~
browserContract ok
~~~

## node --import tsx tests/coach/liveChainSmoke.test.ts

~~~
liveChainSmoke ok
~~~

## node --import tsx tests/coach/branchCompleteRegressionAfterStockfish.test.ts

~~~
branchCompleteRegressionAfterStockfish ok
~~~

## node --import tsx tests/coach/branchCompleteContract.test.ts

~~~
branchCompleteContract ok
~~~

## node --import tsx tests/coach/stockfishValidationGate.test.ts

~~~
stockfishValidationGate ok
~~~

## node --import tsx tests/coach/moveStrengthBadge.test.ts

~~~
moveStrengthBadge ok
~~~

## node --import tsx tests/coach/plainLeak.test.ts

~~~
plainLeak ok
~~~

## node --import tsx tests/coach/showMoreVisualReveal.test.ts

~~~
showMoreVisualReveal ok
~~~

## node --import tsx tests/coach/visibleTeachingSurface.test.ts

~~~
visibleTeachingSurface ok
~~~

## node --import tsx tests/coach/uiSurfaceAdapter.test.ts

~~~
uiSurfaceAdapter ok
~~~

## node --import tsx tests/coach/currentInstructionFrame.test.ts

~~~
currentInstructionFrame ok
~~~

## node --import tsx lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts

~~~
~~~

## npm run maia:check

~~~

> blundr-v2-7-professional-repair@2.7.3 maia:check
> node --import tsx scripts/check-maia-runtime.ts

{
  "config": {
    "enabled": false,
    "skillLevel": "maia-1500",
    "timeoutMs": 250,
    "nodes": 1,
    "lc0Configured": false,
    "weightsConfigured": false
  },
  "health": {
    "status": "disabled",
    "ready": false,
    "providerName": "maia-lc0-runtime",
    "providerVersion": "14B",
    "lc0Path": null,
    "weightsPath": null,
    "weightsExists": false,
    "timeoutMs": 250,
    "nodes": 1,
    "lastError": "runtime_disabled",
    "checkedAt": 1780529899793
  },
  "sampleMove": {
    "status": "disabled",
    "requestId": 1,
    "fen4": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    "skillLevel": "maia-1500",
    "bestMoveUci": null,
    "legal": false,
    "errorReason": "runtime_disabled",
    "runtimeMs": 0
  }
}
~~~

## npm run maia:bench

~~~

> blundr-v2-7-professional-repair@2.7.3 maia:bench
> node --import tsx scripts/benchmark-maia-runtime.ts

{
  "sampleCount": 5,
  "minLatencyMs": 0,
  "p50LatencyMs": 0,
  "p95LatencyMs": 0,
  "maxLatencyMs": 0,
  "legalMoveSuccessRate": 0,
  "timeoutCount": 0
}
~~~


## npm run build (escalated rerun)

~~~

> blundr-v2-7-professional-repair@2.7.3 build
> next build

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...

-----
[1m[31mFATAL[39m[0m: An unexpected Turbopack error occurred. A panic log has been written to /tmp/next-panic-d99b6cce541f7e449232eab0b74d723d.log.

To help make Turbopack better, report this error by clicking here: https://bugs.nextjs.org/search?category=turbopack-error-report&title=Turbopack%20Error%3A%20Failed%20to%20write%20app%20endpoint%20%2Fpage&body=Turbopack%20version%3A%20%60ee6e79b1%60%0ANext.js%20version%3A%20%600.0.0%60%0A%0AError%20message%3A%0A%60%60%60%0AFailed%20to%20write%20app%20endpoint%20%2Fpage%0A%0ACaused%20by%3A%0A-%20%5Bproject%5D%2Fapp%2Fglobals.css%20%5Bapp-client%5D%20%28css%29%0A-%20creating%20new%20process%0A-%20binding%20to%20a%20port%0A-%20Operation%20not%20permitted%20%28os%20error%201%29%0A%0ADebug%20info%3A%0A-%20Execution%20of%20get_all_written_entrypoints_with_issues_operation%20failed%0A-%20Execution%20of%20EntrypointsOperation%3A%3Anew%20failed%0A-%20Execution%20of%20all_entrypoints_write_to_disk_operation%20failed%0A-%20Execution%20of%20output_assets_operation%20failed%0A-%20Execution%20of%20%3CAppEndpoint%20as%20Endpoint%3E%3A%3Aoutput%20failed%0A-%20Failed%20to%20write%20app%20endpoint%20%2Fpage%0A-%20Execution%20of%20AppEndpoint%3A%3Aoutput%20failed%0A-%20Execution%20of%20whole_app_module_graph_operation%20failed%0A-%20Execution%20of%20%2AProject%3A%3Aget_all_additional_entries%20failed%0A-%20Execution%20of%20ModuleGraph%3A%3Afrom_single_graph_without_unused_references%20failed%0A-%20Execution%20of%20ModuleGraph%3A%3Acreate%20failed%0A-%20Execution%20of%20SingleModuleGraph%3A%3Anew_with_entries%20failed%0A-%20%5Bproject%5D%2Fapp%2Fglobals.css%20%5Bapp-client%5D%20%28css%29%0A-%20Execution%20of%20primary_chunkable_referenced_modules%20failed%0A-%20Execution%20of%20%3CCssModule%20as%20Module%3E%3A%3Areferences%20failed%0A-%20Execution%20of%20parse_css%20failed%0A-%20Execution%20of%20%3CPostCssTransformedAsset%20as%20Asset%3E%3A%3Acontent%20failed%0A-%20Execution%20of%20PostCssTransformedAsset%3A%3Aprocess%20failed%0A-%20Execution%20of%20evaluate_webpack_loader%20failed%0A-%20creating%20new%20process%0A-%20binding%20to%20a%20port%0A-%20Operation%20not%20permitted%20%28os%20error%201%29%0A%60%60%60&labels=Turbopack,Turbopack%20Panic%20Backtrace
-----


> Build error occurred
Error [TurbopackInternalError]: Failed to write app endpoint /page

Caused by:
- [project]/app/globals.css [app-client] (css)
- creating new process
- binding to a port
- Operation not permitted (os error 1)

Debug info:
- Execution of get_all_written_entrypoints_with_issues_operation failed
- Execution of EntrypointsOperation::new failed
- Execution of all_entrypoints_write_to_disk_operation failed
- Execution of output_assets_operation failed
- Execution of <AppEndpoint as Endpoint>::output failed
- Failed to write app endpoint /page
- Execution of AppEndpoint::output failed
- Execution of whole_app_module_graph_operation failed
- Execution of *Project::get_all_additional_entries failed
- Execution of ModuleGraph::from_single_graph_without_unused_references failed
- Execution of ModuleGraph::create failed
- Execution of SingleModuleGraph::new_with_entries failed
- [project]/app/globals.css [app-client] (css)
- Execution of primary_chunkable_referenced_modules failed
- Execution of <CssModule as Module>::references failed
- Execution of parse_css failed
- Execution of <PostCssTransformedAsset as Asset>::content failed
- Execution of PostCssTransformedAsset::process failed
- Execution of evaluate_webpack_loader failed
- creating new process
- binding to a port
- Operation not permitted (os error 1)
    at <unknown> (TurbopackInternalError: Failed to write app endpoint /page) {
  type: 'TurbopackInternalError',
  location: undefined
}
~~~

## node --import tsx tests/coach/debugPageCrashRegression.test.ts

~~~
~~~

## node --import tsx tests/coach/debugPanelResilience.test.ts

~~~
~~~

## node --import tsx tests/coach/continuationNoTargetStatus.test.ts

~~~
~~~

## node --import tsx tests/coach/continuationCandidateLifecycle.test.ts

~~~
~~~

## node --import tsx tests/coach/opponentTurnInputGuard.test.ts

~~~
~~~

## node --import tsx tests/coach/trainerRuntimeState.test.ts

~~~
~~~

## node --import tsx tests/coach/continuationEntryStateMachine.test.ts

~~~
~~~

## node --import tsx tests/coach/branchCompleteSecondRun.test.ts

~~~
~~~

## node --import tsx tests/coach/restrictedOpponentTurnBranchComplete.test.ts

~~~
~~~

## node --import tsx tests/coach/maiaAppliedMoveLegality.test.ts

~~~
~~~

## node --import tsx tests/coach/maiaContinuationProvider.test.ts

~~~
maiaContinuationProvider ok
~~~

## node --import tsx tests/coach/maiaRuntimeAdapter.test.ts

~~~
maiaRuntimeAdapter ok
~~~

## node --import tsx tests/coach/maiaApiRoute.test.ts

~~~
maiaApiRoute ok
~~~

## node --import tsx tests/coach/continuationFlowStability.test.ts

~~~
continuationFlowStability ok
~~~

## node --import tsx tests/coach/browserContract.test.ts

~~~
browserContract ok
~~~

## node --import tsx tests/coach/liveChainSmoke.test.ts

~~~
liveChainSmoke ok
~~~

## node --import tsx tests/coach/branchCompleteRegressionAfterStockfish.test.ts

~~~
branchCompleteRegressionAfterStockfish ok
~~~

## node --import tsx tests/coach/branchCompleteContract.test.ts

~~~
branchCompleteContract ok
~~~

## node --import tsx tests/coach/stockfishValidationGate.test.ts

~~~
stockfishValidationGate ok
~~~

## node --import tsx tests/coach/moveStrengthBadge.test.ts

~~~
moveStrengthBadge ok
~~~

## node --import tsx tests/coach/plainLeak.test.ts

~~~
plainLeak ok
~~~

## node --import tsx tests/coach/showMoreVisualReveal.test.ts

~~~
showMoreVisualReveal ok
~~~

## node --import tsx tests/coach/visibleTeachingSurface.test.ts

~~~
visibleTeachingSurface ok
~~~

## node --import tsx tests/coach/uiSurfaceAdapter.test.ts

~~~
uiSurfaceAdapter ok
~~~

## node --import tsx tests/coach/currentInstructionFrame.test.ts

~~~
currentInstructionFrame ok
~~~

## node --import tsx lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts

~~~
~~~

## npm run maia:check

~~~

> blundr-v2-7-professional-repair@2.7.3 maia:check
> node --import tsx scripts/check-maia-runtime.ts

{
  "config": {
    "enabled": false,
    "skillLevel": "maia-1500",
    "timeoutMs": 250,
    "nodes": 1,
    "lc0Configured": false,
    "weightsConfigured": false
  },
  "health": {
    "status": "disabled",
    "ready": false,
    "providerName": "maia-lc0-runtime",
    "providerVersion": "14B",
    "lc0Path": null,
    "weightsPath": null,
    "weightsExists": false,
    "timeoutMs": 250,
    "nodes": 1,
    "lastError": "runtime_disabled",
    "checkedAt": 1780529967167
  },
  "sampleMove": {
    "status": "disabled",
    "requestId": 1,
    "fen4": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    "skillLevel": "maia-1500",
    "bestMoveUci": null,
    "legal": false,
    "errorReason": "runtime_disabled",
    "runtimeMs": 0
  }
}
~~~

## npm run maia:bench

~~~

> blundr-v2-7-professional-repair@2.7.3 maia:bench
> node --import tsx scripts/benchmark-maia-runtime.ts

{
  "sampleCount": 5,
  "minLatencyMs": 0,
  "p50LatencyMs": 0,
  "p95LatencyMs": 0,
  "maxLatencyMs": 0,
  "legalMoveSuccessRate": 0,
  "timeoutCount": 0
}
~~~

## npm run build (escalated success rerun)

~~~

> blundr-v2-7-professional-repair@2.7.3 build
> next build

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 9.0s
  Running TypeScript ...
  Finished TypeScript in 10.6s ...
  Collecting page data using 1 worker ...
  Generating static pages using 1 worker (0/5) ...
  Generating static pages using 1 worker (1/5) 
  Generating static pages using 1 worker (2/5) 
  Generating static pages using 1 worker (3/5) 
✓ Generating static pages using 1 worker (5/5) in 537ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/blundr-visual-model
├ ƒ /api/brain
├ ƒ /api/explorer
├ ƒ /api/maia/health
└ ƒ /api/maia/opponent-reply


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

~~~

## npm run maia:check (env-enabled rerun)

~~~

> blundr-v2-7-professional-repair@2.7.3 maia:check
> node --import tsx scripts/check-maia-runtime.ts

{
  "config": {
    "enabled": true,
    "skillLevel": "maia-1500",
    "timeoutMs": 3000,
    "nodes": 1,
    "lc0Configured": true,
    "weightsConfigured": true
  },
  "health": {
    "status": "ready",
    "ready": true,
    "providerName": "maia-lc0-runtime",
    "providerVersion": "14B",
    "lc0Path": "/workspaces/opening-lab/.runtime/lc0/build/release/lc0",
    "weightsPath": "/workspaces/opening-lab/.maia/maia-1500.pb.gz",
    "weightsExists": true,
    "timeoutMs": 3000,
    "nodes": 1,
    "lastError": null,
    "checkedAt": 1780530037222
  },
  "sampleMove": {
    "status": "ready",
    "requestId": 1,
    "fen4": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    "skillLevel": "maia-1500",
    "bestMoveUci": "e2e4",
    "ponderUci": null,
    "rawBestMoveLine": "bestmove e2e4",
    "legal": true,
    "errorReason": null,
    "runtimeMs": 56
  }
}
~~~

## npm run maia:bench (env-enabled rerun)

~~~

> blundr-v2-7-professional-repair@2.7.3 maia:bench
> node --import tsx scripts/benchmark-maia-runtime.ts

{
  "sampleCount": 5,
  "minLatencyMs": 53,
  "p50LatencyMs": 67,
  "p95LatencyMs": 99,
  "maxLatencyMs": 99,
  "legalMoveSuccessRate": 1,
  "timeoutCount": 0
}
~~~

## Dev reproduction (/ ?debug=1)

~~~
nohup npm run dev > /tmp/blundr-dev-14b4-final.log 2>&1 &
curl -s -o /tmp/blundr-debug14b4-final.html -w "http=%{http_code}\n" "http://localhost:3000/?debug=1"
wc -c /tmp/blundr-debug14b4-final.html
# result: http=200, bytes=23462
~~~

