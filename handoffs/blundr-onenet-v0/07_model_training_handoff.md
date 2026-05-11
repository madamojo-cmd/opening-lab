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

# 07 — Model Training Handoff

## Objective

Create the first BlundrOneNet v0 PyTorch model that learns visual/context policy outputs from verified synthetic labels.

The model does not play chess. It predicts:

```txt
selectedView
primaryConcept
animationPackage
templateId
nextPlanId
warningId
square probabilities
arrow probabilities
confidence
```

The app/Stockfish/chess.js still own chess truth.

## Current-code integration points

This step is mostly isolated in `/model`.

New files:

```txt
model/src/encode.py
model/src/dataset.py
model/src/model.py
model/src/train.py
model/src/evaluate.py
model/src/decode.py
model/src/predict.py
model/exports/
```

Input:

```txt
model/data/enums.json
model/data/labels_v0.jsonl
```

Output:

```txt
model/exports/blundr_one_net_v0.pt
model/exports/enums.json
model/exports/metrics_v0.json
```

## Files to create/modify

### `model/src/model.py`

```python
import torch
import torch.nn as nn

class BlundrOneNet(nn.Module):
    def __init__(
        self,
        board_planes=18,
        scalar_dim=64,
        num_views=6,
        num_concepts=13,
        num_animations=12,
        num_templates=6,
        num_next_plans=8,
        num_warnings=5,
    ):
        super().__init__()
        self.board_encoder = nn.Sequential(
            nn.Conv2d(board_planes, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 96, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv2d(96, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Flatten()
        )
        self.scalar_encoder = nn.Sequential(
            nn.Linear(scalar_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU()
        )
        self.trunk = nn.Sequential(
            nn.Linear(128 * 8 * 8 + 128, 512),
            nn.ReLU(),
            nn.Dropout(0.15),
            nn.Linear(512, 256),
            nn.ReLU()
        )
        self.view_head = nn.Linear(256, num_views)
        self.concept_head = nn.Linear(256, num_concepts)
        self.animation_head = nn.Linear(256, num_animations)
        self.template_head = nn.Linear(256, num_templates)
        self.next_plan_head = nn.Linear(256, num_next_plans)
        self.warning_head = nn.Linear(256, num_warnings)
        self.square_head = nn.Linear(256, 64)
        self.arrow_head = nn.Linear(256, 4096)
        self.confidence_head = nn.Linear(256, 1)

    def forward(self, board, scalars):
        b = self.board_encoder(board)
        s = self.scalar_encoder(scalars)
        x = torch.cat([b, s], dim=1)
        h = self.trunk(x)
        return {
            "view_logits": self.view_head(h),
            "concept_logits": self.concept_head(h),
            "animation_logits": self.animation_head(h),
            "template_logits": self.template_head(h),
            "next_plan_logits": self.next_plan_head(h),
            "warning_logits": self.warning_head(h),
            "square_logits": self.square_head(h),
            "arrow_logits": self.arrow_head(h),
            "confidence": torch.sigmoid(self.confidence_head(h)).squeeze(-1),
        }
```

## Encoding requirements

### Board tensor

Use `8 x 8 x 18`, converted to PyTorch `18 x 8 x 8`.

Planes:

```txt
0-5: white pawn, knight, bishop, rook, queen, king
6-11: black pawn, knight, bishop, rook, queen, king
12: side to move
13: white kingside castling
14: white queenside castling
15: black kingside castling
16: black queenside castling
17: normalized move number or constant fallback
```

### Scalar vector

Fixed length 64. Include IDs/flags:

```txt
stockfish eval normalized
mate flag
rating bucket ID
opening ID
training phase ID
user color ID
expected actor ID
book status ID
is development position
castling available
queen out early
same piece moved twice
weak square count
center square count
candidate move count
candidate arrow count
candidate square count
```

Pad unused scalar slots with zero.

## Training loss

Use weighted multi-task loss:

```python
def compute_loss(outputs, batch):
    ce = torch.nn.CrossEntropyLoss(reduction="none")
    bce = torch.nn.BCEWithLogitsLoss(reduction="none")
    mse = torch.nn.MSELoss(reduction="none")

    weights = batch["label_weight"]

    loss_view = ce(outputs["view_logits"], batch["view_id"])
    loss_concept = ce(outputs["concept_logits"], batch["concept_id"])
    loss_animation = ce(outputs["animation_logits"], batch["animation_id"])
    loss_template = ce(outputs["template_logits"], batch["template_id"])
    loss_next_plan = ce(outputs["next_plan_logits"], batch["next_plan_id"])
    loss_warning = ce(outputs["warning_logits"], batch["warning_id"])

    loss_squares = bce(outputs["square_logits"], batch["square_targets"]).mean(dim=1)
    loss_arrows = bce(outputs["arrow_logits"], batch["arrow_targets"]).mean(dim=1)
    loss_conf = mse(outputs["confidence"], batch["confidence"])

    total = (
        1.0 * loss_view +
        1.5 * loss_concept +
        1.0 * loss_animation +
        0.75 * loss_template +
        0.75 * loss_next_plan +
        0.5 * loss_warning +
        2.0 * loss_squares +
        2.5 * loss_arrows +
        0.25 * loss_conf
    )
    return (total * weights).mean()
```

## Critical runtime requirement

The model may output 64 square logits and 4096 arrow logits, but decoding must use feature-packet masks.

```txt
Allowed square IDs = packet.derived.candidateSquares
Allowed arrow IDs = packet.derived.candidateArrows
```

Never decode from all 4096 arrows directly without masking.

## Pseudocode training flow

```txt
load enums.json
load labels_v0.jsonl
split train/valid
for each row:
  encode board tensor
  encode scalar vector
  encode categorical labels
  encode square target vector length 64
  encode arrow target vector length 4096
train for small number of epochs
save checkpoint
run evaluate
write metrics
```

## First training targets

For same-day v0:

```txt
500+ verified labels minimum
CPU training acceptable
small batch size okay
short training run acceptable
checkpoint integration more important than perfect metrics
```

## Evaluation metrics

Report:

```txt
view accuracy
concept accuracy
animation accuracy
template accuracy
square F1 or overlap@4
arrow F1 or overlap@2
confidence MSE
verifier pass rate after decode
fallback rate after decode
```

Hard gates after verifier:

```txt
illegal move rate = 0
wrong-side rate = 0
invalid square rate = 0
invalid arrow rate = 0
unsupported animation rate = 0
```

## Acceptance criteria

- `model/exports/blundr_one_net_v0.pt` exists.
- `model/exports/enums.json` exists.
- `model/exports/metrics_v0.json` exists.
- `predict.py` can load one feature packet and return raw IDs/probabilities.
- Decoding applies candidate masks.
- Model failure does not block app fallback.

## Common failure modes

- Enum order differs between TypeScript and Python.
- Labels use IDs not present in `enums.json`.
- Arrow target encoding uses wrong square ordering.
- Overfitting tiny dataset is acceptable for v0, but invalid outputs are not.
- Trying to train a text model instead of classification heads.

## What not to change

- Do not modify the Next.js trainer in this step.
- Do not remove the rule selector fallback.
- Do not deploy the model as mandatory infrastructure yet.
- Do not let model output bypass verifier.
