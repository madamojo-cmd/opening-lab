import type { Stage8MScenario } from '../../../../tools/stage8m/types';

export const STAGE8M_KEY_SQUARE_CONQUEST_SCENARIOS: Stage8MScenario[] = [
  {
    "id": "stage8m-key_square_conquest-430c9728",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "4c6d9204879d2b4a36734df2734311d569ccfc16",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "r2qkb1r/pbpppp1p/n4n2/3N2p1/1p5P/2P3PB/PP1PPP1N/R1BQK2R b KQkq - 0 8",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "a6c5",
      "san": "Nc5",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8b8",
        "a8c8",
        "d8c8",
        "d8b8",
        "f8g7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8b8",
          "san": "Rb8",
          "reasonItIsTempting": "Rb8 is legal and pursues a nearby plan.",
          "whyItFails": "Rb8 does not create the verified before/after feature: durable occupation of c5."
        },
        {
          "moveUci": "a8c8",
          "san": "Rc8",
          "reasonItIsTempting": "Rc8 is legal and pursues a nearby plan.",
          "whyItFails": "Rc8 does not create the verified before/after feature: durable occupation of c5."
        },
        {
          "moveUci": "d8c8",
          "san": "Qc8",
          "reasonItIsTempting": "Qc8 is legal and pursues a nearby plan.",
          "whyItFails": "Qc8 does not create the verified before/after feature: durable occupation of c5."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "intro",
      "prompt": "Claim the durable square c5.",
      "lessonObjective": "Claim the durable square c5.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square c5.",
        "detailed": "Nc5 claims c5 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From c5, the piece reaches e4, d3, b3, a4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Rb8 does not create the verified before/after feature: durable occupation of c5.",
          "Rc8 does not create the verified before/after feature: durable occupation of c5.",
          "Qc8 does not create the verified before/after feature: durable occupation of c5."
        ]
      },
      "proof": {
        "targetSquare": "c5",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "e4",
          "d3",
          "b3",
          "a4"
        ],
        "strategicPurpose": "c5 creates access to e4, d3, b3"
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
      "noveltyKey": "key_square_conquest|r2qkb1r/pbpppp1p/n4n2/3N2p1/1p5P/2P3PB/PP1PPP1N/R1BQK2R b KQkq -|a6c5|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-key_square_conquest-1e93241d",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "8c6318c2cfdde46c7496f081f10801a92226bf22",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "nimzo-indian-black"
    },
    "board": {
      "fen": "rnbq1rk1/p1ppppbp/5np1/1p6/1Q1P2P1/7P/PPP1PP2/RNB1KBNR w KQ - 1 6",
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
        "b4a5",
        "b4b5",
        "b4c5",
        "b4d6",
        "b4e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b4a5",
          "san": "Qa5",
          "reasonItIsTempting": "Qa5 is legal and pursues a nearby plan.",
          "whyItFails": "Qa5 does not create the verified before/after feature: durable occupation of f3."
        },
        {
          "moveUci": "b4b5",
          "san": "Qxb5",
          "reasonItIsTempting": "Qxb5 is legal and pursues a nearby plan.",
          "whyItFails": "Qxb5 does not create the verified before/after feature: durable occupation of f3."
        },
        {
          "moveUci": "b4c5",
          "san": "Qc5",
          "reasonItIsTempting": "Qc5 is legal and pursues a nearby plan.",
          "whyItFails": "Qc5 does not create the verified before/after feature: durable occupation of f3."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "easy",
      "prompt": "Claim the durable square f3.",
      "lessonObjective": "Claim the durable square f3.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square f3.",
        "detailed": "Nf3 claims f3 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From f3, the piece reaches e5, g5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Qa5 does not create the verified before/after feature: durable occupation of f3.",
          "Qxb5 does not create the verified before/after feature: durable occupation of f3.",
          "Qc5 does not create the verified before/after feature: durable occupation of f3."
        ]
      },
      "proof": {
        "targetSquare": "f3",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "e5",
          "g5"
        ],
        "strategicPurpose": "f3 creates access to e5, g5"
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
      "noveltyKey": "key_square_conquest|rnbq1rk1/p1ppppbp/5np1/1p6/1Q1P2P1/7P/PPP1PP2/RNB1KBNR w KQ -|g1f3|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-key_square_conquest-9d545c74",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "05f289f7335ea7bb72895a9422348eb4e2bae64c",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "sicilian-black"
    },
    "board": {
      "fen": "1rbq1b1r/pppkpppp/3p3n/1NP5/3n4/5P2/PP1PPKPP/R1B1QBNR b - - 4 9",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d7c6",
      "san": "Kc6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8a8",
        "d8e8",
        "h8g8",
        "a7a6",
        "a7a5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8a8",
          "san": "Ra8",
          "reasonItIsTempting": "Ra8 is legal and pursues a nearby plan.",
          "whyItFails": "Ra8 does not create the verified before/after feature: durable occupation of c6."
        },
        {
          "moveUci": "d8e8",
          "san": "Qe8",
          "reasonItIsTempting": "Qe8 is legal and pursues a nearby plan.",
          "whyItFails": "Qe8 does not create the verified before/after feature: durable occupation of c6."
        },
        {
          "moveUci": "h8g8",
          "san": "Rg8",
          "reasonItIsTempting": "Rg8 is legal and pursues a nearby plan.",
          "whyItFails": "Rg8 does not create the verified before/after feature: durable occupation of c6."
        }
      ]
    },
    "pedagogy": {
      "concept": "blockade",
      "subConcept": "durable_blockade",
      "difficultyBand": "medium",
      "prompt": "Claim the durable square c6.",
      "lessonObjective": "Claim the durable square c6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square c6.",
        "detailed": "Kc6 claims c6 as a blockade. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From c6, the piece reaches .",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Ra8 does not create the verified before/after feature: durable occupation of c6.",
          "Qe8 does not create the verified before/after feature: durable occupation of c6.",
          "Rg8 does not create the verified before/after feature: durable occupation of c6."
        ]
      },
      "proof": {
        "targetSquare": "c6",
        "squareType": "blockade",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 1,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [],
        "strategicPurpose": "halts the pawn directly behind c6"
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
      "noveltyKey": "key_square_conquest|1rbq1b1r/pppkpppp/3p3n/1NP5/3n4/5P2/PP1PPKPP/R1B1QBNR b - -|d7c6|blockade",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-key_square_conquest-237c0e79",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "05f289f7335ea7bb72895a9422348eb4e2bae64c",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "sicilian-black"
    },
    "board": {
      "fen": "1rbq1b1r/pppkpppp/3p3n/1NP5/3n4/5P2/PP1PPKPP/R1B1QBNR b - - 4 9",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "h6f5",
      "san": "Nhf5",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8a8",
        "d8e8",
        "h8g8",
        "a7a6",
        "a7a5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8a8",
          "san": "Ra8",
          "reasonItIsTempting": "Ra8 is legal and pursues a nearby plan.",
          "whyItFails": "Ra8 does not create the verified before/after feature: durable occupation of f5."
        },
        {
          "moveUci": "d8e8",
          "san": "Qe8",
          "reasonItIsTempting": "Qe8 is legal and pursues a nearby plan.",
          "whyItFails": "Qe8 does not create the verified before/after feature: durable occupation of f5."
        },
        {
          "moveUci": "h8g8",
          "san": "Rg8",
          "reasonItIsTempting": "Rg8 is legal and pursues a nearby plan.",
          "whyItFails": "Rg8 does not create the verified before/after feature: durable occupation of f5."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "hard",
      "prompt": "Claim the durable square f5.",
      "lessonObjective": "Claim the durable square f5.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square f5.",
        "detailed": "Nhf5 claims f5 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From f5, the piece reaches h4, g3, e3.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Ra8 does not create the verified before/after feature: durable occupation of f5.",
          "Qe8 does not create the verified before/after feature: durable occupation of f5.",
          "Rg8 does not create the verified before/after feature: durable occupation of f5."
        ]
      },
      "proof": {
        "targetSquare": "f5",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "h4",
          "g3",
          "e3"
        ],
        "strategicPurpose": "f5 creates access to h4, g3, e3"
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
      "noveltyKey": "key_square_conquest|1rbq1b1r/pppkpppp/3p3n/1NP5/3n4/5P2/PP1PPKPP/R1B1QBNR b - -|h6f5|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-key_square_conquest-e77eb025",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "05f289f7335ea7bb72895a9422348eb4e2bae64c",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "sicilian-black"
    },
    "board": {
      "fen": "1rbq1b1r/pppkpppp/3p3n/1NP5/3n4/5P2/PP1PPKPP/R1B1QBNR b - - 4 9",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d4e6",
      "san": "Ne6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8a8",
        "d8e8",
        "h8g8",
        "a7a6",
        "a7a5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8a8",
          "san": "Ra8",
          "reasonItIsTempting": "Ra8 is legal and pursues a nearby plan.",
          "whyItFails": "Ra8 does not create the verified before/after feature: durable occupation of e6."
        },
        {
          "moveUci": "d8e8",
          "san": "Qe8",
          "reasonItIsTempting": "Qe8 is legal and pursues a nearby plan.",
          "whyItFails": "Qe8 does not create the verified before/after feature: durable occupation of e6."
        },
        {
          "moveUci": "h8g8",
          "san": "Rg8",
          "reasonItIsTempting": "Rg8 is legal and pursues a nearby plan.",
          "whyItFails": "Rg8 does not create the verified before/after feature: durable occupation of e6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "expert",
      "prompt": "Claim the durable square e6.",
      "lessonObjective": "Claim the durable square e6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square e6.",
        "detailed": "Ne6 claims e6 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From e6, the piece reaches f4, d4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Ra8 does not create the verified before/after feature: durable occupation of e6.",
          "Qe8 does not create the verified before/after feature: durable occupation of e6.",
          "Rg8 does not create the verified before/after feature: durable occupation of e6."
        ]
      },
      "proof": {
        "targetSquare": "e6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "f4",
          "d4"
        ],
        "strategicPurpose": "e6 creates access to f4, d4"
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
      "noveltyKey": "key_square_conquest|1rbq1b1r/pppkpppp/3p3n/1NP5/3n4/5P2/PP1PPKPP/R1B1QBNR b - -|d4e6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-key_square_conquest-cffdd279",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "f2131669e3499b67a404aba3754407f0bf42bd69",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "scotch-white"
    },
    "board": {
      "fen": "rnbqk2r/1pp3pp/4pp1n/p2p4/1bP1P3/3B1QPN/PP1P1P1P/RNB1K2R w KQkq - 0 7",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b1a3",
      "san": "Na3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "c4c5",
        "c4d5",
        "e4e5",
        "e4d5",
        "d3e2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c4c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 does not create the verified before/after feature: durable occupation of a3."
        },
        {
          "moveUci": "c4d5",
          "san": "cxd5",
          "reasonItIsTempting": "cxd5 is legal and pursues a nearby plan.",
          "whyItFails": "cxd5 does not create the verified before/after feature: durable occupation of a3."
        },
        {
          "moveUci": "e4e5",
          "san": "e5",
          "reasonItIsTempting": "e5 is legal and pursues a nearby plan.",
          "whyItFails": "e5 does not create the verified before/after feature: durable occupation of a3."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "intro",
      "prompt": "Claim the durable square a3.",
      "lessonObjective": "Claim the durable square a3.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square a3.",
        "detailed": "Na3 claims a3 as a invasion. It has 0 friendly supporter(s), 1 current enemy attacker(s), and no immediate pawn chase. From a3, the piece reaches b5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "c5 does not create the verified before/after feature: durable occupation of a3.",
          "cxd5 does not create the verified before/after feature: durable occupation of a3.",
          "e5 does not create the verified before/after feature: durable occupation of a3."
        ]
      },
      "proof": {
        "targetSquare": "a3",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [
          "b4"
        ],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 1,
        "afterEnemyControl": 1,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "b5"
        ],
        "strategicPurpose": "a3 creates access to b5"
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
      "noveltyKey": "key_square_conquest|rnbqk2r/1pp3pp/4pp1n/p2p4/1bP1P3/3B1QPN/PP1P1P1P/RNB1K2R w KQkq -|b1a3|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-key_square_conquest-fbd487c1",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "6587b79e2fe85c45a1bf1adb5744ed7cdbbfe21d",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "scotch-white"
    },
    "board": {
      "fen": "rnbqk2r/p1p1bp1p/1p1p2p1/3Ppn2/8/N2QBP2/PPP1PKPP/R4BNR w kq - 2 8",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g1h3",
      "san": "Nh3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a3b5",
        "a3c4",
        "a3b1",
        "d3c4",
        "d3b5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a3b5",
          "san": "Nb5",
          "reasonItIsTempting": "Nb5 is legal and pursues a nearby plan.",
          "whyItFails": "Nb5 does not create the verified before/after feature: durable occupation of h3."
        },
        {
          "moveUci": "a3c4",
          "san": "Nc4",
          "reasonItIsTempting": "Nc4 is legal and pursues a nearby plan.",
          "whyItFails": "Nc4 does not create the verified before/after feature: durable occupation of h3."
        },
        {
          "moveUci": "a3b1",
          "san": "Nb1",
          "reasonItIsTempting": "Nb1 is legal and pursues a nearby plan.",
          "whyItFails": "Nb1 does not create the verified before/after feature: durable occupation of h3."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "easy",
      "prompt": "Claim the durable square h3.",
      "lessonObjective": "Claim the durable square h3.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square h3.",
        "detailed": "Nh3 claims h3 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From h3, the piece reaches g5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Nb5 does not create the verified before/after feature: durable occupation of h3.",
          "Nc4 does not create the verified before/after feature: durable occupation of h3.",
          "Nb1 does not create the verified before/after feature: durable occupation of h3."
        ]
      },
      "proof": {
        "targetSquare": "h3",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "g5"
        ],
        "strategicPurpose": "h3 creates access to g5"
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
      "noveltyKey": "key_square_conquest|rnbqk2r/p1p1bp1p/1p1p2p1/3Ppn2/8/N2QBP2/PPP1PKPP/R4BNR w kq -|g1h3|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-key_square_conquest-177ccaa5",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "0b5ea5c8eaab0b13665df89bd31790cd872e22dc",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "kings-indian-black"
    },
    "board": {
      "fen": "rnb2bnr/pppkqppp/4p3/3p3Q/4P3/1PN5/P1PP1PPP/R1B1KBNR w KQ - 1 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c3a4",
      "san": "Na4",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "h5g6",
        "h5f7",
        "h5h6",
        "h5h7",
        "h5h4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h5g6",
          "san": "Qg6",
          "reasonItIsTempting": "Qg6 is legal and pursues a nearby plan.",
          "whyItFails": "Qg6 does not create the verified before/after feature: durable occupation of a4."
        },
        {
          "moveUci": "h5f7",
          "san": "Qxf7",
          "reasonItIsTempting": "Qxf7 is legal and pursues a nearby plan.",
          "whyItFails": "Qxf7 does not create the verified before/after feature: durable occupation of a4."
        },
        {
          "moveUci": "h5h6",
          "san": "Qh6",
          "reasonItIsTempting": "Qh6 is legal and pursues a nearby plan.",
          "whyItFails": "Qh6 does not create the verified before/after feature: durable occupation of a4."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "medium",
      "prompt": "Claim the durable square a4.",
      "lessonObjective": "Claim the durable square a4.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square a4.",
        "detailed": "Na4 claims a4 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From a4, the piece reaches b6, c5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Qg6 does not create the verified before/after feature: durable occupation of a4.",
          "Qxf7 does not create the verified before/after feature: durable occupation of a4.",
          "Qh6 does not create the verified before/after feature: durable occupation of a4."
        ]
      },
      "proof": {
        "targetSquare": "a4",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "b6",
          "c5"
        ],
        "strategicPurpose": "a4 creates access to b6, c5"
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
      "noveltyKey": "key_square_conquest|rnb2bnr/pppkqppp/4p3/3p3Q/4P3/1PN5/P1PP1PPP/R1B1KBNR w KQ -|c3a4|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-key_square_conquest-1f7993bd",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "0b5ea5c8eaab0b13665df89bd31790cd872e22dc",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "kings-indian-black"
    },
    "board": {
      "fen": "rnb2bnr/pppkqppp/4p3/3p3Q/4P3/1PN5/P1PP1PPP/R1B1KBNR w KQ - 1 5",
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
        "h5g6",
        "h5f7",
        "h5h6",
        "h5h7",
        "h5h4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h5g6",
          "san": "Qg6",
          "reasonItIsTempting": "Qg6 is legal and pursues a nearby plan.",
          "whyItFails": "Qg6 does not create the verified before/after feature: durable occupation of f3."
        },
        {
          "moveUci": "h5f7",
          "san": "Qxf7",
          "reasonItIsTempting": "Qxf7 is legal and pursues a nearby plan.",
          "whyItFails": "Qxf7 does not create the verified before/after feature: durable occupation of f3."
        },
        {
          "moveUci": "h5h6",
          "san": "Qh6",
          "reasonItIsTempting": "Qh6 is legal and pursues a nearby plan.",
          "whyItFails": "Qh6 does not create the verified before/after feature: durable occupation of f3."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "hard",
      "prompt": "Claim the durable square f3.",
      "lessonObjective": "Claim the durable square f3.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square f3.",
        "detailed": "Nf3 claims f3 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From f3, the piece reaches e5, g5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Qg6 does not create the verified before/after feature: durable occupation of f3.",
          "Qxf7 does not create the verified before/after feature: durable occupation of f3.",
          "Qh6 does not create the verified before/after feature: durable occupation of f3."
        ]
      },
      "proof": {
        "targetSquare": "f3",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "e5",
          "g5"
        ],
        "strategicPurpose": "f3 creates access to e5, g5"
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
      "noveltyKey": "key_square_conquest|rnb2bnr/pppkqppp/4p3/3p3Q/4P3/1PN5/P1PP1PPP/R1B1KBNR w KQ -|g1f3|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-key_square_conquest-d5843063",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "0b5ea5c8eaab0b13665df89bd31790cd872e22dc",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "kings-indian-black"
    },
    "board": {
      "fen": "rnb2bnr/pppkqppp/4p3/3p3Q/4P3/1PN5/P1PP1PPP/R1B1KBNR w KQ - 1 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g1h3",
      "san": "Nh3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "h5g6",
        "h5f7",
        "h5h6",
        "h5h7",
        "h5h4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h5g6",
          "san": "Qg6",
          "reasonItIsTempting": "Qg6 is legal and pursues a nearby plan.",
          "whyItFails": "Qg6 does not create the verified before/after feature: durable occupation of h3."
        },
        {
          "moveUci": "h5f7",
          "san": "Qxf7",
          "reasonItIsTempting": "Qxf7 is legal and pursues a nearby plan.",
          "whyItFails": "Qxf7 does not create the verified before/after feature: durable occupation of h3."
        },
        {
          "moveUci": "h5h6",
          "san": "Qh6",
          "reasonItIsTempting": "Qh6 is legal and pursues a nearby plan.",
          "whyItFails": "Qh6 does not create the verified before/after feature: durable occupation of h3."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "expert",
      "prompt": "Claim the durable square h3.",
      "lessonObjective": "Claim the durable square h3.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square h3.",
        "detailed": "Nh3 claims h3 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From h3, the piece reaches g5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Qg6 does not create the verified before/after feature: durable occupation of h3.",
          "Qxf7 does not create the verified before/after feature: durable occupation of h3.",
          "Qh6 does not create the verified before/after feature: durable occupation of h3."
        ]
      },
      "proof": {
        "targetSquare": "h3",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "g5"
        ],
        "strategicPurpose": "h3 creates access to g5"
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
      "noveltyKey": "key_square_conquest|rnb2bnr/pppkqppp/4p3/3p3Q/4P3/1PN5/P1PP1PPP/R1B1KBNR w KQ -|g1h3|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-key_square_conquest-4ecb88cb",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "e8aff32153bdb0223a9454f9639b0f20814bf408",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "reti-white"
    },
    "board": {
      "fen": "r2qkbnr/ppp1pppp/2n1b3/3p4/3P1P2/N7/PPP1P1PP/R1BQKBNR w KQkq - 3 4",
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
        "f4f5",
        "a3b5",
        "a3c4",
        "a3b1",
        "b2b3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "f4f5",
          "san": "f5",
          "reasonItIsTempting": "f5 is legal and pursues a nearby plan.",
          "whyItFails": "f5 does not create the verified before/after feature: durable occupation of f3."
        },
        {
          "moveUci": "a3b5",
          "san": "Nb5",
          "reasonItIsTempting": "Nb5 is legal and pursues a nearby plan.",
          "whyItFails": "Nb5 does not create the verified before/after feature: durable occupation of f3."
        },
        {
          "moveUci": "a3c4",
          "san": "Nc4",
          "reasonItIsTempting": "Nc4 is legal and pursues a nearby plan.",
          "whyItFails": "Nc4 does not create the verified before/after feature: durable occupation of f3."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "intro",
      "prompt": "Claim the durable square f3.",
      "lessonObjective": "Claim the durable square f3.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square f3.",
        "detailed": "Nf3 claims f3 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From f3, the piece reaches e5, g5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "f5 does not create the verified before/after feature: durable occupation of f3.",
          "Nb5 does not create the verified before/after feature: durable occupation of f3.",
          "Nc4 does not create the verified before/after feature: durable occupation of f3."
        ]
      },
      "proof": {
        "targetSquare": "f3",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 1,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "e5",
          "g5"
        ],
        "strategicPurpose": "f3 creates access to e5, g5"
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
      "noveltyKey": "key_square_conquest|r2qkbnr/ppp1pppp/2n1b3/3p4/3P1P2/N7/PPP1P1PP/R1BQKBNR w KQkq -|g1f3|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-key_square_conquest-8c9912d5",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "e8aff32153bdb0223a9454f9639b0f20814bf408",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "reti-white"
    },
    "board": {
      "fen": "r2qkbnr/ppp1pppp/2n1b3/3p4/3P1P2/N7/PPP1P1PP/R1BQKBNR w KQkq - 3 4",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g1h3",
      "san": "Nh3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "f4f5",
        "a3b5",
        "a3c4",
        "a3b1",
        "b2b3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "f4f5",
          "san": "f5",
          "reasonItIsTempting": "f5 is legal and pursues a nearby plan.",
          "whyItFails": "f5 does not create the verified before/after feature: durable occupation of h3."
        },
        {
          "moveUci": "a3b5",
          "san": "Nb5",
          "reasonItIsTempting": "Nb5 is legal and pursues a nearby plan.",
          "whyItFails": "Nb5 does not create the verified before/after feature: durable occupation of h3."
        },
        {
          "moveUci": "a3c4",
          "san": "Nc4",
          "reasonItIsTempting": "Nc4 is legal and pursues a nearby plan.",
          "whyItFails": "Nc4 does not create the verified before/after feature: durable occupation of h3."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "easy",
      "prompt": "Claim the durable square h3.",
      "lessonObjective": "Claim the durable square h3.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square h3.",
        "detailed": "Nh3 claims h3 as a invasion. It has 0 friendly supporter(s), 1 current enemy attacker(s), and no immediate pawn chase. From h3, the piece reaches g5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "f5 does not create the verified before/after feature: durable occupation of h3.",
          "Nb5 does not create the verified before/after feature: durable occupation of h3.",
          "Nc4 does not create the verified before/after feature: durable occupation of h3."
        ]
      },
      "proof": {
        "targetSquare": "h3",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [
          "e6"
        ],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 1,
        "afterEnemyControl": 1,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "g5"
        ],
        "strategicPurpose": "h3 creates access to g5"
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
      "noveltyKey": "key_square_conquest|r2qkbnr/ppp1pppp/2n1b3/3p4/3P1P2/N7/PPP1P1PP/R1BQKBNR w KQkq -|g1h3|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-key_square_conquest-790761dd",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "8bade03836307035d9451fa3cdb4e95aa014364e",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "vienna-white"
    },
    "board": {
      "fen": "rnbqkb1r/pp1pp1pp/8/1Bpn4/3P1p2/4PP2/PPP3PP/RNBQK1NR w KQkq - 1 6",
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
        "b5a6",
        "b5c6",
        "b5d7",
        "b5c4",
        "b5d3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b5a6",
          "san": "Ba6",
          "reasonItIsTempting": "Ba6 is legal and pursues a nearby plan.",
          "whyItFails": "Ba6 does not create the verified before/after feature: durable occupation of c3."
        },
        {
          "moveUci": "b5c6",
          "san": "Bc6",
          "reasonItIsTempting": "Bc6 is legal and pursues a nearby plan.",
          "whyItFails": "Bc6 does not create the verified before/after feature: durable occupation of c3."
        },
        {
          "moveUci": "b5c4",
          "san": "Bc4",
          "reasonItIsTempting": "Bc4 is legal and pursues a nearby plan.",
          "whyItFails": "Bc4 does not create the verified before/after feature: durable occupation of c3."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "medium",
      "prompt": "Claim the durable square c3.",
      "lessonObjective": "Claim the durable square c3.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square c3.",
        "detailed": "Nc3 claims c3 as a invasion. It has 0 friendly supporter(s), 1 current enemy attacker(s), and no immediate pawn chase. From c3, the piece reaches d5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Ba6 does not create the verified before/after feature: durable occupation of c3.",
          "Bc6 does not create the verified before/after feature: durable occupation of c3.",
          "Bc4 does not create the verified before/after feature: durable occupation of c3."
        ]
      },
      "proof": {
        "targetSquare": "c3",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [
          "d5"
        ],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 1,
        "afterEnemyControl": 1,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "d5"
        ],
        "strategicPurpose": "c3 creates access to d5"
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
      "noveltyKey": "key_square_conquest|rnbqkb1r/pp1pp1pp/8/1Bpn4/3P1p2/4PP2/PPP3PP/RNBQK1NR w KQkq -|b1c3|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-key_square_conquest-f9288b5f",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "8bade03836307035d9451fa3cdb4e95aa014364e",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "vienna-white"
    },
    "board": {
      "fen": "rnbqkb1r/pp1pp1pp/8/1Bpn4/3P1p2/4PP2/PPP3PP/RNBQK1NR w KQkq - 1 6",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g1h3",
      "san": "Nh3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b5a6",
        "b5c6",
        "b5d7",
        "b5c4",
        "b5d3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b5a6",
          "san": "Ba6",
          "reasonItIsTempting": "Ba6 is legal and pursues a nearby plan.",
          "whyItFails": "Ba6 does not create the verified before/after feature: durable occupation of h3."
        },
        {
          "moveUci": "b5c6",
          "san": "Bc6",
          "reasonItIsTempting": "Bc6 is legal and pursues a nearby plan.",
          "whyItFails": "Bc6 does not create the verified before/after feature: durable occupation of h3."
        },
        {
          "moveUci": "b5c4",
          "san": "Bc4",
          "reasonItIsTempting": "Bc4 is legal and pursues a nearby plan.",
          "whyItFails": "Bc4 does not create the verified before/after feature: durable occupation of h3."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "hard",
      "prompt": "Claim the durable square h3.",
      "lessonObjective": "Claim the durable square h3.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square h3.",
        "detailed": "Nh3 claims h3 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From h3, the piece reaches g5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Ba6 does not create the verified before/after feature: durable occupation of h3.",
          "Bc6 does not create the verified before/after feature: durable occupation of h3.",
          "Bc4 does not create the verified before/after feature: durable occupation of h3."
        ]
      },
      "proof": {
        "targetSquare": "h3",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "g5"
        ],
        "strategicPurpose": "h3 creates access to g5"
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
      "noveltyKey": "key_square_conquest|rnbqkb1r/pp1pp1pp/8/1Bpn4/3P1p2/4PP2/PPP3PP/RNBQK1NR w KQkq -|g1h3|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-key_square_conquest-bbe96456",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "9ce797dfffb62ebb1be2559073c7f2407343c422",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "ruy-lopez-white"
    },
    "board": {
      "fen": "r1bqkb1r/3ppp2/p1p2npp/1p6/1n4PP/1P6/P1PPPP2/RNBQKBNR b KQkq - 0 9",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "f6d5",
      "san": "Nfd5",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8b8",
        "a8a7",
        "c8b7",
        "d8c7",
        "d8b6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8b8",
          "san": "Rb8",
          "reasonItIsTempting": "Rb8 is legal and pursues a nearby plan.",
          "whyItFails": "Rb8 does not create the verified before/after feature: durable occupation of d5."
        },
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: durable occupation of d5."
        },
        {
          "moveUci": "c8b7",
          "san": "Bb7",
          "reasonItIsTempting": "Bb7 is legal and pursues a nearby plan.",
          "whyItFails": "Bb7 does not create the verified before/after feature: durable occupation of d5."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "expert",
      "prompt": "Claim the durable square d5.",
      "lessonObjective": "Claim the durable square d5.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square d5.",
        "detailed": "Nfd5 claims d5 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From d5, the piece reaches f4, e3, c3.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Rb8 does not create the verified before/after feature: durable occupation of d5.",
          "Ra7 does not create the verified before/after feature: durable occupation of d5.",
          "Bb7 does not create the verified before/after feature: durable occupation of d5."
        ]
      },
      "proof": {
        "targetSquare": "d5",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "f4",
          "e3",
          "c3"
        ],
        "strategicPurpose": "d5 creates access to f4, e3, c3"
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
      "noveltyKey": "key_square_conquest|r1bqkb1r/3ppp2/p1p2npp/1p6/1n4PP/1P6/P1PPPP2/RNBQKBNR b KQkq -|f6d5|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-key_square_conquest-e8729216",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "f041f2b0f1e853a1f8f07501b3131256b3ed5a08",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rnbq1b1r/1p1ppkpp/8/p1pn1p2/Q5PN/1PP1P3/P2PBP1P/RNB1K2R b KQ - 0 9",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b8c6",
      "san": "Nc6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8a7",
        "a8a6",
        "b8a6",
        "d8e8",
        "d8c7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: durable occupation of c6."
        },
        {
          "moveUci": "a8a6",
          "san": "Ra6",
          "reasonItIsTempting": "Ra6 is legal and pursues a nearby plan.",
          "whyItFails": "Ra6 does not create the verified before/after feature: durable occupation of c6."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: durable occupation of c6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "intro",
      "prompt": "Claim the durable square c6.",
      "lessonObjective": "Claim the durable square c6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square c6.",
        "detailed": "Nc6 claims c6 as a invasion. It has 0 friendly supporter(s), 1 current enemy attacker(s), and no immediate pawn chase. From c6, the piece reaches d4, b4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: durable occupation of c6.",
          "Ra6 does not create the verified before/after feature: durable occupation of c6.",
          "Na6 does not create the verified before/after feature: durable occupation of c6."
        ]
      },
      "proof": {
        "targetSquare": "c6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [
          "a4"
        ],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 1,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 1,
        "afterEnemyControl": 1,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "d4",
          "b4"
        ],
        "strategicPurpose": "c6 creates access to d4, b4"
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
      "noveltyKey": "key_square_conquest|rnbq1b1r/1p1ppkpp/8/p1pn1p2/Q5PN/1PP1P3/P2PBP1P/RNB1K2R b KQ -|b8c6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-key_square_conquest-aa492bc4",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "f041f2b0f1e853a1f8f07501b3131256b3ed5a08",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rnbq1b1r/1p1ppkpp/8/p1pn1p2/Q5PN/1PP1P3/P2PBP1P/RNB1K2R b KQ - 0 9",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b8a6",
      "san": "Na6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8a7",
        "a8a6",
        "b8c6",
        "d8e8",
        "d8c7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: durable occupation of a6."
        },
        {
          "moveUci": "a8a6",
          "san": "Ra6",
          "reasonItIsTempting": "Ra6 is legal and pursues a nearby plan.",
          "whyItFails": "Ra6 does not create the verified before/after feature: durable occupation of a6."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: durable occupation of a6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "easy",
      "prompt": "Claim the durable square a6.",
      "lessonObjective": "Claim the durable square a6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square a6.",
        "detailed": "Na6 claims a6 as a invasion. It has 0 friendly supporter(s), 1 current enemy attacker(s), and no immediate pawn chase. From a6, the piece reaches b4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: durable occupation of a6.",
          "Ra6 does not create the verified before/after feature: durable occupation of a6.",
          "Nc6 does not create the verified before/after feature: durable occupation of a6."
        ]
      },
      "proof": {
        "targetSquare": "a6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [
          "e2"
        ],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 1,
        "afterEnemyControl": 1,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "b4"
        ],
        "strategicPurpose": "a6 creates access to b4"
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
      "noveltyKey": "key_square_conquest|rnbq1b1r/1p1ppkpp/8/p1pn1p2/Q5PN/1PP1P3/P2PBP1P/RNB1K2R b KQ -|b8a6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-key_square_conquest-662296a6",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "f041f2b0f1e853a1f8f07501b3131256b3ed5a08",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rnbq1b1r/1p1ppkpp/8/p1pn1p2/Q5PN/1PP1P3/P2PBP1P/RNB1K2R b KQ - 0 9",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d5b6",
      "san": "Nb6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8a7",
        "a8a6",
        "b8c6",
        "b8a6",
        "d8e8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: durable occupation of b6."
        },
        {
          "moveUci": "a8a6",
          "san": "Ra6",
          "reasonItIsTempting": "Ra6 is legal and pursues a nearby plan.",
          "whyItFails": "Ra6 does not create the verified before/after feature: durable occupation of b6."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: durable occupation of b6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "medium",
      "prompt": "Claim the durable square b6.",
      "lessonObjective": "Claim the durable square b6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square b6.",
        "detailed": "Nb6 claims b6 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From b6, the piece reaches c4, a4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: durable occupation of b6.",
          "Ra6 does not create the verified before/after feature: durable occupation of b6.",
          "Nc6 does not create the verified before/after feature: durable occupation of b6."
        ]
      },
      "proof": {
        "targetSquare": "b6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "c4",
          "a4"
        ],
        "strategicPurpose": "b6 creates access to c4, a4"
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
      "noveltyKey": "key_square_conquest|rnbq1b1r/1p1ppkpp/8/p1pn1p2/Q5PN/1PP1P3/P2PBP1P/RNB1K2R b KQ -|d5b6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-key_square_conquest-8da281ac",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "8d58b6a891fd97d03be0cf0df99703ff2bfc17b9",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "petroff-black"
    },
    "board": {
      "fen": "rnbqkbnr/ppp3p1/3ppp1p/8/6P1/2P2N2/PP1PPP1P/RNBQKB1R b KQkq - 1 5",
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
        "c8d7",
        "d8e7",
        "d8d7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: durable occupation of c6."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: durable occupation of c6."
        },
        {
          "moveUci": "c8d7",
          "san": "Bd7",
          "reasonItIsTempting": "Bd7 is legal and pursues a nearby plan.",
          "whyItFails": "Bd7 does not create the verified before/after feature: durable occupation of c6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "hard",
      "prompt": "Claim the durable square c6.",
      "lessonObjective": "Claim the durable square c6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square c6.",
        "detailed": "Nc6 claims c6 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From c6, the piece reaches d4, b4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: durable occupation of c6.",
          "Na6 does not create the verified before/after feature: durable occupation of c6.",
          "Bd7 does not create the verified before/after feature: durable occupation of c6."
        ]
      },
      "proof": {
        "targetSquare": "c6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "d4",
          "b4"
        ],
        "strategicPurpose": "c6 creates access to d4, b4"
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
      "noveltyKey": "key_square_conquest|rnbqkbnr/ppp3p1/3ppp1p/8/6P1/2P2N2/PP1PPP1P/RNBQKB1R b KQkq -|b8c6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-key_square_conquest-5690d17e",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "8d58b6a891fd97d03be0cf0df99703ff2bfc17b9",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "petroff-black"
    },
    "board": {
      "fen": "rnbqkbnr/ppp3p1/3ppp1p/8/6P1/2P2N2/PP1PPP1P/RNBQKB1R b KQkq - 1 5",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b8a6",
      "san": "Na6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8d7",
        "b8c6",
        "c8d7",
        "d8e7",
        "d8d7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: durable occupation of a6."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: durable occupation of a6."
        },
        {
          "moveUci": "c8d7",
          "san": "Bd7",
          "reasonItIsTempting": "Bd7 is legal and pursues a nearby plan.",
          "whyItFails": "Bd7 does not create the verified before/after feature: durable occupation of a6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "expert",
      "prompt": "Claim the durable square a6.",
      "lessonObjective": "Claim the durable square a6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square a6.",
        "detailed": "Na6 claims a6 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From a6, the piece reaches b4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: durable occupation of a6.",
          "Nc6 does not create the verified before/after feature: durable occupation of a6.",
          "Bd7 does not create the verified before/after feature: durable occupation of a6."
        ]
      },
      "proof": {
        "targetSquare": "a6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "b4"
        ],
        "strategicPurpose": "a6 creates access to b4"
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
      "noveltyKey": "key_square_conquest|rnbqkbnr/ppp3p1/3ppp1p/8/6P1/2P2N2/PP1PPP1P/RNBQKB1R b KQkq -|b8a6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-key_square_conquest-264e2352",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "168c4a3a05b7d8747262edcd3955273dc2c1e969",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "kings-indian-black"
    },
    "board": {
      "fen": "rn1qk1nr/p1p2ppp/1p1bp3/3p4/2bP3B/N5PP/PPP1PP2/R2QKBNR b KQkq - 4 7",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b8a6",
      "san": "Na6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8d7",
        "b8c6",
        "d8e7",
        "d8f6",
        "d8g5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: durable occupation of a6."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: durable occupation of a6."
        },
        {
          "moveUci": "d8e7",
          "san": "Qe7",
          "reasonItIsTempting": "Qe7 is legal and pursues a nearby plan.",
          "whyItFails": "Qe7 does not create the verified before/after feature: durable occupation of a6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "intro",
      "prompt": "Claim the durable square a6.",
      "lessonObjective": "Claim the durable square a6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square a6.",
        "detailed": "Na6 claims a6 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From a6, the piece reaches b4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: durable occupation of a6.",
          "Nc6 does not create the verified before/after feature: durable occupation of a6.",
          "Qe7 does not create the verified before/after feature: durable occupation of a6."
        ]
      },
      "proof": {
        "targetSquare": "a6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "b4"
        ],
        "strategicPurpose": "a6 creates access to b4"
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
      "noveltyKey": "key_square_conquest|rn1qk1nr/p1p2ppp/1p1bp3/3p4/2bP3B/N5PP/PPP1PP2/R2QKBNR b KQkq -|b8a6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-key_square_conquest-d612475e",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "168c4a3a05b7d8747262edcd3955273dc2c1e969",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "kings-indian-black"
    },
    "board": {
      "fen": "rn1qk1nr/p1p2ppp/1p1bp3/3p4/2bP3B/N5PP/PPP1PP2/R2QKBNR b KQkq - 4 7",
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
        "d8e7",
        "d8f6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: durable occupation of h6."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: durable occupation of h6."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: durable occupation of h6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "easy",
      "prompt": "Claim the durable square h6.",
      "lessonObjective": "Claim the durable square h6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square h6.",
        "detailed": "Nh6 claims h6 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From h6, the piece reaches g4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: durable occupation of h6.",
          "Nc6 does not create the verified before/after feature: durable occupation of h6.",
          "Na6 does not create the verified before/after feature: durable occupation of h6."
        ]
      },
      "proof": {
        "targetSquare": "h6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "g4"
        ],
        "strategicPurpose": "h6 creates access to g4"
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
      "noveltyKey": "key_square_conquest|rn1qk1nr/p1p2ppp/1p1bp3/3p4/2bP3B/N5PP/PPP1PP2/R2QKBNR b KQkq -|g8h6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-key_square_conquest-4d85eec8",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "168c4a3a05b7d8747262edcd3955273dc2c1e969",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "kings-indian-black"
    },
    "board": {
      "fen": "rn1qk1nr/p1p2ppp/1p1bp3/3p4/2bP3B/N5PP/PPP1PP2/R2QKBNR b KQkq - 4 7",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g8f6",
      "san": "Nf6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8d7",
        "b8c6",
        "b8a6",
        "d8e7",
        "d8f6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: durable occupation of f6."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: durable occupation of f6."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: durable occupation of f6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "medium",
      "prompt": "Claim the durable square f6.",
      "lessonObjective": "Claim the durable square f6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square f6.",
        "detailed": "Nf6 claims f6 as a invasion. It has 0 friendly supporter(s), 1 current enemy attacker(s), and no immediate pawn chase. From f6, the piece reaches g4, e4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: durable occupation of f6.",
          "Nc6 does not create the verified before/after feature: durable occupation of f6.",
          "Na6 does not create the verified before/after feature: durable occupation of f6."
        ]
      },
      "proof": {
        "targetSquare": "f6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [
          "h4"
        ],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 1,
        "afterEnemyControl": 1,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "g4",
          "e4"
        ],
        "strategicPurpose": "f6 creates access to g4, e4"
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
      "noveltyKey": "key_square_conquest|rn1qk1nr/p1p2ppp/1p1bp3/3p4/2bP3B/N5PP/PPP1PP2/R2QKBNR b KQkq -|g8f6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-key_square_conquest-031f0077",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "07970b921a484976c96c0dccc8a6f0bb971dbb1c",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "queens-gambit-white"
    },
    "board": {
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2P5/4PN1P/PP1P1PP1/RNBQKB1R w KQkq - 1 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "f3h4",
      "san": "Nh4",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "c4c5",
        "c4d5",
        "e3e4",
        "f3d4",
        "f3e5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c4c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 does not create the verified before/after feature: durable occupation of h4."
        },
        {
          "moveUci": "c4d5",
          "san": "cxd5",
          "reasonItIsTempting": "cxd5 is legal and pursues a nearby plan.",
          "whyItFails": "cxd5 does not create the verified before/after feature: durable occupation of h4."
        },
        {
          "moveUci": "e3e4",
          "san": "e4",
          "reasonItIsTempting": "e4 is legal and pursues a nearby plan.",
          "whyItFails": "e4 does not create the verified before/after feature: durable occupation of h4."
        }
      ]
    },
    "pedagogy": {
      "concept": "blockade",
      "subConcept": "durable_blockade",
      "difficultyBand": "hard",
      "prompt": "Claim the durable square h4.",
      "lessonObjective": "Claim the durable square h4.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square h4.",
        "detailed": "Nh4 claims h4 as a blockade. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From h4, the piece reaches f5, g6.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "c5 does not create the verified before/after feature: durable occupation of h4.",
          "cxd5 does not create the verified before/after feature: durable occupation of h4.",
          "e4 does not create the verified before/after feature: durable occupation of h4."
        ]
      },
      "proof": {
        "targetSquare": "h4",
        "squareType": "blockade",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "f5",
          "g6"
        ],
        "strategicPurpose": "halts the pawn directly behind h4"
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
      "noveltyKey": "key_square_conquest|rnbqkb1r/pp3ppp/2p1pn2/3p4/2P5/4PN1P/PP1P1PP1/RNBQKB1R w KQkq -|f3h4|blockade",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-key_square_conquest-0e3350a9",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "07970b921a484976c96c0dccc8a6f0bb971dbb1c",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "queens-gambit-white"
    },
    "board": {
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2P5/4PN1P/PP1P1PP1/RNBQKB1R w KQkq - 1 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b1a3",
      "san": "Na3",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "c4c5",
        "c4d5",
        "e3e4",
        "f3d4",
        "f3e5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c4c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 does not create the verified before/after feature: durable occupation of a3."
        },
        {
          "moveUci": "c4d5",
          "san": "cxd5",
          "reasonItIsTempting": "cxd5 is legal and pursues a nearby plan.",
          "whyItFails": "cxd5 does not create the verified before/after feature: durable occupation of a3."
        },
        {
          "moveUci": "e3e4",
          "san": "e4",
          "reasonItIsTempting": "e4 is legal and pursues a nearby plan.",
          "whyItFails": "e4 does not create the verified before/after feature: durable occupation of a3."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "expert",
      "prompt": "Claim the durable square a3.",
      "lessonObjective": "Claim the durable square a3.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square a3.",
        "detailed": "Na3 claims a3 as a invasion. It has 0 friendly supporter(s), 1 current enemy attacker(s), and no immediate pawn chase. From a3, the piece reaches b5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "c5 does not create the verified before/after feature: durable occupation of a3.",
          "cxd5 does not create the verified before/after feature: durable occupation of a3.",
          "e4 does not create the verified before/after feature: durable occupation of a3."
        ]
      },
      "proof": {
        "targetSquare": "a3",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [
          "f8"
        ],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 1,
        "afterEnemyControl": 1,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "b5"
        ],
        "strategicPurpose": "a3 creates access to b5"
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
      "noveltyKey": "key_square_conquest|rnbqkb1r/pp3ppp/2p1pn2/3p4/2P5/4PN1P/PP1P1PP1/RNBQKB1R w KQkq -|b1a3|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-key_square_conquest-e0b48d30",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "fb6fc1758d279df4a7840f60ec125ad5406f5e3c",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "scandinavian-black"
    },
    "board": {
      "fen": "rnb1kbnr/1ppp1ppp/p3p3/8/3P1B1q/2N4P/PPP1PPP1/R2QKBNR b KQkq - 3 4",
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
        "a8a7",
        "b8c6",
        "e8e7",
        "e8d8",
        "f8e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: durable occupation of h6."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: durable occupation of h6."
        },
        {
          "moveUci": "e8e7",
          "san": "Ke7",
          "reasonItIsTempting": "Ke7 is legal and pursues a nearby plan.",
          "whyItFails": "Ke7 does not create the verified before/after feature: durable occupation of h6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "intro",
      "prompt": "Claim the durable square h6.",
      "lessonObjective": "Claim the durable square h6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square h6.",
        "detailed": "Nh6 claims h6 as a invasion. It has 0 friendly supporter(s), 1 current enemy attacker(s), and no immediate pawn chase. From h6, the piece reaches g4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: durable occupation of h6.",
          "Nc6 does not create the verified before/after feature: durable occupation of h6.",
          "Ke7 does not create the verified before/after feature: durable occupation of h6."
        ]
      },
      "proof": {
        "targetSquare": "h6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [
          "f4"
        ],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 1,
        "afterEnemyControl": 1,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "g4"
        ],
        "strategicPurpose": "h6 creates access to g4"
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
      "noveltyKey": "key_square_conquest|rnb1kbnr/1ppp1ppp/p3p3/8/3P1B1q/2N4P/PPP1PPP1/R2QKBNR b KQkq -|g8h6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-key_square_conquest-5a48f696",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "fb6fc1758d279df4a7840f60ec125ad5406f5e3c",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "scandinavian-black"
    },
    "board": {
      "fen": "rnb1kbnr/1ppp1ppp/p3p3/8/3P1B1q/2N4P/PPP1PPP1/R2QKBNR b KQkq - 3 4",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g8f6",
      "san": "Nf6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a8a7",
        "b8c6",
        "e8e7",
        "e8d8",
        "f8e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: durable occupation of f6."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: durable occupation of f6."
        },
        {
          "moveUci": "e8e7",
          "san": "Ke7",
          "reasonItIsTempting": "Ke7 is legal and pursues a nearby plan.",
          "whyItFails": "Ke7 does not create the verified before/after feature: durable occupation of f6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "easy",
      "prompt": "Claim the durable square f6.",
      "lessonObjective": "Claim the durable square f6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square f6.",
        "detailed": "Nf6 claims f6 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From f6, the piece reaches g4, e4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: durable occupation of f6.",
          "Nc6 does not create the verified before/after feature: durable occupation of f6.",
          "Ke7 does not create the verified before/after feature: durable occupation of f6."
        ]
      },
      "proof": {
        "targetSquare": "f6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "g4",
          "e4"
        ],
        "strategicPurpose": "f6 creates access to g4, e4"
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
      "noveltyKey": "key_square_conquest|rnb1kbnr/1ppp1ppp/p3p3/8/3P1B1q/2N4P/PPP1PPP1/R2QKBNR b KQkq -|g8f6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-key_square_conquest-a90186d3",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "ed1814b878215f9816b3d3e6fe57b19f76bb7d60",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "caro-kann-black"
    },
    "board": {
      "fen": "rnb1kb1r/pp1ppp1p/Bq4pn/2p5/4P1P1/2N4P/PPPP1P2/R1BQK1NR w KQkq - 0 6",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c3a4",
      "san": "Na4",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "a6b7",
        "a6b5",
        "a6c4",
        "a6d3",
        "a6e2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a6b7",
          "san": "Bxb7",
          "reasonItIsTempting": "Bxb7 is legal and pursues a nearby plan.",
          "whyItFails": "Bxb7 does not create the verified before/after feature: durable occupation of a4."
        },
        {
          "moveUci": "a6b5",
          "san": "Bb5",
          "reasonItIsTempting": "Bb5 is legal and pursues a nearby plan.",
          "whyItFails": "Bb5 does not create the verified before/after feature: durable occupation of a4."
        },
        {
          "moveUci": "a6c4",
          "san": "Bc4",
          "reasonItIsTempting": "Bc4 is legal and pursues a nearby plan.",
          "whyItFails": "Bc4 does not create the verified before/after feature: durable occupation of a4."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "medium",
      "prompt": "Claim the durable square a4.",
      "lessonObjective": "Claim the durable square a4.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square a4.",
        "detailed": "Na4 claims a4 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From a4, the piece reaches b6, c5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Bxb7 does not create the verified before/after feature: durable occupation of a4.",
          "Bb5 does not create the verified before/after feature: durable occupation of a4.",
          "Bc4 does not create the verified before/after feature: durable occupation of a4."
        ]
      },
      "proof": {
        "targetSquare": "a4",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "b6",
          "c5"
        ],
        "strategicPurpose": "a4 creates access to b6, c5"
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
      "noveltyKey": "key_square_conquest|rnb1kb1r/pp1ppp1p/Bq4pn/2p5/4P1P1/2N4P/PPPP1P2/R1BQK1NR w KQkq -|c3a4|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-key_square_conquest-534ae38f",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "ed1814b878215f9816b3d3e6fe57b19f76bb7d60",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "caro-kann-black"
    },
    "board": {
      "fen": "rnb1kb1r/pp1ppp1p/Bq4pn/2p5/4P1P1/2N4P/PPPP1P2/R1BQK1NR w KQkq - 0 6",
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
        "a6b7",
        "a6b5",
        "a6c4",
        "a6d3",
        "a6e2"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a6b7",
          "san": "Bxb7",
          "reasonItIsTempting": "Bxb7 is legal and pursues a nearby plan.",
          "whyItFails": "Bxb7 does not create the verified before/after feature: durable occupation of f3."
        },
        {
          "moveUci": "a6b5",
          "san": "Bb5",
          "reasonItIsTempting": "Bb5 is legal and pursues a nearby plan.",
          "whyItFails": "Bb5 does not create the verified before/after feature: durable occupation of f3."
        },
        {
          "moveUci": "a6c4",
          "san": "Bc4",
          "reasonItIsTempting": "Bc4 is legal and pursues a nearby plan.",
          "whyItFails": "Bc4 does not create the verified before/after feature: durable occupation of f3."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "hard",
      "prompt": "Claim the durable square f3.",
      "lessonObjective": "Claim the durable square f3.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square f3.",
        "detailed": "Nf3 claims f3 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From f3, the piece reaches e5, g5.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Bxb7 does not create the verified before/after feature: durable occupation of f3.",
          "Bb5 does not create the verified before/after feature: durable occupation of f3.",
          "Bc4 does not create the verified before/after feature: durable occupation of f3."
        ]
      },
      "proof": {
        "targetSquare": "f3",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 3,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "e5",
          "g5"
        ],
        "strategicPurpose": "f3 creates access to e5, g5"
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
      "noveltyKey": "key_square_conquest|rnb1kb1r/pp1ppp1p/Bq4pn/2p5/4P1P1/2N4P/PPPP1P2/R1BQK1NR w KQkq -|g1f3|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-key_square_conquest-0c9b9db8",
    "miniGameId": "key_square_conquest",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "a5d12a4e4925907febb690d8fff1394f0f99d19e",
      "seed": "stage-8m-plus:key_square_conquest",
      "generatorId": "keySquareConquestGenerator",
      "openingId": "queens-indian-black"
    },
    "board": {
      "fen": "rnbq1bnr/pppkpp2/6pp/1N1p4/3P4/5N2/PPPQPPPP/R1B1KB1R b KQ - 1 5",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b8a6",
      "san": "Na6",
      "moveType": "piece_improvement",
      "legalAlternatives": [
        "b8c6",
        "d8e8",
        "f8g7",
        "g8f6",
        "h8h7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: durable occupation of a6."
        },
        {
          "moveUci": "d8e8",
          "san": "Qe8",
          "reasonItIsTempting": "Qe8 is legal and pursues a nearby plan.",
          "whyItFails": "Qe8 does not create the verified before/after feature: durable occupation of a6."
        },
        {
          "moveUci": "f8g7",
          "san": "Bg7",
          "reasonItIsTempting": "Bg7 is legal and pursues a nearby plan.",
          "whyItFails": "Bg7 does not create the verified before/after feature: durable occupation of a6."
        }
      ]
    },
    "pedagogy": {
      "concept": "invasion",
      "subConcept": "durable_invasion",
      "difficultyBand": "expert",
      "prompt": "Claim the durable square a6.",
      "lessonObjective": "Claim the durable square a6.",
      "transferPattern": "Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.",
      "explanation": {
        "short": "Claim the durable square a6.",
        "detailed": "Na6 claims a6 as a invasion. It has 0 friendly supporter(s), 0 current enemy attacker(s), and no immediate pawn chase. From a6, the piece reaches b4.",
        "coachNote": "Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.",
        "whyAlternativesFail": [
          "Nc6 does not create the verified before/after feature: durable occupation of a6.",
          "Qe8 does not create the verified before/after feature: durable occupation of a6.",
          "Bg7 does not create the verified before/after feature: durable occupation of a6."
        ]
      },
      "proof": {
        "targetSquare": "a6",
        "squareType": "invasion",
        "friendlySupporters": [],
        "friendlyPawnSupporters": [],
        "enemyAttackers": [],
        "enemyPawnChasers": [],
        "enemyCanChaseWithPawn": false,
        "beforeFriendlyControl": 2,
        "afterFriendlyControl": 0,
        "beforeEnemyControl": 0,
        "afterEnemyControl": 0,
        "durabilityPlyEstimate": 2,
        "usefulTargetsFromSquare": [
          "b4"
        ],
        "strategicPurpose": "a6 creates access to b4"
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
      "noveltyKey": "key_square_conquest|rnbq1bnr/pppkpp2/6pp/1N1p4/3P4/5N2/PPPQPPPP/R1B1KB1R b KQ -|b8a6|invasion",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  }
];
