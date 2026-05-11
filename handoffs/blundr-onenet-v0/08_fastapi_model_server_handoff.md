# BlundrOneNet v0 Implementation Handoff

**Repo:** https://github.com/madamojo-cmd/opening-lab  
**Branch to work from:** `blundr-v2.7.1-product-review-core`  
**Previous stable branch:** `blundr-v2.7-stability-temporal-core`  
**Current app:** Next.js app on Vercel, custom board in `app/page.tsx`, `chess.js` for legal moves/FEN, browser Stockfish, API routes at `app/api/brain/route.ts` and `app/api/explorer/route.ts`.

## Global non-negotiables

1. Do not rebuild the app from scratch.
2. Do not replace `chess.js` legal move validation.
3. Do not let GPT decide legal moves.
4. Do not let the model invent tactics, mates, checks, legal moves, arrows, or square coordinates.
5. Do not display random legal fallback moves as user-facing recommendations.
6. Continuation recommendations must remain Stockfish-backed.
7. Attack/Defense/Plan tabs must not refetch Brain/model on tab switch.
8. Old Brain/GPT/model responses must not overwrite the current FEN.
9. Knight moves must render as true L-shaped paths.
10. Book Complete and Continue vs Bot must keep working.
11. Captured pieces, material advantage, stable eval display, game-over UI, selected-piece legal moves, settings, and move review must remain intact.
12. The model layer must fail safely back to deterministic/rule output.

## Before editing

Run these checks in Codespaces:

```bash
git checkout blundr-v2.7.1-product-review-core
git pull
git log --oneline -5
git diff --stat blundr-v2.7-stability-temporal-core..blundr-v2.7.1-product-review-core
cat PATCH_NOTES.md | head -80
tree -L 4 -I "node_modules|.next|.git"
npm run build
```

Treat the fixed A-J product issues from v2.7.1 as regression-protected behavior, not as unresolved bugs.

---

# 08 — FastAPI Model Server Handoff

## Objective

Add an optional local FastAPI service that serves BlundrOneNet v0 predictions during development/testing.

The current app has no separate backend integrated. Therefore the model server must be optional. If it is unavailable, the Next.js bridge must fall back to deterministic rule output.

## Current-code integration points

New files:

```txt
model/server.py
model/src/predict.py
model/src/decode.py
model/requirements.txt
```

Next.js caller later:

```txt
app/api/blundr-visual-model/route.ts
```

Environment variable later:

```txt
MODEL_SERVER_URL=http://127.0.0.1:8000
```

## Files to create/modify

### Update `model/requirements.txt`

```txt
fastapi
uvicorn
pydantic
numpy
python-chess
pandas
torch
```

If torch installation is too heavy for the immediate session, keep server working with `fallbackRequired: true` until the model checkpoint is installed.

### Create `model/server.py`

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, Optional
import time

app = FastAPI(title="BlundrOneNet v0 Model Server")

MODEL = None
MODEL_READY = False
MODEL_LOAD_ERROR: Optional[str] = None

class PredictRequest(BaseModel):
    featurePacket: Dict[str, Any]

class PredictResponse(BaseModel):
    fallbackRequired: bool = False
    selectedViewId: Optional[int] = None
    primaryConceptId: Optional[int] = None
    animationPackageId: Optional[int] = None
    templateId: Optional[int] = None
    nextPlanId: Optional[int] = None
    warningId: Optional[int] = None
    squareIds: list[int] = []
    arrowIds: list[int] = []
    confidence: float = 0.0
    debug: Dict[str, Any] = {}

@app.on_event("startup")
def load_model():
    global MODEL, MODEL_READY, MODEL_LOAD_ERROR
    try:
        # Import lazily so server can still start without a checkpoint.
        from src.predict import load_predictor
        MODEL = load_predictor("model/exports/blundr_one_net_v0.pt", "model/exports/enums.json")
        MODEL_READY = True
    except Exception as e:
        MODEL_READY = False
        MODEL_LOAD_ERROR = str(e)

@app.get("/health")
def health():
    return {
        "ok": True,
        "modelReady": MODEL_READY,
        "modelLoadError": MODEL_LOAD_ERROR
    }

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    start = time.time()
    if not MODEL_READY or MODEL is None:
        return PredictResponse(
            fallbackRequired=True,
            confidence=0.0,
            debug={
                "source": "model_unavailable",
                "modelReady": MODEL_READY,
                "modelLoadError": MODEL_LOAD_ERROR,
                "latencyMs": round((time.time() - start) * 1000)
            }
        )

    try:
        pred = MODEL.predict(req.featurePacket)
        pred.setdefault("debug", {})
        pred["debug"].update({
            "source": "blundr_one_net_v0",
            "latencyMs": round((time.time() - start) * 1000)
        })
        return PredictResponse(**pred)
    except Exception as e:
        return PredictResponse(
            fallbackRequired=True,
            confidence=0.0,
            debug={
                "source": "model_error",
                "error": str(e),
                "latencyMs": round((time.time() - start) * 1000)
            }
        )
```

## API contract

### `GET /health`

Returns:

```json
{
  "ok": true,
  "modelReady": true,
  "modelLoadError": null
}
```

### `POST /predict`

Input:

```json
{
  "featurePacket": {}
}
```

Output when model works:

```json
{
  "fallbackRequired": false,
  "selectedViewId": 1,
  "primaryConceptId": 3,
  "animationPackageId": 1,
  "templateId": 2,
  "nextPlanId": 4,
  "warningId": 0,
  "squareIds": [26, 13, 28],
  "arrowIds": [394, 847],
  "confidence": 0.84,
  "debug": {
    "source": "blundr_one_net_v0",
    "latencyMs": 12
  }
}
```

Output when model unavailable:

```json
{
  "fallbackRequired": true,
  "confidence": 0,
  "debug": {
    "source": "model_unavailable"
  }
}
```

## Run commands

```bash
cd /workspaces/opening-lab
python3 -m venv model/.venv
source model/.venv/bin/activate
pip install -r model/requirements.txt
uvicorn model.server:app --host 127.0.0.1 --port 8000 --reload
```

## Pseudocode

```txt
server starts
try to load model checkpoint
if load fails:
  keep server alive but mark modelReady false

/predict:
  if not ready:
    return fallbackRequired true
  else:
    encode packet
    run model
    return raw prediction IDs
```

## Validation tests

```bash
curl http://127.0.0.1:8000/health
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"featurePacket": {"fen":"test"}}'
```

Expected if model unavailable:

```txt
HTTP 200
fallbackRequired true
```

## Acceptance criteria

- Server starts even without checkpoint.
- `/health` is available.
- `/predict` never crashes the Next.js app.
- Missing model returns `fallbackRequired: true`.
- Model output remains raw IDs/probabilities; Next.js remains responsible for final decode/verify/template.

## Common failure modes

- Server fails to start because checkpoint is missing.
- Torch import fails and crashes server.
- Returning full final UI JSON from Python, duplicating Next.js logic.
- Making Vercel deployment depend on local FastAPI.

## What not to change

- Do not make the FastAPI server required for Vercel frontend deployment.
- Do not expose OpenAI or other secrets from the server.
- Do not bypass the Next.js verifier.
- Do not deploy this server to Vercel as a Python function unless deliberately planned later.
