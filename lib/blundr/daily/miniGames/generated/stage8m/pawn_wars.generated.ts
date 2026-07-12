import type { Stage8MScenario } from '../../../../tools/stage8m/types';

export const STAGE8M_PAWN_WARS_SCENARIOS: Stage8MScenario[] = [
  {
    "id": "stage8m-pawn_wars-f55ce3e5",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-1",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/1k6/1p2p3/5P2/pPp3P1/8/PK6/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p4n0b0r0q0|b:p4n0b0r0q0",
      "pieceCount": 10,
      "pawnCount": 8
    },
    "solution": {
      "primaryMoveUci": "e6f5",
      "san": "exf5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b7a8",
        "b7b8",
        "b7c8",
        "b7c7",
        "b7c6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e6e5",
          "san": "e5",
          "reasonItIsTempting": "e5 is legal and pursues a nearby plan.",
          "whyItFails": "e5 leaves the bounded race score 56 points worse and does not match: opens the e file."
        },
        {
          "moveUci": "a4a3",
          "san": "a3+",
          "reasonItIsTempting": "a3+ is legal and pursues a nearby plan.",
          "whyItFails": "a3+ leaves the bounded race score 140 points worse and does not match: opens the e file."
        },
        {
          "moveUci": "c4c3",
          "san": "c3+",
          "reasonItIsTempting": "c3+ is legal and pursues a nearby plan.",
          "whyItFails": "c3+ leaves the bounded race score 140 points worse and does not match: opens the e file."
        }
      ]
    },
    "pedagogy": {
      "concept": "breakthrough",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "intro",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "exf5 changes the pawn race because opens the e file. Before the move the passers are g4, c4; after it they are c4. A four-ply capture search prefers the line e6f5 g4f5 b6b5 f5f6.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "e5 leaves the bounded race score 56 points worse and does not match: opens the e file.",
          "a3+ leaves the bounded race score 140 points worse and does not match: opens the e file.",
          "c3+ leaves the bounded race score 140 points worse and does not match: opens the e file."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "f5",
          "from": "e6",
          "to": "f5",
          "capture": "f5",
          "beforeTags": [
            "passed:g4",
            "passed:c4",
            "outside:g4",
            "open:d",
            "open:h"
          ],
          "afterTags": [
            "passed:c4",
            "open:d",
            "open:e",
            "open:h"
          ],
          "openedFiles": [
            "e"
          ],
          "halfOpenedFiles": [],
          "openedDiagonals": [
            "e6"
          ],
          "newlyWeakSquares": [
            "d5",
            "f5"
          ],
          "improvedSquares": [
            "e4",
            "g4"
          ],
          "changedFiles": [
            "e",
            "f"
          ],
          "summary": "opens the e file",
          "meaningful": true
        },
        "beforePassers": [
          "g4",
          "c4"
        ],
        "afterPassers": [
          "c4"
        ],
        "searchDepth": 4,
        "bestScore": 16,
        "alternativeScores": [
          -40,
          -124,
          -124
        ],
        "principalVariation": [
          "e6f5",
          "g4f5",
          "b6b5",
          "f5f6"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/1k6/1p2p3/5P2/pPp3P1/8/PK6/8 b - -|e6f5|breakthrough",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-pawn_wars-9ff85d97",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-3",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/k7/4p3/3P1p2/8/2P5/8/7K w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "d5e6",
      "san": "dxe6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "d5d6",
        "c3c4",
        "h1g2",
        "h1h2",
        "h1g1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d5d6",
          "san": "d6",
          "reasonItIsTempting": "d6 is legal and pursues a nearby plan.",
          "whyItFails": "d6 leaves the bounded race score 108 points worse and does not match: creates a passed pawn on e6; opens the d file."
        },
        {
          "moveUci": "c3c4",
          "san": "c4",
          "reasonItIsTempting": "c4 is legal and pursues a nearby plan.",
          "whyItFails": "c4 leaves the bounded race score 180 points worse and does not match: creates a passed pawn on e6; opens the d file."
        }
      ]
    },
    "pedagogy": {
      "concept": "passed_pawn_creation",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "easy",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "dxe6 changes the pawn race because creates a passed pawn on e6; opens the d file. Before the move the passers are c3, f5; after it they are c3, e6, f5. A four-ply capture search prefers the line d5e6 f5f4 e6e7 f4f3.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "d6 leaves the bounded race score 108 points worse and does not match: creates a passed pawn on e6; opens the d file.",
          "c4 leaves the bounded race score 180 points worse and does not match: creates a passed pawn on e6; opens the d file."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "e6",
          "from": "d5",
          "to": "e6",
          "capture": "e6",
          "beforeTags": [
            "passed:c3",
            "passed:f5",
            "protected:f5",
            "outside:c3",
            "outside:f5",
            "open:a",
            "open:b",
            "open:g",
            "open:h"
          ],
          "afterTags": [
            "passed:c3",
            "passed:e6",
            "passed:f5",
            "outside:c3",
            "open:a",
            "open:b",
            "open:d",
            "open:g",
            "open:h"
          ],
          "createdPassedPawn": "e6",
          "openedFiles": [
            "d"
          ],
          "halfOpenedFiles": [],
          "openedDiagonals": [
            "d5"
          ],
          "newlyWeakSquares": [
            "c6",
            "e6"
          ],
          "improvedSquares": [
            "d7",
            "f7"
          ],
          "changedFiles": [
            "d",
            "e"
          ],
          "summary": "creates a passed pawn on e6; opens the d file",
          "meaningful": true
        },
        "beforePassers": [
          "c3",
          "f5"
        ],
        "afterPassers": [
          "c3",
          "e6",
          "f5"
        ],
        "searchDepth": 4,
        "bestScore": 180,
        "alternativeScores": [
          72,
          0
        ],
        "principalVariation": [
          "d5e6",
          "f5f4",
          "e6e7",
          "f4f3"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/k7/4p3/3P1p2/8/2P5/8/7K w - -|d5e6|passed_pawn_creation",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-pawn_wars-ce9eaf95",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-8",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "6k1/2p5/2p5/6Pp/8/P7/5P2/6K1 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 8,
      "pawnCount": 6
    },
    "solution": {
      "primaryMoveUci": "h5h4",
      "san": "h4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "g8h8",
        "g8h7",
        "g8g7",
        "g8f7",
        "g8f8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c6c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on h4."
        }
      ]
    },
    "pedagogy": {
      "concept": "passed_pawn_creation",
      "subConcept": "promotion_tempo",
      "difficultyBand": "medium",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "h4 changes the pawn race because creates a passed pawn on h4. Before the move the passers are f2, a3, g5, h5, c6, c7; after it they are f2, a3, g5, h4, c6, c7. A four-ply capture search prefers the line h5h4 g5g6 h4h3 g6g7.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "c5 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on h4."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "h4",
          "from": "h5",
          "to": "h4",
          "beforeTags": [
            "passed:f2",
            "passed:a3",
            "passed:g5",
            "passed:h5",
            "passed:c6",
            "passed:c7",
            "outside:f2",
            "outside:a3",
            "outside:c6",
            "outside:c7",
            "open:b",
            "open:d",
            "open:e"
          ],
          "afterTags": [
            "passed:f2",
            "passed:a3",
            "passed:g5",
            "passed:h4",
            "passed:c6",
            "passed:c7",
            "outside:f2",
            "outside:a3",
            "outside:c6",
            "outside:c7",
            "open:b",
            "open:d",
            "open:e"
          ],
          "createdPassedPawn": "h4",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "g4"
          ],
          "improvedSquares": [
            "g3"
          ],
          "changedFiles": [
            "h"
          ],
          "summary": "creates a passed pawn on h4",
          "meaningful": true
        },
        "beforePassers": [
          "f2",
          "a3",
          "g5",
          "h5",
          "c6",
          "c7"
        ],
        "afterPassers": [
          "f2",
          "a3",
          "g5",
          "h4",
          "c6",
          "c7"
        ],
        "searchDepth": 4,
        "bestScore": -72,
        "alternativeScores": [
          -104
        ],
        "principalVariation": [
          "h5h4",
          "g5g6",
          "h4h3",
          "g6g7"
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
      "score": 90,
      "noveltyKey": "pawn_wars|6k1/2p5/2p5/6Pp/8/P7/5P2/6K1 b - -|h5h4|passed_pawn_creation",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-pawn_wars-06c4998f",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-10",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/2pp3k/2p5/P7/8/6P1/7P/7K w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 8,
      "pawnCount": 6
    },
    "solution": {
      "primaryMoveUci": "a5a6",
      "san": "a6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "g3g4",
        "h2h3",
        "h2h4",
        "h1g2",
        "h1g1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h2h4",
          "san": "h4",
          "reasonItIsTempting": "h4 is legal and pursues a nearby plan.",
          "whyItFails": "h4 leaves the bounded race score 40 points worse and does not match: creates a passed pawn on a6."
        },
        {
          "moveUci": "g3g4",
          "san": "g4",
          "reasonItIsTempting": "g4 is legal and pursues a nearby plan.",
          "whyItFails": "g4 leaves the bounded race score 48 points worse and does not match: creates a passed pawn on a6."
        },
        {
          "moveUci": "h2h3",
          "san": "h3",
          "reasonItIsTempting": "h3 is legal and pursues a nearby plan.",
          "whyItFails": "h3 leaves the bounded race score 64 points worse and does not match: creates a passed pawn on a6."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "promotion_tempo",
      "difficultyBand": "hard",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "a6 changes the pawn race because creates a passed pawn on a6. Before the move the passers are h2, g3, a5, c6, c7, d7; after it they are h2, g3, a6, c6, c7, d7. A four-ply capture search prefers the line a5a6 d7d5 a6a7 d5d4.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "h4 leaves the bounded race score 40 points worse and does not match: creates a passed pawn on a6.",
          "g4 leaves the bounded race score 48 points worse and does not match: creates a passed pawn on a6.",
          "h3 leaves the bounded race score 64 points worse and does not match: creates a passed pawn on a6."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "a6",
          "from": "a5",
          "to": "a6",
          "beforeTags": [
            "passed:h2",
            "passed:g3",
            "passed:a5",
            "passed:c6",
            "passed:c7",
            "passed:d7",
            "protected:g3",
            "protected:c6",
            "outside:h2",
            "outside:g3",
            "outside:a5",
            "outside:c6",
            "outside:c7",
            "outside:d7",
            "open:b",
            "open:e",
            "open:f"
          ],
          "afterTags": [
            "passed:h2",
            "passed:g3",
            "passed:a6",
            "passed:c6",
            "passed:c7",
            "passed:d7",
            "protected:g3",
            "protected:c6",
            "outside:h2",
            "outside:g3",
            "outside:a6",
            "outside:c6",
            "outside:c7",
            "outside:d7",
            "open:b",
            "open:e",
            "open:f"
          ],
          "createdPassedPawn": "a6",
          "createdOutsidePasser": "a6",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "b6"
          ],
          "improvedSquares": [
            "b7"
          ],
          "changedFiles": [
            "a"
          ],
          "summary": "creates a passed pawn on a6",
          "meaningful": true
        },
        "beforePassers": [
          "h2",
          "g3",
          "a5",
          "c6",
          "c7",
          "d7"
        ],
        "afterPassers": [
          "h2",
          "g3",
          "a6",
          "c6",
          "c7",
          "d7"
        ],
        "searchDepth": 4,
        "bestScore": 128,
        "alternativeScores": [
          88,
          80,
          64
        ],
        "principalVariation": [
          "a5a6",
          "d7d5",
          "a6a7",
          "d5d4"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/2pp3k/2p5/P7/8/6P1/7P/7K w - -|a5a6|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-pawn_wars-84dd1ece",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-19",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/p2pp1k1/8/8/1P2P1p1/4P3/P7/K7 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p4n0b0r0q0|b:p4n0b0r0q0",
      "pieceCount": 10,
      "pawnCount": 8
    },
    "solution": {
      "primaryMoveUci": "g4g3",
      "san": "g3",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a7a6",
        "a7a5",
        "d7d6",
        "d7d5",
        "e7e6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e7e5",
          "san": "e5",
          "reasonItIsTempting": "e5 is legal and pursues a nearby plan.",
          "whyItFails": "e5 leaves the bounded race score 40 points worse and does not match: creates a passed pawn on g3."
        },
        {
          "moveUci": "a7a6",
          "san": "a6",
          "reasonItIsTempting": "a6 is legal and pursues a nearby plan.",
          "whyItFails": "a6 leaves the bounded race score 64 points worse and does not match: creates a passed pawn on g3."
        },
        {
          "moveUci": "d7d6",
          "san": "d6",
          "reasonItIsTempting": "d6 is legal and pursues a nearby plan.",
          "whyItFails": "d6 leaves the bounded race score 64 points worse and does not match: creates a passed pawn on g3."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "promotion_tempo",
      "difficultyBand": "expert",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "g3 changes the pawn race because creates a passed pawn on g3. Before the move the passers are g4; after it they are g3. A four-ply capture search prefers the line g4g3 b4b5 g3g2 b5b6.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "e5 leaves the bounded race score 40 points worse and does not match: creates a passed pawn on g3.",
          "a6 leaves the bounded race score 64 points worse and does not match: creates a passed pawn on g3.",
          "d6 leaves the bounded race score 64 points worse and does not match: creates a passed pawn on g3."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "g3",
          "from": "g4",
          "to": "g3",
          "beforeTags": [
            "passed:g4",
            "outside:g4",
            "open:c",
            "open:f",
            "open:h"
          ],
          "afterTags": [
            "passed:g3",
            "outside:g3",
            "open:c",
            "open:f",
            "open:h"
          ],
          "createdPassedPawn": "g3",
          "createdOutsidePasser": "g3",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "f3",
            "h3"
          ],
          "improvedSquares": [
            "f2",
            "h2"
          ],
          "changedFiles": [
            "g"
          ],
          "summary": "creates a passed pawn on g3",
          "meaningful": true
        },
        "beforePassers": [
          "g4"
        ],
        "afterPassers": [
          "g3"
        ],
        "searchDepth": 4,
        "bestScore": 32,
        "alternativeScores": [
          -8,
          -32,
          -32
        ],
        "principalVariation": [
          "g4g3",
          "b4b5",
          "g3g2",
          "b5b6"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/p2pp1k1/8/8/1P2P1p1/4P3/P7/K7 b - -|g4g3|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-pawn_wars-b5f8d546",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-20",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/1k6/5p2/1p2PP2/2p5/5P2/K7/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 8,
      "pawnCount": 6
    },
    "solution": {
      "primaryMoveUci": "e5f6",
      "san": "exf6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "e5e6",
        "f3f4",
        "a2a3",
        "a2b2",
        "a2b1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e5e6",
          "san": "e6",
          "reasonItIsTempting": "e6 is legal and pursues a nearby plan.",
          "whyItFails": "e6 leaves the bounded race score 108 points worse and does not match: creates a passed pawn on f3; opens the e file; breaks a locked pawn pair."
        },
        {
          "moveUci": "f3f4",
          "san": "f4",
          "reasonItIsTempting": "f4 is legal and pursues a nearby plan.",
          "whyItFails": "f4 leaves the bounded race score 164 points worse and does not match: creates a passed pawn on f3; opens the e file; breaks a locked pawn pair."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "intro",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "exf6 changes the pawn race because creates a passed pawn on f3; opens the e file; breaks a locked pawn pair. Before the move the passers are c4, b5; after it they are f3, f5, f6, c4, b5. A four-ply capture search prefers the line e5f6 c4c3 f6f7 c3c2.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "e6 leaves the bounded race score 108 points worse and does not match: creates a passed pawn on f3; opens the e file; breaks a locked pawn pair.",
          "f4 leaves the bounded race score 164 points worse and does not match: creates a passed pawn on f3; opens the e file; breaks a locked pawn pair."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "f6",
          "from": "e5",
          "to": "f6",
          "capture": "f6",
          "beforeTags": [
            "passed:c4",
            "passed:b5",
            "protected:c4",
            "outside:c4",
            "outside:b5",
            "open:a",
            "open:d",
            "open:g",
            "open:h",
            "locked:f5"
          ],
          "afterTags": [
            "passed:f3",
            "passed:f5",
            "passed:f6",
            "passed:c4",
            "passed:b5",
            "protected:c4",
            "outside:f3",
            "outside:f5",
            "outside:f6",
            "outside:c4",
            "outside:b5",
            "open:a",
            "open:d",
            "open:e",
            "open:g",
            "open:h"
          ],
          "createdPassedPawn": "f3",
          "createdOutsidePasser": "f3",
          "removedBlocker": "f6",
          "openedFiles": [
            "e"
          ],
          "halfOpenedFiles": [
            "f"
          ],
          "openedDiagonals": [
            "e5"
          ],
          "newlyWeakSquares": [
            "d6",
            "f6"
          ],
          "improvedSquares": [
            "e7",
            "g7"
          ],
          "changedFiles": [
            "e",
            "f"
          ],
          "summary": "creates a passed pawn on f3; opens the e file; breaks a locked pawn pair",
          "meaningful": true
        },
        "beforePassers": [
          "c4",
          "b5"
        ],
        "afterPassers": [
          "f3",
          "f5",
          "f6",
          "c4",
          "b5"
        ],
        "searchDepth": 4,
        "bestScore": 148,
        "alternativeScores": [
          40,
          -16
        ],
        "principalVariation": [
          "e5f6",
          "c4c3",
          "f6f7",
          "c3c2"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/1k6/5p2/1p2PP2/2p5/5P2/K7/8 w - -|e5f6|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-pawn_wars-ff27941d",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-21",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "7k/8/8/2p3P1/p2P4/8/8/1K6 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "c5d4",
      "san": "cxd4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "h8h7",
        "h8g7",
        "h8g8",
        "c5c4",
        "a4a3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c5c4",
          "san": "c4",
          "reasonItIsTempting": "c4 is legal and pursues a nearby plan.",
          "whyItFails": "c4 leaves the bounded race score 148 points worse and does not match: creates a passed pawn on d4; opens the c file."
        },
        {
          "moveUci": "a4a3",
          "san": "a3",
          "reasonItIsTempting": "a3 is legal and pursues a nearby plan.",
          "whyItFails": "a3 leaves the bounded race score 288 points worse and does not match: creates a passed pawn on d4; opens the c file."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "easy",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "cxd4 changes the pawn race because creates a passed pawn on d4; opens the c file. Before the move the passers are g5, a4; after it they are g5, a4, d4. A four-ply capture search prefers the line c5d4 g5g6 h8g7 b1a2.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "c4 leaves the bounded race score 148 points worse and does not match: creates a passed pawn on d4; opens the c file.",
          "a3 leaves the bounded race score 288 points worse and does not match: creates a passed pawn on d4; opens the c file."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "d4",
          "from": "c5",
          "to": "d4",
          "capture": "d4",
          "beforeTags": [
            "passed:g5",
            "passed:a4",
            "outside:g5",
            "outside:a4",
            "open:b",
            "open:e",
            "open:f",
            "open:h"
          ],
          "afterTags": [
            "passed:g5",
            "passed:a4",
            "passed:d4",
            "outside:g5",
            "outside:a4",
            "outside:d4",
            "open:b",
            "open:c",
            "open:e",
            "open:f",
            "open:h"
          ],
          "createdPassedPawn": "d4",
          "createdOutsidePasser": "d4",
          "openedFiles": [
            "c"
          ],
          "halfOpenedFiles": [],
          "openedDiagonals": [
            "c5"
          ],
          "newlyWeakSquares": [
            "b4",
            "d4"
          ],
          "improvedSquares": [
            "c3",
            "e3"
          ],
          "changedFiles": [
            "c",
            "d"
          ],
          "summary": "creates a passed pawn on d4; opens the c file",
          "meaningful": true
        },
        "beforePassers": [
          "g5",
          "a4"
        ],
        "afterPassers": [
          "g5",
          "a4",
          "d4"
        ],
        "searchDepth": 4,
        "bestScore": 116,
        "alternativeScores": [
          -32,
          -172
        ],
        "principalVariation": [
          "c5d4",
          "g5g6",
          "h8g7",
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
      "score": 90,
      "noveltyKey": "pawn_wars|7k/8/8/2p3P1/p2P4/8/8/1K6 b - -|c5d4|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-pawn_wars-12879ca4",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-31",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "k7/5p2/8/5Pp1/1P1p4/2P5/7K/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 8,
      "pawnCount": 6
    },
    "solution": {
      "primaryMoveUci": "c3d4",
      "san": "cxd4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "f5f6",
        "b4b5",
        "c3c4",
        "h2g3",
        "h2h3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c3c4",
          "san": "c4",
          "reasonItIsTempting": "c4 is legal and pursues a nearby plan.",
          "whyItFails": "c4 leaves the bounded race score 204 points worse and does not match: creates a passed pawn on d4; opens the c file."
        },
        {
          "moveUci": "f5f6",
          "san": "f6",
          "reasonItIsTempting": "f6 is legal and pursues a nearby plan.",
          "whyItFails": "f6 leaves the bounded race score 296 points worse and does not match: creates a passed pawn on d4; opens the c file."
        },
        {
          "moveUci": "b4b5",
          "san": "b5",
          "reasonItIsTempting": "b5 is legal and pursues a nearby plan.",
          "whyItFails": "b5 leaves the bounded race score 296 points worse and does not match: creates a passed pawn on d4; opens the c file."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "medium",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "cxd4 changes the pawn race because creates a passed pawn on d4; opens the c file. Before the move the passers are b4, g5; after it they are b4, d4, g5. A four-ply capture search prefers the line c3d4 g5g4 f5f6 g4g3.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "c4 leaves the bounded race score 204 points worse and does not match: creates a passed pawn on d4; opens the c file.",
          "f6 leaves the bounded race score 296 points worse and does not match: creates a passed pawn on d4; opens the c file.",
          "b5 leaves the bounded race score 296 points worse and does not match: creates a passed pawn on d4; opens the c file."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "d4",
          "from": "c3",
          "to": "d4",
          "capture": "d4",
          "beforeTags": [
            "passed:b4",
            "passed:g5",
            "protected:b4",
            "outside:b4",
            "open:a",
            "open:e",
            "open:h"
          ],
          "afterTags": [
            "passed:b4",
            "passed:d4",
            "passed:g5",
            "outside:b4",
            "outside:d4",
            "open:a",
            "open:c",
            "open:e",
            "open:h"
          ],
          "createdPassedPawn": "d4",
          "createdOutsidePasser": "d4",
          "openedFiles": [
            "c"
          ],
          "halfOpenedFiles": [],
          "openedDiagonals": [
            "c3"
          ],
          "newlyWeakSquares": [
            "b4",
            "d4"
          ],
          "improvedSquares": [
            "c5",
            "e5"
          ],
          "changedFiles": [
            "c",
            "d"
          ],
          "summary": "creates a passed pawn on d4; opens the c file",
          "meaningful": true
        },
        "beforePassers": [
          "b4",
          "g5"
        ],
        "afterPassers": [
          "b4",
          "d4",
          "g5"
        ],
        "searchDepth": 4,
        "bestScore": 164,
        "alternativeScores": [
          -40,
          -132,
          -132
        ],
        "principalVariation": [
          "c3d4",
          "g5g4",
          "f5f6",
          "g4g3"
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
      "score": 90,
      "noveltyKey": "pawn_wars|k7/5p2/8/5Pp1/1P1p4/2P5/7K/8 w - -|c3d4|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-pawn_wars-11b0bed9",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-32",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/k7/ppp5/6P1/6P1/8/P7/1K6 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 8,
      "pawnCount": 6
    },
    "solution": {
      "primaryMoveUci": "g5g6",
      "san": "g6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a2a3",
        "a2a4",
        "b1b2",
        "b1c2",
        "b1c1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a2a4",
          "san": "a4",
          "reasonItIsTempting": "a4 is legal and pursues a nearby plan.",
          "whyItFails": "a4 leaves the bounded race score 56 points worse and does not match: creates a passed pawn on g6."
        },
        {
          "moveUci": "a2a3",
          "san": "a3",
          "reasonItIsTempting": "a3 is legal and pursues a nearby plan.",
          "whyItFails": "a3 leaves the bounded race score 64 points worse and does not match: creates a passed pawn on g6."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "promotion_tempo",
      "difficultyBand": "hard",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "g6 changes the pawn race because creates a passed pawn on g6. Before the move the passers are g4, g5, c6; after it they are g4, g6, c6. A four-ply capture search prefers the line g5g6 a6a5 g6g7 a5a4.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "a4 leaves the bounded race score 56 points worse and does not match: creates a passed pawn on g6.",
          "a3 leaves the bounded race score 64 points worse and does not match: creates a passed pawn on g6."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "g6",
          "from": "g5",
          "to": "g6",
          "beforeTags": [
            "passed:g4",
            "passed:g5",
            "passed:c6",
            "outside:g4",
            "outside:g5",
            "outside:c6",
            "open:d",
            "open:e",
            "open:f",
            "open:h"
          ],
          "afterTags": [
            "passed:g4",
            "passed:g6",
            "passed:c6",
            "outside:g4",
            "outside:g6",
            "outside:c6",
            "open:d",
            "open:e",
            "open:f",
            "open:h"
          ],
          "createdPassedPawn": "g6",
          "createdOutsidePasser": "g6",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "f6",
            "h6"
          ],
          "improvedSquares": [
            "f7",
            "h7"
          ],
          "changedFiles": [
            "g"
          ],
          "summary": "creates a passed pawn on g6",
          "meaningful": true
        },
        "beforePassers": [
          "g4",
          "g5",
          "c6"
        ],
        "afterPassers": [
          "g4",
          "g6",
          "c6"
        ],
        "searchDepth": 4,
        "bestScore": 144,
        "alternativeScores": [
          88,
          80
        ],
        "principalVariation": [
          "g5g6",
          "a6a5",
          "g6g7",
          "a5a4"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/k7/ppp5/6P1/6P1/8/P7/1K6 w - -|g5g6|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-pawn_wars-4b5307fe",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-34",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "6k1/1p6/1p6/P7/5p2/1P6/7P/1K6 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 8,
      "pawnCount": 6
    },
    "solution": {
      "primaryMoveUci": "a5b6",
      "san": "axb6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a5a6",
        "b3b4",
        "h2h3",
        "h2h4",
        "b1a2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b3b4",
          "san": "b4",
          "reasonItIsTempting": "b4 is legal and pursues a nearby plan.",
          "whyItFails": "b4 leaves the bounded race score 124 points worse and does not match: opens the a file."
        },
        {
          "moveUci": "h2h4",
          "san": "h4",
          "reasonItIsTempting": "h4 is legal and pursues a nearby plan.",
          "whyItFails": "h4 leaves the bounded race score 248 points worse and does not match: opens the a file."
        },
        {
          "moveUci": "a5a6",
          "san": "a6",
          "reasonItIsTempting": "a6 is legal and pursues a nearby plan.",
          "whyItFails": "a6 leaves the bounded race score 272 points worse and does not match: opens the a file."
        }
      ]
    },
    "pedagogy": {
      "concept": "breakthrough",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "expert",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "axb6 changes the pawn race because opens the a file. Before the move the passers are h2, f4; after it they are h2, f4. A four-ply capture search prefers the line a5b6 f4f3 h2h4 f3f2.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "b4 leaves the bounded race score 124 points worse and does not match: opens the a file.",
          "h4 leaves the bounded race score 248 points worse and does not match: opens the a file.",
          "a6 leaves the bounded race score 272 points worse and does not match: opens the a file."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "b6",
          "from": "a5",
          "to": "b6",
          "capture": "b6",
          "beforeTags": [
            "passed:h2",
            "passed:f4",
            "outside:h2",
            "outside:f4",
            "open:c",
            "open:d",
            "open:e",
            "open:g"
          ],
          "afterTags": [
            "passed:h2",
            "passed:f4",
            "outside:h2",
            "outside:f4",
            "open:a",
            "open:c",
            "open:d",
            "open:e",
            "open:g"
          ],
          "openedFiles": [
            "a"
          ],
          "halfOpenedFiles": [],
          "openedDiagonals": [
            "a5"
          ],
          "newlyWeakSquares": [
            "b6"
          ],
          "improvedSquares": [
            "a7",
            "c7"
          ],
          "changedFiles": [
            "a",
            "b"
          ],
          "summary": "opens the a file",
          "meaningful": true
        },
        "beforePassers": [
          "h2",
          "f4"
        ],
        "afterPassers": [
          "h2",
          "f4"
        ],
        "searchDepth": 4,
        "bestScore": 68,
        "alternativeScores": [
          -56,
          -180,
          -204
        ],
        "principalVariation": [
          "a5b6",
          "f4f3",
          "h2h4",
          "f3f2"
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
      "score": 90,
      "noveltyKey": "pawn_wars|6k1/1p6/1p6/P7/5p2/1P6/7P/1K6 w - -|a5b6|breakthrough",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-pawn_wars-188e869a",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-35",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "7k/8/1p6/P7/4p3/8/1P6/1K6 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "a5b6",
      "san": "axb6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a5a6",
        "b2b3",
        "b2b4",
        "b1a2",
        "b1c2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a5a6",
          "san": "a6",
          "reasonItIsTempting": "a6 is legal and pursues a nearby plan.",
          "whyItFails": "a6 leaves the bounded race score 108 points worse and does not match: creates a passed pawn on b2; opens the a file."
        },
        {
          "moveUci": "b2b4",
          "san": "b4",
          "reasonItIsTempting": "b4 is legal and pursues a nearby plan.",
          "whyItFails": "b4 leaves the bounded race score 156 points worse and does not match: creates a passed pawn on b2; opens the a file."
        },
        {
          "moveUci": "b2b3",
          "san": "b3",
          "reasonItIsTempting": "b3 is legal and pursues a nearby plan.",
          "whyItFails": "b3 leaves the bounded race score 352 points worse and does not match: creates a passed pawn on b2; opens the a file."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "intro",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "axb6 changes the pawn race because creates a passed pawn on b2; opens the a file. Before the move the passers are e4; after it they are b2, b6, e4. A four-ply capture search prefers the line a5b6 e4e3 b6b7 e3e2.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "a6 leaves the bounded race score 108 points worse and does not match: creates a passed pawn on b2; opens the a file.",
          "b4 leaves the bounded race score 156 points worse and does not match: creates a passed pawn on b2; opens the a file.",
          "b3 leaves the bounded race score 352 points worse and does not match: creates a passed pawn on b2; opens the a file."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "b6",
          "from": "a5",
          "to": "b6",
          "capture": "b6",
          "beforeTags": [
            "passed:e4",
            "outside:e4",
            "open:c",
            "open:d",
            "open:f",
            "open:g",
            "open:h"
          ],
          "afterTags": [
            "passed:b2",
            "passed:b6",
            "passed:e4",
            "outside:b2",
            "outside:b6",
            "outside:e4",
            "open:a",
            "open:c",
            "open:d",
            "open:f",
            "open:g",
            "open:h"
          ],
          "createdPassedPawn": "b2",
          "createdOutsidePasser": "b2",
          "openedFiles": [
            "a"
          ],
          "halfOpenedFiles": [
            "b"
          ],
          "openedDiagonals": [
            "a5"
          ],
          "newlyWeakSquares": [
            "b6"
          ],
          "improvedSquares": [
            "a7",
            "c7"
          ],
          "changedFiles": [
            "a",
            "b"
          ],
          "summary": "creates a passed pawn on b2; opens the a file",
          "meaningful": true
        },
        "beforePassers": [
          "e4"
        ],
        "afterPassers": [
          "b2",
          "b6",
          "e4"
        ],
        "searchDepth": 4,
        "bestScore": 100,
        "alternativeScores": [
          -8,
          -56,
          -252
        ],
        "principalVariation": [
          "a5b6",
          "e4e3",
          "b6b7",
          "e3e2"
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
      "score": 90,
      "noveltyKey": "pawn_wars|7k/8/1p6/P7/4p3/8/1P6/1K6 w - -|a5b6|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-pawn_wars-00015ba1",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-36",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/3p2k1/2p5/1p3P2/2PpP3/3P4/8/K7 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p4n0b0r0q0|b:p4n0b0r0q0",
      "pieceCount": 10,
      "pawnCount": 8
    },
    "solution": {
      "primaryMoveUci": "b5b4",
      "san": "b4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "d7d6",
        "d7d5",
        "g7f8",
        "g7g8",
        "g7h8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d7d6",
          "san": "d6",
          "reasonItIsTempting": "d6 is legal and pursues a nearby plan.",
          "whyItFails": "d6 leaves the bounded race score 24 points worse and does not match: creates a passed pawn on b4."
        },
        {
          "moveUci": "b5c4",
          "san": "bxc4",
          "reasonItIsTempting": "bxc4 is legal and pursues a nearby plan.",
          "whyItFails": "bxc4 leaves the bounded race score 24 points worse and does not match: creates a passed pawn on b4."
        },
        {
          "moveUci": "d7d5",
          "san": "d5",
          "reasonItIsTempting": "d5 is legal and pursues a nearby plan.",
          "whyItFails": "d5 leaves the bounded race score 116 points worse and does not match: creates a passed pawn on b4."
        }
      ]
    },
    "pedagogy": {
      "concept": "passed_pawn_creation",
      "subConcept": "promotion_tempo",
      "difficultyBand": "easy",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "b4 changes the pawn race because creates a passed pawn on b4. Before the move the passers are f5; after it they are f5, b4. A four-ply capture search prefers the line b5b4 c4c5 b4b3 f5f6.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "d6 leaves the bounded race score 24 points worse and does not match: creates a passed pawn on b4.",
          "bxc4 leaves the bounded race score 24 points worse and does not match: creates a passed pawn on b4.",
          "d5 leaves the bounded race score 116 points worse and does not match: creates a passed pawn on b4."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "b4",
          "from": "b5",
          "to": "b4",
          "beforeTags": [
            "passed:f5",
            "protected:f5",
            "outside:f5",
            "open:a",
            "open:g",
            "open:h",
            "locked:d3"
          ],
          "afterTags": [
            "passed:f5",
            "passed:b4",
            "protected:f5",
            "outside:f5",
            "open:a",
            "open:g",
            "open:h",
            "locked:d3"
          ],
          "createdPassedPawn": "b4",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "a4",
            "c4"
          ],
          "improvedSquares": [
            "a3",
            "c3"
          ],
          "changedFiles": [
            "b"
          ],
          "summary": "creates a passed pawn on b4",
          "meaningful": true
        },
        "beforePassers": [
          "f5"
        ],
        "afterPassers": [
          "f5",
          "b4"
        ],
        "searchDepth": 4,
        "bestScore": -32,
        "alternativeScores": [
          -56,
          -56,
          -148
        ],
        "principalVariation": [
          "b5b4",
          "c4c5",
          "b4b3",
          "f5f6"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/3p2k1/2p5/1p3P2/2PpP3/3P4/8/K7 b - -|b5b4|passed_pawn_creation",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-pawn_wars-d9e28a42",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-37",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "6k1/8/5p2/4P3/7p/8/1K1P4/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "e5e6",
      "san": "e6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "e5f6",
        "b2a3",
        "b2b3",
        "b2c3",
        "b2c2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e5f6",
          "san": "exf6",
          "reasonItIsTempting": "exf6 is legal and pursues a nearby plan.",
          "whyItFails": "exf6 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on e6."
        },
        {
          "moveUci": "d2d4",
          "san": "d4",
          "reasonItIsTempting": "d4 is legal and pursues a nearby plan.",
          "whyItFails": "d4 leaves the bounded race score 48 points worse and does not match: creates a passed pawn on e6."
        },
        {
          "moveUci": "d2d3",
          "san": "d3",
          "reasonItIsTempting": "d3 is legal and pursues a nearby plan.",
          "whyItFails": "d3 leaves the bounded race score 244 points worse and does not match: creates a passed pawn on e6."
        }
      ]
    },
    "pedagogy": {
      "concept": "passed_pawn_creation",
      "subConcept": "promotion_tempo",
      "difficultyBand": "medium",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "e6 changes the pawn race because creates a passed pawn on e6. Before the move the passers are d2, h4; after it they are d2, e6, h4, f6. A four-ply capture search prefers the line e5e6 h4h3 e6e7 h3h2.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "exf6 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on e6.",
          "d4 leaves the bounded race score 48 points worse and does not match: creates a passed pawn on e6.",
          "d3 leaves the bounded race score 244 points worse and does not match: creates a passed pawn on e6."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "e6",
          "from": "e5",
          "to": "e6",
          "beforeTags": [
            "passed:d2",
            "passed:h4",
            "outside:d2",
            "outside:h4",
            "open:a",
            "open:b",
            "open:c",
            "open:g"
          ],
          "afterTags": [
            "passed:d2",
            "passed:e6",
            "passed:h4",
            "passed:f6",
            "outside:d2",
            "outside:h4",
            "open:a",
            "open:b",
            "open:c",
            "open:g"
          ],
          "createdPassedPawn": "e6",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "d6",
            "f6"
          ],
          "improvedSquares": [
            "d7",
            "f7"
          ],
          "changedFiles": [
            "e"
          ],
          "summary": "creates a passed pawn on e6",
          "meaningful": true
        },
        "beforePassers": [
          "d2",
          "h4"
        ],
        "afterPassers": [
          "d2",
          "e6",
          "h4",
          "f6"
        ],
        "searchDepth": 4,
        "bestScore": -8,
        "alternativeScores": [
          -40,
          -56,
          -252
        ],
        "principalVariation": [
          "e5e6",
          "h4h3",
          "e6e7",
          "h3h2"
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
      "score": 90,
      "noveltyKey": "pawn_wars|6k1/8/5p2/4P3/7p/8/1K1P4/8 w - -|e5e6|passed_pawn_creation",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-pawn_wars-9e4c9d1a",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-38",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/6pk/8/2P2p2/6P1/8/8/6K1 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "g4f5",
      "san": "gxf5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "c5c6",
        "g4g5",
        "g1f2",
        "g1g2",
        "g1h2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "g4g5",
          "san": "g5",
          "reasonItIsTempting": "g5 is legal and pursues a nearby plan.",
          "whyItFails": "g5 leaves the bounded race score 232 points worse and does not match: no verified structural transformation."
        },
        {
          "moveUci": "c5c6",
          "san": "c6",
          "reasonItIsTempting": "c6 is legal and pursues a nearby plan.",
          "whyItFails": "c6 leaves the bounded race score 256 points worse and does not match: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "breakthrough",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "hard",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "gxf5 changes the pawn race because no verified structural transformation. Before the move the passers are c5; after it they are c5. A four-ply capture search prefers the line g4f5 g7g5 c5c6 g5g4.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "g5 leaves the bounded race score 232 points worse and does not match: no verified structural transformation.",
          "c6 leaves the bounded race score 256 points worse and does not match: no verified structural transformation."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "f5",
          "from": "g4",
          "to": "f5",
          "capture": "f5",
          "beforeTags": [
            "passed:c5",
            "outside:c5",
            "open:a",
            "open:b",
            "open:d",
            "open:e",
            "open:h"
          ],
          "afterTags": [
            "passed:c5",
            "outside:c5",
            "open:a",
            "open:b",
            "open:d",
            "open:e",
            "open:h"
          ],
          "openedFiles": [],
          "halfOpenedFiles": [
            "g"
          ],
          "openedDiagonals": [
            "g4"
          ],
          "newlyWeakSquares": [
            "f5",
            "h5"
          ],
          "improvedSquares": [
            "e6",
            "g6"
          ],
          "changedFiles": [
            "g",
            "f"
          ],
          "summary": "no verified structural transformation",
          "meaningful": true
        },
        "beforePassers": [
          "c5"
        ],
        "afterPassers": [
          "c5"
        ],
        "searchDepth": 4,
        "bestScore": 228,
        "alternativeScores": [
          -4,
          -28
        ],
        "principalVariation": [
          "g4f5",
          "g7g5",
          "c5c6",
          "g5g4"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/6pk/8/2P2p2/6P1/8/8/6K1 w - -|g4f5|breakthrough",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-pawn_wars-27cbab5c",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-39",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "k7/8/8/P5pP/2p5/8/8/6K1 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "c4c3",
      "san": "c3",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a8b8",
        "a8b7",
        "a8a7",
        "g5g4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "g5g4",
          "san": "g4",
          "reasonItIsTempting": "g4 is legal and pursues a nearby plan.",
          "whyItFails": "g4 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on c3."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "promotion_tempo",
      "difficultyBand": "expert",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "c3 changes the pawn race because creates a passed pawn on c3. Before the move the passers are a5, h5, c4, g5; after it they are a5, h5, c3, g5. A four-ply capture search prefers the line c4c3 a5a6 c3c2 a6a7.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "g4 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on c3."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "c3",
          "from": "c4",
          "to": "c3",
          "beforeTags": [
            "passed:a5",
            "passed:h5",
            "passed:c4",
            "passed:g5",
            "outside:a5",
            "outside:c4",
            "open:b",
            "open:d",
            "open:e",
            "open:f"
          ],
          "afterTags": [
            "passed:a5",
            "passed:h5",
            "passed:c3",
            "passed:g5",
            "outside:a5",
            "outside:c3",
            "open:b",
            "open:d",
            "open:e",
            "open:f"
          ],
          "createdPassedPawn": "c3",
          "createdOutsidePasser": "c3",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "b3",
            "d3"
          ],
          "improvedSquares": [
            "b2",
            "d2"
          ],
          "changedFiles": [
            "c"
          ],
          "summary": "creates a passed pawn on c3",
          "meaningful": true
        },
        "beforePassers": [
          "a5",
          "h5",
          "c4",
          "g5"
        ],
        "afterPassers": [
          "a5",
          "h5",
          "c3",
          "g5"
        ],
        "searchDepth": 4,
        "bestScore": -40,
        "alternativeScores": [
          -72
        ],
        "principalVariation": [
          "c4c3",
          "a5a6",
          "c3c2",
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
      "score": 90,
      "noveltyKey": "pawn_wars|k7/8/8/P5pP/2p5/8/8/6K1 b - -|c4c3|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-pawn_wars-35d061b4",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-41",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "k7/p6p/8/3P2p1/3pP3/2P5/4P3/K7 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p4n0b0r0q0|b:p4n0b0r0q0",
      "pieceCount": 10,
      "pawnCount": 8
    },
    "solution": {
      "primaryMoveUci": "c3d4",
      "san": "cxd4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "d5d6",
        "e4e5",
        "c3c4",
        "e2e3",
        "a1a2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c3c4",
          "san": "c4",
          "reasonItIsTempting": "c4 is legal and pursues a nearby plan.",
          "whyItFails": "c4 leaves the bounded race score 172 points worse and does not match: creates a passed pawn on e2; opens the c file."
        },
        {
          "moveUci": "d5d6",
          "san": "d6",
          "reasonItIsTempting": "d6 is legal and pursues a nearby plan.",
          "whyItFails": "d6 leaves the bounded race score 264 points worse and does not match: creates a passed pawn on e2; opens the c file."
        },
        {
          "moveUci": "e4e5",
          "san": "e5",
          "reasonItIsTempting": "e5 is legal and pursues a nearby plan.",
          "whyItFails": "e5 leaves the bounded race score 296 points worse and does not match: creates a passed pawn on e2; opens the c file."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "intro",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "cxd4 changes the pawn race because creates a passed pawn on e2; opens the c file. Before the move the passers are e4, d5, g5, a7, h7; after it they are e2, d4, e4, d5, g5, a7, h7. A four-ply capture search prefers the line c3d4 g5g4 d5d6 g4g3.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "c4 leaves the bounded race score 172 points worse and does not match: creates a passed pawn on e2; opens the c file.",
          "d6 leaves the bounded race score 264 points worse and does not match: creates a passed pawn on e2; opens the c file.",
          "e5 leaves the bounded race score 296 points worse and does not match: creates a passed pawn on e2; opens the c file."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "d4",
          "from": "c3",
          "to": "d4",
          "capture": "d4",
          "beforeTags": [
            "passed:e4",
            "passed:d5",
            "passed:g5",
            "passed:a7",
            "passed:h7",
            "protected:d5",
            "outside:g5",
            "outside:a7",
            "outside:h7",
            "open:b",
            "open:f"
          ],
          "afterTags": [
            "passed:e2",
            "passed:d4",
            "passed:e4",
            "passed:d5",
            "passed:g5",
            "passed:a7",
            "passed:h7",
            "protected:d5",
            "outside:e2",
            "outside:d4",
            "outside:e4",
            "outside:d5",
            "outside:g5",
            "outside:a7",
            "outside:h7",
            "open:b",
            "open:c",
            "open:f"
          ],
          "createdPassedPawn": "e2",
          "createdOutsidePasser": "e2",
          "openedFiles": [
            "c"
          ],
          "halfOpenedFiles": [
            "d"
          ],
          "openedDiagonals": [
            "c3"
          ],
          "newlyWeakSquares": [
            "b4",
            "d4"
          ],
          "improvedSquares": [
            "c5",
            "e5"
          ],
          "changedFiles": [
            "c",
            "d"
          ],
          "summary": "creates a passed pawn on e2; opens the c file",
          "meaningful": true
        },
        "beforePassers": [
          "e4",
          "d5",
          "g5",
          "a7",
          "h7"
        ],
        "afterPassers": [
          "e2",
          "d4",
          "e4",
          "d5",
          "g5",
          "a7",
          "h7"
        ],
        "searchDepth": 4,
        "bestScore": 164,
        "alternativeScores": [
          -8,
          -100,
          -132
        ],
        "principalVariation": [
          "c3d4",
          "g5g4",
          "d5d6",
          "g4g3"
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
      "score": 90,
      "noveltyKey": "pawn_wars|k7/p6p/8/3P2p1/3pP3/2P5/4P3/K7 w - -|c3d4|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-pawn_wars-7a976a20",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-48",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/pk6/7p/5p2/P2PpP2/7P/7K/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p4n0b0r0q0|b:p4n0b0r0q0",
      "pieceCount": 10,
      "pawnCount": 8
    },
    "solution": {
      "primaryMoveUci": "d4d5",
      "san": "d5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a4a5",
        "h3h4",
        "h2g3",
        "h2h1",
        "h2g1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h3h4",
          "san": "h4",
          "reasonItIsTempting": "h4 is legal and pursues a nearby plan.",
          "whyItFails": "h4 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on d5."
        },
        {
          "moveUci": "a4a5",
          "san": "a5",
          "reasonItIsTempting": "a5 is legal and pursues a nearby plan.",
          "whyItFails": "a5 leaves the bounded race score 60 points worse and does not match: creates a passed pawn on d5."
        }
      ]
    },
    "pedagogy": {
      "concept": "passed_pawn_creation",
      "subConcept": "promotion_tempo",
      "difficultyBand": "easy",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "d5 changes the pawn race because creates a passed pawn on d5. Before the move the passers are d4, e4; after it they are d5, e4. A four-ply capture search prefers the line d4d5 e4e3 d5d6 e3e2.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "h4 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on d5.",
          "a5 leaves the bounded race score 60 points worse and does not match: creates a passed pawn on d5."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "d5",
          "from": "d4",
          "to": "d5",
          "beforeTags": [
            "passed:d4",
            "passed:e4",
            "protected:e4",
            "open:b",
            "open:c",
            "open:g",
            "locked:f4"
          ],
          "afterTags": [
            "passed:d5",
            "passed:e4",
            "protected:e4",
            "open:b",
            "open:c",
            "open:g",
            "locked:f4"
          ],
          "createdPassedPawn": "d5",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "c5",
            "e5"
          ],
          "improvedSquares": [
            "c6",
            "e6"
          ],
          "changedFiles": [
            "d"
          ],
          "summary": "creates a passed pawn on d5",
          "meaningful": true
        },
        "beforePassers": [
          "d4",
          "e4"
        ],
        "afterPassers": [
          "d5",
          "e4"
        ],
        "searchDepth": 4,
        "bestScore": -40,
        "alternativeScores": [
          -72,
          -100
        ],
        "principalVariation": [
          "d4d5",
          "e4e3",
          "d5d6",
          "e3e2"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/pk6/7p/5p2/P2PpP2/7P/7K/8 w - -|d4d5|passed_pawn_creation",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-pawn_wars-bc6cdecd",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-50",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "k7/5p2/3p4/8/1P6/8/5P1K/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "b4b5",
      "san": "b5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "f2f3",
        "f2f4",
        "h2g3",
        "h2h3",
        "h2h1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "f2f4",
          "san": "f4",
          "reasonItIsTempting": "f4 is legal and pursues a nearby plan.",
          "whyItFails": "f4 leaves the bounded race score 16 points worse and does not match: creates a passed pawn on b5."
        },
        {
          "moveUci": "f2f3",
          "san": "f3",
          "reasonItIsTempting": "f3 is legal and pursues a nearby plan.",
          "whyItFails": "f3 leaves the bounded race score 48 points worse and does not match: creates a passed pawn on b5."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "promotion_tempo",
      "difficultyBand": "medium",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "b5 changes the pawn race because creates a passed pawn on b5. Before the move the passers are b4, d6; after it they are b5, d6. A four-ply capture search prefers the line b4b5 f7f5 b5b6 f5f4.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "f4 leaves the bounded race score 16 points worse and does not match: creates a passed pawn on b5.",
          "f3 leaves the bounded race score 48 points worse and does not match: creates a passed pawn on b5."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "b5",
          "from": "b4",
          "to": "b5",
          "beforeTags": [
            "passed:b4",
            "passed:d6",
            "outside:b4",
            "outside:d6",
            "open:a",
            "open:c",
            "open:e",
            "open:g",
            "open:h"
          ],
          "afterTags": [
            "passed:b5",
            "passed:d6",
            "outside:b5",
            "outside:d6",
            "open:a",
            "open:c",
            "open:e",
            "open:g",
            "open:h"
          ],
          "createdPassedPawn": "b5",
          "createdOutsidePasser": "b5",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "a5",
            "c5"
          ],
          "improvedSquares": [
            "a6",
            "c6"
          ],
          "changedFiles": [
            "b"
          ],
          "summary": "creates a passed pawn on b5",
          "meaningful": true
        },
        "beforePassers": [
          "b4",
          "d6"
        ],
        "afterPassers": [
          "b5",
          "d6"
        ],
        "searchDepth": 4,
        "bestScore": 48,
        "alternativeScores": [
          32,
          0
        ],
        "principalVariation": [
          "b4b5",
          "f7f5",
          "b5b6",
          "f5f4"
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
      "score": 90,
      "noveltyKey": "pawn_wars|k7/5p2/3p4/8/1P6/8/5P1K/8 w - -|b4b5|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-pawn_wars-74351bde",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-52",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/pp5k/8/p4P2/1P6/6P1/1K6/8 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 8,
      "pawnCount": 6
    },
    "solution": {
      "primaryMoveUci": "b4a5",
      "san": "bxa5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "f5f6",
        "b4b5",
        "g3g4",
        "b2a3",
        "b2b3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b4b5",
          "san": "b5",
          "reasonItIsTempting": "b5 is legal and pursues a nearby plan.",
          "whyItFails": "b5 leaves the bounded race score 156 points worse and does not match: no verified structural transformation."
        },
        {
          "moveUci": "f5f6",
          "san": "f6",
          "reasonItIsTempting": "f6 is legal and pursues a nearby plan.",
          "whyItFails": "f6 leaves the bounded race score 256 points worse and does not match: no verified structural transformation."
        },
        {
          "moveUci": "g3g4",
          "san": "g4",
          "reasonItIsTempting": "g4 is legal and pursues a nearby plan.",
          "whyItFails": "g4 leaves the bounded race score 304 points worse and does not match: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "breakthrough",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "hard",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "bxa5 changes the pawn race because no verified structural transformation. Before the move the passers are g3, f5; after it they are g3, f5. A four-ply capture search prefers the line b4a5 b7b5 a5a6 b5b4.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "b5 leaves the bounded race score 156 points worse and does not match: no verified structural transformation.",
          "f6 leaves the bounded race score 256 points worse and does not match: no verified structural transformation.",
          "g4 leaves the bounded race score 304 points worse and does not match: no verified structural transformation."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "a5",
          "from": "b4",
          "to": "a5",
          "capture": "a5",
          "beforeTags": [
            "passed:g3",
            "passed:f5",
            "outside:g3",
            "outside:f5",
            "open:c",
            "open:d",
            "open:e",
            "open:h"
          ],
          "afterTags": [
            "passed:g3",
            "passed:f5",
            "outside:g3",
            "outside:f5",
            "open:c",
            "open:d",
            "open:e",
            "open:h"
          ],
          "openedFiles": [],
          "halfOpenedFiles": [
            "b"
          ],
          "openedDiagonals": [
            "b4"
          ],
          "newlyWeakSquares": [
            "a5",
            "c5"
          ],
          "improvedSquares": [
            "b6"
          ],
          "changedFiles": [
            "b",
            "a"
          ],
          "summary": "no verified structural transformation",
          "meaningful": true
        },
        "beforePassers": [
          "g3",
          "f5"
        ],
        "afterPassers": [
          "g3",
          "f5"
        ],
        "searchDepth": 4,
        "bestScore": 236,
        "alternativeScores": [
          80,
          -20,
          -68
        ],
        "principalVariation": [
          "b4a5",
          "b7b5",
          "a5a6",
          "b5b4"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/pp5k/8/p4P2/1P6/6P1/1K6/8 w - -|b4a5|breakthrough",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-pawn_wars-40c82bad",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-53",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "1k6/8/3p4/1p6/Pp6/5P2/5P2/6K1 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 8,
      "pawnCount": 6
    },
    "solution": {
      "primaryMoveUci": "b5a4",
      "san": "bxa4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b8c8",
        "b8c7",
        "b8b7",
        "b8a7",
        "b8a8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b4b3",
          "san": "b3",
          "reasonItIsTempting": "b3 is legal and pursues a nearby plan.",
          "whyItFails": "b3 leaves the bounded race score 264 points worse and does not match: creates a passed pawn on a4."
        },
        {
          "moveUci": "d6d5",
          "san": "d5",
          "reasonItIsTempting": "d5 is legal and pursues a nearby plan.",
          "whyItFails": "d5 leaves the bounded race score 312 points worse and does not match: creates a passed pawn on a4."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "expert",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "bxa4 changes the pawn race because creates a passed pawn on a4. Before the move the passers are f2, f3, b4, d6; after it they are f2, f3, a4, b4, d6. A four-ply capture search prefers the line b5a4 f3f4 a4a3 f4f5.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "b3 leaves the bounded race score 264 points worse and does not match: creates a passed pawn on a4.",
          "d5 leaves the bounded race score 312 points worse and does not match: creates a passed pawn on a4."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "a4",
          "from": "b5",
          "to": "a4",
          "capture": "a4",
          "beforeTags": [
            "passed:f2",
            "passed:f3",
            "passed:b4",
            "passed:d6",
            "outside:f2",
            "outside:f3",
            "outside:d6",
            "open:c",
            "open:e",
            "open:g",
            "open:h"
          ],
          "afterTags": [
            "passed:f2",
            "passed:f3",
            "passed:a4",
            "passed:b4",
            "passed:d6",
            "outside:f2",
            "outside:f3",
            "outside:a4",
            "outside:b4",
            "outside:d6",
            "open:c",
            "open:e",
            "open:g",
            "open:h"
          ],
          "createdPassedPawn": "a4",
          "createdOutsidePasser": "a4",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [
            "b5"
          ],
          "newlyWeakSquares": [
            "a4",
            "c4"
          ],
          "improvedSquares": [
            "b3"
          ],
          "changedFiles": [
            "b",
            "a"
          ],
          "summary": "creates a passed pawn on a4",
          "meaningful": true
        },
        "beforePassers": [
          "f2",
          "f3",
          "b4",
          "d6"
        ],
        "afterPassers": [
          "f2",
          "f3",
          "a4",
          "b4",
          "d6"
        ],
        "searchDepth": 4,
        "bestScore": 236,
        "alternativeScores": [
          -28,
          -76
        ],
        "principalVariation": [
          "b5a4",
          "f3f4",
          "a4a3",
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
      "score": 90,
      "noveltyKey": "pawn_wars|1k6/8/3p4/1p6/Pp6/5P2/5P2/6K1 b - -|b5a4|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-pawn_wars-02b1a194",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-55",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "1k6/1p6/2p5/2P1p3/8/8/P5P1/K7 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 8,
      "pawnCount": 6
    },
    "solution": {
      "primaryMoveUci": "e5e4",
      "san": "e4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b8c8",
        "b8c7",
        "b8a7",
        "b8a8",
        "b7b6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b7b6",
          "san": "b6",
          "reasonItIsTempting": "b6 is legal and pursues a nearby plan.",
          "whyItFails": "b6 leaves the bounded race score 212 points worse and does not match: creates a passed pawn on e4."
        },
        {
          "moveUci": "b7b5",
          "san": "b5",
          "reasonItIsTempting": "b5 is legal and pursues a nearby plan.",
          "whyItFails": "b5 leaves the bounded race score 212 points worse and does not match: creates a passed pawn on e4."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "promotion_tempo",
      "difficultyBand": "intro",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "e4 changes the pawn race because creates a passed pawn on e4. Before the move the passers are g2, e5; after it they are g2, e4. A four-ply capture search prefers the line e5e4 a2a4 e4e3 a4a5.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "b6 leaves the bounded race score 212 points worse and does not match: creates a passed pawn on e4.",
          "b5 leaves the bounded race score 212 points worse and does not match: creates a passed pawn on e4."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "e4",
          "from": "e5",
          "to": "e4",
          "beforeTags": [
            "passed:g2",
            "passed:e5",
            "outside:g2",
            "outside:e5",
            "open:d",
            "open:f",
            "open:h",
            "locked:c5"
          ],
          "afterTags": [
            "passed:g2",
            "passed:e4",
            "outside:g2",
            "outside:e4",
            "open:d",
            "open:f",
            "open:h",
            "locked:c5"
          ],
          "createdPassedPawn": "e4",
          "createdOutsidePasser": "e4",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "d4",
            "f4"
          ],
          "improvedSquares": [
            "d3",
            "f3"
          ],
          "changedFiles": [
            "e"
          ],
          "summary": "creates a passed pawn on e4",
          "meaningful": true
        },
        "beforePassers": [
          "g2",
          "e5"
        ],
        "afterPassers": [
          "g2",
          "e4"
        ],
        "searchDepth": 4,
        "bestScore": -8,
        "alternativeScores": [
          -220,
          -220
        ],
        "principalVariation": [
          "e5e4",
          "a2a4",
          "e4e3",
          "a4a5"
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
      "score": 90,
      "noveltyKey": "pawn_wars|1k6/1p6/2p5/2P1p3/8/8/P5P1/K7 b - -|e5e4|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-pawn_wars-c7202fe6",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-60",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "k7/8/7p/1P1p4/2P5/8/7K/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "d5c4",
      "san": "dxc4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a8b8",
        "a8b7",
        "a8a7",
        "h6h5",
        "d5d4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d5d4",
          "san": "d4",
          "reasonItIsTempting": "d4 is legal and pursues a nearby plan.",
          "whyItFails": "d4 leaves the bounded race score 148 points worse and does not match: creates a passed pawn on c4; opens the d file."
        },
        {
          "moveUci": "h6h5",
          "san": "h5",
          "reasonItIsTempting": "h5 is legal and pursues a nearby plan.",
          "whyItFails": "h5 leaves the bounded race score 280 points worse and does not match: creates a passed pawn on c4; opens the d file."
        }
      ]
    },
    "pedagogy": {
      "concept": "passed_pawn_creation",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "easy",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "dxc4 changes the pawn race because creates a passed pawn on c4; opens the d file. Before the move the passers are b5, h6; after it they are b5, c4, h6. A four-ply capture search prefers the line d5c4 b5b6 a8b7 h2g3.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "d4 leaves the bounded race score 148 points worse and does not match: creates a passed pawn on c4; opens the d file.",
          "h5 leaves the bounded race score 280 points worse and does not match: creates a passed pawn on c4; opens the d file."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "c4",
          "from": "d5",
          "to": "c4",
          "capture": "c4",
          "beforeTags": [
            "passed:b5",
            "passed:h6",
            "protected:b5",
            "outside:b5",
            "outside:h6",
            "open:a",
            "open:e",
            "open:f",
            "open:g"
          ],
          "afterTags": [
            "passed:b5",
            "passed:c4",
            "passed:h6",
            "outside:h6",
            "open:a",
            "open:d",
            "open:e",
            "open:f",
            "open:g"
          ],
          "createdPassedPawn": "c4",
          "openedFiles": [
            "d"
          ],
          "halfOpenedFiles": [],
          "openedDiagonals": [
            "d5"
          ],
          "newlyWeakSquares": [
            "c4",
            "e4"
          ],
          "improvedSquares": [
            "b3",
            "d3"
          ],
          "changedFiles": [
            "d",
            "c"
          ],
          "summary": "creates a passed pawn on c4; opens the d file",
          "meaningful": true
        },
        "beforePassers": [
          "b5",
          "h6"
        ],
        "afterPassers": [
          "b5",
          "c4",
          "h6"
        ],
        "searchDepth": 4,
        "bestScore": 52,
        "alternativeScores": [
          -96,
          -228
        ],
        "principalVariation": [
          "d5c4",
          "b5b6",
          "a8b7",
          "h2g3"
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
      "score": 90,
      "noveltyKey": "pawn_wars|k7/8/7p/1P1p4/2P5/8/7K/8 b - -|d5c4|passed_pawn_creation",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-pawn_wars-b5847c04",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-63",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/2p4k/8/8/p7/6P1/3P4/6K1 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "a4a3",
      "san": "a3",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "c7c6",
        "c7c5",
        "h7g8",
        "h7h8",
        "h7h6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c7c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on a3."
        },
        {
          "moveUci": "c7c6",
          "san": "c6",
          "reasonItIsTempting": "c6 is legal and pursues a nearby plan.",
          "whyItFails": "c6 leaves the bounded race score 64 points worse and does not match: creates a passed pawn on a3."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "promotion_tempo",
      "difficultyBand": "medium",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "a3 changes the pawn race because creates a passed pawn on a3. Before the move the passers are g3, a4; after it they are g3, a3. A four-ply capture search prefers the line a4a3 d2d4 a3a2 d4d5.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "c5 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on a3.",
          "c6 leaves the bounded race score 64 points worse and does not match: creates a passed pawn on a3."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "a3",
          "from": "a4",
          "to": "a3",
          "beforeTags": [
            "passed:g3",
            "passed:a4",
            "outside:g3",
            "outside:a4",
            "open:b",
            "open:e",
            "open:f",
            "open:h"
          ],
          "afterTags": [
            "passed:g3",
            "passed:a3",
            "outside:g3",
            "outside:a3",
            "open:b",
            "open:e",
            "open:f",
            "open:h"
          ],
          "createdPassedPawn": "a3",
          "createdOutsidePasser": "a3",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "b3"
          ],
          "improvedSquares": [
            "b2"
          ],
          "changedFiles": [
            "a"
          ],
          "summary": "creates a passed pawn on a3",
          "meaningful": true
        },
        "beforePassers": [
          "g3",
          "a4"
        ],
        "afterPassers": [
          "g3",
          "a3"
        ],
        "searchDepth": 4,
        "bestScore": 120,
        "alternativeScores": [
          88,
          56
        ],
        "principalVariation": [
          "a4a3",
          "d2d4",
          "a3a2",
          "d4d5"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/2p4k/8/8/p7/6P1/3P4/6K1 b - -|a4a3|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-pawn_wars-9a6347dc",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-67",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "7k/8/8/1p2p3/2p1P1P1/5P2/6K1/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 8,
      "pawnCount": 6
    },
    "solution": {
      "primaryMoveUci": "c4c3",
      "san": "c3",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "h8h7",
        "h8g7",
        "h8g8",
        "b5b4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b5b4",
          "san": "b4",
          "reasonItIsTempting": "b4 is legal and pursues a nearby plan.",
          "whyItFails": "b4 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on c3."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "promotion_tempo",
      "difficultyBand": "hard",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "c3 changes the pawn race because creates a passed pawn on c3. Before the move the passers are g4, c4, b5; after it they are g4, c3, b5. A four-ply capture search prefers the line c4c3 g4g5 c3c2 g5g6.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "b4 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on c3."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "c3",
          "from": "c4",
          "to": "c3",
          "beforeTags": [
            "passed:g4",
            "passed:c4",
            "passed:b5",
            "protected:g4",
            "protected:c4",
            "outside:g4",
            "outside:c4",
            "outside:b5",
            "open:a",
            "open:d",
            "open:h",
            "locked:e4"
          ],
          "afterTags": [
            "passed:g4",
            "passed:c3",
            "passed:b5",
            "protected:g4",
            "outside:g4",
            "outside:c3",
            "outside:b5",
            "open:a",
            "open:d",
            "open:h",
            "locked:e4"
          ],
          "createdPassedPawn": "c3",
          "createdOutsidePasser": "c3",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "b3",
            "d3"
          ],
          "improvedSquares": [
            "b2",
            "d2"
          ],
          "changedFiles": [
            "c"
          ],
          "summary": "creates a passed pawn on c3",
          "meaningful": true
        },
        "beforePassers": [
          "g4",
          "c4",
          "b5"
        ],
        "afterPassers": [
          "g4",
          "c3",
          "b5"
        ],
        "searchDepth": 4,
        "bestScore": 96,
        "alternativeScores": [
          64
        ],
        "principalVariation": [
          "c4c3",
          "g4g5",
          "c3c2",
          "g5g6"
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
      "score": 90,
      "noveltyKey": "pawn_wars|7k/8/8/1p2p3/2p1P1P1/5P2/6K1/8 b - -|c4c3|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-pawn_wars-78e89073",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-69",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "7k/3p4/8/8/P1p5/3P4/6K1/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "c4d3",
      "san": "cxd3",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "h8h7",
        "h8g7",
        "h8g8",
        "d7d6",
        "d7d5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c4c3",
          "san": "c3",
          "reasonItIsTempting": "c3 is legal and pursues a nearby plan.",
          "whyItFails": "c3 leaves the bounded race score 108 points worse and does not match: creates a passed pawn on d3; opens the c file."
        },
        {
          "moveUci": "d7d5",
          "san": "d5",
          "reasonItIsTempting": "d5 is legal and pursues a nearby plan.",
          "whyItFails": "d5 leaves the bounded race score 172 points worse and does not match: creates a passed pawn on d3; opens the c file."
        },
        {
          "moveUci": "d7d6",
          "san": "d6",
          "reasonItIsTempting": "d6 is legal and pursues a nearby plan.",
          "whyItFails": "d6 leaves the bounded race score 368 points worse and does not match: creates a passed pawn on d3; opens the c file."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "expert",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "cxd3 changes the pawn race because creates a passed pawn on d3; opens the c file. Before the move the passers are a4; after it they are a4, d3, d7. A four-ply capture search prefers the line c4d3 a4a5 d3d2 a5a6.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "c3 leaves the bounded race score 108 points worse and does not match: creates a passed pawn on d3; opens the c file.",
          "d5 leaves the bounded race score 172 points worse and does not match: creates a passed pawn on d3; opens the c file.",
          "d6 leaves the bounded race score 368 points worse and does not match: creates a passed pawn on d3; opens the c file."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "d3",
          "from": "c4",
          "to": "d3",
          "capture": "d3",
          "beforeTags": [
            "passed:a4",
            "outside:a4",
            "open:b",
            "open:e",
            "open:f",
            "open:g",
            "open:h"
          ],
          "afterTags": [
            "passed:a4",
            "passed:d3",
            "passed:d7",
            "outside:a4",
            "outside:d3",
            "outside:d7",
            "open:b",
            "open:c",
            "open:e",
            "open:f",
            "open:g",
            "open:h"
          ],
          "createdPassedPawn": "d3",
          "createdOutsidePasser": "d3",
          "openedFiles": [
            "c"
          ],
          "halfOpenedFiles": [
            "d"
          ],
          "openedDiagonals": [
            "c4"
          ],
          "newlyWeakSquares": [
            "b3",
            "d3"
          ],
          "improvedSquares": [
            "c2",
            "e2"
          ],
          "changedFiles": [
            "c",
            "d"
          ],
          "summary": "creates a passed pawn on d3; opens the c file",
          "meaningful": true
        },
        "beforePassers": [
          "a4"
        ],
        "afterPassers": [
          "a4",
          "d3",
          "d7"
        ],
        "searchDepth": 4,
        "bestScore": 172,
        "alternativeScores": [
          64,
          0,
          -196
        ],
        "principalVariation": [
          "c4d3",
          "a4a5",
          "d3d2",
          "a5a6"
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
      "score": 90,
      "noveltyKey": "pawn_wars|7k/3p4/8/8/P1p5/3P4/6K1/8 b - -|c4d3|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-pawn_wars-b4e05dfb",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-70",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/7k/8/4p2p/1P6/7P/8/K7 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "b4b5",
      "san": "b5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "h3h4",
        "a1a2",
        "a1b2",
        "a1b1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h3h4",
          "san": "h4",
          "reasonItIsTempting": "h4 is legal and pursues a nearby plan.",
          "whyItFails": "h4 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on b5."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "promotion_tempo",
      "difficultyBand": "intro",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "b5 changes the pawn race because creates a passed pawn on b5. Before the move the passers are b4, e5; after it they are b5, e5. A four-ply capture search prefers the line b4b5 e5e4 b5b6 e4e3.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "h4 leaves the bounded race score 32 points worse and does not match: creates a passed pawn on b5."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "b5",
          "from": "b4",
          "to": "b5",
          "beforeTags": [
            "passed:b4",
            "passed:e5",
            "outside:b4",
            "outside:e5",
            "open:a",
            "open:c",
            "open:d",
            "open:f",
            "open:g"
          ],
          "afterTags": [
            "passed:b5",
            "passed:e5",
            "outside:b5",
            "outside:e5",
            "open:a",
            "open:c",
            "open:d",
            "open:f",
            "open:g"
          ],
          "createdPassedPawn": "b5",
          "createdOutsidePasser": "b5",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "a5",
            "c5"
          ],
          "improvedSquares": [
            "a6",
            "c6"
          ],
          "changedFiles": [
            "b"
          ],
          "summary": "creates a passed pawn on b5",
          "meaningful": true
        },
        "beforePassers": [
          "b4",
          "e5"
        ],
        "afterPassers": [
          "b5",
          "e5"
        ],
        "searchDepth": 4,
        "bestScore": -24,
        "alternativeScores": [
          -56
        ],
        "principalVariation": [
          "b4b5",
          "e5e4",
          "b5b6",
          "e4e3"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/7k/8/4p2p/1P6/7P/8/K7 w - -|b4b5|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-pawn_wars-4b6f7f91",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-72",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "7k/8/1pp5/2p4P/1P6/7P/1K6/8 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p3n0b0r0q0|b:p3n0b0r0q0",
      "pieceCount": 8,
      "pawnCount": 6
    },
    "solution": {
      "primaryMoveUci": "c5b4",
      "san": "cxb4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "h8h7",
        "h8g7",
        "h8g8",
        "b6b5",
        "c5c4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c5c4",
          "san": "c4",
          "reasonItIsTempting": "c4 is legal and pursues a nearby plan.",
          "whyItFails": "c4 leaves the bounded race score 148 points worse and does not match: creates a passed pawn on b4."
        },
        {
          "moveUci": "b6b5",
          "san": "b5",
          "reasonItIsTempting": "b5 is legal and pursues a nearby plan.",
          "whyItFails": "b5 leaves the bounded race score 256 points worse and does not match: creates a passed pawn on b4."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "easy",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "cxb4 changes the pawn race because creates a passed pawn on b4. Before the move the passers are h3, h5; after it they are h3, h5, b4, b6, c6. A four-ply capture search prefers the line c5b4 h5h6 h8h7 h3h4.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "c4 leaves the bounded race score 148 points worse and does not match: creates a passed pawn on b4.",
          "b5 leaves the bounded race score 256 points worse and does not match: creates a passed pawn on b4."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "b4",
          "from": "c5",
          "to": "b4",
          "capture": "b4",
          "beforeTags": [
            "passed:h3",
            "passed:h5",
            "outside:h3",
            "outside:h5",
            "open:a",
            "open:d",
            "open:e",
            "open:f",
            "open:g"
          ],
          "afterTags": [
            "passed:h3",
            "passed:h5",
            "passed:b4",
            "passed:b6",
            "passed:c6",
            "outside:h3",
            "outside:h5",
            "outside:b4",
            "outside:b6",
            "outside:c6",
            "open:a",
            "open:d",
            "open:e",
            "open:f",
            "open:g"
          ],
          "createdPassedPawn": "b4",
          "createdOutsidePasser": "b4",
          "openedFiles": [],
          "halfOpenedFiles": [
            "b"
          ],
          "openedDiagonals": [
            "c5"
          ],
          "newlyWeakSquares": [
            "b4",
            "d4"
          ],
          "improvedSquares": [
            "a3",
            "c3"
          ],
          "changedFiles": [
            "c",
            "b"
          ],
          "summary": "creates a passed pawn on b4",
          "meaningful": true
        },
        "beforePassers": [
          "h3",
          "h5"
        ],
        "afterPassers": [
          "h3",
          "h5",
          "b4",
          "b6",
          "c6"
        ],
        "searchDepth": 4,
        "bestScore": 28,
        "alternativeScores": [
          -120,
          -228
        ],
        "principalVariation": [
          "c5b4",
          "h5h6",
          "h8h7",
          "h3h4"
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
      "score": 90,
      "noveltyKey": "pawn_wars|7k/8/1pp5/2p4P/1P6/7P/1K6/8 b - -|c5b4|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-pawn_wars-6a48d7a0",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-74",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "k7/4p3/8/pP2P3/5pp1/6P1/5P2/K7 w - - 0 1",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "endgame",
      "materialSignature": "w:p4n0b0r0q0|b:p4n0b0r0q0",
      "pieceCount": 10,
      "pawnCount": 8
    },
    "solution": {
      "primaryMoveUci": "g3f4",
      "san": "gxf4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b5b6",
        "e5e6",
        "f2f3",
        "a1a2",
        "a1b2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b5b6",
          "san": "b6",
          "reasonItIsTempting": "b6 is legal and pursues a nearby plan.",
          "whyItFails": "b6 leaves the bounded race score 140 points worse and does not match: no verified structural transformation."
        },
        {
          "moveUci": "e5e6",
          "san": "e6",
          "reasonItIsTempting": "e6 is legal and pursues a nearby plan.",
          "whyItFails": "e6 leaves the bounded race score 140 points worse and does not match: no verified structural transformation."
        },
        {
          "moveUci": "f2f3",
          "san": "f3",
          "reasonItIsTempting": "f3 is legal and pursues a nearby plan.",
          "whyItFails": "f3 leaves the bounded race score 188 points worse and does not match: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "breakthrough",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "medium",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "gxf4 changes the pawn race because no verified structural transformation. Before the move the passers are b5, a5; after it they are b5, a5. A four-ply capture search prefers the line g3f4 a5a4 b5b6 a4a3.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "b6 leaves the bounded race score 140 points worse and does not match: no verified structural transformation.",
          "e6 leaves the bounded race score 140 points worse and does not match: no verified structural transformation.",
          "f3 leaves the bounded race score 188 points worse and does not match: no verified structural transformation."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "f4",
          "from": "g3",
          "to": "f4",
          "capture": "f4",
          "beforeTags": [
            "passed:b5",
            "passed:a5",
            "open:c",
            "open:d",
            "open:h"
          ],
          "afterTags": [
            "passed:b5",
            "passed:a5",
            "open:c",
            "open:d",
            "open:h"
          ],
          "openedFiles": [],
          "halfOpenedFiles": [
            "g",
            "f"
          ],
          "openedDiagonals": [
            "g3"
          ],
          "newlyWeakSquares": [
            "f4",
            "h4"
          ],
          "improvedSquares": [
            "e5",
            "g5"
          ],
          "changedFiles": [
            "g",
            "f"
          ],
          "summary": "no verified structural transformation",
          "meaningful": true
        },
        "beforePassers": [
          "b5",
          "a5"
        ],
        "afterPassers": [
          "b5",
          "a5"
        ],
        "searchDepth": 4,
        "bestScore": 132,
        "alternativeScores": [
          -8,
          -8,
          -56
        ],
        "principalVariation": [
          "g3f4",
          "a5a4",
          "b5b6",
          "a4a3"
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
      "score": 90,
      "noveltyKey": "pawn_wars|k7/4p3/8/pP2P3/5pp1/6P1/5P2/K7 w - -|g3f4|breakthrough",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-pawn_wars-6ef6fb64",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-78",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "7k/8/2p5/8/1P1p4/2P5/8/K7 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "d4c3",
      "san": "dxc3",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "h8h7",
        "h8g7",
        "h8g8",
        "c6c5",
        "d4d3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d4d3",
          "san": "d3",
          "reasonItIsTempting": "d3 is legal and pursues a nearby plan.",
          "whyItFails": "d3 leaves the bounded race score 60 points worse and does not match: creates a passed pawn on c3; opens the d file."
        },
        {
          "moveUci": "c6c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 leaves the bounded race score 164 points worse and does not match: creates a passed pawn on c3; opens the d file."
        }
      ]
    },
    "pedagogy": {
      "concept": "passed_pawn_creation",
      "subConcept": "decoy_capture_tree",
      "difficultyBand": "hard",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "dxc3 changes the pawn race because creates a passed pawn on c3; opens the d file. Before the move the passers are none; after it they are c3. A four-ply capture search prefers the line d4c3 a1b1 h8h7 b4b5.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "d3 leaves the bounded race score 60 points worse and does not match: creates a passed pawn on c3; opens the d file.",
          "c5 leaves the bounded race score 164 points worse and does not match: creates a passed pawn on c3; opens the d file."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "c3",
          "from": "d4",
          "to": "c3",
          "capture": "c3",
          "beforeTags": [
            "open:a",
            "open:e",
            "open:f",
            "open:g",
            "open:h"
          ],
          "afterTags": [
            "passed:c3",
            "open:a",
            "open:d",
            "open:e",
            "open:f",
            "open:g",
            "open:h"
          ],
          "createdPassedPawn": "c3",
          "openedFiles": [
            "d"
          ],
          "halfOpenedFiles": [
            "c"
          ],
          "openedDiagonals": [
            "d4"
          ],
          "newlyWeakSquares": [
            "c3",
            "e3"
          ],
          "improvedSquares": [
            "b2",
            "d2"
          ],
          "changedFiles": [
            "d",
            "c"
          ],
          "summary": "creates a passed pawn on c3; opens the d file",
          "meaningful": true
        },
        "beforePassers": [],
        "afterPassers": [
          "c3"
        ],
        "searchDepth": 4,
        "bestScore": 164,
        "alternativeScores": [
          104,
          0
        ],
        "principalVariation": [
          "d4c3",
          "a1b1",
          "h8h7",
          "b4b5"
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
      "score": 90,
      "noveltyKey": "pawn_wars|7k/8/2p5/8/1P1p4/2P5/8/K7 b - -|d4c3|passed_pawn_creation",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-pawn_wars-c694922a",
    "miniGameId": "pawn_wars",
    "version": "stage8m.v1",
    "source": {
      "kind": "procedural",
      "sourceId": "procedural-83",
      "seed": "stage-8m-plus:pawn_wars",
      "generatorId": "pawnWarsGenerator"
    },
    "board": {
      "fen": "8/1kp5/8/3p4/P6P/8/8/1K6 b - - 0 1",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "endgame",
      "materialSignature": "w:p2n0b0r0q0|b:p2n0b0r0q0",
      "pieceCount": 6,
      "pawnCount": 4
    },
    "solution": {
      "primaryMoveUci": "d5d4",
      "san": "d4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b7a8",
        "b7b8",
        "b7c8",
        "b7c6",
        "b7b6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c7c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 leaves the bounded race score 24 points worse and does not match: creates a passed pawn on d4."
        },
        {
          "moveUci": "c7c6",
          "san": "c6",
          "reasonItIsTempting": "c6 is legal and pursues a nearby plan.",
          "whyItFails": "c6 leaves the bounded race score 48 points worse and does not match: creates a passed pawn on d4."
        }
      ]
    },
    "pedagogy": {
      "concept": "outside_passer",
      "subConcept": "promotion_tempo",
      "difficultyBand": "expert",
      "prompt": "Choose the pawn move that changes the race.",
      "lessonObjective": "Choose the pawn move that changes the race.",
      "transferPattern": "Breakthroughs work when every capture response creates a passer or loses the promotion race.",
      "explanation": {
        "short": "Choose the pawn move that changes the race.",
        "detailed": "d4 changes the pawn race because creates a passed pawn on d4. Before the move the passers are a4, h4, d5, c7; after it they are a4, h4, d4, c7. A four-ply capture search prefers the line d5d4 a4a5 d4d3 a5a6.",
        "coachNote": "Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.",
        "whyAlternativesFail": [
          "c5 leaves the bounded race score 24 points worse and does not match: creates a passed pawn on d4.",
          "c6 leaves the bounded race score 48 points worse and does not match: creates a passed pawn on d4."
        ]
      },
      "proof": {
        "delta": {
          "movedPawn": "d4",
          "from": "d5",
          "to": "d4",
          "beforeTags": [
            "passed:a4",
            "passed:h4",
            "passed:d5",
            "passed:c7",
            "outside:a4",
            "outside:h4",
            "outside:d5",
            "outside:c7",
            "open:b",
            "open:e",
            "open:f",
            "open:g"
          ],
          "afterTags": [
            "passed:a4",
            "passed:h4",
            "passed:d4",
            "passed:c7",
            "outside:a4",
            "outside:h4",
            "outside:d4",
            "outside:c7",
            "open:b",
            "open:e",
            "open:f",
            "open:g"
          ],
          "createdPassedPawn": "d4",
          "createdOutsidePasser": "d4",
          "openedFiles": [],
          "halfOpenedFiles": [],
          "openedDiagonals": [],
          "newlyWeakSquares": [
            "c4",
            "e4"
          ],
          "improvedSquares": [
            "c3",
            "e3"
          ],
          "changedFiles": [
            "d"
          ],
          "summary": "creates a passed pawn on d4",
          "meaningful": true
        },
        "beforePassers": [
          "a4",
          "h4",
          "d5",
          "c7"
        ],
        "afterPassers": [
          "a4",
          "h4",
          "d4",
          "c7"
        ],
        "searchDepth": 4,
        "bestScore": -32,
        "alternativeScores": [
          -56,
          -80
        ],
        "principalVariation": [
          "d5d4",
          "a4a5",
          "d4d3",
          "a5a6"
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
      "score": 90,
      "noveltyKey": "pawn_wars|8/1kp5/8/3p4/P6P/8/8/1K6 b - -|d5d4|outside_passer",
      "densityScore": 88,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  }
];
