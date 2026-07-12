import type { Stage8MScenario } from '../../../../tools/stage8m/types';

export const STAGE8M_IMBALANCE_ARENA_SCENARIOS: Stage8MScenario[] = [
  {
    "id": "stage8m-imbalance_arena-6c3f715c",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "36d17228c1d45c9d64eb11c1b185a018647cbd48",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "a3b4",
      "san": "Bb4",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4f5",
        "a3c5",
        "a3d6",
        "a3e7",
        "a3f8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Bb4 improves good knight vs bad bishop by 5.0 activity units.."
        },
        {
          "moveUci": "a3c5",
          "san": "Bc5",
          "reasonItIsTempting": "Bc5 is legal and pursues a nearby plan.",
          "whyItFails": "Bc5 does not create the verified before/after feature: Bb4 improves good knight vs bad bishop by 5.0 activity units.."
        },
        {
          "moveUci": "a3d6",
          "san": "Bd6",
          "reasonItIsTempting": "Bd6 is legal and pursues a nearby plan.",
          "whyItFails": "Bd6 does not create the verified before/after feature: Bb4 improves good knight vs bad bishop by 5.0 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "intro",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Bb4 uses the good knight vs bad bishop rather than chasing material. Activity rises from 40.8 to 45.8. The relevant pieces are a3, b4, b1, c1, e1, and the move creates pressure against f8, f5, a6.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exf5 does not create the verified before/after feature: Bb4 improves good knight vs bad bishop by 5.0 activity units..",
          "Bc5 does not create the verified before/after feature: Bb4 improves good knight vs bad bishop by 5.0 activity units..",
          "Bd6 does not create the verified before/after feature: Bb4 improves good knight vs bad bishop by 5.0 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 40.8,
        "afterActivity": 45.8,
        "activityDelta": 5,
        "relevantPieces": [
          "a3",
          "b4",
          "b1",
          "c1",
          "e1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "f8",
          "f5",
          "a6"
        ],
        "whyItMatters": "Bb4 improves good knight vs bad bishop by 5.0 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq -|a3b4|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-imbalance_arena-41b139d6",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "36d17228c1d45c9d64eb11c1b185a018647cbd48",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "a3c5",
      "san": "Bc5",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4f5",
        "a3b4",
        "a3d6",
        "a3e7",
        "a3f8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Bc5 improves good knight vs bad bishop by 8.4 activity units.."
        },
        {
          "moveUci": "a3b4",
          "san": "Bb4",
          "reasonItIsTempting": "Bb4 is legal and pursues a nearby plan.",
          "whyItFails": "Bb4 does not create the verified before/after feature: Bc5 improves good knight vs bad bishop by 8.4 activity units.."
        },
        {
          "moveUci": "a3d6",
          "san": "Bd6",
          "reasonItIsTempting": "Bd6 is legal and pursues a nearby plan.",
          "whyItFails": "Bd6 does not create the verified before/after feature: Bc5 improves good knight vs bad bishop by 8.4 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "easy",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Bc5 uses the good knight vs bad bishop rather than chasing material. Activity rises from 40.8 to 49.2. The relevant pieces are a3, c5, b1, c1, e1, and the move creates pressure against a7, f8, f5, a6.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exf5 does not create the verified before/after feature: Bc5 improves good knight vs bad bishop by 8.4 activity units..",
          "Bb4 does not create the verified before/after feature: Bc5 improves good knight vs bad bishop by 8.4 activity units..",
          "Bd6 does not create the verified before/after feature: Bc5 improves good knight vs bad bishop by 8.4 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 40.8,
        "afterActivity": 49.2,
        "activityDelta": 8.4,
        "relevantPieces": [
          "a3",
          "c5",
          "b1",
          "c1",
          "e1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "a7",
          "f8",
          "f5",
          "a6"
        ],
        "whyItMatters": "Bc5 improves good knight vs bad bishop by 8.4 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq -|a3c5|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-imbalance_arena-7126c4a0",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "36d17228c1d45c9d64eb11c1b185a018647cbd48",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "a3d6",
      "san": "Bd6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4f5",
        "a3b4",
        "a3c5",
        "a3e7",
        "a3f8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Bd6 improves good knight vs bad bishop by 7.8 activity units.."
        },
        {
          "moveUci": "a3b4",
          "san": "Bb4",
          "reasonItIsTempting": "Bb4 is legal and pursues a nearby plan.",
          "whyItFails": "Bb4 does not create the verified before/after feature: Bd6 improves good knight vs bad bishop by 7.8 activity units.."
        },
        {
          "moveUci": "a3c5",
          "san": "Bc5",
          "reasonItIsTempting": "Bc5 is legal and pursues a nearby plan.",
          "whyItFails": "Bc5 does not create the verified before/after feature: Bd6 improves good knight vs bad bishop by 7.8 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "medium",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Bd6 uses the good knight vs bad bishop rather than chasing material. Activity rises from 40.8 to 48.6. The relevant pieces are a3, d6, b1, c1, e1, and the move creates pressure against f8, e5, f5, a6.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exf5 does not create the verified before/after feature: Bd6 improves good knight vs bad bishop by 7.8 activity units..",
          "Bb4 does not create the verified before/after feature: Bd6 improves good knight vs bad bishop by 7.8 activity units..",
          "Bc5 does not create the verified before/after feature: Bd6 improves good knight vs bad bishop by 7.8 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 40.8,
        "afterActivity": 48.6,
        "activityDelta": 7.8,
        "relevantPieces": [
          "a3",
          "d6",
          "b1",
          "c1",
          "e1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "f8",
          "e5",
          "f5",
          "a6"
        ],
        "whyItMatters": "Bd6 improves good knight vs bad bishop by 7.8 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq -|a3d6|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-imbalance_arena-752717be",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "36d17228c1d45c9d64eb11c1b185a018647cbd48",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "a3e7",
      "san": "Be7",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4f5",
        "a3b4",
        "a3c5",
        "a3d6",
        "a3f8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Be7 improves good knight vs bad bishop by 10.0 activity units.."
        },
        {
          "moveUci": "a3b4",
          "san": "Bb4",
          "reasonItIsTempting": "Bb4 is legal and pursues a nearby plan.",
          "whyItFails": "Bb4 does not create the verified before/after feature: Be7 improves good knight vs bad bishop by 10.0 activity units.."
        },
        {
          "moveUci": "a3c5",
          "san": "Bc5",
          "reasonItIsTempting": "Bc5 is legal and pursues a nearby plan.",
          "whyItFails": "Bc5 does not create the verified before/after feature: Be7 improves good knight vs bad bishop by 10.0 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "hard",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Be7 uses the good knight vs bad bishop rather than chasing material. Activity rises from 40.8 to 50.8. The relevant pieces are a3, e7, b1, c1, e1, and the move creates pressure against d8, f8, f5, a6.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exf5 does not create the verified before/after feature: Be7 improves good knight vs bad bishop by 10.0 activity units..",
          "Bb4 does not create the verified before/after feature: Be7 improves good knight vs bad bishop by 10.0 activity units..",
          "Bc5 does not create the verified before/after feature: Be7 improves good knight vs bad bishop by 10.0 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 40.8,
        "afterActivity": 50.8,
        "activityDelta": 10,
        "relevantPieces": [
          "a3",
          "e7",
          "b1",
          "c1",
          "e1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "d8",
          "f8",
          "f5",
          "a6"
        ],
        "whyItMatters": "Be7 improves good knight vs bad bishop by 10.0 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq -|a3e7|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-imbalance_arena-8940da49",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "36d17228c1d45c9d64eb11c1b185a018647cbd48",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b1c3",
      "san": "Nc3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4f5",
        "a3b4",
        "a3c5",
        "a3d6",
        "a3e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 6.4 activity units.."
        },
        {
          "moveUci": "a3b4",
          "san": "Bb4",
          "reasonItIsTempting": "Bb4 is legal and pursues a nearby plan.",
          "whyItFails": "Bb4 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 6.4 activity units.."
        },
        {
          "moveUci": "a3c5",
          "san": "Bc5",
          "reasonItIsTempting": "Bc5 is legal and pursues a nearby plan.",
          "whyItFails": "Bc5 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 6.4 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "expert",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Nc3 uses the good knight vs bad bishop rather than chasing material. Activity rises from 40.8 to 47.2. The relevant pieces are b1, c3, a1, c1, e1, and the move creates pressure against f5, f8, a6.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exf5 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 6.4 activity units..",
          "Bb4 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 6.4 activity units..",
          "Bc5 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 6.4 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 40.8,
        "afterActivity": 47.2,
        "activityDelta": 6.4,
        "relevantPieces": [
          "b1",
          "c3",
          "a1",
          "c1",
          "e1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "f5",
          "f8",
          "a6"
        ],
        "whyItMatters": "Nc3 improves good knight vs bad bishop by 6.4 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq -|b1c3|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-imbalance_arena-ba208d26",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "36d17228c1d45c9d64eb11c1b185a018647cbd48",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c1b2",
      "san": "Qb2",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4f5",
        "a3b4",
        "a3c5",
        "a3d6",
        "a3e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Qb2 improves good knight vs bad bishop by 1.8 activity units.."
        },
        {
          "moveUci": "a3b4",
          "san": "Bb4",
          "reasonItIsTempting": "Bb4 is legal and pursues a nearby plan.",
          "whyItFails": "Bb4 does not create the verified before/after feature: Qb2 improves good knight vs bad bishop by 1.8 activity units.."
        },
        {
          "moveUci": "a3c5",
          "san": "Bc5",
          "reasonItIsTempting": "Bc5 is legal and pursues a nearby plan.",
          "whyItFails": "Bc5 does not create the verified before/after feature: Qb2 improves good knight vs bad bishop by 1.8 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "intro",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qb2 uses the good knight vs bad bishop rather than chasing material. Activity rises from 40.8 to 42.6. The relevant pieces are c1, b2, b1, e1, f1, and the move creates pressure against f5, f8, e5, a6.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exf5 does not create the verified before/after feature: Qb2 improves good knight vs bad bishop by 1.8 activity units..",
          "Bb4 does not create the verified before/after feature: Qb2 improves good knight vs bad bishop by 1.8 activity units..",
          "Bc5 does not create the verified before/after feature: Qb2 improves good knight vs bad bishop by 1.8 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 40.8,
        "afterActivity": 42.6,
        "activityDelta": 1.8,
        "relevantPieces": [
          "c1",
          "b2",
          "b1",
          "e1",
          "f1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "f5",
          "f8",
          "e5",
          "a6"
        ],
        "whyItMatters": "Qb2 improves good knight vs bad bishop by 1.8 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq -|c1b2|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-imbalance_arena-44aeb141",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "36d17228c1d45c9d64eb11c1b185a018647cbd48",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c1d1",
      "san": "Qd1",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4f5",
        "a3b4",
        "a3c5",
        "a3d6",
        "a3e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 4.4 activity units.."
        },
        {
          "moveUci": "a3b4",
          "san": "Bb4",
          "reasonItIsTempting": "Bb4 is legal and pursues a nearby plan.",
          "whyItFails": "Bb4 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 4.4 activity units.."
        },
        {
          "moveUci": "a3c5",
          "san": "Bc5",
          "reasonItIsTempting": "Bc5 is legal and pursues a nearby plan.",
          "whyItFails": "Bc5 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 4.4 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "easy",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qd1 uses the good knight vs bad bishop rather than chasing material. Activity rises from 40.8 to 45.2. The relevant pieces are c1, d1, b1, e1, and the move creates pressure against f5, f8, a6.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exf5 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 4.4 activity units..",
          "Bb4 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 4.4 activity units..",
          "Bc5 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 4.4 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 40.8,
        "afterActivity": 45.2,
        "activityDelta": 4.4,
        "relevantPieces": [
          "c1",
          "d1",
          "b1",
          "e1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "f5",
          "f8",
          "a6"
        ],
        "whyItMatters": "Qd1 improves good knight vs bad bishop by 4.4 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq -|c1d1|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-imbalance_arena-95cf5cf8",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "36d17228c1d45c9d64eb11c1b185a018647cbd48",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "f1e2",
      "san": "Be2",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4f5",
        "a3b4",
        "a3c5",
        "a3d6",
        "a3e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Be2 improves good knight vs bad bishop by 4.4 activity units.."
        },
        {
          "moveUci": "a3b4",
          "san": "Bb4",
          "reasonItIsTempting": "Bb4 is legal and pursues a nearby plan.",
          "whyItFails": "Bb4 does not create the verified before/after feature: Be2 improves good knight vs bad bishop by 4.4 activity units.."
        },
        {
          "moveUci": "a3c5",
          "san": "Bc5",
          "reasonItIsTempting": "Bc5 is legal and pursues a nearby plan.",
          "whyItFails": "Bc5 does not create the verified before/after feature: Be2 improves good knight vs bad bishop by 4.4 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "medium",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Be2 uses the good knight vs bad bishop rather than chasing material. Activity rises from 40.8 to 45.2. The relevant pieces are f1, e2, b1, c1, e1, and the move creates pressure against f5, f8, a6.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exf5 does not create the verified before/after feature: Be2 improves good knight vs bad bishop by 4.4 activity units..",
          "Bb4 does not create the verified before/after feature: Be2 improves good knight vs bad bishop by 4.4 activity units..",
          "Bc5 does not create the verified before/after feature: Be2 improves good knight vs bad bishop by 4.4 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 40.8,
        "afterActivity": 45.2,
        "activityDelta": 4.4,
        "relevantPieces": [
          "f1",
          "e2",
          "b1",
          "c1",
          "e1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "f5",
          "f8",
          "a6"
        ],
        "whyItMatters": "Be2 improves good knight vs bad bishop by 4.4 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq -|f1e2|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-imbalance_arena-fb662108",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "36d17228c1d45c9d64eb11c1b185a018647cbd48",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "f1c4",
      "san": "Bc4",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4f5",
        "a3b4",
        "a3c5",
        "a3d6",
        "a3e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Bc4 improves good knight vs bad bishop by 10.2 activity units.."
        },
        {
          "moveUci": "a3b4",
          "san": "Bb4",
          "reasonItIsTempting": "Bb4 is legal and pursues a nearby plan.",
          "whyItFails": "Bb4 does not create the verified before/after feature: Bc4 improves good knight vs bad bishop by 10.2 activity units.."
        },
        {
          "moveUci": "a3c5",
          "san": "Bc5",
          "reasonItIsTempting": "Bc5 is legal and pursues a nearby plan.",
          "whyItFails": "Bc5 does not create the verified before/after feature: Bc4 improves good knight vs bad bishop by 10.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "hard",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Bc4 uses the good knight vs bad bishop rather than chasing material. Activity rises from 40.8 to 51. The relevant pieces are f1, c4, b1, c1, e1, and the move creates pressure against a6, g8, f5, f8.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exf5 does not create the verified before/after feature: Bc4 improves good knight vs bad bishop by 10.2 activity units..",
          "Bb4 does not create the verified before/after feature: Bc4 improves good knight vs bad bishop by 10.2 activity units..",
          "Bc5 does not create the verified before/after feature: Bc4 improves good knight vs bad bishop by 10.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 40.8,
        "afterActivity": 51,
        "activityDelta": 10.2,
        "relevantPieces": [
          "f1",
          "c4",
          "b1",
          "c1",
          "e1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "a6",
          "g8",
          "f5",
          "f8"
        ],
        "whyItMatters": "Bc4 improves good knight vs bad bishop by 10.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq -|f1c4|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-imbalance_arena-2fe85812",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "36d17228c1d45c9d64eb11c1b185a018647cbd48",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "f1b5",
      "san": "Bb5",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4f5",
        "a3b4",
        "a3c5",
        "a3d6",
        "a3e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Bb5 improves good knight vs bad bishop by 4.4 activity units.."
        },
        {
          "moveUci": "a3b4",
          "san": "Bb4",
          "reasonItIsTempting": "Bb4 is legal and pursues a nearby plan.",
          "whyItFails": "Bb4 does not create the verified before/after feature: Bb5 improves good knight vs bad bishop by 4.4 activity units.."
        },
        {
          "moveUci": "a3c5",
          "san": "Bc5",
          "reasonItIsTempting": "Bc5 is legal and pursues a nearby plan.",
          "whyItFails": "Bc5 does not create the verified before/after feature: Bb5 improves good knight vs bad bishop by 4.4 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "expert",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Bb5 uses the good knight vs bad bishop rather than chasing material. Activity rises from 40.8 to 45.2. The relevant pieces are f1, b5, b1, c1, e1, and the move creates pressure against a6, c6, f5, f8.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exf5 does not create the verified before/after feature: Bb5 improves good knight vs bad bishop by 4.4 activity units..",
          "Bb4 does not create the verified before/after feature: Bb5 improves good knight vs bad bishop by 4.4 activity units..",
          "Bc5 does not create the verified before/after feature: Bb5 improves good knight vs bad bishop by 4.4 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 40.8,
        "afterActivity": 45.2,
        "activityDelta": 4.4,
        "relevantPieces": [
          "f1",
          "b5",
          "b1",
          "c1",
          "e1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "a6",
          "c6",
          "f5",
          "f8"
        ],
        "whyItMatters": "Bb5 improves good knight vs bad bishop by 4.4 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq -|f1b5|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-imbalance_arena-4ceae93d",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "36d17228c1d45c9d64eb11c1b185a018647cbd48",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g1f3",
      "san": "Nf3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4f5",
        "a3b4",
        "a3c5",
        "a3d6",
        "a3e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 2.2 activity units.."
        },
        {
          "moveUci": "a3b4",
          "san": "Bb4",
          "reasonItIsTempting": "Bb4 is legal and pursues a nearby plan.",
          "whyItFails": "Bb4 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 2.2 activity units.."
        },
        {
          "moveUci": "a3c5",
          "san": "Bc5",
          "reasonItIsTempting": "Bc5 is legal and pursues a nearby plan.",
          "whyItFails": "Bc5 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 2.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "intro",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Nf3 uses the good knight vs bad bishop rather than chasing material. Activity rises from 40.8 to 43. The relevant pieces are g1, f3, b1, c1, e1, and the move creates pressure against f5, f8, e5, a6.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exf5 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 2.2 activity units..",
          "Bb4 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 2.2 activity units..",
          "Bc5 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 2.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 40.8,
        "afterActivity": 43,
        "activityDelta": 2.2,
        "relevantPieces": [
          "g1",
          "f3",
          "b1",
          "c1",
          "e1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "f5",
          "f8",
          "e5",
          "a6"
        ],
        "whyItMatters": "Nf3 improves good knight vs bad bishop by 2.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqkbnr/pp1p2pp/n1p5/4pp2/4P3/BP6/P1PP1PPP/RNQ1KBNR w KQkq -|g1f3|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-imbalance_arena-91d7ed7c",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "3d360458c922375368b3d4eef234260badcd1115",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "reti-white"
    },
    "board": {
      "fen": "r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq - 0 9",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c2b3",
      "san": "Qb3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4e5",
        "g4g5",
        "g4h5",
        "a3a4",
        "d3d4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4e5",
          "san": "e5",
          "reasonItIsTempting": "e5 is legal and pursues a nearby plan.",
          "whyItFails": "e5 does not create the verified before/after feature: Qb3 improves good knight vs bad bishop by 5.0 activity units.."
        },
        {
          "moveUci": "g4g5",
          "san": "g5",
          "reasonItIsTempting": "g5 is legal and pursues a nearby plan.",
          "whyItFails": "g5 does not create the verified before/after feature: Qb3 improves good knight vs bad bishop by 5.0 activity units.."
        },
        {
          "moveUci": "g4h5",
          "san": "gxh5",
          "reasonItIsTempting": "gxh5 is legal and pursues a nearby plan.",
          "whyItFails": "gxh5 does not create the verified before/after feature: Qb3 improves good knight vs bad bishop by 5.0 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "easy",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qb3 uses the good knight vs bad bishop rather than chasing material. Activity rises from 30.2 to 35.2. The relevant pieces are c2, b3, a1, b1, f1, and the move creates pressure against h5, b6.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "e5 does not create the verified before/after feature: Qb3 improves good knight vs bad bishop by 5.0 activity units..",
          "g5 does not create the verified before/after feature: Qb3 improves good knight vs bad bishop by 5.0 activity units..",
          "gxh5 does not create the verified before/after feature: Qb3 improves good knight vs bad bishop by 5.0 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 30.2,
        "afterActivity": 35.2,
        "activityDelta": 5,
        "relevantPieces": [
          "c2",
          "b3",
          "a1",
          "b1",
          "f1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "h5",
          "b6"
        ],
        "whyItMatters": "Qb3 improves good knight vs bad bishop by 5.0 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq -|c2b3|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-imbalance_arena-d6882e62",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "3d360458c922375368b3d4eef234260badcd1115",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "reti-white"
    },
    "board": {
      "fen": "r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq - 0 9",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c2a4",
      "san": "Qa4",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4e5",
        "g4g5",
        "g4h5",
        "a3a4",
        "d3d4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4e5",
          "san": "e5",
          "reasonItIsTempting": "e5 is legal and pursues a nearby plan.",
          "whyItFails": "e5 does not create the verified before/after feature: Qa4 improves good knight vs bad bishop by 9.2 activity units.."
        },
        {
          "moveUci": "g4g5",
          "san": "g5",
          "reasonItIsTempting": "g5 is legal and pursues a nearby plan.",
          "whyItFails": "g5 does not create the verified before/after feature: Qa4 improves good knight vs bad bishop by 9.2 activity units.."
        },
        {
          "moveUci": "g4h5",
          "san": "gxh5",
          "reasonItIsTempting": "gxh5 is legal and pursues a nearby plan.",
          "whyItFails": "gxh5 does not create the verified before/after feature: Qa4 improves good knight vs bad bishop by 9.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "medium",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qa4 uses the good knight vs bad bishop rather than chasing material. Activity rises from 30.2 to 39.4. The relevant pieces are c2, a4, a1, b1, f1, and the move creates pressure against a5, d7, h5.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "e5 does not create the verified before/after feature: Qa4 improves good knight vs bad bishop by 9.2 activity units..",
          "g5 does not create the verified before/after feature: Qa4 improves good knight vs bad bishop by 9.2 activity units..",
          "gxh5 does not create the verified before/after feature: Qa4 improves good knight vs bad bishop by 9.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 30.2,
        "afterActivity": 39.4,
        "activityDelta": 9.2,
        "relevantPieces": [
          "c2",
          "a4",
          "a1",
          "b1",
          "f1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "a5",
          "d7",
          "h5"
        ],
        "whyItMatters": "Qa4 improves good knight vs bad bishop by 9.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq -|c2a4|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-imbalance_arena-77a0494d",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "3d360458c922375368b3d4eef234260badcd1115",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "reti-white"
    },
    "board": {
      "fen": "r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq - 0 9",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c2c3",
      "san": "Qc3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4e5",
        "g4g5",
        "g4h5",
        "a3a4",
        "d3d4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4e5",
          "san": "e5",
          "reasonItIsTempting": "e5 is legal and pursues a nearby plan.",
          "whyItFails": "e5 does not create the verified before/after feature: Qc3 improves good knight vs bad bishop by 8.2 activity units.."
        },
        {
          "moveUci": "g4g5",
          "san": "g5",
          "reasonItIsTempting": "g5 is legal and pursues a nearby plan.",
          "whyItFails": "g5 does not create the verified before/after feature: Qc3 improves good knight vs bad bishop by 8.2 activity units.."
        },
        {
          "moveUci": "g4h5",
          "san": "gxh5",
          "reasonItIsTempting": "gxh5 is legal and pursues a nearby plan.",
          "whyItFails": "gxh5 does not create the verified before/after feature: Qc3 improves good knight vs bad bishop by 8.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "hard",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qc3 uses the good knight vs bad bishop rather than chasing material. Activity rises from 30.2 to 38.4. The relevant pieces are c2, c3, a1, f1, g1, and the move creates pressure against h5, a5, g7.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "e5 does not create the verified before/after feature: Qc3 improves good knight vs bad bishop by 8.2 activity units..",
          "g5 does not create the verified before/after feature: Qc3 improves good knight vs bad bishop by 8.2 activity units..",
          "gxh5 does not create the verified before/after feature: Qc3 improves good knight vs bad bishop by 8.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 30.2,
        "afterActivity": 38.4,
        "activityDelta": 8.2,
        "relevantPieces": [
          "c2",
          "c3",
          "a1",
          "f1",
          "g1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "h5",
          "a5",
          "g7"
        ],
        "whyItMatters": "Qc3 improves good knight vs bad bishop by 8.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq -|c2c3|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-imbalance_arena-47ff6c2c",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "3d360458c922375368b3d4eef234260badcd1115",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "reti-white"
    },
    "board": {
      "fen": "r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq - 0 9",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c2d1",
      "san": "Qd1",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4e5",
        "g4g5",
        "g4h5",
        "a3a4",
        "d3d4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4e5",
          "san": "e5",
          "reasonItIsTempting": "e5 is legal and pursues a nearby plan.",
          "whyItFails": "e5 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 2.4 activity units.."
        },
        {
          "moveUci": "g4g5",
          "san": "g5",
          "reasonItIsTempting": "g5 is legal and pursues a nearby plan.",
          "whyItFails": "g5 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 2.4 activity units.."
        },
        {
          "moveUci": "g4h5",
          "san": "gxh5",
          "reasonItIsTempting": "gxh5 is legal and pursues a nearby plan.",
          "whyItFails": "gxh5 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 2.4 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "expert",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qd1 uses the good knight vs bad bishop rather than chasing material. Activity rises from 30.2 to 32.6. The relevant pieces are c2, d1, a1, b1, and the move creates pressure against h5.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "e5 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 2.4 activity units..",
          "g5 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 2.4 activity units..",
          "gxh5 does not create the verified before/after feature: Qd1 improves good knight vs bad bishop by 2.4 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 30.2,
        "afterActivity": 32.6,
        "activityDelta": 2.4,
        "relevantPieces": [
          "c2",
          "d1",
          "a1",
          "b1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "h5"
        ],
        "whyItMatters": "Qd1 improves good knight vs bad bishop by 2.4 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq -|c2d1|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-imbalance_arena-3689b73d",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "3d360458c922375368b3d4eef234260badcd1115",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "reti-white"
    },
    "board": {
      "fen": "r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq - 0 9",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b1c3",
      "san": "Nc3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4e5",
        "g4g5",
        "g4h5",
        "a3a4",
        "d3d4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4e5",
          "san": "e5",
          "reasonItIsTempting": "e5 is legal and pursues a nearby plan.",
          "whyItFails": "e5 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 7.2 activity units.."
        },
        {
          "moveUci": "g4g5",
          "san": "g5",
          "reasonItIsTempting": "g5 is legal and pursues a nearby plan.",
          "whyItFails": "g5 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 7.2 activity units.."
        },
        {
          "moveUci": "g4h5",
          "san": "gxh5",
          "reasonItIsTempting": "gxh5 is legal and pursues a nearby plan.",
          "whyItFails": "gxh5 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 7.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "intro",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Nc3 uses the good knight vs bad bishop rather than chasing material. Activity rises from 30.2 to 37.4. The relevant pieces are b1, c3, a1, f1, g1, and the move creates pressure against h5.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "e5 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 7.2 activity units..",
          "g5 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 7.2 activity units..",
          "gxh5 does not create the verified before/after feature: Nc3 improves good knight vs bad bishop by 7.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 30.2,
        "afterActivity": 37.4,
        "activityDelta": 7.2,
        "relevantPieces": [
          "b1",
          "c3",
          "a1",
          "f1",
          "g1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "h5"
        ],
        "whyItMatters": "Nc3 improves good knight vs bad bishop by 7.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq -|b1c3|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-imbalance_arena-29ffea41",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "3d360458c922375368b3d4eef234260badcd1115",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "reti-white"
    },
    "board": {
      "fen": "r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq - 0 9",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g1f3",
      "san": "Nf3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "e4e5",
        "g4g5",
        "g4h5",
        "a3a4",
        "d3d4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4e5",
          "san": "e5",
          "reasonItIsTempting": "e5 is legal and pursues a nearby plan.",
          "whyItFails": "e5 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 3.2 activity units.."
        },
        {
          "moveUci": "g4g5",
          "san": "g5",
          "reasonItIsTempting": "g5 is legal and pursues a nearby plan.",
          "whyItFails": "g5 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 3.2 activity units.."
        },
        {
          "moveUci": "g4h5",
          "san": "gxh5",
          "reasonItIsTempting": "gxh5 is legal and pursues a nearby plan.",
          "whyItFails": "gxh5 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 3.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "easy",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Nf3 uses the good knight vs bad bishop rather than chasing material. Activity rises from 30.2 to 33.4. The relevant pieces are g1, f3, a1, b1, f1, and the move creates pressure against h5.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "e5 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 3.2 activity units..",
          "g5 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 3.2 activity units..",
          "gxh5 does not create the verified before/after feature: Nf3 improves good knight vs bad bishop by 3.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 30.2,
        "afterActivity": 33.4,
        "activityDelta": 3.2,
        "relevantPieces": [
          "g1",
          "f3",
          "a1",
          "b1",
          "f1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "h5"
        ],
        "whyItMatters": "Nf3 improves good knight vs bad bishop by 3.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|r1bqk1nr/p1pp1pp1/1p2p3/n1b4p/2P1P1PP/P2P4/1PQK1P2/RNB2BNR w kq -|g1f3|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-imbalance_arena-6e37f5d1",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "26cd933aec389f4edf19278d96e139927ae76da8",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq - 0 8",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g7d4",
      "san": "Bd4",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8a7",
        "e8f8",
        "e8d8",
        "h8g8",
        "h8f8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: Bd4 improves good knight vs bad bishop by 6.2 activity units.."
        },
        {
          "moveUci": "e8f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 does not create the verified before/after feature: Bd4 improves good knight vs bad bishop by 6.2 activity units.."
        },
        {
          "moveUci": "e8d8",
          "san": "Kd8",
          "reasonItIsTempting": "Kd8 is legal and pursues a nearby plan.",
          "whyItFails": "Kd8 does not create the verified before/after feature: Bd4 improves good knight vs bad bishop by 6.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "medium",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Bd4 uses the good knight vs bad bishop rather than chasing material. Activity rises from 55.8 to 62. The relevant pieces are g7, d4, g4, a5, and the move creates pressure against b4, a4, h4, f2.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: Bd4 improves good knight vs bad bishop by 6.2 activity units..",
          "Kf8 does not create the verified before/after feature: Bd4 improves good knight vs bad bishop by 6.2 activity units..",
          "Kd8 does not create the verified before/after feature: Bd4 improves good knight vs bad bishop by 6.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 55.8,
        "afterActivity": 62,
        "activityDelta": 6.2,
        "relevantPieces": [
          "g7",
          "d4",
          "g4",
          "a5"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "b4",
          "a4",
          "h4",
          "f2"
        ],
        "whyItMatters": "Bd4 improves good knight vs bad bishop by 6.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq -|g7d4|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-imbalance_arena-d2d2cbc5",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "26cd933aec389f4edf19278d96e139927ae76da8",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq - 0 8",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "a5b6",
      "san": "Qb6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8a7",
        "e8f8",
        "e8d8",
        "h8g8",
        "h8f8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: Qb6 improves good knight vs bad bishop by 2.2 activity units.."
        },
        {
          "moveUci": "e8f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 does not create the verified before/after feature: Qb6 improves good knight vs bad bishop by 2.2 activity units.."
        },
        {
          "moveUci": "e8d8",
          "san": "Kd8",
          "reasonItIsTempting": "Kd8 is legal and pursues a nearby plan.",
          "whyItFails": "Kd8 does not create the verified before/after feature: Qb6 improves good knight vs bad bishop by 2.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "hard",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qb6 uses the good knight vs bad bishop rather than chasing material. Activity rises from 55.8 to 58. The relevant pieces are a5, b6, g4, g5, a6, and the move creates pressure against b2, f2, b4, h4.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: Qb6 improves good knight vs bad bishop by 2.2 activity units..",
          "Kf8 does not create the verified before/after feature: Qb6 improves good knight vs bad bishop by 2.2 activity units..",
          "Kd8 does not create the verified before/after feature: Qb6 improves good knight vs bad bishop by 2.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 55.8,
        "afterActivity": 58,
        "activityDelta": 2.2,
        "relevantPieces": [
          "a5",
          "b6",
          "g4",
          "g5",
          "a6"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "b2",
          "f2",
          "b4",
          "h4"
        ],
        "whyItMatters": "Qb6 improves good knight vs bad bishop by 2.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq -|a5b6|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-imbalance_arena-bab53181",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "26cd933aec389f4edf19278d96e139927ae76da8",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq - 0 8",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "a5c5",
      "san": "Qc5",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8a7",
        "e8f8",
        "e8d8",
        "h8g8",
        "h8f8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: Qc5 improves good knight vs bad bishop by 7.4 activity units.."
        },
        {
          "moveUci": "e8f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 does not create the verified before/after feature: Qc5 improves good knight vs bad bishop by 7.4 activity units.."
        },
        {
          "moveUci": "e8d8",
          "san": "Kd8",
          "reasonItIsTempting": "Kd8 is legal and pursues a nearby plan.",
          "whyItFails": "Kd8 does not create the verified before/after feature: Qc5 improves good knight vs bad bishop by 7.4 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "expert",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qc5 uses the good knight vs bad bishop rather than chasing material. Activity rises from 55.8 to 63.2. The relevant pieces are a5, c5, g4, g5, and the move creates pressure against b2, f2, c4, b4.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: Qc5 improves good knight vs bad bishop by 7.4 activity units..",
          "Kf8 does not create the verified before/after feature: Qc5 improves good knight vs bad bishop by 7.4 activity units..",
          "Kd8 does not create the verified before/after feature: Qc5 improves good knight vs bad bishop by 7.4 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 55.8,
        "afterActivity": 63.2,
        "activityDelta": 7.4,
        "relevantPieces": [
          "a5",
          "c5",
          "g4",
          "g5"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "b2",
          "f2",
          "c4",
          "b4"
        ],
        "whyItMatters": "Qc5 improves good knight vs bad bishop by 7.4 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq -|a5c5|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-imbalance_arena-d620fd66",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "26cd933aec389f4edf19278d96e139927ae76da8",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq - 0 8",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "a5d5",
      "san": "Qd5",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8a7",
        "e8f8",
        "e8d8",
        "h8g8",
        "h8f8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: Qd5 improves good knight vs bad bishop by 9.0 activity units.."
        },
        {
          "moveUci": "e8f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 does not create the verified before/after feature: Qd5 improves good knight vs bad bishop by 9.0 activity units.."
        },
        {
          "moveUci": "e8d8",
          "san": "Kd8",
          "reasonItIsTempting": "Kd8 is legal and pursues a nearby plan.",
          "whyItFails": "Kd8 does not create the verified before/after feature: Qd5 improves good knight vs bad bishop by 9.0 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "intro",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qd5 uses the good knight vs bad bishop rather than chasing material. Activity rises from 55.8 to 64.8. The relevant pieces are a5, d5, g4, g5, and the move creates pressure against b2, f3, d2, c4.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: Qd5 improves good knight vs bad bishop by 9.0 activity units..",
          "Kf8 does not create the verified before/after feature: Qd5 improves good knight vs bad bishop by 9.0 activity units..",
          "Kd8 does not create the verified before/after feature: Qd5 improves good knight vs bad bishop by 9.0 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 55.8,
        "afterActivity": 64.8,
        "activityDelta": 9,
        "relevantPieces": [
          "a5",
          "d5",
          "g4",
          "g5"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "b2",
          "f3",
          "d2",
          "c4"
        ],
        "whyItMatters": "Qd5 improves good knight vs bad bishop by 9.0 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq -|a5d5|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-imbalance_arena-33d23043",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "26cd933aec389f4edf19278d96e139927ae76da8",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq - 0 8",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "a5e5",
      "san": "Qe5",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8a7",
        "e8f8",
        "e8d8",
        "h8g8",
        "h8f8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: Qe5 improves good knight vs bad bishop by 8.2 activity units.."
        },
        {
          "moveUci": "e8f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 does not create the verified before/after feature: Qe5 improves good knight vs bad bishop by 8.2 activity units.."
        },
        {
          "moveUci": "e8d8",
          "san": "Kd8",
          "reasonItIsTempting": "Kd8 is legal and pursues a nearby plan.",
          "whyItFails": "Kd8 does not create the verified before/after feature: Qe5 improves good knight vs bad bishop by 8.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "easy",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qe5 uses the good knight vs bad bishop rather than chasing material. Activity rises from 55.8 to 64. The relevant pieces are a5, e5, g4, g5, and the move creates pressure against e2, b2, h4, f2.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: Qe5 improves good knight vs bad bishop by 8.2 activity units..",
          "Kf8 does not create the verified before/after feature: Qe5 improves good knight vs bad bishop by 8.2 activity units..",
          "Kd8 does not create the verified before/after feature: Qe5 improves good knight vs bad bishop by 8.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 55.8,
        "afterActivity": 64,
        "activityDelta": 8.2,
        "relevantPieces": [
          "a5",
          "e5",
          "g4",
          "g5"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "e2",
          "b2",
          "h4",
          "f2"
        ],
        "whyItMatters": "Qe5 improves good knight vs bad bishop by 8.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq -|a5e5|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-imbalance_arena-87d61858",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "26cd933aec389f4edf19278d96e139927ae76da8",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq - 0 8",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "a5f5",
      "san": "Qf5",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8a7",
        "e8f8",
        "e8d8",
        "h8g8",
        "h8f8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: Qf5 improves good knight vs bad bishop by 11.2 activity units.."
        },
        {
          "moveUci": "e8f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 does not create the verified before/after feature: Qf5 improves good knight vs bad bishop by 11.2 activity units.."
        },
        {
          "moveUci": "e8d8",
          "san": "Kd8",
          "reasonItIsTempting": "Kd8 is legal and pursues a nearby plan.",
          "whyItFails": "Kd8 does not create the verified before/after feature: Qf5 improves good knight vs bad bishop by 11.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "medium",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qf5 uses the good knight vs bad bishop rather than chasing material. Activity rises from 55.8 to 67. The relevant pieces are a5, f5, g4, g5, and the move creates pressure against b2, f3, b1, h4.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: Qf5 improves good knight vs bad bishop by 11.2 activity units..",
          "Kf8 does not create the verified before/after feature: Qf5 improves good knight vs bad bishop by 11.2 activity units..",
          "Kd8 does not create the verified before/after feature: Qf5 improves good knight vs bad bishop by 11.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 55.8,
        "afterActivity": 67,
        "activityDelta": 11.2,
        "relevantPieces": [
          "a5",
          "f5",
          "g4",
          "g5"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "b2",
          "f3",
          "b1",
          "h4"
        ],
        "whyItMatters": "Qf5 improves good knight vs bad bishop by 11.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rnb1k2r/1p1pppbp/p1p5/q5p1/PQP3nP/5N2/RP1PPPP1/1NBK1B1R b kq -|a5f5|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-imbalance_arena-86d1e911",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "690617a05678c4979530122f3f0b232f37676f15",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "french-black"
    },
    "board": {
      "fen": "rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq - 1 5",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b8c6",
      "san": "Nc6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8d7",
        "b8a6",
        "d8d7",
        "d8d6",
        "d8c8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: Nc6 improves good knight vs bad bishop by 3.2 activity units.."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: Nc6 improves good knight vs bad bishop by 3.2 activity units.."
        },
        {
          "moveUci": "d8d7",
          "san": "Qd7",
          "reasonItIsTempting": "Qd7 is legal and pursues a nearby plan.",
          "whyItFails": "Qd7 does not create the verified before/after feature: Nc6 improves good knight vs bad bishop by 3.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "hard",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Nc6 uses the good knight vs bad bishop rather than chasing material. Activity rises from 29.6 to 32.8. The relevant pieces are b8, c6, b5, d5, and the move creates pressure against c4.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: Nc6 improves good knight vs bad bishop by 3.2 activity units..",
          "Na6 does not create the verified before/after feature: Nc6 improves good knight vs bad bishop by 3.2 activity units..",
          "Qd7 does not create the verified before/after feature: Nc6 improves good knight vs bad bishop by 3.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 29.6,
        "afterActivity": 32.8,
        "activityDelta": 3.2,
        "relevantPieces": [
          "b8",
          "c6",
          "b5",
          "d5"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "c4"
        ],
        "whyItMatters": "Nc6 improves good knight vs bad bishop by 3.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq -|b8c6|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-imbalance_arena-adfd5f93",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "690617a05678c4979530122f3f0b232f37676f15",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "french-black"
    },
    "board": {
      "fen": "rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq - 1 5",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d8d7",
      "san": "Qd7",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8d7",
        "b8c6",
        "b8a6",
        "d8d6",
        "d8c8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: Qd7 improves good knight vs bad bishop by 6.2 activity units.."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: Qd7 improves good knight vs bad bishop by 6.2 activity units.."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: Qd7 improves good knight vs bad bishop by 6.2 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "expert",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qd7 uses the good knight vs bad bishop rather than chasing material. Activity rises from 29.6 to 35.8. The relevant pieces are d8, d7, b5, d5, f6, and the move creates pressure against c4.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: Qd7 improves good knight vs bad bishop by 6.2 activity units..",
          "Nc6 does not create the verified before/after feature: Qd7 improves good knight vs bad bishop by 6.2 activity units..",
          "Na6 does not create the verified before/after feature: Qd7 improves good knight vs bad bishop by 6.2 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 29.6,
        "afterActivity": 35.8,
        "activityDelta": 6.2,
        "relevantPieces": [
          "d8",
          "d7",
          "b5",
          "d5",
          "f6"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "c4"
        ],
        "whyItMatters": "Qd7 improves good knight vs bad bishop by 6.2 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq -|d8d7|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-imbalance_arena-b5e647fc",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "690617a05678c4979530122f3f0b232f37676f15",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "french-black"
    },
    "board": {
      "fen": "rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq - 1 5",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d8d6",
      "san": "Qd6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8d7",
        "b8c6",
        "b8a6",
        "d8d7",
        "d8c8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: Qd6 improves good knight vs bad bishop by 17.0 activity units.."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: Qd6 improves good knight vs bad bishop by 17.0 activity units.."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: Qd6 improves good knight vs bad bishop by 17.0 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "intro",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qd6 uses the good knight vs bad bishop rather than chasing material. Activity rises from 29.6 to 46.6. The relevant pieces are d8, d6, b5, d5, and the move creates pressure against h2, c4.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: Qd6 improves good knight vs bad bishop by 17.0 activity units..",
          "Nc6 does not create the verified before/after feature: Qd6 improves good knight vs bad bishop by 17.0 activity units..",
          "Na6 does not create the verified before/after feature: Qd6 improves good knight vs bad bishop by 17.0 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 29.6,
        "afterActivity": 46.6,
        "activityDelta": 17,
        "relevantPieces": [
          "d8",
          "d6",
          "b5",
          "d5"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "h2",
          "c4"
        ],
        "whyItMatters": "Qd6 improves good knight vs bad bishop by 17.0 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq -|d8d6|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-imbalance_arena-6be62d55",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "690617a05678c4979530122f3f0b232f37676f15",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "french-black"
    },
    "board": {
      "fen": "rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq - 1 5",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d8c8",
      "san": "Qc8",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8d7",
        "b8c6",
        "b8a6",
        "d8d7",
        "d8d6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: Qc8 improves good knight vs bad bishop by 4.6 activity units.."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: Qc8 improves good knight vs bad bishop by 4.6 activity units.."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: Qc8 improves good knight vs bad bishop by 4.6 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "easy",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Qc8 uses the good knight vs bad bishop rather than chasing material. Activity rises from 29.6 to 34.2. The relevant pieces are d8, c8, b5, d5, f6, and the move creates pressure against c4.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: Qc8 improves good knight vs bad bishop by 4.6 activity units..",
          "Nc6 does not create the verified before/after feature: Qc8 improves good knight vs bad bishop by 4.6 activity units..",
          "Na6 does not create the verified before/after feature: Qc8 improves good knight vs bad bishop by 4.6 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 29.6,
        "afterActivity": 34.2,
        "activityDelta": 4.6,
        "relevantPieces": [
          "d8",
          "c8",
          "b5",
          "d5",
          "f6"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "c4"
        ],
        "whyItMatters": "Qc8 improves good knight vs bad bishop by 4.6 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq -|d8c8|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-imbalance_arena-84f9e177",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "690617a05678c4979530122f3f0b232f37676f15",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "french-black"
    },
    "board": {
      "fen": "rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq - 1 5",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g8h6",
      "san": "Nh6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8d7",
        "b8c6",
        "b8a6",
        "d8d7",
        "d8d6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: Nh6 improves good knight vs bad bishop by 3.6 activity units.."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: Nh6 improves good knight vs bad bishop by 3.6 activity units.."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: Nh6 improves good knight vs bad bishop by 3.6 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "medium",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Nh6 uses the good knight vs bad bishop rather than chasing material. Activity rises from 29.6 to 33.2. The relevant pieces are g8, h6, b5, d5, f6, and the move creates pressure against c4.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: Nh6 improves good knight vs bad bishop by 3.6 activity units..",
          "Nc6 does not create the verified before/after feature: Nh6 improves good knight vs bad bishop by 3.6 activity units..",
          "Na6 does not create the verified before/after feature: Nh6 improves good knight vs bad bishop by 3.6 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 29.6,
        "afterActivity": 33.2,
        "activityDelta": 3.6,
        "relevantPieces": [
          "g8",
          "h6",
          "b5",
          "d5",
          "f6"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "c4"
        ],
        "whyItMatters": "Nh6 improves good knight vs bad bishop by 3.6 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq -|g8h6|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-imbalance_arena-1dc4ef0e",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "690617a05678c4979530122f3f0b232f37676f15",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "french-black"
    },
    "board": {
      "fen": "rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq - 1 5",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b7c8",
      "san": "Bc8",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8d7",
        "b8c6",
        "b8a6",
        "d8d7",
        "d8d6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: Bc8 improves good knight vs bad bishop by 4.8 activity units.."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: Bc8 improves good knight vs bad bishop by 4.8 activity units.."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: Bc8 improves good knight vs bad bishop by 4.8 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "hard",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Bc8 uses the good knight vs bad bishop rather than chasing material. Activity rises from 29.6 to 34.4. The relevant pieces are b7, c8, b5, d5, f6, and the move creates pressure against c4.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: Bc8 improves good knight vs bad bishop by 4.8 activity units..",
          "Nc6 does not create the verified before/after feature: Bc8 improves good knight vs bad bishop by 4.8 activity units..",
          "Na6 does not create the verified before/after feature: Bc8 improves good knight vs bad bishop by 4.8 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "b",
        "beforeActivity": 29.6,
        "afterActivity": 34.4,
        "activityDelta": 4.8,
        "relevantPieces": [
          "b7",
          "c8",
          "b5",
          "d5",
          "f6"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "c4"
        ],
        "whyItMatters": "Bc8 improves good knight vs bad bishop by 4.8 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rn1qkbnr/pbp1p1pp/5p2/1p1p3P/2P5/1P6/P2PPPPR/RNBQKBN1 b Qkq -|b7c8|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-imbalance_arena-56f66bbb",
    "miniGameId": "imbalance_arena",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "1e520777afc1b87b9174efb65c4455e5f619044c",
      "seed": "stage-8m-plus:imbalance_arena",
      "generatorId": "imbalanceArenaGenerator",
      "openingId": "vienna-white"
    },
    "board": {
      "fen": "rnbq1bnr/pp2p2p/3k4/2pp1p2/3PP1p1/N4NP1/PPPB1P1P/R2QKB1R w KQ - 1 8",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "f3e5",
      "san": "Ne5",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "d4c5",
        "e4e5",
        "e4d5",
        "e4f5",
        "a3b5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e4d5",
          "san": "exd5",
          "reasonItIsTempting": "exd5 is legal and pursues a nearby plan.",
          "whyItFails": "exd5 does not create the verified before/after feature: Ne5 improves good knight vs bad bishop by 13.0 activity units.."
        },
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: Ne5 improves good knight vs bad bishop by 13.0 activity units.."
        },
        {
          "moveUci": "a3b1",
          "san": "Nb1",
          "reasonItIsTempting": "Nb1 is legal and pursues a nearby plan.",
          "whyItFails": "Nb1 does not create the verified before/after feature: Ne5 improves good knight vs bad bishop by 13.0 activity units.."
        }
      ]
    },
    "pedagogy": {
      "concept": "good_knight_vs_bad_bishop",
      "subConcept": "activity_conversion",
      "difficultyBand": "expert",
      "prompt": "Use the position's good knight vs bad bishop.",
      "lessonObjective": "Use the position's good knight vs bad bishop.",
      "transferPattern": "Identify what differs between the armies, then improve the piece that makes that difference useful.",
      "explanation": {
        "short": "Use the position's good knight vs bad bishop.",
        "detailed": "Ne5 uses the good knight vs bad bishop rather than chasing material. Activity rises from 62.8 to 75.8. The relevant pieces are f3, e5, a1, d1, e1, and the move creates pressure against g4, c5, d5, f5.",
        "coachNote": "An imbalance matters only when a move converts it into activity, targets, or restriction.",
        "whyAlternativesFail": [
          "exd5 does not create the verified before/after feature: Ne5 improves good knight vs bad bishop by 13.0 activity units..",
          "exf5 does not create the verified before/after feature: Ne5 improves good knight vs bad bishop by 13.0 activity units..",
          "Nb1 does not create the verified before/after feature: Ne5 improves good knight vs bad bishop by 13.0 activity units.."
        ]
      },
      "proof": {
        "imbalanceType": "good_knight_vs_bad_bishop",
        "sideWithImbalance": "w",
        "beforeActivity": 62.8,
        "afterActivity": 75.8,
        "activityDelta": 13,
        "relevantPieces": [
          "f3",
          "e5",
          "a1",
          "d1",
          "e1"
        ],
        "durableFeatures": [
          "good_knight_vs_bad_bishop",
          "rook_open_file_activity"
        ],
        "targets": [
          "g4",
          "c5",
          "d5",
          "f5"
        ],
        "whyItMatters": "Ne5 improves good knight vs bad bishop by 13.0 activity units."
      }
    },
    "validation": {
      "legalFen": true,
      "legalMove": true,
      "proofComplete": true,
      "explanationSpecific": true,
      "engineReviewed": false,
      "tablebaseReviewed": false,
      "humanAuditRequired": false,
      "runtimeReady": true,
      "rejectionReasons": []
    },
    "quality": {
      "score": 82,
      "noveltyKey": "imbalance_arena|rnbq1bnr/pp2p2p/3k4/2pp1p2/3PP1p1/N4NP1/PPPB1P1P/R2QKB1R w KQ -|f3e5|good_knight_vs_bad_bishop",
      "densityScore": 96,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  }
];
