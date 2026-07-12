import type { Stage8MScenario } from '../../../../tools/stage8m/types';

export const STAGE8M_TECHNIQUE_LAB_SCENARIOS: Stage8MScenario[] = [
  {
    "id": "stage8m-technique_lab-03e23b80",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-6",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "K7/2k5/8/8/2P5/8/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "a8a7",
      "san": "Ka7",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "c4c5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c4c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 scores 132 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "intro",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Ka7 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are a8, a7, c4, a8, c7. A 4-ply verification scores it 132, compared with 0 for the next legal plan, and checks a8a7 c7d6 a7a8 d6c7.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "c5 scores 132 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "a8",
          "a7",
          "c4",
          "a8",
          "c7"
        ],
        "beforeMetric": 1,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 132,
        "nextBestScore": 0,
        "principalVariation": [
          "a8a7",
          "c7d6",
          "a7a8",
          "d6c7"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|K7/2k5/8/8/2P5/8/8/8 w - -|a8a7|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-technique_lab-53c3499b",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-28",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/5k1K/8/8/6P1/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "f7f6",
      "san": "Kf6",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "f7e8",
        "f7f8",
        "f7e6",
        "f7e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "f7e8",
          "san": "Ke8",
          "reasonItIsTempting": "Ke8 is legal and pursues a nearby plan.",
          "whyItFails": "Ke8 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "f7f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "f7e6",
          "san": "Ke6",
          "reasonItIsTempting": "Ke6 is legal and pursues a nearby plan.",
          "whyItFails": "Ke6 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "easy",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kf6 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are f7, f6, f7, h7. A 4-ply verification scores it -172, compared with -228 for the next legal plan, and checks f7f6 h7h6 f6e7 g4g5.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Ke8 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kf8 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Ke6 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "f7",
          "f6",
          "f7",
          "h7"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": -172,
        "nextBestScore": -228,
        "principalVariation": [
          "f7f6",
          "h7h6",
          "f6e7",
          "g4g5"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/5k1K/8/8/6P1/8/8/8 b - -|f7f6|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-technique_lab-9e829502",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-65",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/3k4/8/Kp6/8/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "a4b4",
      "san": "Kxb4",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "a4a5",
        "a4b5",
        "a4b3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a4b3",
          "san": "Kb3",
          "reasonItIsTempting": "Kb3 is legal and pursues a nearby plan.",
          "whyItFails": "Kb3 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "a4a5",
          "san": "Ka5",
          "reasonItIsTempting": "Ka5 is legal and pursues a nearby plan.",
          "whyItFails": "Ka5 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "a4b5",
          "san": "Kb5",
          "reasonItIsTempting": "Kb5 is legal and pursues a nearby plan.",
          "whyItFails": "Kb5 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "medium",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kxb4 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are a4, b4, a4, d6. A 4-ply verification scores it 0, compared with -228 for the next legal plan, and checks a4b4.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kb3 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Ka5 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kb5 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "a4",
          "b4",
          "a4",
          "d6"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 0,
        "nextBestScore": -228,
        "principalVariation": [
          "a4b4"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/3k4/8/Kp6/8/8/8 w - -|a4b4|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-technique_lab-d7b2f7ef",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "active_king-108",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/7r/5Rk1/4p3/8/K7/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r1q0|b:p1n0b0r1q0",
      "pieceCount": 5,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "g5f5",
      "san": "Kxf5",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "g5g6",
        "g5h4",
        "g5g4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "g5g6",
          "san": "Kg6",
          "reasonItIsTempting": "Kg6 is legal and pursues a nearby plan.",
          "whyItFails": "Kg6 scores 556 lower in the bounded conversion tree and does not execute the active king rule as directly."
        },
        {
          "moveUci": "g5g4",
          "san": "Kg4",
          "reasonItIsTempting": "Kg4 is legal and pursues a nearby plan.",
          "whyItFails": "Kg4 scores 556 lower in the bounded conversion tree and does not execute the active king rule as directly."
        },
        {
          "moveUci": "g5h4",
          "san": "Kh4",
          "reasonItIsTempting": "Kh4 is legal and pursues a nearby plan.",
          "whyItFails": "Kh4 scores 728 lower in the bounded conversion tree and does not execute the active king rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "active_king",
      "subConcept": "named_endgame_method",
      "difficultyBand": "hard",
      "prompt": "Apply the active king technique.",
      "lessonObjective": "Apply the active king technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the active king technique.",
        "detailed": "Kxf5 follows the rule: Centralize the king before spending pawn tempi. The relevant squares are g5, f5, e4, g5, a2. A 4-ply verification scores it 728, compared with 172 for the next legal plan, and checks g5f5 a2a3 e4e3 a3a4.",
        "coachNote": "Centralize the king before spending pawn tempi.",
        "whyAlternativesFail": [
          "Kg6 scores 556 lower in the bounded conversion tree and does not execute the active king rule as directly.",
          "Kg4 scores 556 lower in the bounded conversion tree and does not execute the active king rule as directly.",
          "Kh4 scores 728 lower in the bounded conversion tree and does not execute the active king rule as directly."
        ]
      },
      "proof": {
        "family": "active_king",
        "ruleSentence": "Centralize the king before spending pawn tempi.",
        "relevantSquares": [
          "g5",
          "f5",
          "e4",
          "g5",
          "a2"
        ],
        "beforeMetric": -2,
        "afterMetric": -3,
        "searchDepth": 4,
        "bestScore": 728,
        "nextBestScore": 172,
        "principalVariation": [
          "g5f5",
          "a2a3",
          "e4e3",
          "a3a4"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 5"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/7r/5Rk1/4p3/8/K7/8 b - -|g5f5|active_king",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-technique_lab-4d9cd211",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-115",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "3k4/1K6/8/3P4/8/8/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "b7c6",
      "san": "Kc6",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "b7a8",
        "b7b8",
        "b7b6",
        "b7a6",
        "b7a7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b7a8",
          "san": "Ka8",
          "reasonItIsTempting": "Ka8 is legal and pursues a nearby plan.",
          "whyItFails": "Ka8 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "b7b8",
          "san": "Kb8",
          "reasonItIsTempting": "Kb8 is legal and pursues a nearby plan.",
          "whyItFails": "Kb8 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "b7b6",
          "san": "Kb6",
          "reasonItIsTempting": "Kb6 is legal and pursues a nearby plan.",
          "whyItFails": "Kb6 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "expert",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kc6 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are b7, c6, d5, b7, d8. A 4-ply verification scores it 228, compared with 172 for the next legal plan, and checks b7c6 d8e8 d5d6 e8f8.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Ka8 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kb8 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kb6 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "b7",
          "c6",
          "d5",
          "b7",
          "d8"
        ],
        "beforeMetric": -1,
        "afterMetric": -2,
        "searchDepth": 4,
        "bestScore": 228,
        "nextBestScore": 172,
        "principalVariation": [
          "b7c6",
          "d8e8",
          "d5d6",
          "e8f8"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|3k4/1K6/8/3P4/8/8/8/8 w - -|b7c6|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-technique_lab-6798876b",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-256",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/8/5p2/7k/8/8/7K w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "h1g2",
      "san": "Kg2",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "h1h2",
        "h1g1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h1h2",
          "san": "Kh2",
          "reasonItIsTempting": "Kh2 is legal and pursues a nearby plan.",
          "whyItFails": "Kh2 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "h1g1",
          "san": "Kg1",
          "reasonItIsTempting": "Kg1 is legal and pursues a nearby plan.",
          "whyItFails": "Kg1 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "intro",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kg2 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are h1, g2, h1, h4. A 4-ply verification scores it -172, compared with -228 for the next legal plan, and checks h1g2 f5f4 g2f3 h4g5.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kh2 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kg1 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "h1",
          "g2",
          "h1",
          "h4"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": -172,
        "nextBestScore": -228,
        "principalVariation": [
          "h1g2",
          "f5f4",
          "g2f3",
          "h4g5"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/8/5p2/7k/8/8/7K w - -|h1g2|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-technique_lab-15d4d4bd",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-375",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/4P1k1/8/7K/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "g6f6",
      "san": "Kf6",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "g6g7",
        "g6h7",
        "g6h6",
        "g6f5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "g6g7",
          "san": "Kg7",
          "reasonItIsTempting": "Kg7 is legal and pursues a nearby plan.",
          "whyItFails": "Kg7 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "g6h7",
          "san": "Kh7",
          "reasonItIsTempting": "Kh7 is legal and pursues a nearby plan.",
          "whyItFails": "Kh7 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "g6h6",
          "san": "Kh6",
          "reasonItIsTempting": "Kh6 is legal and pursues a nearby plan.",
          "whyItFails": "Kh6 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "easy",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kf6 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are g6, f6, g6, h4. A 4-ply verification scores it 0, compared with -900 for the next legal plan, and checks g6f6 e6e7 f6e7.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kg7 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kh7 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kh6 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "g6",
          "f6",
          "g6",
          "h4"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 0,
        "nextBestScore": -900,
        "principalVariation": [
          "g6f6",
          "e6e7",
          "f6e7"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/4P1k1/8/7K/8/8/8 b - -|g6f6|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-technique_lab-6ddd3ed2",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-424",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/8/1Pk5/K7/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "c5b6",
      "san": "Kb6",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "c5d6",
        "c5d5",
        "c5d4",
        "c5c4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c5d6",
          "san": "Kd6",
          "reasonItIsTempting": "Kd6 is legal and pursues a nearby plan.",
          "whyItFails": "Kd6 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "c5d5",
          "san": "Kd5",
          "reasonItIsTempting": "Kd5 is legal and pursues a nearby plan.",
          "whyItFails": "Kd5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "c5d4",
          "san": "Kd4",
          "reasonItIsTempting": "Kd4 is legal and pursues a nearby plan.",
          "whyItFails": "Kd4 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "medium",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kb6 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are c5, b6, c5, a4. A 4-ply verification scores it -228, compared with -300 for the next legal plan, and checks c5b6 a4b4 b6a7 b5b6.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kd6 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kd5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kd4 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "c5",
          "b6",
          "c5",
          "a4"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": -228,
        "nextBestScore": -300,
        "principalVariation": [
          "c5b6",
          "a4b4",
          "b6a7",
          "b5b6"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/8/1Pk5/K7/8/8/8 b - -|c5b6|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-technique_lab-030625cb",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-438",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/4Pk2/8/6K1/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "f6e6",
      "san": "Kxe6",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "f6e7",
        "f6g7",
        "f6g6",
        "f6e5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "f6e7",
          "san": "Ke7",
          "reasonItIsTempting": "Ke7 is legal and pursues a nearby plan.",
          "whyItFails": "Ke7 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "f6g7",
          "san": "Kg7",
          "reasonItIsTempting": "Kg7 is legal and pursues a nearby plan.",
          "whyItFails": "Kg7 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "f6g6",
          "san": "Kg6",
          "reasonItIsTempting": "Kg6 is legal and pursues a nearby plan.",
          "whyItFails": "Kg6 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "hard",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kxe6 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are f6, e6, f6, g4. A 4-ply verification scores it 0, compared with -300 for the next legal plan, and checks f6e6.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Ke7 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kg7 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kg6 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "f6",
          "e6",
          "f6",
          "g4"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 0,
        "nextBestScore": -300,
        "principalVariation": [
          "f6e6"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/4Pk2/8/6K1/8/8/8 b - -|f6e6|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-technique_lab-7cb3d393",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-464",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/2k5/Kp6/8/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "c6c5",
      "san": "Kc5",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "c6b7",
        "c6c7",
        "c6d7",
        "c6d6",
        "c6d5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c6b7",
          "san": "Kb7",
          "reasonItIsTempting": "Kb7 is legal and pursues a nearby plan.",
          "whyItFails": "Kb7 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "c6c7",
          "san": "Kc7",
          "reasonItIsTempting": "Kc7 is legal and pursues a nearby plan.",
          "whyItFails": "Kc7 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "c6d7",
          "san": "Kd7",
          "reasonItIsTempting": "Kd7 is legal and pursues a nearby plan.",
          "whyItFails": "Kd7 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "expert",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kc5 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are c6, c5, b5, c6, a5. A 4-ply verification scores it 172, compared with 0 for the next legal plan, and checks c6c5 a5a6 b5b4 a6a7.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kb7 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kc7 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kd7 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "c6",
          "c5",
          "b5",
          "c6",
          "a5"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 172,
        "nextBestScore": 0,
        "principalVariation": [
          "c6c5",
          "a5a6",
          "b5b4",
          "a6a7"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/2k5/Kp6/8/8/8/8 b - -|c6c5|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-technique_lab-a58dc08d",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-571",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/2k1P3/8/2K5/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "c6d6",
      "san": "Kd6",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "c6b7",
        "c6c7",
        "c6b6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c6b7",
          "san": "Kb7",
          "reasonItIsTempting": "Kb7 is legal and pursues a nearby plan.",
          "whyItFails": "Kb7 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "c6c7",
          "san": "Kc7",
          "reasonItIsTempting": "Kc7 is legal and pursues a nearby plan.",
          "whyItFails": "Kc7 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "c6b6",
          "san": "Kb6",
          "reasonItIsTempting": "Kb6 is legal and pursues a nearby plan.",
          "whyItFails": "Kb6 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "intro",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kd6 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are c6, d6, c6, c4. A 4-ply verification scores it 0, compared with -900 for the next legal plan, and checks c6d6 e6e7 d6e7.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kb7 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kc7 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kb6 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "c6",
          "d6",
          "c6",
          "c4"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 0,
        "nextBestScore": -900,
        "principalVariation": [
          "c6d6",
          "e6e7",
          "d6e7"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/2k1P3/8/2K5/8/8/8 b - -|c6d6|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-technique_lab-6c0e6535",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "king_cutoff-581",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/R4K2/3k4/2p4r/8/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r1q0|b:p1n0b0r1q0",
      "pieceCount": 5,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "h5h7",
      "san": "Rh7+",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "d6e5",
        "d6d5",
        "d6c6",
        "c5c4",
        "h5h6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c5c4",
          "san": "c4",
          "reasonItIsTempting": "c4 is legal and pursues a nearby plan.",
          "whyItFails": "c4 scores 460 lower in the bounded conversion tree and does not execute the king cutoff rule as directly."
        },
        {
          "moveUci": "d6e5",
          "san": "Ke5",
          "reasonItIsTempting": "Ke5 is legal and pursues a nearby plan.",
          "whyItFails": "Ke5 scores 500 lower in the bounded conversion tree and does not execute the king cutoff rule as directly."
        },
        {
          "moveUci": "d6d5",
          "san": "Kd5",
          "reasonItIsTempting": "Kd5 is legal and pursues a nearby plan.",
          "whyItFails": "Kd5 scores 500 lower in the bounded conversion tree and does not execute the king cutoff rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "king_cutoff",
      "subConcept": "named_endgame_method",
      "difficultyBand": "easy",
      "prompt": "Apply the king cutoff technique.",
      "lessonObjective": "Apply the king cutoff technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the king cutoff technique.",
        "detailed": "Rh7+ follows the rule: Use the rook to cut the defending king away from the promotion zone. The relevant squares are h5, h7, c5, d6, f7. A 4-ply verification scores it 632, compared with 172 for the next legal plan, and checks h5h7 f7e8 h7a7 e8f8.",
        "coachNote": "Use the rook to cut the defending king away from the promotion zone.",
        "whyAlternativesFail": [
          "c4 scores 460 lower in the bounded conversion tree and does not execute the king cutoff rule as directly.",
          "Ke5 scores 500 lower in the bounded conversion tree and does not execute the king cutoff rule as directly.",
          "Kd5 scores 500 lower in the bounded conversion tree and does not execute the king cutoff rule as directly."
        ]
      },
      "proof": {
        "family": "king_cutoff",
        "ruleSentence": "Use the rook to cut the defending king away from the promotion zone.",
        "relevantSquares": [
          "h5",
          "h7",
          "c5",
          "d6",
          "f7"
        ],
        "beforeMetric": -2,
        "afterMetric": -2,
        "searchDepth": 4,
        "bestScore": 632,
        "nextBestScore": 172,
        "principalVariation": [
          "h5h7",
          "f7e8",
          "h7a7",
          "e8f8"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 5"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/R4K2/3k4/2p4r/8/8/8/8 b - -|h5h7|king_cutoff",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-technique_lab-f948a26c",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-668",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/8/7k/5p2/8/7K/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "h5g4",
      "san": "Kg4",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "h5g6",
        "h5h6",
        "h5h4",
        "h5g5",
        "f4f3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h5g6",
          "san": "Kg6",
          "reasonItIsTempting": "Kg6 is legal and pursues a nearby plan.",
          "whyItFails": "Kg6 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "h5h6",
          "san": "Kh6",
          "reasonItIsTempting": "Kh6 is legal and pursues a nearby plan.",
          "whyItFails": "Kh6 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "h5h4",
          "san": "Kh4",
          "reasonItIsTempting": "Kh4 is legal and pursues a nearby plan.",
          "whyItFails": "Kh4 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "medium",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kg4 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are h5, g4, f4, h5, h2. A 4-ply verification scores it 228, compared with 172 for the next legal plan, and checks h5g4 h2h1 f4f3 h1h2.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kg6 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kh6 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kh4 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "h5",
          "g4",
          "f4",
          "h5",
          "h2"
        ],
        "beforeMetric": 0,
        "afterMetric": -1,
        "searchDepth": 4,
        "bestScore": 228,
        "nextBestScore": 172,
        "principalVariation": [
          "h5g4",
          "h2h1",
          "f4f3",
          "h1h2"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/8/7k/5p2/8/7K/8 b - -|h5g4|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-technique_lab-e5539c48",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-703",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/5k1K/6p1/8/8/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "h6h5",
      "san": "Kh5",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "h6h7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h6h7",
          "san": "Kh7",
          "reasonItIsTempting": "Kh7 is legal and pursues a nearby plan.",
          "whyItFails": "Kh7 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "hard",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kh5 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are h6, h5, h6, f6. A 4-ply verification scores it -172, compared with -228 for the next legal plan, and checks h6h5 f6f5 h5h6 g5g4.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kh7 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "h6",
          "h5",
          "h6",
          "f6"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": -172,
        "nextBestScore": -228,
        "principalVariation": [
          "h6h5",
          "f6f5",
          "h5h6",
          "g5g4"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/5k1K/6p1/8/8/8/8 w - -|h6h5|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-technique_lab-db3de11b",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-731",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/3k4/6p1/4K3/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "d6e6",
      "san": "Ke6",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "d6c7",
        "d6d7",
        "d6e7",
        "d6c5",
        "d6c6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d6c7",
          "san": "Kc7",
          "reasonItIsTempting": "Kc7 is legal and pursues a nearby plan.",
          "whyItFails": "Kc7 scores 132 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "d6d7",
          "san": "Kd7",
          "reasonItIsTempting": "Kd7 is legal and pursues a nearby plan.",
          "whyItFails": "Kd7 scores 132 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "d6e7",
          "san": "Ke7",
          "reasonItIsTempting": "Ke7 is legal and pursues a nearby plan.",
          "whyItFails": "Ke7 scores 132 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "expert",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Ke6 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are d6, e6, g5, d6, e4. A 4-ply verification scores it 132, compared with 0 for the next legal plan, and checks d6e6 e4f3 e6d7 f3e4.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kc7 scores 132 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kd7 scores 132 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Ke7 scores 132 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "d6",
          "e6",
          "g5",
          "d6",
          "e4"
        ],
        "beforeMetric": 1,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 132,
        "nextBestScore": 0,
        "principalVariation": [
          "d6e6",
          "e4f3",
          "e6d7",
          "f3e4"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/3k4/6p1/4K3/8/8/8 b - -|d6e6|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-technique_lab-87ebc14b",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-805",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "3K4/8/2Pk4/8/8/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "d6c6",
      "san": "Kxc6",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "d6e6",
        "d6e5",
        "d6d5",
        "d6c5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d6e6",
          "san": "Ke6",
          "reasonItIsTempting": "Ke6 is legal and pursues a nearby plan.",
          "whyItFails": "Ke6 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "d6e5",
          "san": "Ke5",
          "reasonItIsTempting": "Ke5 is legal and pursues a nearby plan.",
          "whyItFails": "Ke5 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "d6d5",
          "san": "Kd5",
          "reasonItIsTempting": "Kd5 is legal and pursues a nearby plan.",
          "whyItFails": "Kd5 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "intro",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kxc6 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are d6, c6, d6, d8. A 4-ply verification scores it 0, compared with -900 for the next legal plan, and checks d6c6.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Ke6 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Ke5 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kd5 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "d6",
          "c6",
          "d6",
          "d8"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 0,
        "nextBestScore": -900,
        "principalVariation": [
          "d6c6"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|3K4/8/2Pk4/8/8/8/8/8 b - -|d6c6|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-technique_lab-972320e9",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "king_cutoff-815",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/8/3p4/3r2k1/R7/8/1K6 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r1q0|b:p1n0b0r1q0",
      "pieceCount": 5,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "d4b4",
      "san": "Rb4+",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "d4e4",
        "d4f4",
        "d4d3",
        "d4d2",
        "d4d1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d4e4",
          "san": "Re4",
          "reasonItIsTempting": "Re4 is legal and pursues a nearby plan.",
          "whyItFails": "Re4 scores 40 lower in the bounded conversion tree and does not execute the king cutoff rule as directly."
        },
        {
          "moveUci": "d4f4",
          "san": "Rf4",
          "reasonItIsTempting": "Rf4 is legal and pursues a nearby plan.",
          "whyItFails": "Rf4 scores 40 lower in the bounded conversion tree and does not execute the king cutoff rule as directly."
        },
        {
          "moveUci": "d4d2",
          "san": "Rd2",
          "reasonItIsTempting": "Rd2 is legal and pursues a nearby plan.",
          "whyItFails": "Rd2 scores 40 lower in the bounded conversion tree and does not execute the king cutoff rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "king_cutoff",
      "subConcept": "named_endgame_method",
      "difficultyBand": "easy",
      "prompt": "Apply the king cutoff technique.",
      "lessonObjective": "Apply the king cutoff technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the king cutoff technique.",
        "detailed": "Rb4+ follows the rule: Use the rook to cut the defending king away from the promotion zone. The relevant squares are d4, b4, d5, g4, b1. A 4-ply verification scores it 172, compared with 132 for the next legal plan, and checks d4b4 b1a2 d5d4 a3a4.",
        "coachNote": "Use the rook to cut the defending king away from the promotion zone.",
        "whyAlternativesFail": [
          "Re4 scores 40 lower in the bounded conversion tree and does not execute the king cutoff rule as directly.",
          "Rf4 scores 40 lower in the bounded conversion tree and does not execute the king cutoff rule as directly.",
          "Rd2 scores 40 lower in the bounded conversion tree and does not execute the king cutoff rule as directly."
        ]
      },
      "proof": {
        "family": "king_cutoff",
        "ruleSentence": "Use the rook to cut the defending king away from the promotion zone.",
        "relevantSquares": [
          "d4",
          "b4",
          "d5",
          "g4",
          "b1"
        ],
        "beforeMetric": -1,
        "afterMetric": -1,
        "searchDepth": 4,
        "bestScore": 172,
        "nextBestScore": 132,
        "principalVariation": [
          "d4b4",
          "b1a2",
          "d5d4",
          "a3a4"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 5"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/8/3p4/3r2k1/R7/8/1K6 b - -|d4b4|king_cutoff",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-technique_lab-6476bcc2",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-821",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/8/2p5/8/K7/3k4/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "a3b3",
      "san": "Kb3",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "a3a4",
        "a3b2",
        "a3a2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a3a4",
          "san": "Ka4",
          "reasonItIsTempting": "Ka4 is legal and pursues a nearby plan.",
          "whyItFails": "Ka4 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "a3b2",
          "san": "Kb2",
          "reasonItIsTempting": "Kb2 is legal and pursues a nearby plan.",
          "whyItFails": "Kb2 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "a3a2",
          "san": "Ka2",
          "reasonItIsTempting": "Ka2 is legal and pursues a nearby plan.",
          "whyItFails": "Ka2 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "medium",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kb3 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are a3, b3, a3, d2. A 4-ply verification scores it -172, compared with -228 for the next legal plan, and checks a3b3 d2d3 b3a4 c5c4.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Ka4 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kb2 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Ka2 scores 56 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "a3",
          "b3",
          "a3",
          "d2"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": -172,
        "nextBestScore": -228,
        "principalVariation": [
          "a3b3",
          "d2d3",
          "b3a4",
          "c5c4"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/8/2p5/8/K7/3k4/8 w - -|a3b3|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-technique_lab-b42828cf",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-915",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/4P3/3k1K2/8/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "d5d6",
      "san": "Kd6",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "d5c6",
        "d5d4",
        "d5c4",
        "d5c5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d5c6",
          "san": "Kc6",
          "reasonItIsTempting": "Kc6 is legal and pursues a nearby plan.",
          "whyItFails": "Kc6 scores 600 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "d5d4",
          "san": "Kd4",
          "reasonItIsTempting": "Kd4 is legal and pursues a nearby plan.",
          "whyItFails": "Kd4 scores 600 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "d5c4",
          "san": "Kc4",
          "reasonItIsTempting": "Kc4 is legal and pursues a nearby plan.",
          "whyItFails": "Kc4 scores 600 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "hard",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kd6 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are d5, d6, d5, f5. A 4-ply verification scores it -300, compared with -900 for the next legal plan, and checks d5d6 f5f6 d6c7 e6e7.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kc6 scores 600 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kd4 scores 600 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kc4 scores 600 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "d5",
          "d6",
          "d5",
          "f5"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": -300,
        "nextBestScore": -900,
        "principalVariation": [
          "d5d6",
          "f5f6",
          "d6c7",
          "e6e7"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/4P3/3k1K2/8/8/8/8 b - -|d5d6|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-technique_lab-8a174d57",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "active_king-996",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/3r4/K7/1p4Rk/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r1q0|b:p1n0b0r1q0",
      "pieceCount": 5,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "h4g4",
      "san": "Kxg4",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "h4h5",
        "h4h3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h4h5",
          "san": "Kh5",
          "reasonItIsTempting": "Kh5 is legal and pursues a nearby plan.",
          "whyItFails": "Kh5 scores 500 lower in the bounded conversion tree and does not execute the active king rule as directly."
        },
        {
          "moveUci": "h4h3",
          "san": "Kh3",
          "reasonItIsTempting": "Kh3 is legal and pursues a nearby plan.",
          "whyItFails": "Kh3 scores 500 lower in the bounded conversion tree and does not execute the active king rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "active_king",
      "subConcept": "named_endgame_method",
      "difficultyBand": "expert",
      "prompt": "Apply the active king technique.",
      "lessonObjective": "Apply the active king technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the active king technique.",
        "detailed": "Kxg4 follows the rule: Centralize the king before spending pawn tempi. The relevant squares are h4, g4, b4, h4, a5. A 4-ply verification scores it 500, compared with 0 for the next legal plan, and checks h4g4 a5b4 d6d7 b4a5.",
        "coachNote": "Centralize the king before spending pawn tempi.",
        "whyAlternativesFail": [
          "Kh5 scores 500 lower in the bounded conversion tree and does not execute the active king rule as directly.",
          "Kh3 scores 500 lower in the bounded conversion tree and does not execute the active king rule as directly."
        ]
      },
      "proof": {
        "family": "active_king",
        "ruleSentence": "Centralize the king before spending pawn tempi.",
        "relevantSquares": [
          "h4",
          "g4",
          "b4",
          "h4",
          "a5"
        ],
        "beforeMetric": 5,
        "afterMetric": 4,
        "searchDepth": 4,
        "bestScore": 500,
        "nextBestScore": 0,
        "principalVariation": [
          "h4g4",
          "a5b4",
          "d6d7",
          "b4a5"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 5"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/3r4/K7/1p4Rk/8/8/8 b - -|h4g4|active_king",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-technique_lab-efc49ab7",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-1065",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "7K/8/4P1k1/8/8/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "g6f6",
      "san": "Kf6",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "g6h6",
        "g6h5",
        "g6g5",
        "g6f5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "g6h6",
          "san": "Kh6",
          "reasonItIsTempting": "Kh6 is legal and pursues a nearby plan.",
          "whyItFails": "Kh6 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "g6h5",
          "san": "Kh5",
          "reasonItIsTempting": "Kh5 is legal and pursues a nearby plan.",
          "whyItFails": "Kh5 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "g6g5",
          "san": "Kg5",
          "reasonItIsTempting": "Kg5 is legal and pursues a nearby plan.",
          "whyItFails": "Kg5 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "intro",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kf6 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are g6, f6, g6, h8. A 4-ply verification scores it 0, compared with -900 for the next legal plan, and checks g6f6 h8h7 f6e6.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kh6 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kh5 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kg5 scores 900 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "g6",
          "f6",
          "g6",
          "h8"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 0,
        "nextBestScore": -900,
        "principalVariation": [
          "g6f6",
          "h8h7",
          "f6e6"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|7K/8/4P1k1/8/8/8/8/8 b - -|g6f6|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-technique_lab-c0b235e6",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-1211",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/8/1R3k2/6P1/4K3/5r2/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r1q0|b:p0n0b0r1q0",
      "pieceCount": 5,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "f5g4",
      "san": "Kxg4",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "f5e6",
        "f5f6",
        "f5g6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "f5e6",
          "san": "Ke6",
          "reasonItIsTempting": "Ke6 is legal and pursues a nearby plan.",
          "whyItFails": "Ke6 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "f5f6",
          "san": "Kf6",
          "reasonItIsTempting": "Kf6 is legal and pursues a nearby plan.",
          "whyItFails": "Kf6 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "f5g6",
          "san": "Kg6",
          "reasonItIsTempting": "Kg6 is legal and pursues a nearby plan.",
          "whyItFails": "Kg6 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "easy",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kxg4 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are f5, g4, f5, e3. A 4-ply verification scores it -500, compared with -672 for the next legal plan, and checks f5g4 e3f2 g4h4 b5b6.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Ke6 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kf6 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kg6 scores 172 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "f5",
          "g4",
          "f5",
          "e3"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": -500,
        "nextBestScore": -672,
        "principalVariation": [
          "f5g4",
          "e3f2",
          "g4h4",
          "b5b6"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 5"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/8/1R3k2/6P1/4K3/5r2/8 b - -|f5g4|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-technique_lab-746a8266",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-1227",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/8/5p2/8/7K/8/4k3 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "h3g3",
      "san": "Kg3",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "h3h4",
        "h3h2",
        "h3g2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h3g2",
          "san": "Kg2",
          "reasonItIsTempting": "Kg2 is legal and pursues a nearby plan.",
          "whyItFails": "Kg2 scores 40 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "h3h4",
          "san": "Kh4",
          "reasonItIsTempting": "Kh4 is legal and pursues a nearby plan.",
          "whyItFails": "Kh4 scores 96 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "h3h2",
          "san": "Kh2",
          "reasonItIsTempting": "Kh2 is legal and pursues a nearby plan.",
          "whyItFails": "Kh2 scores 96 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "medium",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kg3 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are h3, g3, h3, e1. A 4-ply verification scores it -132, compared with -172 for the next legal plan, and checks h3g3 e1d2 g3f4 d2c3.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kg2 scores 40 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kh4 scores 96 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kh2 scores 96 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "h3",
          "g3",
          "h3",
          "e1"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": -132,
        "nextBestScore": -172,
        "principalVariation": [
          "h3g3",
          "e1d2",
          "g3f4",
          "d2c3"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/8/5p2/8/7K/8/4k3 w - -|h3g3|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-technique_lab-ed9fd6aa",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-1236",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/8/3P4/1k2K3/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "b4c5",
      "san": "Kc5",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "b4a5",
        "b4b5",
        "b4c4",
        "b4c3",
        "b4b3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b4a5",
          "san": "Ka5",
          "reasonItIsTempting": "Ka5 is legal and pursues a nearby plan.",
          "whyItFails": "Ka5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "b4b5",
          "san": "Kb5",
          "reasonItIsTempting": "Kb5 is legal and pursues a nearby plan.",
          "whyItFails": "Kb5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "b4c4",
          "san": "Kc4",
          "reasonItIsTempting": "Kc4 is legal and pursues a nearby plan.",
          "whyItFails": "Kc4 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "hard",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kc5 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are b4, c5, b4, e4. A 4-ply verification scores it -228, compared with -300 for the next legal plan, and checks b4c5 e4e5 c5b6 d5d6.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Ka5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kb5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kc4 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "b4",
          "c5",
          "b4",
          "e4"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": -228,
        "nextBestScore": -300,
        "principalVariation": [
          "b4c5",
          "e4e5",
          "c5b6",
          "d5d6"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/8/3P4/1k2K3/8/8/8 b - -|b4c5|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-technique_lab-e6995b76",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-1301",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/8/8/3k4/1p6/1K6/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "b2b3",
      "san": "Kxb3",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "b2a3",
        "b2c1",
        "b2b1",
        "b2a1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b2a3",
          "san": "Ka3",
          "reasonItIsTempting": "Ka3 is legal and pursues a nearby plan.",
          "whyItFails": "Ka3 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "b2c1",
          "san": "Kc1",
          "reasonItIsTempting": "Kc1 is legal and pursues a nearby plan.",
          "whyItFails": "Kc1 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "b2b1",
          "san": "Kb1",
          "reasonItIsTempting": "Kb1 is legal and pursues a nearby plan.",
          "whyItFails": "Kb1 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "expert",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kxb3 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are b2, b3, b2, d4. A 4-ply verification scores it 0, compared with -300 for the next legal plan, and checks b2b3.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Ka3 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kc1 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kb1 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "b2",
          "b3",
          "b2",
          "d4"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 0,
        "nextBestScore": -300,
        "principalVariation": [
          "b2b3"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/8/8/3k4/1p6/1K6/8 w - -|b2b3|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-technique_lab-ac95294b",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-1393",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "2k5/5K2/2P5/8/8/8/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "f7e6",
      "san": "Ke6",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "f7e8",
        "f7f8",
        "f7g8",
        "f7g7",
        "f7g6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "f7e8",
          "san": "Ke8",
          "reasonItIsTempting": "Ke8 is legal and pursues a nearby plan.",
          "whyItFails": "Ke8 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "f7f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "f7g8",
          "san": "Kg8",
          "reasonItIsTempting": "Kg8 is legal and pursues a nearby plan.",
          "whyItFails": "Kg8 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "intro",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Ke6 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are f7, e6, c6, f7, c8. A 4-ply verification scores it 228, compared with 0 for the next legal plan, and checks f7e6 c8d8 e6f7 d8c7.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Ke8 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kf8 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kg8 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "f7",
          "e6",
          "c6",
          "f7",
          "c8"
        ],
        "beforeMetric": 1,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 228,
        "nextBestScore": 0,
        "principalVariation": [
          "f7e6",
          "c8d8",
          "e6f7",
          "d8c7"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|2k5/5K2/2P5/8/8/8/8/8 w - -|f7e6|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-technique_lab-02166b55",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-1482",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/4k1P1/8/7K/8/8/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "h4g5",
      "san": "Kg5",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "g6g7",
        "h4h5",
        "h4h3",
        "h4g3",
        "h4g4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h4h5",
          "san": "Kh5",
          "reasonItIsTempting": "Kh5 is legal and pursues a nearby plan.",
          "whyItFails": "Kh5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "h4g4",
          "san": "Kg4",
          "reasonItIsTempting": "Kg4 is legal and pursues a nearby plan.",
          "whyItFails": "Kg4 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "g6g7",
          "san": "g7",
          "reasonItIsTempting": "g7 is legal and pursues a nearby plan.",
          "whyItFails": "g7 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "easy",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kg5 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are h4, g5, g6, h4, e6. A 4-ply verification scores it 300, compared with 228 for the next legal plan, and checks h4g5 e6d7 g6g7 d7c8.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kh5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kg4 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "g7 scores 300 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "h4",
          "g5",
          "g6",
          "h4",
          "e6"
        ],
        "beforeMetric": 0,
        "afterMetric": -1,
        "searchDepth": 4,
        "bestScore": 300,
        "nextBestScore": 228,
        "principalVariation": [
          "h4g5",
          "e6d7",
          "g6g7",
          "d7c8"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/4k1P1/8/7K/8/8/8 w - -|h4g5|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-technique_lab-9cdd46df",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-1522",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/3k4/3P4/5K2/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p1n0b0r0q0|b:p0n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "d6d5",
      "san": "Kxd5",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "d6c7",
        "d6d7",
        "d6e7",
        "d6c5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d6c7",
          "san": "Kc7",
          "reasonItIsTempting": "Kc7 is legal and pursues a nearby plan.",
          "whyItFails": "Kc7 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "d6d7",
          "san": "Kd7",
          "reasonItIsTempting": "Kd7 is legal and pursues a nearby plan.",
          "whyItFails": "Kd7 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "d6e7",
          "san": "Ke7",
          "reasonItIsTempting": "Ke7 is legal and pursues a nearby plan.",
          "whyItFails": "Ke7 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "medium",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kxd5 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are d6, d5, d6, f4. A 4-ply verification scores it 0, compared with -228 for the next legal plan, and checks d6d5.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kc7 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kd7 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Ke7 scores 228 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "d6",
          "d5",
          "d6",
          "f4"
        ],
        "beforeMetric": 0,
        "afterMetric": 0,
        "searchDepth": 4,
        "bestScore": 0,
        "nextBestScore": -228,
        "principalVariation": [
          "d6d5"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/3k4/3P4/5K2/8/8/8 b - -|d6d5|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-technique_lab-9de6338a",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-1538",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/7k/5p2/8/4K3/8/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "h6g5",
      "san": "Kg5",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "h6g7",
        "h6h7",
        "h6h5",
        "h6g6",
        "f5f4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h6g7",
          "san": "Kg7",
          "reasonItIsTempting": "Kg7 is legal and pursues a nearby plan.",
          "whyItFails": "Kg7 scores 40 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "h6h7",
          "san": "Kh7",
          "reasonItIsTempting": "Kh7 is legal and pursues a nearby plan.",
          "whyItFails": "Kh7 scores 40 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "h6h5",
          "san": "Kh5",
          "reasonItIsTempting": "Kh5 is legal and pursues a nearby plan.",
          "whyItFails": "Kh5 scores 40 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "hard",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kg5 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are h6, g5, f5, h6, e3. A 4-ply verification scores it 172, compared with 132 for the next legal plan, and checks h6g5 e3d4 f5f4 d4c5.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kg7 scores 40 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kh7 scores 40 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kh5 scores 40 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "h6",
          "g5",
          "f5",
          "h6",
          "e3"
        ],
        "beforeMetric": 0,
        "afterMetric": -1,
        "searchDepth": 4,
        "bestScore": 172,
        "nextBestScore": 132,
        "principalVariation": [
          "h6g5",
          "e3d4",
          "f5f4",
          "d4c5"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/7k/5p2/8/4K3/8/8 b - -|h6g5|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-technique_lab-c8f16053",
    "miniGameId": "technique_lab",
    "version": "stage8m.v1",
    "source": {
      "kind": "curated",
      "sourceId": "opposition-1550",
      "seed": "stage-8m-plus:technique_lab",
      "generatorId": "techniqueLabGenerator"
    },
    "board": {
      "fen": "8/8/8/8/7k/6p1/8/5K2 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p0n0b0r0q0|b:p1n0b0r0q0",
      "pieceCount": 3,
      "pawnCount": 1
    },
    "solution": {
      "primaryMoveUci": "h4h3",
      "san": "Kh3",
      "moveType": "endgame_technique",
      "legalAlternatives": [
        "h4g5",
        "h4h5",
        "h4g4",
        "g3g2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h4g5",
          "san": "Kg5",
          "reasonItIsTempting": "Kg5 is legal and pursues a nearby plan.",
          "whyItFails": "Kg5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "h4h5",
          "san": "Kh5",
          "reasonItIsTempting": "Kh5 is legal and pursues a nearby plan.",
          "whyItFails": "Kh5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        },
        {
          "moveUci": "h4g4",
          "san": "Kg4",
          "reasonItIsTempting": "Kg4 is legal and pursues a nearby plan.",
          "whyItFails": "Kg4 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        }
      ]
    },
    "pedagogy": {
      "concept": "opposition",
      "subConcept": "named_endgame_method",
      "difficultyBand": "expert",
      "prompt": "Apply the opposition technique.",
      "lessonObjective": "Apply the opposition technique.",
      "transferPattern": "Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.",
      "explanation": {
        "short": "Apply the opposition technique.",
        "detailed": "Kh3 follows the rule: Take or yield opposition according to whose turn creates the entry square. The relevant squares are h4, h3, g3, h4, f1. A 4-ply verification scores it 300, compared with 228 for the next legal plan, and checks h4h3 f1e2 g3g2 e2d3.",
        "coachNote": "Take or yield opposition according to whose turn creates the entry square.",
        "whyAlternativesFail": [
          "Kg5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kh5 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly.",
          "Kg4 scores 72 lower in the bounded conversion tree and does not execute the opposition rule as directly."
        ]
      },
      "proof": {
        "family": "opposition",
        "ruleSentence": "Take or yield opposition according to whose turn creates the entry square.",
        "relevantSquares": [
          "h4",
          "h3",
          "g3",
          "h4",
          "f1"
        ],
        "beforeMetric": -1,
        "afterMetric": -1,
        "searchDepth": 4,
        "bestScore": 300,
        "nextBestScore": 228,
        "principalVariation": [
          "h4h3",
          "f1e2",
          "g3g2",
          "e2d3"
        ],
        "proceduralChecks": [
          "legal named-family construction",
          "kings non-adjacent",
          "bounded move-tree reviewed",
          "piece count 3"
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
      "score": 89,
      "noveltyKey": "technique_lab|8/8/8/8/7k/6p1/8/5K2 b - -|h4h3|opposition",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  }
];
