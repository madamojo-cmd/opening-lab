import type { Stage8MScenario } from '../../../../tools/stage8m/types';

export const STAGE8M_KING_RACE_SCENARIOS: Stage8MScenario[] = [
  {
    "id": "stage8m-king_race-da53d316",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-5",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/8/3k4/6p1/2K5/6P1/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 4,
      "pawnCount": 2
    },
    "solution": {
      "primaryMoveUci": "g3g4",
      "san": "g4",
      "moveType": "promotion",
      "legalAlternatives": [
        "c4b5",
        "c4d4",
        "c4d3",
        "c4c3",
        "c4b3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c4b5",
          "san": "Kb5",
          "reasonItIsTempting": "Kb5 is legal and pursues a nearby plan.",
          "whyItFails": "Kb5 scores -64, 64 below g4 in the 4-ply race search."
        },
        {
          "moveUci": "c4d4",
          "san": "Kd4",
          "reasonItIsTempting": "Kd4 is legal and pursues a nearby plan.",
          "whyItFails": "Kd4 scores -64, 64 below g4 in the 4-ply race search."
        },
        {
          "moveUci": "c4d3",
          "san": "Kd3",
          "reasonItIsTempting": "Kd3 is legal and pursues a nearby plan.",
          "whyItFails": "Kd3 scores -64, 64 below g4 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "has_opposition",
      "difficultyBand": "intro",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "g4 improves the verified race score from -64 to 0. The critical squares are f5, g5, h5, promotion tempi are White 5 and Black 4, and the checked route begins g3g4 d6c7 c4b5 c7b8.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kb5 scores -64, 64 below g4 in the 4-ply race search.",
          "Kd4 scores -64, 64 below g4 in the 4-ply race search.",
          "Kd3 scores -64, 64 below g4 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "has_opposition",
        "criticalSquares": [
          "f5",
          "g5",
          "h5"
        ],
        "squareOfPawn": [
          "g3",
          "g5"
        ],
        "kingRoute": [
          "g4",
          "c7",
          "b5",
          "b8"
        ],
        "promotionTempi": {
          "white": 5,
          "black": 4
        },
        "spareTempo": false,
        "scoreBefore": -64,
        "scoreAfter": 0,
        "verificationDepth": 4,
        "principalVariation": [
          "g3g4",
          "d6c7",
          "c4b5",
          "c7b8"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/8/3k4/6p1/2K5/6P1/8/8 w - -|g3g4|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-king_race-f658af95",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-6",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/6p1/8/6PP/5k2/8/7p/5K2 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "f1g2",
      "san": "Kg2",
      "moveType": "king_route",
      "legalAlternatives": [
        "g5g6",
        "h5h6",
        "f1e2",
        "f1f2",
        "f1e1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "g5g6",
          "san": "g6",
          "reasonItIsTempting": "g6 is legal and pursues a nearby plan.",
          "whyItFails": "g6 scores -772, 672 below Kg2 in the 4-ply race search."
        },
        {
          "moveUci": "f1e2",
          "san": "Ke2",
          "reasonItIsTempting": "Ke2 is legal and pursues a nearby plan.",
          "whyItFails": "Ke2 scores -772, 672 below Kg2 in the 4-ply race search."
        },
        {
          "moveUci": "f1f2",
          "san": "Kf2",
          "reasonItIsTempting": "Kf2 is legal and pursues a nearby plan.",
          "whyItFails": "Kf2 scores -772, 672 below Kg2 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "king_route",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "easy",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "Kg2 improves the verified race score from -772 to -100. The critical squares are f6, g6, h6, promotion tempi are White 3 and Black 1, and the checked route begins f1g2 f4g5 g2h2 g5h5.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "g6 scores -772, 672 below Kg2 in the 4-ply race search.",
          "Ke2 scores -772, 672 below Kg2 in the 4-ply race search.",
          "Kf2 scores -772, 672 below Kg2 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "f6",
          "g6",
          "h6"
        ],
        "squareOfPawn": [
          "g5",
          "h5",
          "g7"
        ],
        "kingRoute": [
          "g2",
          "g5",
          "h2",
          "h5"
        ],
        "promotionTempi": {
          "white": 3,
          "black": 1
        },
        "spareTempo": true,
        "scoreBefore": -772,
        "scoreAfter": -100,
        "verificationDepth": 4,
        "principalVariation": [
          "f1g2",
          "f4g5",
          "g2h2",
          "g5h5"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/6p1/8/6PP/5k2/8/7p/5K2 w - -|f1g2|king_route",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-king_race-507ea24b",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-7",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/5P2/8/1P1K4/6P1/8/k5p1/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "f7f8q",
      "san": "f8=Q",
      "moveType": "promotion",
      "legalAlternatives": [
        "f7f8n",
        "f7f8b",
        "f7f8r",
        "b5b6",
        "d5c6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d5c6",
          "san": "Kc6",
          "reasonItIsTempting": "Kc6 is legal and pursues a nearby plan.",
          "whyItFails": "Kc6 scores 172, 132 below f8=Q in the 4-ply race search."
        },
        {
          "moveUci": "d5d6",
          "san": "Kd6",
          "reasonItIsTempting": "Kd6 is legal and pursues a nearby plan.",
          "whyItFails": "Kd6 scores 172, 132 below f8=Q in the 4-ply race search."
        },
        {
          "moveUci": "d5e6",
          "san": "Ke6",
          "reasonItIsTempting": "Ke6 is legal and pursues a nearby plan.",
          "whyItFails": "Ke6 scores 172, 132 below f8=Q in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_avoid_opposition",
      "difficultyBand": "medium",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "f8=Q improves the verified race score from 172 to 304. The critical squares are f6, g6, h6, promotion tempi are White 1 and Black 1, and the checked route begins f7f8q g2g1q f8a8 a2b3.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kc6 scores 172, 132 below f8=Q in the 4-ply race search.",
          "Kd6 scores 172, 132 below f8=Q in the 4-ply race search.",
          "Ke6 scores 172, 132 below f8=Q in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_avoid_opposition",
        "criticalSquares": [
          "f6",
          "g6",
          "h6"
        ],
        "squareOfPawn": [
          "b5"
        ],
        "kingRoute": [
          "f8",
          "g1",
          "a8",
          "b3"
        ],
        "promotionTempi": {
          "white": 1,
          "black": 1
        },
        "spareTempo": true,
        "scoreBefore": 172,
        "scoreAfter": 304,
        "verificationDepth": 4,
        "principalVariation": [
          "f7f8q",
          "g2g1q",
          "f8a8",
          "a2b3"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/5P2/8/1P1K4/6P1/8/k5p1/8 w - -|f7f8q|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-king_race-71863caa",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-8",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/8/1kp2K2/8/8/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "c6c5",
      "san": "c5",
      "moveType": "promotion",
      "legalAlternatives": [
        "b6a7",
        "b6b7",
        "b6c7",
        "b6c5",
        "b6b5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b6a7",
          "san": "Ka7",
          "reasonItIsTempting": "Ka7 is legal and pursues a nearby plan.",
          "whyItFails": "Ka7 scores 132, 40 below c5 in the 4-ply race search."
        },
        {
          "moveUci": "b6b7",
          "san": "Kb7",
          "reasonItIsTempting": "Kb7 is legal and pursues a nearby plan.",
          "whyItFails": "Kb7 scores 132, 40 below c5 in the 4-ply race search."
        },
        {
          "moveUci": "b6c7",
          "san": "Kc7",
          "reasonItIsTempting": "Kc7 is legal and pursues a nearby plan.",
          "whyItFails": "Kc7 scores 132, 40 below c5 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_avoid_opposition",
      "difficultyBand": "hard",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "c5 improves the verified race score from 132 to 172. The critical squares are b4, c4, d4, promotion tempi are White 99 and Black 5, and the checked route begins c6c5 f6e7 c5c4 e7d8.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Ka7 scores 132, 40 below c5 in the 4-ply race search.",
          "Kb7 scores 132, 40 below c5 in the 4-ply race search.",
          "Kc7 scores 132, 40 below c5 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_avoid_opposition",
        "criticalSquares": [
          "b4",
          "c4",
          "d4"
        ],
        "squareOfPawn": [
          "c6"
        ],
        "kingRoute": [
          "c5",
          "e7",
          "c4",
          "d8"
        ],
        "promotionTempi": {
          "white": 99,
          "black": 5
        },
        "spareTempo": true,
        "scoreBefore": 132,
        "scoreAfter": 172,
        "verificationDepth": 4,
        "principalVariation": [
          "c6c5",
          "f6e7",
          "c5c4",
          "e7d8"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/8/1kp2K2/8/8/8/8/8 b - -|c6c5|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-king_race-4bf47709",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-10",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/P7/8/8/3pk3/7P/4P2K/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "a7a8q",
      "san": "a8=Q+",
      "moveType": "promotion",
      "legalAlternatives": [
        "a7a8n",
        "a7a8b",
        "a7a8r",
        "h3h4",
        "e2e3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h3h4",
          "san": "h4",
          "reasonItIsTempting": "h4 is legal and pursues a nearby plan.",
          "whyItFails": "h4 scores 860, 76 below a8=Q+ in the 4-ply race search."
        },
        {
          "moveUci": "h2g3",
          "san": "Kg3",
          "reasonItIsTempting": "Kg3 is legal and pursues a nearby plan.",
          "whyItFails": "Kg3 scores 836, 100 below a8=Q+ in the 4-ply race search."
        },
        {
          "moveUci": "h2h1",
          "san": "Kh1",
          "reasonItIsTempting": "Kh1 is legal and pursues a nearby plan.",
          "whyItFails": "Kh1 scores 836, 100 below a8=Q+ in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "expert",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "a8=Q+ improves the verified race score from 860 to 936. The critical squares are d4, e4, f4, promotion tempi are White 1 and Black 3, and the checked route begins a7a8q e4e5 a8b8 e5e6.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "h4 scores 860, 76 below a8=Q+ in the 4-ply race search.",
          "Kg3 scores 836, 100 below a8=Q+ in the 4-ply race search.",
          "Kh1 scores 836, 100 below a8=Q+ in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "d4",
          "e4",
          "f4"
        ],
        "squareOfPawn": [
          "e2",
          "h3"
        ],
        "kingRoute": [
          "a8",
          "e5",
          "b8",
          "e6"
        ],
        "promotionTempi": {
          "white": 1,
          "black": 3
        },
        "spareTempo": true,
        "scoreBefore": 860,
        "scoreAfter": 936,
        "verificationDepth": 4,
        "principalVariation": [
          "a7a8q",
          "e4e5",
          "a8b8",
          "e5e6"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/P7/8/8/3pk3/7P/4P2K/8 w - -|a7a8q|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-king_race-34c6e972",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-12",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/8/5p2/P7/K7/1p6/6k1/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 5,
      "pawnCount": 3
    },
    "solution": {
      "primaryMoveUci": "b3b2",
      "san": "b2",
      "moveType": "promotion",
      "legalAlternatives": [
        "f6f5",
        "g2f3",
        "g2g3",
        "g2h3",
        "g2h2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "f6f5",
          "san": "f5",
          "reasonItIsTempting": "f5 is legal and pursues a nearby plan.",
          "whyItFails": "f5 scores -56, 764 below b2 in the 4-ply race search."
        },
        {
          "moveUci": "g2f3",
          "san": "Kf3",
          "reasonItIsTempting": "Kf3 is legal and pursues a nearby plan.",
          "whyItFails": "Kf3 scores -96, 804 below b2 in the 4-ply race search."
        },
        {
          "moveUci": "g2g3",
          "san": "Kg3",
          "reasonItIsTempting": "Kg3 is legal and pursues a nearby plan.",
          "whyItFails": "Kg3 scores -96, 804 below b2 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "intro",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "b2 improves the verified race score from -56 to 708. The critical squares are a2, b2, c2, promotion tempi are White 3 and Black 2, and the checked route begins b3b2 a5a6 b2b1q a6a7.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "f5 scores -56, 764 below b2 in the 4-ply race search.",
          "Kf3 scores -96, 804 below b2 in the 4-ply race search.",
          "Kg3 scores -96, 804 below b2 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "a2",
          "b2",
          "c2"
        ],
        "squareOfPawn": [
          "b3",
          "f6"
        ],
        "kingRoute": [
          "b2",
          "a6",
          "b1",
          "a7"
        ],
        "promotionTempi": {
          "white": 3,
          "black": 2
        },
        "spareTempo": true,
        "scoreBefore": -56,
        "scoreAfter": 708,
        "verificationDepth": 4,
        "principalVariation": [
          "b3b2",
          "a5a6",
          "b2b1q",
          "a6a7"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/8/5p2/P7/K7/1p6/6k1/8 b - -|b3b2|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-king_race-3b5d25e3",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-14",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/8/K7/3p4/8/6p1/2k5/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 4,
      "pawnCount": 2
    },
    "solution": {
      "primaryMoveUci": "g3g2",
      "san": "g2",
      "moveType": "promotion",
      "legalAlternatives": [
        "d5d4",
        "c2b3",
        "c2c3",
        "c2d3",
        "c2d2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d5d4",
          "san": "d4",
          "reasonItIsTempting": "d4 is legal and pursues a nearby plan.",
          "whyItFails": "d4 scores 472, 560 below g2 in the 4-ply race search."
        },
        {
          "moveUci": "c2b3",
          "san": "Kb3",
          "reasonItIsTempting": "Kb3 is legal and pursues a nearby plan.",
          "whyItFails": "Kb3 scores 432, 600 below g2 in the 4-ply race search."
        },
        {
          "moveUci": "c2c3",
          "san": "Kc3",
          "reasonItIsTempting": "Kc3 is legal and pursues a nearby plan.",
          "whyItFails": "Kc3 scores 432, 600 below g2 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_avoid_opposition",
      "difficultyBand": "easy",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "g2 improves the verified race score from 472 to 1032. The critical squares are f2, g2, h2, promotion tempi are White 99 and Black 2, and the checked route begins g3g2 a6a7 g2g1q a7a8.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "d4 scores 472, 560 below g2 in the 4-ply race search.",
          "Kb3 scores 432, 600 below g2 in the 4-ply race search.",
          "Kc3 scores 432, 600 below g2 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_avoid_opposition",
        "criticalSquares": [
          "f2",
          "g2",
          "h2"
        ],
        "squareOfPawn": [
          "d5"
        ],
        "kingRoute": [
          "g2",
          "a7",
          "g1",
          "a8"
        ],
        "promotionTempi": {
          "white": 99,
          "black": 2
        },
        "spareTempo": true,
        "scoreBefore": 472,
        "scoreAfter": 1032,
        "verificationDepth": 4,
        "principalVariation": [
          "g3g2",
          "a6a7",
          "g2g1q",
          "a7a8"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/8/K7/3p4/8/6p1/2k5/8 b - -|g3g2|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-king_race-fcb85e93",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-23",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/1k6/8/8/8/8/3p1K2/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "d2d1q",
      "san": "d1=Q",
      "moveType": "promotion",
      "legalAlternatives": [
        "b7a8",
        "b7b8",
        "b7c8",
        "b7c7",
        "b7c6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d2d1r",
          "san": "d1=R",
          "reasonItIsTempting": "d1=R is legal and pursues a nearby plan.",
          "whyItFails": "d1=R scores 500, 400 below d1=Q in the 4-ply race search."
        },
        {
          "moveUci": "b7a8",
          "san": "Ka8",
          "reasonItIsTempting": "Ka8 is legal and pursues a nearby plan.",
          "whyItFails": "Ka8 scores 0, 900 below d1=Q in the 4-ply race search."
        },
        {
          "moveUci": "b7b8",
          "san": "Kb8",
          "reasonItIsTempting": "Kb8 is legal and pursues a nearby plan.",
          "whyItFails": "Kb8 scores 0, 900 below d1=Q in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "medium",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "d1=Q improves the verified race score from 500 to 900. The critical squares are c1, d1, e1, promotion tempi are White 99 and Black 1, and the checked route begins d2d1q f2e3 b7a8 e3e4.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "d1=R scores 500, 400 below d1=Q in the 4-ply race search.",
          "Ka8 scores 0, 900 below d1=Q in the 4-ply race search.",
          "Kb8 scores 0, 900 below d1=Q in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "c1",
          "d1",
          "e1"
        ],
        "squareOfPawn": [],
        "kingRoute": [
          "d1",
          "e3",
          "a8",
          "e4"
        ],
        "promotionTempi": {
          "white": 99,
          "black": 1
        },
        "spareTempo": true,
        "scoreBefore": 500,
        "scoreAfter": 900,
        "verificationDepth": 4,
        "principalVariation": [
          "d2d1q",
          "f2e3",
          "b7a8",
          "e3e4"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/1k6/8/8/8/8/3p1K2/8 b - -|d2d1q|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-king_race-442c2c0e",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-24",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "4k3/K7/5P2/8/5p2/4PP2/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "f4e3",
      "san": "fxe3",
      "moveType": "promotion",
      "legalAlternatives": [
        "e8f8",
        "e8f7",
        "e8d7",
        "e8d8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e8f7",
          "san": "Kf7",
          "reasonItIsTempting": "Kf7 is legal and pursues a nearby plan.",
          "whyItFails": "Kf7 scores -280, 148 below fxe3 in the 4-ply race search."
        },
        {
          "moveUci": "e8f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 scores -508, 376 below fxe3 in the 4-ply race search."
        },
        {
          "moveUci": "e8d7",
          "san": "Kd7",
          "reasonItIsTempting": "Kd7 is legal and pursues a nearby plan.",
          "whyItFails": "Kd7 scores -780, 648 below fxe3 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_avoid_opposition",
      "difficultyBand": "hard",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "fxe3 improves the verified race score from -280 to -132. The critical squares are e3, f3, g3, promotion tempi are White 2 and Black 3, and the checked route begins f4e3 f3f4 e3e2 f6f7.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kf7 scores -280, 148 below fxe3 in the 4-ply race search.",
          "Kf8 scores -508, 376 below fxe3 in the 4-ply race search.",
          "Kd7 scores -780, 648 below fxe3 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_avoid_opposition",
        "criticalSquares": [
          "e3",
          "f3",
          "g3"
        ],
        "squareOfPawn": [
          "e3",
          "f3",
          "f6"
        ],
        "kingRoute": [
          "e3",
          "f4",
          "e2",
          "f7"
        ],
        "promotionTempi": {
          "white": 2,
          "black": 3
        },
        "spareTempo": true,
        "scoreBefore": -280,
        "scoreAfter": -132,
        "verificationDepth": 4,
        "principalVariation": [
          "f4e3",
          "f3f4",
          "e3e2",
          "f6f7"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|4k3/K7/5P2/8/5p2/4PP2/8/8 b - -|f4e3|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-king_race-e91e1f24",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-28",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/2k5/8/5p2/8/4K3/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "e3f4",
      "san": "Kf4",
      "moveType": "king_route",
      "legalAlternatives": [
        "e3d4",
        "e3f3",
        "e3f2",
        "e3e2",
        "e3d2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e3f3",
          "san": "Kf3",
          "reasonItIsTempting": "Kf3 is legal and pursues a nearby plan.",
          "whyItFails": "Kf3 scores -132, 132 below Kf4 in the 4-ply race search."
        },
        {
          "moveUci": "e3f2",
          "san": "Kf2",
          "reasonItIsTempting": "Kf2 is legal and pursues a nearby plan.",
          "whyItFails": "Kf2 scores -172, 172 below Kf4 in the 4-ply race search."
        },
        {
          "moveUci": "e3e2",
          "san": "Ke2",
          "reasonItIsTempting": "Ke2 is legal and pursues a nearby plan.",
          "whyItFails": "Ke2 scores -172, 172 below Kf4 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "king_route",
      "subConcept": "must_avoid_opposition",
      "difficultyBand": "expert",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "Kf4 improves the verified race score from -132 to 0. The critical squares are e3, f3, g3, promotion tempi are White 99 and Black 4, and the checked route begins e3f4 c7b8 f4f5.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kf3 scores -132, 132 below Kf4 in the 4-ply race search.",
          "Kf2 scores -172, 172 below Kf4 in the 4-ply race search.",
          "Ke2 scores -172, 172 below Kf4 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_avoid_opposition",
        "criticalSquares": [
          "e3",
          "f3",
          "g3"
        ],
        "squareOfPawn": [
          "f5"
        ],
        "kingRoute": [
          "f4",
          "b8",
          "f5"
        ],
        "promotionTempi": {
          "white": 99,
          "black": 4
        },
        "spareTempo": true,
        "scoreBefore": -132,
        "scoreAfter": 0,
        "verificationDepth": 4,
        "principalVariation": [
          "e3f4",
          "c7b8",
          "f4f5"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/2k5/8/5p2/8/4K3/8/8 w - -|e3f4|king_route",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-king_race-e8f5fc3b",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-37",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/7K/p7/8/1p2k3/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 4,
      "pawnCount": 2
    },
    "solution": {
      "primaryMoveUci": "b4b3",
      "san": "b3",
      "moveType": "promotion",
      "legalAlternatives": [
        "a6a5",
        "e4d5",
        "e4e5",
        "e4f5",
        "e4f4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a6a5",
          "san": "a5",
          "reasonItIsTempting": "a5 is legal and pursues a nearby plan.",
          "whyItFails": "a5 scores 360, 48 below b3 in the 4-ply race search."
        },
        {
          "moveUci": "e4d5",
          "san": "Kd5",
          "reasonItIsTempting": "Kd5 is legal and pursues a nearby plan.",
          "whyItFails": "Kd5 scores 336, 72 below b3 in the 4-ply race search."
        },
        {
          "moveUci": "e4e5",
          "san": "Ke5",
          "reasonItIsTempting": "Ke5 is legal and pursues a nearby plan.",
          "whyItFails": "Ke5 scores 336, 72 below b3 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_avoid_opposition",
      "difficultyBand": "intro",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "b3 improves the verified race score from 360 to 408. The critical squares are a3, b3, c3, promotion tempi are White 99 and Black 3, and the checked route begins b4b3 h7g8 b3b2 g8h8.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "a5 scores 360, 48 below b3 in the 4-ply race search.",
          "Kd5 scores 336, 72 below b3 in the 4-ply race search.",
          "Ke5 scores 336, 72 below b3 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_avoid_opposition",
        "criticalSquares": [
          "a3",
          "b3",
          "c3"
        ],
        "squareOfPawn": [],
        "kingRoute": [
          "b3",
          "g8",
          "b2",
          "h8"
        ],
        "promotionTempi": {
          "white": 99,
          "black": 3
        },
        "spareTempo": true,
        "scoreBefore": 360,
        "scoreAfter": 408,
        "verificationDepth": 4,
        "principalVariation": [
          "b4b3",
          "h7g8",
          "b3b2",
          "g8h8"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/7K/p7/8/1p2k3/8/8/8 b - -|b4b3|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-king_race-1d576bc2",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-39",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/7K/1p6/8/8/4p2P/1k6/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 5,
      "pawnCount": 3
    },
    "solution": {
      "primaryMoveUci": "e3e2",
      "san": "e2",
      "moveType": "promotion",
      "legalAlternatives": [
        "b6b5",
        "b2a3",
        "b2b3",
        "b2c3",
        "b2c2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b6b5",
          "san": "b5",
          "reasonItIsTempting": "b5 is legal and pursues a nearby plan.",
          "whyItFails": "b5 scores 260, 576 below e2 in the 4-ply race search."
        },
        {
          "moveUci": "b2a3",
          "san": "Ka3",
          "reasonItIsTempting": "Ka3 is legal and pursues a nearby plan.",
          "whyItFails": "Ka3 scores 236, 600 below e2 in the 4-ply race search."
        },
        {
          "moveUci": "b2b3",
          "san": "Kb3",
          "reasonItIsTempting": "Kb3 is legal and pursues a nearby plan.",
          "whyItFails": "Kb3 scores 236, 600 below e2 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_avoid_opposition",
      "difficultyBand": "easy",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "e2 improves the verified race score from 260 to 836. The critical squares are d2, e2, f2, promotion tempi are White 5 and Black 2, and the checked route begins e3e2 h3h4 e2e1q h4h5.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "b5 scores 260, 576 below e2 in the 4-ply race search.",
          "Ka3 scores 236, 600 below e2 in the 4-ply race search.",
          "Kb3 scores 236, 600 below e2 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_avoid_opposition",
        "criticalSquares": [
          "d2",
          "e2",
          "f2"
        ],
        "squareOfPawn": [],
        "kingRoute": [
          "e2",
          "h4",
          "e1",
          "h5"
        ],
        "promotionTempi": {
          "white": 5,
          "black": 2
        },
        "spareTempo": true,
        "scoreBefore": 260,
        "scoreAfter": 836,
        "verificationDepth": 4,
        "principalVariation": [
          "e3e2",
          "h3h4",
          "e2e1q",
          "h4h5"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/7K/1p6/8/8/4p2P/1k6/8 b - -|e3e2|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-king_race-85f129bc",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-40",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/8/4Kp2/k7/4P3/8/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 4,
      "pawnCount": 2
    },
    "solution": {
      "primaryMoveUci": "e6f6",
      "san": "Kxf6",
      "moveType": "king_route",
      "legalAlternatives": [
        "e6d7",
        "e6e7",
        "e6f7",
        "e6f5",
        "e6d5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e6e7",
          "san": "Ke7",
          "reasonItIsTempting": "Ke7 is legal and pursues a nearby plan.",
          "whyItFails": "Ke7 scores 132, 40 below Kxf6 in the 4-ply race search."
        },
        {
          "moveUci": "e6f7",
          "san": "Kf7",
          "reasonItIsTempting": "Kf7 is legal and pursues a nearby plan.",
          "whyItFails": "Kf7 scores 132, 40 below Kxf6 in the 4-ply race search."
        },
        {
          "moveUci": "e6f5",
          "san": "Kf5",
          "reasonItIsTempting": "Kf5 is legal and pursues a nearby plan.",
          "whyItFails": "Kf5 scores 132, 40 below Kxf6 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "critical_square",
      "subConcept": "must_avoid_opposition",
      "difficultyBand": "medium",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "Kxf6 improves the verified race score from 132 to 172. The critical squares are d6, e6, f6, promotion tempi are White 4 and Black 5, and the checked route begins e6f6 a5a6 e4e5 a6a7.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Ke7 scores 132, 40 below Kxf6 in the 4-ply race search.",
          "Kf7 scores 132, 40 below Kxf6 in the 4-ply race search.",
          "Kf5 scores 132, 40 below Kxf6 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_avoid_opposition",
        "criticalSquares": [
          "d6",
          "e6",
          "f6"
        ],
        "squareOfPawn": [
          "e4",
          "f6"
        ],
        "kingRoute": [
          "f6",
          "a6",
          "e5",
          "a7"
        ],
        "promotionTempi": {
          "white": 4,
          "black": 5
        },
        "spareTempo": false,
        "scoreBefore": 132,
        "scoreAfter": 172,
        "verificationDepth": 4,
        "principalVariation": [
          "e6f6",
          "a5a6",
          "e4e5",
          "a6a7"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/8/4Kp2/k7/4P3/8/8/8 w - -|e6f6|critical_square",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-king_race-df5afe43",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-41",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "4k3/8/8/8/1K6/1pP5/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 4,
      "pawnCount": 2
    },
    "solution": {
      "primaryMoveUci": "b3b2",
      "san": "b2",
      "moveType": "promotion",
      "legalAlternatives": [
        "e8f8",
        "e8f7",
        "e8e7",
        "e8d7",
        "e8d8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e8f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 scores -132, 900 below b2 in the 4-ply race search."
        },
        {
          "moveUci": "e8f7",
          "san": "Kf7",
          "reasonItIsTempting": "Kf7 is legal and pursues a nearby plan.",
          "whyItFails": "Kf7 scores -132, 900 below b2 in the 4-ply race search."
        },
        {
          "moveUci": "e8e7",
          "san": "Ke7",
          "reasonItIsTempting": "Ke7 is legal and pursues a nearby plan.",
          "whyItFails": "Ke7 scores -132, 900 below b2 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "hard",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "b2 improves the verified race score from -132 to 768. The critical squares are a2, b2, c2, promotion tempi are White 5 and Black 2, and the checked route begins b3b2 b4a5 b2b1q c3c4.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kf8 scores -132, 900 below b2 in the 4-ply race search.",
          "Kf7 scores -132, 900 below b2 in the 4-ply race search.",
          "Ke7 scores -132, 900 below b2 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "a2",
          "b2",
          "c2"
        ],
        "squareOfPawn": [
          "c3",
          "b3"
        ],
        "kingRoute": [
          "b2",
          "a5",
          "b1",
          "c4"
        ],
        "promotionTempi": {
          "white": 5,
          "black": 2
        },
        "spareTempo": false,
        "scoreBefore": -132,
        "scoreAfter": 768,
        "verificationDepth": 4,
        "principalVariation": [
          "b3b2",
          "b4a5",
          "b2b1q",
          "c3c4"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|4k3/8/8/8/1K6/1pP5/8/8 b - -|b3b2|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-king_race-50f13c16",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-43",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "4K3/8/6P1/8/k7/8/2p5/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 4,
      "pawnCount": 2
    },
    "solution": {
      "primaryMoveUci": "g6g7",
      "san": "g7",
      "moveType": "promotion",
      "legalAlternatives": [
        "e8f8",
        "e8f7",
        "e8e7",
        "e8d7",
        "e8d8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e8f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 scores -600, 600 below g7 in the 4-ply race search."
        },
        {
          "moveUci": "e8f7",
          "san": "Kf7",
          "reasonItIsTempting": "Kf7 is legal and pursues a nearby plan.",
          "whyItFails": "Kf7 scores -600, 600 below g7 in the 4-ply race search."
        },
        {
          "moveUci": "e8e7",
          "san": "Ke7",
          "reasonItIsTempting": "Ke7 is legal and pursues a nearby plan.",
          "whyItFails": "Ke7 scores -600, 600 below g7 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_avoid_opposition",
      "difficultyBand": "expert",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "g7 improves the verified race score from -600 to 0. The critical squares are f7, g7, h7, promotion tempi are White 2 and Black 1, and the checked route begins g6g7 a4a5 g7g8q c2c1q.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kf8 scores -600, 600 below g7 in the 4-ply race search.",
          "Kf7 scores -600, 600 below g7 in the 4-ply race search.",
          "Ke7 scores -600, 600 below g7 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_avoid_opposition",
        "criticalSquares": [
          "f7",
          "g7",
          "h7"
        ],
        "squareOfPawn": [],
        "kingRoute": [
          "g7",
          "a5",
          "g8",
          "c1"
        ],
        "promotionTempi": {
          "white": 2,
          "black": 1
        },
        "spareTempo": true,
        "scoreBefore": -600,
        "scoreAfter": 0,
        "verificationDepth": 4,
        "principalVariation": [
          "g6g7",
          "a4a5",
          "g7g8q",
          "c2c1q"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|4K3/8/6P1/8/k7/8/2p5/8 w - -|g6g7|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-king_race-3f6f5d37",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-44",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/6K1/8/6kP/8/2p2P2/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 5,
      "pawnCount": 3
    },
    "solution": {
      "primaryMoveUci": "h5h6",
      "san": "h6",
      "moveType": "promotion",
      "legalAlternatives": [
        "g7f8",
        "g7g8",
        "g7h8",
        "g7h7",
        "g7f7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "f3f4",
          "san": "f4+",
          "reasonItIsTempting": "f4+ is legal and pursues a nearby plan.",
          "whyItFails": "f4+ scores -128, 56 below h6 in the 4-ply race search."
        },
        {
          "moveUci": "g7f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 scores -168, 96 below h6 in the 4-ply race search."
        },
        {
          "moveUci": "g7g8",
          "san": "Kg8",
          "reasonItIsTempting": "Kg8 is legal and pursues a nearby plan.",
          "whyItFails": "Kg8 scores -168, 96 below h6 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "has_opposition",
      "difficultyBand": "intro",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "h6 improves the verified race score from -128 to -72. The critical squares are e5, f5, g5, promotion tempi are White 3 and Black 2, and the checked route begins h5h6 c3c2 f3f4 g5f4.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "f4+ scores -128, 56 below h6 in the 4-ply race search.",
          "Kf8 scores -168, 96 below h6 in the 4-ply race search.",
          "Kg8 scores -168, 96 below h6 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "has_opposition",
        "criticalSquares": [
          "e5",
          "f5",
          "g5"
        ],
        "squareOfPawn": [
          "f3",
          "h5"
        ],
        "kingRoute": [
          "h6",
          "c2",
          "f4",
          "f4"
        ],
        "promotionTempi": {
          "white": 3,
          "black": 2
        },
        "spareTempo": true,
        "scoreBefore": -128,
        "scoreAfter": -72,
        "verificationDepth": 4,
        "principalVariation": [
          "h5h6",
          "c3c2",
          "f3f4",
          "g5f4"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/6K1/8/6kP/8/2p2P2/8/8 w - -|h5h6|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-king_race-f55b6ab7",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-45",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/6p1/8/2k5/8/K1pP4/3P4/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "d2c3",
      "san": "dxc3",
      "moveType": "promotion",
      "legalAlternatives": [
        "a3a4",
        "a3b3",
        "a3a2",
        "d3d4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d3d4",
          "san": "d4+",
          "reasonItIsTempting": "d4+ is legal and pursues a nearby plan.",
          "whyItFails": "d4+ scores -100, 208 below dxc3 in the 4-ply race search."
        },
        {
          "moveUci": "a3a4",
          "san": "Ka4",
          "reasonItIsTempting": "Ka4 is legal and pursues a nearby plan.",
          "whyItFails": "Ka4 scores -400, 508 below dxc3 in the 4-ply race search."
        },
        {
          "moveUci": "a3b3",
          "san": "Kb3",
          "reasonItIsTempting": "Kb3 is legal and pursues a nearby plan.",
          "whyItFails": "Kb3 scores -400, 508 below dxc3 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "has_opposition",
      "difficultyBand": "easy",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "dxc3 improves the verified race score from -100 to 108. The critical squares are c4, d4, e4, promotion tempi are White 5 and Black 2, and the checked route begins d2c3 g7g5 d3d4 c5b6.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "d4+ scores -100, 208 below dxc3 in the 4-ply race search.",
          "Ka4 scores -400, 508 below dxc3 in the 4-ply race search.",
          "Kb3 scores -400, 508 below dxc3 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "has_opposition",
        "criticalSquares": [
          "c4",
          "d4",
          "e4"
        ],
        "squareOfPawn": [
          "d2",
          "d3",
          "c3",
          "g7"
        ],
        "kingRoute": [
          "c3",
          "g5",
          "d4",
          "b6"
        ],
        "promotionTempi": {
          "white": 5,
          "black": 2
        },
        "spareTempo": true,
        "scoreBefore": -100,
        "scoreAfter": 108,
        "verificationDepth": 4,
        "principalVariation": [
          "d2c3",
          "g7g5",
          "d3d4",
          "c5b6"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/6p1/8/2k5/8/K1pP4/3P4/8 w - -|d2c3|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-king_race-740fc2b9",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-47",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/8/8/8/2p5/5p2/k7/5K2 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 4,
      "pawnCount": 2
    },
    "solution": {
      "primaryMoveUci": "c4c3",
      "san": "c3",
      "moveType": "promotion",
      "legalAlternatives": [
        "f3f2",
        "a2a3",
        "a2b3",
        "a2b2",
        "a2b1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "f3f2",
          "san": "f2",
          "reasonItIsTempting": "f2 is legal and pursues a nearby plan.",
          "whyItFails": "f2 scores 228, 72 below c3 in the 4-ply race search."
        },
        {
          "moveUci": "a2a3",
          "san": "Ka3",
          "reasonItIsTempting": "Ka3 is legal and pursues a nearby plan.",
          "whyItFails": "Ka3 scores 228, 72 below c3 in the 4-ply race search."
        },
        {
          "moveUci": "a2b3",
          "san": "Kb3",
          "reasonItIsTempting": "Kb3 is legal and pursues a nearby plan.",
          "whyItFails": "Kb3 scores 228, 72 below c3 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "medium",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "c3 improves the verified race score from 228 to 300. The critical squares are e2, f2, g2, promotion tempi are White 99 and Black 2, and the checked route begins c4c3 f1f2 c3c2 f2f3.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "f2 scores 228, 72 below c3 in the 4-ply race search.",
          "Ka3 scores 228, 72 below c3 in the 4-ply race search.",
          "Kb3 scores 228, 72 below c3 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "e2",
          "f2",
          "g2"
        ],
        "squareOfPawn": [
          "f3",
          "c4"
        ],
        "kingRoute": [
          "c3",
          "f2",
          "c2",
          "f3"
        ],
        "promotionTempi": {
          "white": 99,
          "black": 2
        },
        "spareTempo": true,
        "scoreBefore": 228,
        "scoreAfter": 300,
        "verificationDepth": 4,
        "principalVariation": [
          "c4c3",
          "f1f2",
          "c3c2",
          "f2f3"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/8/8/8/2p5/5p2/k7/5K2 b - -|c4c3|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-king_race-387538b3",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-53",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/5P2/8/8/p7/3k4/8/4K3 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 4,
      "pawnCount": 2
    },
    "solution": {
      "primaryMoveUci": "a4a3",
      "san": "a3",
      "moveType": "promotion",
      "legalAlternatives": [
        "d3c4",
        "d3d4",
        "d3e4",
        "d3e3",
        "d3c2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d3c4",
          "san": "Kc4",
          "reasonItIsTempting": "Kc4 is legal and pursues a nearby plan.",
          "whyItFails": "Kc4 scores -728, 128 below a3 in the 4-ply race search."
        },
        {
          "moveUci": "d3d4",
          "san": "Kd4",
          "reasonItIsTempting": "Kd4 is legal and pursues a nearby plan.",
          "whyItFails": "Kd4 scores -728, 128 below a3 in the 4-ply race search."
        },
        {
          "moveUci": "d3e4",
          "san": "Ke4",
          "reasonItIsTempting": "Ke4 is legal and pursues a nearby plan.",
          "whyItFails": "Ke4 scores -728, 128 below a3 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "has_opposition",
      "difficultyBand": "hard",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "a3 improves the verified race score from -728 to -600. The critical squares are a3, b3, promotion tempi are White 1 and Black 3, and the checked route begins a4a3 f7f8q a3a2 f8g8.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kc4 scores -728, 128 below a3 in the 4-ply race search.",
          "Kd4 scores -728, 128 below a3 in the 4-ply race search.",
          "Ke4 scores -728, 128 below a3 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "has_opposition",
        "criticalSquares": [
          "a3",
          "b3"
        ],
        "squareOfPawn": [],
        "kingRoute": [
          "a3",
          "f8",
          "a2",
          "g8"
        ],
        "promotionTempi": {
          "white": 1,
          "black": 3
        },
        "spareTempo": true,
        "scoreBefore": -728,
        "scoreAfter": -600,
        "verificationDepth": 4,
        "principalVariation": [
          "a4a3",
          "f7f8q",
          "a3a2",
          "f8g8"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/5P2/8/8/p7/3k4/8/4K3 b - -|a4a3|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-king_race-b01b439e",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-58",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "6k1/7p/3P4/p7/3K4/8/1p6/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "d6d7",
      "san": "d7",
      "moveType": "promotion",
      "legalAlternatives": [
        "d4c5",
        "d4d5",
        "d4e5",
        "d4e4",
        "d4e3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d4c5",
          "san": "Kc5",
          "reasonItIsTempting": "Kc5 is legal and pursues a nearby plan.",
          "whyItFails": "Kc5 scores -872, 640 below d7 in the 4-ply race search."
        },
        {
          "moveUci": "d4d5",
          "san": "Kd5",
          "reasonItIsTempting": "Kd5 is legal and pursues a nearby plan.",
          "whyItFails": "Kd5 scores -872, 640 below d7 in the 4-ply race search."
        },
        {
          "moveUci": "d4e5",
          "san": "Ke5",
          "reasonItIsTempting": "Ke5 is legal and pursues a nearby plan.",
          "whyItFails": "Ke5 scores -872, 640 below d7 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_avoid_opposition",
      "difficultyBand": "expert",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "d7 improves the verified race score from -872 to -232. The critical squares are c7, d7, e7, promotion tempi are White 2 and Black 1, and the checked route begins d6d7 g8g7 d7d8q b2b1q.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kc5 scores -872, 640 below d7 in the 4-ply race search.",
          "Kd5 scores -872, 640 below d7 in the 4-ply race search.",
          "Ke5 scores -872, 640 below d7 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_avoid_opposition",
        "criticalSquares": [
          "c7",
          "d7",
          "e7"
        ],
        "squareOfPawn": [
          "a5",
          "h7"
        ],
        "kingRoute": [
          "d7",
          "g7",
          "d8",
          "b1"
        ],
        "promotionTempi": {
          "white": 2,
          "black": 1
        },
        "spareTempo": true,
        "scoreBefore": -872,
        "scoreAfter": -232,
        "verificationDepth": 4,
        "principalVariation": [
          "d6d7",
          "g8g7",
          "d7d8q",
          "b2b1q"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|6k1/7p/3P4/p7/3K4/8/1p6/8 w - -|d6d7|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-king_race-8c0b8809",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-59",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/8/4K3/5P1p/7k/7P/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 5,
      "pawnCount": 3
    },
    "solution": {
      "primaryMoveUci": "f5f6",
      "san": "f6",
      "moveType": "promotion",
      "legalAlternatives": [
        "e6d7",
        "e6e7",
        "e6f7",
        "e6f6",
        "e6e5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e6d7",
          "san": "Kd7",
          "reasonItIsTempting": "Kd7 is legal and pursues a nearby plan.",
          "whyItFails": "Kd7 scores 56, 72 below f6 in the 4-ply race search."
        },
        {
          "moveUci": "e6e7",
          "san": "Ke7",
          "reasonItIsTempting": "Ke7 is legal and pursues a nearby plan.",
          "whyItFails": "Ke7 scores 56, 72 below f6 in the 4-ply race search."
        },
        {
          "moveUci": "e6f7",
          "san": "Kf7",
          "reasonItIsTempting": "Kf7 is legal and pursues a nearby plan.",
          "whyItFails": "Kf7 scores 56, 72 below f6 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "intro",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "f6 improves the verified race score from 56 to 128. The critical squares are g5, h5, promotion tempi are White 3 and Black 4, and the checked route begins f5f6 h4h3 f6f7 h5h4.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kd7 scores 56, 72 below f6 in the 4-ply race search.",
          "Ke7 scores 56, 72 below f6 in the 4-ply race search.",
          "Kf7 scores 56, 72 below f6 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "g5",
          "h5"
        ],
        "squareOfPawn": [
          "h3",
          "f5",
          "h5"
        ],
        "kingRoute": [
          "f6",
          "h3",
          "f7",
          "h4"
        ],
        "promotionTempi": {
          "white": 3,
          "black": 4
        },
        "spareTempo": true,
        "scoreBefore": 56,
        "scoreAfter": 128,
        "verificationDepth": 4,
        "principalVariation": [
          "f5f6",
          "h4h3",
          "f6f7",
          "h5h4"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/8/4K3/5P1p/7k/7P/8/8 w - -|f5f6|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-king_race-25875e94",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-62",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/1p5P/8/6p1/8/2K5/8/1k6 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 5,
      "pawnCount": 3
    },
    "solution": {
      "primaryMoveUci": "h7h8q",
      "san": "h8=Q",
      "moveType": "promotion",
      "legalAlternatives": [
        "h7h8n",
        "h7h8b",
        "h7h8r",
        "c3b4",
        "c3c4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c3b4",
          "san": "Kb4",
          "reasonItIsTempting": "Kb4 is legal and pursues a nearby plan.",
          "whyItFails": "Kb4 scores 572, 56 below h8=Q in the 4-ply race search."
        },
        {
          "moveUci": "c3d4",
          "san": "Kd4",
          "reasonItIsTempting": "Kd4 is legal and pursues a nearby plan.",
          "whyItFails": "Kd4 scores 572, 56 below h8=Q in the 4-ply race search."
        },
        {
          "moveUci": "c3d3",
          "san": "Kd3",
          "reasonItIsTempting": "Kd3 is legal and pursues a nearby plan.",
          "whyItFails": "Kd3 scores 572, 56 below h8=Q in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "has_opposition",
      "difficultyBand": "easy",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "h8=Q improves the verified race score from 572 to 628. The critical squares are g8, h8, promotion tempi are White 1 and Black 4, and the checked route begins h7h8q g5g4 h8h7 b1a2.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kb4 scores 572, 56 below h8=Q in the 4-ply race search.",
          "Kd4 scores 572, 56 below h8=Q in the 4-ply race search.",
          "Kd3 scores 572, 56 below h8=Q in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "has_opposition",
        "criticalSquares": [
          "g8",
          "h8"
        ],
        "squareOfPawn": [
          "g5",
          "b7"
        ],
        "kingRoute": [
          "h8",
          "g4",
          "h7",
          "a2"
        ],
        "promotionTempi": {
          "white": 1,
          "black": 4
        },
        "spareTempo": true,
        "scoreBefore": 572,
        "scoreAfter": 628,
        "verificationDepth": 4,
        "principalVariation": [
          "h7h8q",
          "g5g4",
          "h8h7",
          "b1a2"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/1p5P/8/6p1/8/2K5/8/1k6 w - -|h7h8q|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-king_race-50c42f22",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-63",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/8/P1P5/2P5/4K3/k3P3/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p4n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "a3b4",
      "san": "Kb4",
      "moveType": "king_route",
      "legalAlternatives": [
        "a3a4",
        "a3b3",
        "a3b2",
        "a3a2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a3a4",
          "san": "Ka4",
          "reasonItIsTempting": "Ka4 is legal and pursues a nearby plan.",
          "whyItFails": "Ka4 scores -1408, 172 below Kb4 in the 4-ply race search."
        },
        {
          "moveUci": "a3b3",
          "san": "Kb3",
          "reasonItIsTempting": "Kb3 is legal and pursues a nearby plan.",
          "whyItFails": "Kb3 scores -1408, 172 below Kb4 in the 4-ply race search."
        },
        {
          "moveUci": "a3b2",
          "san": "Kb2",
          "reasonItIsTempting": "Kb2 is legal and pursues a nearby plan.",
          "whyItFails": "Kb2 scores -1408, 172 below Kb4 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "king_route",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "medium",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "Kb4 improves the verified race score from -1408 to -1236. The critical squares are d5, e5, f5, promotion tempi are White 2 and Black 99, and the checked route begins a3b4 a6a7 b4c5 a7a8q.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Ka4 scores -1408, 172 below Kb4 in the 4-ply race search.",
          "Kb3 scores -1408, 172 below Kb4 in the 4-ply race search.",
          "Kb2 scores -1408, 172 below Kb4 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "d5",
          "e5",
          "f5"
        ],
        "squareOfPawn": [
          "e3",
          "c5"
        ],
        "kingRoute": [
          "b4",
          "a7",
          "c5",
          "a8"
        ],
        "promotionTempi": {
          "white": 2,
          "black": 99
        },
        "spareTempo": true,
        "scoreBefore": -1408,
        "scoreAfter": -1236,
        "verificationDepth": 4,
        "principalVariation": [
          "a3b4",
          "a6a7",
          "b4c5",
          "a7a8q"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/8/P1P5/2P5/4K3/k3P3/8/8 b - -|a3b4|king_route",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-king_race-65f00fc4",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-64",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/4pp2/7P/8/8/5p2/2K5/7k w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "h6h7",
      "san": "h7",
      "moveType": "promotion",
      "legalAlternatives": [
        "c2b3",
        "c2c3",
        "c2d3",
        "c2d2",
        "c2d1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c2b3",
          "san": "Kb3",
          "reasonItIsTempting": "Kb3 is legal and pursues a nearby plan.",
          "whyItFails": "Kb3 scores -800, 1200 below h7 in the 4-ply race search."
        },
        {
          "moveUci": "c2c3",
          "san": "Kc3",
          "reasonItIsTempting": "Kc3 is legal and pursues a nearby plan.",
          "whyItFails": "Kc3 scores -800, 1200 below h7 in the 4-ply race search."
        },
        {
          "moveUci": "c2d3",
          "san": "Kd3",
          "reasonItIsTempting": "Kd3 is legal and pursues a nearby plan.",
          "whyItFails": "Kd3 scores -800, 1200 below h7 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_avoid_opposition",
      "difficultyBand": "hard",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "h7 improves the verified race score from -800 to 400. The critical squares are g7, h7, promotion tempi are White 2 and Black 2, and the checked route begins h6h7 f3f2 h7h8q h1g2.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kb3 scores -800, 1200 below h7 in the 4-ply race search.",
          "Kc3 scores -800, 1200 below h7 in the 4-ply race search.",
          "Kd3 scores -800, 1200 below h7 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_avoid_opposition",
        "criticalSquares": [
          "g7",
          "h7"
        ],
        "squareOfPawn": [
          "e7",
          "f7"
        ],
        "kingRoute": [
          "h7",
          "f2",
          "h8",
          "g2"
        ],
        "promotionTempi": {
          "white": 2,
          "black": 2
        },
        "spareTempo": true,
        "scoreBefore": -800,
        "scoreAfter": 400,
        "verificationDepth": 4,
        "principalVariation": [
          "h6h7",
          "f3f2",
          "h7h8q",
          "h1g2"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/4pp2/7P/8/8/5p2/2K5/7k w - -|h6h7|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-king_race-ae4d659e",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-65",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/2K1P3/8/4p3/8/1k6/3P4/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 5,
      "pawnCount": 3
    },
    "solution": {
      "primaryMoveUci": "e7e8q",
      "san": "e8=Q",
      "moveType": "promotion",
      "legalAlternatives": [
        "c7b8",
        "c7c8",
        "c7d8",
        "c7d7",
        "c7d6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c7b8",
          "san": "Kb8",
          "reasonItIsTempting": "Kb8 is legal and pursues a nearby plan.",
          "whyItFails": "Kb8 scores 768, 132 below e8=Q in the 4-ply race search."
        },
        {
          "moveUci": "c7c8",
          "san": "Kc8",
          "reasonItIsTempting": "Kc8 is legal and pursues a nearby plan.",
          "whyItFails": "Kc8 scores 768, 132 below e8=Q in the 4-ply race search."
        },
        {
          "moveUci": "c7d8",
          "san": "Kd8",
          "reasonItIsTempting": "Kd8 is legal and pursues a nearby plan.",
          "whyItFails": "Kd8 scores 768, 132 below e8=Q in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "expert",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "e8=Q improves the verified race score from 768 to 900. The critical squares are c4, d4, e4, promotion tempi are White 1 and Black 4, and the checked route begins e7e8q b3c2 e8e5 c2d2.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kb8 scores 768, 132 below e8=Q in the 4-ply race search.",
          "Kc8 scores 768, 132 below e8=Q in the 4-ply race search.",
          "Kd8 scores 768, 132 below e8=Q in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "c4",
          "d4",
          "e4"
        ],
        "squareOfPawn": [
          "d2",
          "e5"
        ],
        "kingRoute": [
          "e8",
          "c2",
          "e5",
          "d2"
        ],
        "promotionTempi": {
          "white": 1,
          "black": 4
        },
        "spareTempo": true,
        "scoreBefore": 768,
        "scoreAfter": 900,
        "verificationDepth": 4,
        "principalVariation": [
          "e7e8q",
          "b3c2",
          "e8e5",
          "c2d2"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/2K1P3/8/4p3/8/1k6/3P4/8 w - -|e7e8q|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-king_race-269d8694",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-67",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/8/1k6/5K2/8/4P3/4p3/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 4,
      "pawnCount": 2
    },
    "solution": {
      "primaryMoveUci": "e2e1q",
      "san": "e1=Q",
      "moveType": "promotion",
      "legalAlternatives": [
        "b6a7",
        "b6b7",
        "b6c7",
        "b6c6",
        "b6c5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b6a7",
          "san": "Ka7",
          "reasonItIsTempting": "Ka7 is legal and pursues a nearby plan.",
          "whyItFails": "Ka7 scores 728, 40 below e1=Q in the 4-ply race search."
        },
        {
          "moveUci": "b6b7",
          "san": "Kb7",
          "reasonItIsTempting": "Kb7 is legal and pursues a nearby plan.",
          "whyItFails": "Kb7 scores 728, 40 below e1=Q in the 4-ply race search."
        },
        {
          "moveUci": "b6c7",
          "san": "Kc7",
          "reasonItIsTempting": "Kc7 is legal and pursues a nearby plan.",
          "whyItFails": "Kc7 scores 728, 40 below e1=Q in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "intro",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "e1=Q improves the verified race score from 728 to 768. The critical squares are d1, e1, f1, promotion tempi are White 5 and Black 1, and the checked route begins e2e1q e3e4 e1f2 f5e6.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Ka7 scores 728, 40 below e1=Q in the 4-ply race search.",
          "Kb7 scores 728, 40 below e1=Q in the 4-ply race search.",
          "Kc7 scores 728, 40 below e1=Q in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "d1",
          "e1",
          "f1"
        ],
        "squareOfPawn": [
          "e3"
        ],
        "kingRoute": [
          "e1",
          "e4",
          "f2",
          "e6"
        ],
        "promotionTempi": {
          "white": 5,
          "black": 1
        },
        "spareTempo": true,
        "scoreBefore": 728,
        "scoreAfter": 768,
        "verificationDepth": 4,
        "principalVariation": [
          "e2e1q",
          "e3e4",
          "e1f2",
          "f5e6"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/8/1k6/5K2/8/4P3/4p3/8 b - -|e2e1q|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-king_race-e1d03748",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-72",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/2K5/7P/5P2/8/p6k/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 5,
      "pawnCount": 3
    },
    "solution": {
      "primaryMoveUci": "a3a2",
      "san": "a2",
      "moveType": "promotion",
      "legalAlternatives": [
        "h3g4",
        "h3h4",
        "h3h2",
        "h3g2",
        "h3g3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h3g4",
          "san": "Kg4",
          "reasonItIsTempting": "Kg4 is legal and pursues a nearby plan.",
          "whyItFails": "Kg4 scores -672, 500 below a2 in the 4-ply race search."
        },
        {
          "moveUci": "h3h4",
          "san": "Kh4",
          "reasonItIsTempting": "Kh4 is legal and pursues a nearby plan.",
          "whyItFails": "Kh4 scores -772, 600 below a2 in the 4-ply race search."
        },
        {
          "moveUci": "h3h2",
          "san": "Kh2",
          "reasonItIsTempting": "Kh2 is legal and pursues a nearby plan.",
          "whyItFails": "Kh2 scores -772, 600 below a2 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "easy",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "a2 improves the verified race score from -672 to -172. The critical squares are a2, b2, promotion tempi are White 2 and Black 2, and the checked route begins a3a2 h6h7 a2a1q h7h8q.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Kg4 scores -672, 500 below a2 in the 4-ply race search.",
          "Kh4 scores -772, 600 below a2 in the 4-ply race search.",
          "Kh2 scores -772, 600 below a2 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "a2",
          "b2"
        ],
        "squareOfPawn": [
          "f5"
        ],
        "kingRoute": [
          "a2",
          "h7",
          "a1",
          "h8"
        ],
        "promotionTempi": {
          "white": 2,
          "black": 2
        },
        "spareTempo": true,
        "scoreBefore": -672,
        "scoreAfter": -172,
        "verificationDepth": 4,
        "principalVariation": [
          "a3a2",
          "h6h7",
          "a2a1q",
          "h7h8q"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/2K5/7P/5P2/8/p6k/8/8 b - -|a3a2|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-king_race-b8526106",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-73",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/3P2k1/8/4K3/2P4p/8/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 5,
      "pawnCount": 3
    },
    "solution": {
      "primaryMoveUci": "d7d8q",
      "san": "d8=Q",
      "moveType": "promotion",
      "legalAlternatives": [
        "d7d8n",
        "d7d8b",
        "d7d8r",
        "e5d6",
        "e5e6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c4c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 scores 772, 32 below d8=Q in the 4-ply race search."
        },
        {
          "moveUci": "e5d6",
          "san": "Kd6",
          "reasonItIsTempting": "Kd6 is legal and pursues a nearby plan.",
          "whyItFails": "Kd6 scores 732, 72 below d8=Q in the 4-ply race search."
        },
        {
          "moveUci": "e5e6",
          "san": "Ke6",
          "reasonItIsTempting": "Ke6 is legal and pursues a nearby plan.",
          "whyItFails": "Ke6 scores 732, 72 below d8=Q in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "has_opposition",
      "difficultyBand": "medium",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "d8=Q improves the verified race score from 772 to 804. The critical squares are b6, c6, d6, promotion tempi are White 1 and Black 3, and the checked route begins d7d8q h4h3 d8e7 g7g8.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "c5 scores 772, 32 below d8=Q in the 4-ply race search.",
          "Kd6 scores 732, 72 below d8=Q in the 4-ply race search.",
          "Ke6 scores 732, 72 below d8=Q in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "has_opposition",
        "criticalSquares": [
          "b6",
          "c6",
          "d6"
        ],
        "squareOfPawn": [
          "c4",
          "h4"
        ],
        "kingRoute": [
          "d8",
          "h3",
          "e7",
          "g8"
        ],
        "promotionTempi": {
          "white": 1,
          "black": 3
        },
        "spareTempo": true,
        "scoreBefore": 772,
        "scoreAfter": 804,
        "verificationDepth": 4,
        "principalVariation": [
          "d7d8q",
          "h4h3",
          "d8e7",
          "g7g8"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/3P2k1/8/4K3/2P4p/8/8/8 w - -|d7d8q|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-king_race-3a1219cc",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-76",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/8/8/8/6p1/8/1k6/4K3 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "g4g3",
      "san": "g3",
      "moveType": "promotion",
      "legalAlternatives": [
        "b2a3",
        "b2b3",
        "b2c3",
        "b2c2",
        "b2c1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b2a3",
          "san": "Ka3",
          "reasonItIsTempting": "Ka3 is legal and pursues a nearby plan.",
          "whyItFails": "Ka3 scores 172, 56 below g3 in the 4-ply race search."
        },
        {
          "moveUci": "b2b3",
          "san": "Kb3",
          "reasonItIsTempting": "Kb3 is legal and pursues a nearby plan.",
          "whyItFails": "Kb3 scores 172, 56 below g3 in the 4-ply race search."
        },
        {
          "moveUci": "b2c3",
          "san": "Kc3",
          "reasonItIsTempting": "Kc3 is legal and pursues a nearby plan.",
          "whyItFails": "Kc3 scores 172, 56 below g3 in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "must_gain_opposition",
      "difficultyBand": "hard",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "g3 improves the verified race score from 172 to 228. The critical squares are f3, g3, h3, promotion tempi are White 99 and Black 3, and the checked route begins g4g3 e1f1 b2a3 f1e2.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "Ka3 scores 172, 56 below g3 in the 4-ply race search.",
          "Kb3 scores 172, 56 below g3 in the 4-ply race search.",
          "Kc3 scores 172, 56 below g3 in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "must_gain_opposition",
        "criticalSquares": [
          "f3",
          "g3",
          "h3"
        ],
        "squareOfPawn": [
          "g4"
        ],
        "kingRoute": [
          "g3",
          "f1",
          "a3",
          "e2"
        ],
        "promotionTempi": {
          "white": 99,
          "black": 3
        },
        "spareTempo": true,
        "scoreBefore": 172,
        "scoreAfter": 228,
        "verificationDepth": 4,
        "principalVariation": [
          "g4g3",
          "e1f1",
          "b2a3",
          "f1e2"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/8/8/8/6p1/8/1k6/4K3 b - -|g4g3|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-king_race-37611589",
    "miniGameId": "king_race",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-77",
      "seed": "stage-8m-plus:king_race",
      "generatorId": "kingRaceGenerator"
    },
    "board": {
      "fen": "8/7P/6k1/8/5pK1/8/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 4,
      "pawnCount": 2
    },
    "solution": {
      "primaryMoveUci": "h7h8q",
      "san": "h8=Q",
      "moveType": "promotion",
      "legalAlternatives": [
        "h7h8n",
        "h7h8b",
        "h7h8r",
        "g4h4",
        "g4h3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h7h8r",
          "san": "h8=R",
          "reasonItIsTempting": "h8=R is legal and pursues a nearby plan.",
          "whyItFails": "h8=R scores 272, 628 below h8=Q in the 4-ply race search."
        },
        {
          "moveUci": "h7h8b",
          "san": "h8=B",
          "reasonItIsTempting": "h8=B is legal and pursues a nearby plan.",
          "whyItFails": "h8=B scores 30, 870 below h8=Q in the 4-ply race search."
        },
        {
          "moveUci": "h7h8n",
          "san": "h8=N+",
          "reasonItIsTempting": "h8=N+ is legal and pursues a nearby plan.",
          "whyItFails": "h8=N+ scores 0, 900 below h8=Q in the 4-ply race search."
        }
      ]
    },
    "pedagogy": {
      "concept": "promotion_race",
      "subConcept": "has_opposition",
      "difficultyBand": "expert",
      "prompt": "Find the move that wins the king-and-pawn race.",
      "lessonObjective": "Find the move that wins the king-and-pawn race.",
      "transferPattern": "In pawn endings, compare exact king routes, critical squares, and promotion tempi.",
      "explanation": {
        "short": "Find the move that wins the king-and-pawn race.",
        "detailed": "h8=Q improves the verified race score from 272 to 900. The critical squares are g8, h8, promotion tempi are White 1 and Black 3, and the checked route begins h7h8q g6f7 g4f4 f7g6.",
        "coachNote": "Count king distance and pawn tempi before relying on visual proximity.",
        "whyAlternativesFail": [
          "h8=R scores 272, 628 below h8=Q in the 4-ply race search.",
          "h8=B scores 30, 870 below h8=Q in the 4-ply race search.",
          "h8=N+ scores 0, 900 below h8=Q in the 4-ply race search."
        ]
      },
      "proof": {
        "oppositionState": "has_opposition",
        "criticalSquares": [
          "g8",
          "h8"
        ],
        "squareOfPawn": [
          "h7",
          "f4"
        ],
        "kingRoute": [
          "h8",
          "f7",
          "f4",
          "g6"
        ],
        "promotionTempi": {
          "white": 1,
          "black": 3
        },
        "spareTempo": true,
        "scoreBefore": 272,
        "scoreAfter": 900,
        "verificationDepth": 4,
        "principalVariation": [
          "h7h8q",
          "g6f7",
          "g4f4",
          "f7g6"
        ]
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
      "score": 88,
      "noveltyKey": "king_race|8/7P/6k1/8/5pK1/8/8/8 w - -|h7h8q|promotion_race",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  }
];
