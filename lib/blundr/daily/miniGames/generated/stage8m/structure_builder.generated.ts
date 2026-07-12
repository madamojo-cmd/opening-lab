import type { Stage8MScenario } from '../../../../tools/stage8m/types';

export const STAGE8M_STRUCTURE_BUILDER_SCENARIOS: Stage8MScenario[] = [
  {
    "id": "stage8m-structure_builder-706940ba",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "2a5d2e6320253d18a4331faecc8812d097f05a19",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "queens-indian-black"
    },
    "board": {
      "fen": "rn1qkbnr/ppp1ppp1/8/3p3p/2Q1P3/2P4b/PP1P1PPP/RNB1KBNR b KQkq - 2 4",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d5e4",
      "san": "dxe4",
      "moveType": "pawn_break",
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
          "whyItFails": "Nd7 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "intro",
      "prompt": "Change the pawn structure with dxe4.",
      "lessonObjective": "Change the pawn structure with dxe4.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with dxe4.",
        "detailed": "dxe4 is structural because it changes the position before and after: no verified structural transformation. The move changes the d and e file(s), controls d3, f3, and creates weaknesses on c4, e4.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: no verified structural transformation.",
          "Nc6 does not create the verified before/after feature: no verified structural transformation.",
          "Na6 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "e4",
        "from": "d5",
        "to": "e4",
        "capture": "e4",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "e",
          "d"
        ],
        "openedDiagonals": [
          "d5"
        ],
        "newlyWeakSquares": [
          "c4",
          "e4"
        ],
        "improvedSquares": [
          "d3",
          "f3"
        ],
        "changedFiles": [
          "d",
          "e"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rn1qkbnr/ppp1ppp1/8/3p3p/2Q1P3/2P4b/PP1P1PPP/RNB1KBNR b KQkq -|d5e4|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-structure_builder-eaf4add3",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "78aeac2c093607c39342c24d40e7cc7bd5df2c57",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "vienna-white"
    },
    "board": {
      "fen": "r2qkbn1/pppnpppr/1Q5p/3p4/3NP3/3B3b/PPPP1PPP/RNB1K2R b KQq - 9 7",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "a7b6",
      "san": "axb6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a8b8",
        "a8c8",
        "d8c8",
        "d8b8",
        "g8f6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8b8",
          "san": "Rb8",
          "reasonItIsTempting": "Rb8 is legal and pursues a nearby plan.",
          "whyItFails": "Rb8 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "a8c8",
          "san": "Rc8",
          "reasonItIsTempting": "Rc8 is legal and pursues a nearby plan.",
          "whyItFails": "Rc8 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "d8c8",
          "san": "Qc8",
          "reasonItIsTempting": "Qc8 is legal and pursues a nearby plan.",
          "whyItFails": "Qc8 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "easy",
      "prompt": "Change the pawn structure with axb6.",
      "lessonObjective": "Change the pawn structure with axb6.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with axb6.",
        "detailed": "axb6 is structural because it changes the position before and after: no verified structural transformation. The move changes the a and b file(s), controls a5, c5, and creates weaknesses on b6.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Rb8 does not create the verified before/after feature: no verified structural transformation.",
          "Rc8 does not create the verified before/after feature: no verified structural transformation.",
          "Qc8 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "b6",
        "from": "a7",
        "to": "b6",
        "capture": "b6",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "a"
        ],
        "openedDiagonals": [
          "a7"
        ],
        "newlyWeakSquares": [
          "b6"
        ],
        "improvedSquares": [
          "a5",
          "c5"
        ],
        "changedFiles": [
          "a",
          "b"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|r2qkbn1/pppnpppr/1Q5p/3p4/3NP3/3B3b/PPPP1PPP/RNB1K2R b KQq -|a7b6|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-structure_builder-78ba2353",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "0944cbfd08167f965cf2f50a4d88f3625e732912",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "slav-black"
    },
    "board": {
      "fen": "r1bqk2r/ppp1ppb1/Q1n2n2/3p2pp/N1P5/5P1N/PP1PP1PP/R1B1KB1R w KQkq - 0 8",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c4d5",
      "san": "cxd5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a6a7",
        "a6b7",
        "a6b6",
        "a6c6",
        "a6b5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a6a7",
          "san": "Qxa7",
          "reasonItIsTempting": "Qxa7 is legal and pursues a nearby plan.",
          "whyItFails": "Qxa7 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "a6b7",
          "san": "Qxb7",
          "reasonItIsTempting": "Qxb7 is legal and pursues a nearby plan.",
          "whyItFails": "Qxb7 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "a6b6",
          "san": "Qb6",
          "reasonItIsTempting": "Qb6 is legal and pursues a nearby plan.",
          "whyItFails": "Qb6 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "medium",
      "prompt": "Change the pawn structure with cxd5.",
      "lessonObjective": "Change the pawn structure with cxd5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with cxd5.",
        "detailed": "cxd5 is structural because it changes the position before and after: no verified structural transformation. The move changes the c and d file(s), controls c6, e6, and creates weaknesses on b5, d5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Qxa7 does not create the verified before/after feature: no verified structural transformation.",
          "Qxb7 does not create the verified before/after feature: no verified structural transformation.",
          "Qb6 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "d5",
        "from": "c4",
        "to": "d5",
        "capture": "d5",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "c",
          "d"
        ],
        "openedDiagonals": [
          "c4"
        ],
        "newlyWeakSquares": [
          "b5",
          "d5"
        ],
        "improvedSquares": [
          "c6",
          "e6"
        ],
        "changedFiles": [
          "c",
          "d"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|r1bqk2r/ppp1ppb1/Q1n2n2/3p2pp/N1P5/5P1N/PP1PP1PP/R1B1KB1R w KQkq -|c4d5|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-structure_builder-1796b51b",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "a8eef8950a2b40e3c6918a77566b699d713fcba3",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "petroff-black"
    },
    "board": {
      "fen": "rn1k1bnr/p1pbp1p1/3qQp1p/1p1p4/2P5/1PN2P1N/P2PP1PP/R1B1KB1R w KQ - 4 9",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c4b5",
      "san": "cxb5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "e6d7",
        "e6e7",
        "e6f7",
        "e6g8",
        "e6f6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "e6f7",
          "san": "Qf7",
          "reasonItIsTempting": "Qf7 is legal and pursues a nearby plan.",
          "whyItFails": "Qf7 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "e6g8",
          "san": "Qxg8",
          "reasonItIsTempting": "Qxg8 is legal and pursues a nearby plan.",
          "whyItFails": "Qxg8 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "e6f6",
          "san": "Qxf6",
          "reasonItIsTempting": "Qxf6 is legal and pursues a nearby plan.",
          "whyItFails": "Qxf6 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "hard",
      "prompt": "Change the pawn structure with cxb5.",
      "lessonObjective": "Change the pawn structure with cxb5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with cxb5.",
        "detailed": "cxb5 is structural because it changes the position before and after: no verified structural transformation. The move changes the c and b file(s), controls a6, c6, and creates weaknesses on b5, d5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Qf7 does not create the verified before/after feature: no verified structural transformation.",
          "Qxg8 does not create the verified before/after feature: no verified structural transformation.",
          "Qxf6 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "b5",
        "from": "c4",
        "to": "b5",
        "capture": "b5",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "c",
          "b"
        ],
        "openedDiagonals": [
          "c4"
        ],
        "newlyWeakSquares": [
          "b5",
          "d5"
        ],
        "improvedSquares": [
          "a6",
          "c6"
        ],
        "changedFiles": [
          "c",
          "b"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rn1k1bnr/p1pbp1p1/3qQp1p/1p1p4/2P5/1PN2P1N/P2PP1PP/R1B1KB1R w KQ -|c4b5|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-structure_builder-719f30bb",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "9ce797dfffb62ebb1be2559073c7f2407343c422",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "ruy-lopez-white"
    },
    "board": {
      "fen": "r1bqkb1r/2ppn1pp/1pn5/p3ppN1/3PPP2/8/PPPN2PP/R1BQKB1R w KQkq - 1 7",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d4e5",
      "san": "dxe5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "g5e6",
        "g5f7",
        "g5h7",
        "g5h3",
        "g5f3"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "g5e6",
          "san": "Ne6",
          "reasonItIsTempting": "Ne6 is legal and pursues a nearby plan.",
          "whyItFails": "Ne6 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "g5f7",
          "san": "Nf7",
          "reasonItIsTempting": "Nf7 is legal and pursues a nearby plan.",
          "whyItFails": "Nf7 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "g5h7",
          "san": "Nxh7",
          "reasonItIsTempting": "Nxh7 is legal and pursues a nearby plan.",
          "whyItFails": "Nxh7 does not create the verified before/after feature: breaks a locked pawn pair."
        }
      ]
    },
    "pedagogy": {
      "concept": "locked_center_break",
      "subConcept": "locked_center_break",
      "difficultyBand": "expert",
      "prompt": "Change the pawn structure with dxe5.",
      "lessonObjective": "Change the pawn structure with dxe5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with dxe5.",
        "detailed": "dxe5 is structural because it changes the position before and after: breaks a locked pawn pair. The move changes the d and e file(s), controls d6, f6, and creates weaknesses on c5, e5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Ne6 does not create the verified before/after feature: breaks a locked pawn pair.",
          "Nf7 does not create the verified before/after feature: breaks a locked pawn pair.",
          "Nxh7 does not create the verified before/after feature: breaks a locked pawn pair."
        ]
      },
      "proof": {
        "movedPawn": "e5",
        "from": "d4",
        "to": "e5",
        "capture": "e5",
        "beforeTags": [
          "locked:e4",
          "locked:f4"
        ],
        "afterTags": [
          "locked:f4"
        ],
        "removedBlocker": "e5",
        "openedFiles": [],
        "halfOpenedFiles": [
          "d",
          "e"
        ],
        "openedDiagonals": [
          "d4"
        ],
        "newlyWeakSquares": [
          "c5",
          "e5"
        ],
        "improvedSquares": [
          "d6",
          "f6"
        ],
        "changedFiles": [
          "d",
          "e"
        ],
        "summary": "breaks a locked pawn pair",
        "meaningful": true
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
      "noveltyKey": "structure_builder|r1bqkb1r/2ppn1pp/1pn5/p3ppN1/3PPP2/8/PPPN2PP/R1BQKB1R w KQkq -|d4e5|locked_center_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-structure_builder-c47153f1",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "a93abe422c9465f579901abd27a444f0a8f9c929",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "queens-indian-black"
    },
    "board": {
      "fen": "r2qkb1r/ppp1pp1p/2n4n/2Pp2p1/7P/NP1b2P1/P2PPP2/R1BQKBNR w KQkq - 1 9",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "h4g5",
      "san": "hxg5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "h4h5",
        "a3b5",
        "a3c4",
        "a3c2",
        "a3b1"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "h4h5",
          "san": "h5",
          "reasonItIsTempting": "h5 is legal and pursues a nearby plan.",
          "whyItFails": "h5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "a3b5",
          "san": "Nb5",
          "reasonItIsTempting": "Nb5 is legal and pursues a nearby plan.",
          "whyItFails": "Nb5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "a3c4",
          "san": "Nc4",
          "reasonItIsTempting": "Nc4 is legal and pursues a nearby plan.",
          "whyItFails": "Nc4 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "intro",
      "prompt": "Change the pawn structure with hxg5.",
      "lessonObjective": "Change the pawn structure with hxg5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with hxg5.",
        "detailed": "hxg5 is structural because it changes the position before and after: no verified structural transformation. The move changes the h and g file(s), controls f6, h6, and creates weaknesses on g5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "h5 does not create the verified before/after feature: no verified structural transformation.",
          "Nb5 does not create the verified before/after feature: no verified structural transformation.",
          "Nc4 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "g5",
        "from": "h4",
        "to": "g5",
        "capture": "g5",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "h",
          "g"
        ],
        "openedDiagonals": [
          "h4"
        ],
        "newlyWeakSquares": [
          "g5"
        ],
        "improvedSquares": [
          "f6",
          "h6"
        ],
        "changedFiles": [
          "h",
          "g"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|r2qkb1r/ppp1pp1p/2n4n/2Pp2p1/7P/NP1b2P1/P2PPP2/R1BQKBNR w KQkq -|h4g5|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-structure_builder-acce76ea",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "aa8529f5543a04a19040e1848140304fb5b03ffd",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "scotch-white"
    },
    "board": {
      "fen": "rnb2bnr/ppk1pppp/2pq4/3p2BQ/P3P3/3P3P/1PP2PP1/RN2KBNR b KQ - 2 6",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d5e4",
      "san": "dxe4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b8d7",
        "b8a6",
        "c8d7",
        "c8e6",
        "c8f5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8d7",
          "san": "Nd7",
          "reasonItIsTempting": "Nd7 is legal and pursues a nearby plan.",
          "whyItFails": "Nd7 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "c8d7",
          "san": "Bd7",
          "reasonItIsTempting": "Bd7 is legal and pursues a nearby plan.",
          "whyItFails": "Bd7 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "easy",
      "prompt": "Change the pawn structure with dxe4.",
      "lessonObjective": "Change the pawn structure with dxe4.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with dxe4.",
        "detailed": "dxe4 is structural because it changes the position before and after: no verified structural transformation. The move changes the d and e file(s), controls d3, f3, and creates weaknesses on c4, e4.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Nd7 does not create the verified before/after feature: no verified structural transformation.",
          "Na6 does not create the verified before/after feature: no verified structural transformation.",
          "Bd7 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "e4",
        "from": "d5",
        "to": "e4",
        "capture": "e4",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "e",
          "d"
        ],
        "openedDiagonals": [
          "d5"
        ],
        "newlyWeakSquares": [
          "c4",
          "e4"
        ],
        "improvedSquares": [
          "d3",
          "f3"
        ],
        "changedFiles": [
          "d",
          "e"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnb2bnr/ppk1pppp/2pq4/3p2BQ/P3P3/3P3P/1PP2PP1/RN2KBNR b KQ -|d5e4|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-structure_builder-4fd245ac",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "1ecb891ff8ad16fcf8ed1dc8175ffec2ab34e5f7",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "kings-indian-black"
    },
    "board": {
      "fen": "r2qkbnr/pbpnpp1p/8/1p1p4/2P1P1p1/N2Q1PP1/PP1P3P/R1B1KBNR b KQkq - 3 7",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b5c4",
      "san": "bxc4",
      "moveType": "pawn_break",
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
          "whyItFails": "Rb8 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "a8c8",
          "san": "Rc8",
          "reasonItIsTempting": "Rc8 is legal and pursues a nearby plan.",
          "whyItFails": "Rc8 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "d8c8",
          "san": "Qc8",
          "reasonItIsTempting": "Qc8 is legal and pursues a nearby plan.",
          "whyItFails": "Qc8 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "medium",
      "prompt": "Change the pawn structure with bxc4.",
      "lessonObjective": "Change the pawn structure with bxc4.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with bxc4.",
        "detailed": "bxc4 is structural because it changes the position before and after: no verified structural transformation. The move changes the b and c file(s), controls b3, d3, and creates weaknesses on a4, c4.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Rb8 does not create the verified before/after feature: no verified structural transformation.",
          "Rc8 does not create the verified before/after feature: no verified structural transformation.",
          "Qc8 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "c4",
        "from": "b5",
        "to": "c4",
        "capture": "c4",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "c",
          "b"
        ],
        "openedDiagonals": [
          "b5"
        ],
        "newlyWeakSquares": [
          "a4",
          "c4"
        ],
        "improvedSquares": [
          "b3",
          "d3"
        ],
        "changedFiles": [
          "b",
          "c"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|r2qkbnr/pbpnpp1p/8/1p1p4/2P1P1p1/N2Q1PP1/PP1P3P/R1B1KBNR b KQkq -|b5c4|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-structure_builder-f922e4c5",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "1ecb891ff8ad16fcf8ed1dc8175ffec2ab34e5f7",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "kings-indian-black"
    },
    "board": {
      "fen": "r2qkbnr/pbpnpp1p/8/1p1p4/2P1P1p1/N2Q1PP1/PP1P3P/R1B1KBNR b KQkq - 3 7",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g4f3",
      "san": "gxf3",
      "moveType": "pawn_break",
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
          "whyItFails": "Rb8 does not create the verified before/after feature: creates a passed pawn on f3."
        },
        {
          "moveUci": "a8c8",
          "san": "Rc8",
          "reasonItIsTempting": "Rc8 is legal and pursues a nearby plan.",
          "whyItFails": "Rc8 does not create the verified before/after feature: creates a passed pawn on f3."
        },
        {
          "moveUci": "d8c8",
          "san": "Qc8",
          "reasonItIsTempting": "Qc8 is legal and pursues a nearby plan.",
          "whyItFails": "Qc8 does not create the verified before/after feature: creates a passed pawn on f3."
        }
      ]
    },
    "pedagogy": {
      "concept": "passed_pawn_creation",
      "subConcept": "passed_pawn_creation",
      "difficultyBand": "hard",
      "prompt": "Change the pawn structure with gxf3.",
      "lessonObjective": "Change the pawn structure with gxf3.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with gxf3.",
        "detailed": "gxf3 is structural because it changes the position before and after: creates a passed pawn on f3. The move changes the g and f file(s), controls e2, g2, and creates weaknesses on f3, h3.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Rb8 does not create the verified before/after feature: creates a passed pawn on f3.",
          "Rc8 does not create the verified before/after feature: creates a passed pawn on f3.",
          "Qc8 does not create the verified before/after feature: creates a passed pawn on f3."
        ]
      },
      "proof": {
        "movedPawn": "f3",
        "from": "g4",
        "to": "f3",
        "capture": "f3",
        "beforeTags": [],
        "afterTags": [
          "passed:f3"
        ],
        "createdPassedPawn": "f3",
        "openedFiles": [],
        "halfOpenedFiles": [
          "f",
          "g"
        ],
        "openedDiagonals": [
          "g4"
        ],
        "newlyWeakSquares": [
          "f3",
          "h3"
        ],
        "improvedSquares": [
          "e2",
          "g2"
        ],
        "changedFiles": [
          "g",
          "f"
        ],
        "summary": "creates a passed pawn on f3",
        "meaningful": true
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
      "noveltyKey": "structure_builder|r2qkbnr/pbpnpp1p/8/1p1p4/2P1P1p1/N2Q1PP1/PP1P3P/R1B1KBNR b KQkq -|g4f3|passed_pawn_creation",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-structure_builder-6c8bd5fd",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "225542d4b62f396c2b720bdfbccded0fe8d2583e",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "queens-indian-black"
    },
    "board": {
      "fen": "rn1qkbnr/p1pbp2p/1p3p2/3p2p1/P1P4P/1P4P1/3PPP2/RNBQKBNR w KQkq - 0 6",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c4d5",
      "san": "cxd5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a4a5",
        "c4c5",
        "h4h5",
        "h4g5",
        "b3b4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a4a5",
          "san": "a5",
          "reasonItIsTempting": "a5 is legal and pursues a nearby plan.",
          "whyItFails": "a5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "c4c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "h4h5",
          "san": "h5",
          "reasonItIsTempting": "h5 is legal and pursues a nearby plan.",
          "whyItFails": "h5 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "expert",
      "prompt": "Change the pawn structure with cxd5.",
      "lessonObjective": "Change the pawn structure with cxd5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with cxd5.",
        "detailed": "cxd5 is structural because it changes the position before and after: no verified structural transformation. The move changes the c and d file(s), controls c6, e6, and creates weaknesses on b5, d5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "a5 does not create the verified before/after feature: no verified structural transformation.",
          "c5 does not create the verified before/after feature: no verified structural transformation.",
          "h5 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "d5",
        "from": "c4",
        "to": "d5",
        "capture": "d5",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "c",
          "d"
        ],
        "openedDiagonals": [
          "c4"
        ],
        "newlyWeakSquares": [
          "b5",
          "d5"
        ],
        "improvedSquares": [
          "c6",
          "e6"
        ],
        "changedFiles": [
          "c",
          "d"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rn1qkbnr/p1pbp2p/1p3p2/3p2p1/P1P4P/1P4P1/3PPP2/RNBQKBNR w KQkq -|c4d5|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-structure_builder-274d346a",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "b8d754ad4cedc702d6deaa8369c60d23ea1b56fc",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "colle-white"
    },
    "board": {
      "fen": "r1bqkbnr/ppppn1p1/5p2/4p2p/3P2P1/8/PPPBPPBP/RN1QK1NR b KQkq - 0 6",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "e5d4",
      "san": "exd4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a8b8",
        "e8f7",
        "g8h6",
        "h8h7",
        "h8h6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8b8",
          "san": "Rb8",
          "reasonItIsTempting": "Rb8 is legal and pursues a nearby plan.",
          "whyItFails": "Rb8 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "e8f7",
          "san": "Kf7",
          "reasonItIsTempting": "Kf7 is legal and pursues a nearby plan.",
          "whyItFails": "Kf7 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "g8h6",
          "san": "Nh6",
          "reasonItIsTempting": "Nh6 is legal and pursues a nearby plan.",
          "whyItFails": "Nh6 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "intro",
      "prompt": "Change the pawn structure with exd4.",
      "lessonObjective": "Change the pawn structure with exd4.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with exd4.",
        "detailed": "exd4 is structural because it changes the position before and after: no verified structural transformation. The move changes the e and d file(s), controls c3, e3, and creates weaknesses on d4, f4.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Rb8 does not create the verified before/after feature: no verified structural transformation.",
          "Kf7 does not create the verified before/after feature: no verified structural transformation.",
          "Nh6 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "d4",
        "from": "e5",
        "to": "d4",
        "capture": "d4",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "d",
          "e"
        ],
        "openedDiagonals": [
          "e5"
        ],
        "newlyWeakSquares": [
          "d4",
          "f4"
        ],
        "improvedSquares": [
          "c3",
          "e3"
        ],
        "changedFiles": [
          "e",
          "d"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|r1bqkbnr/ppppn1p1/5p2/4p2p/3P2P1/8/PPPBPPBP/RN1QK1NR b KQkq -|e5d4|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-structure_builder-73071a9b",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "8c6318c2cfdde46c7496f081f10801a92226bf22",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "nimzo-indian-black"
    },
    "board": {
      "fen": "rnbbk1nr/1ppp1ppp/8/p3p3/1qPP4/P1B2P1P/RP2P1P1/1N1QKBNR b Kkq - 6 8",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "e5d4",
      "san": "exd4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a8a7",
        "a8a6",
        "b8c6",
        "b8a6",
        "d8e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "a8a6",
          "san": "Ra6",
          "reasonItIsTempting": "Ra6 is legal and pursues a nearby plan.",
          "whyItFails": "Ra6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "easy",
      "prompt": "Change the pawn structure with exd4.",
      "lessonObjective": "Change the pawn structure with exd4.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with exd4.",
        "detailed": "exd4 is structural because it changes the position before and after: no verified structural transformation. The move changes the e and d file(s), controls c3, e3, and creates weaknesses on d4, f4.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: no verified structural transformation.",
          "Ra6 does not create the verified before/after feature: no verified structural transformation.",
          "Nc6 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "d4",
        "from": "e5",
        "to": "d4",
        "capture": "d4",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "d",
          "e"
        ],
        "openedDiagonals": [
          "e5"
        ],
        "newlyWeakSquares": [
          "d4",
          "f4"
        ],
        "improvedSquares": [
          "c3",
          "e3"
        ],
        "changedFiles": [
          "e",
          "d"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnbbk1nr/1ppp1ppp/8/p3p3/1qPP4/P1B2P1P/RP2P1P1/1N1QKBNR b Kkq -|e5d4|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-structure_builder-d68b4ca0",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "9947cc7c83bf660b872753bdfa876ed2f17285d3",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "italian-black"
    },
    "board": {
      "fen": "rnbqk2r/p1pp1p1p/1p4p1/4p1bn/3PP1Q1/N1P4P/PP1BNPP1/R3KB1R b KQkq - 1 9",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "e5d4",
      "san": "exd4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b8c6",
        "b8a6",
        "c8b7",
        "c8a6",
        "d8e7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "c8b7",
          "san": "Bb7",
          "reasonItIsTempting": "Bb7 is legal and pursues a nearby plan.",
          "whyItFails": "Bb7 does not create the verified before/after feature: breaks a locked pawn pair."
        }
      ]
    },
    "pedagogy": {
      "concept": "locked_center_break",
      "subConcept": "locked_center_break",
      "difficultyBand": "medium",
      "prompt": "Change the pawn structure with exd4.",
      "lessonObjective": "Change the pawn structure with exd4.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with exd4.",
        "detailed": "exd4 is structural because it changes the position before and after: breaks a locked pawn pair. The move changes the e and d file(s), controls c3, e3, and creates weaknesses on d4, f4.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Nc6 does not create the verified before/after feature: breaks a locked pawn pair.",
          "Na6 does not create the verified before/after feature: breaks a locked pawn pair.",
          "Bb7 does not create the verified before/after feature: breaks a locked pawn pair."
        ]
      },
      "proof": {
        "movedPawn": "d4",
        "from": "e5",
        "to": "d4",
        "capture": "d4",
        "beforeTags": [
          "locked:e4"
        ],
        "afterTags": [],
        "removedBlocker": "d4",
        "openedFiles": [],
        "halfOpenedFiles": [
          "d",
          "e"
        ],
        "openedDiagonals": [
          "e5"
        ],
        "newlyWeakSquares": [
          "d4",
          "f4"
        ],
        "improvedSquares": [
          "c3",
          "e3"
        ],
        "changedFiles": [
          "e",
          "d"
        ],
        "summary": "breaks a locked pawn pair",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnbqk2r/p1pp1p1p/1p4p1/4p1bn/3PP1Q1/N1P4P/PP1BNPP1/R3KB1R b KQkq -|e5d4|locked_center_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-structure_builder-962394c2",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "2a8041057a504b1a7133773b6fd115f974e22dc6",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "rnbqkbnr/p2pp2p/1p4p1/2p2p2/3PPP2/BP1Q4/P1P3PP/RN2KBNR b KQkq - 0 6",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c5d4",
      "san": "cxd4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b8c6",
        "b8a6",
        "c8b7",
        "c8a6",
        "d8c7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "c8b7",
          "san": "Bb7",
          "reasonItIsTempting": "Bb7 is legal and pursues a nearby plan.",
          "whyItFails": "Bb7 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "hard",
      "prompt": "Change the pawn structure with cxd4.",
      "lessonObjective": "Change the pawn structure with cxd4.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with cxd4.",
        "detailed": "cxd4 is structural because it changes the position before and after: no verified structural transformation. The move changes the c and d file(s), controls c3, e3, and creates weaknesses on b4, d4.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Nc6 does not create the verified before/after feature: no verified structural transformation.",
          "Na6 does not create the verified before/after feature: no verified structural transformation.",
          "Bb7 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "d4",
        "from": "c5",
        "to": "d4",
        "capture": "d4",
        "beforeTags": [
          "locked:f4"
        ],
        "afterTags": [
          "locked:f4"
        ],
        "openedFiles": [],
        "halfOpenedFiles": [
          "d",
          "c"
        ],
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
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnbqkbnr/p2pp2p/1p4p1/2p2p2/3PPP2/BP1Q4/P1P3PP/RN2KBNR b KQkq -|c5d4|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-structure_builder-641021b9",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "2a8041057a504b1a7133773b6fd115f974e22dc6",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "qgd-black"
    },
    "board": {
      "fen": "rnbqkbnr/p2pp2p/1p4p1/2p2p2/3PPP2/BP1Q4/P1P3PP/RN2KBNR b KQkq - 0 6",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "f5e4",
      "san": "fxe4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b8c6",
        "b8a6",
        "c8b7",
        "c8a6",
        "d8c7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: creates a passed pawn on e4; breaks a locked pawn pair."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: creates a passed pawn on e4; breaks a locked pawn pair."
        },
        {
          "moveUci": "c8b7",
          "san": "Bb7",
          "reasonItIsTempting": "Bb7 is legal and pursues a nearby plan.",
          "whyItFails": "Bb7 does not create the verified before/after feature: creates a passed pawn on e4; breaks a locked pawn pair."
        }
      ]
    },
    "pedagogy": {
      "concept": "passed_pawn_creation",
      "subConcept": "passed_pawn_creation",
      "difficultyBand": "expert",
      "prompt": "Change the pawn structure with fxe4.",
      "lessonObjective": "Change the pawn structure with fxe4.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with fxe4.",
        "detailed": "fxe4 is structural because it changes the position before and after: creates a passed pawn on e4; breaks a locked pawn pair. The move changes the f and e file(s), controls d3, f3, and creates weaknesses on e4, g4.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Nc6 does not create the verified before/after feature: creates a passed pawn on e4; breaks a locked pawn pair.",
          "Na6 does not create the verified before/after feature: creates a passed pawn on e4; breaks a locked pawn pair.",
          "Bb7 does not create the verified before/after feature: creates a passed pawn on e4; breaks a locked pawn pair."
        ]
      },
      "proof": {
        "movedPawn": "e4",
        "from": "f5",
        "to": "e4",
        "capture": "e4",
        "beforeTags": [
          "locked:f4"
        ],
        "afterTags": [
          "passed:e4"
        ],
        "createdPassedPawn": "e4",
        "removedBlocker": "e4",
        "openedFiles": [],
        "halfOpenedFiles": [
          "e",
          "f"
        ],
        "openedDiagonals": [
          "f5"
        ],
        "newlyWeakSquares": [
          "e4",
          "g4"
        ],
        "improvedSquares": [
          "d3",
          "f3"
        ],
        "changedFiles": [
          "f",
          "e"
        ],
        "summary": "creates a passed pawn on e4; breaks a locked pawn pair",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnbqkbnr/p2pp2p/1p4p1/2p2p2/3PPP2/BP1Q4/P1P3PP/RN2KBNR b KQkq -|f5e4|passed_pawn_creation",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-structure_builder-5dc84d59",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "2a5d1b19c6a4c5760898c850608ba066f76e96c8",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "ruy-lopez-white"
    },
    "board": {
      "fen": "rnb2bnr/pp2k1pp/3p4/q1p1pp2/1PP1P1P1/B7/P2PBP1P/RN1QK1NR w KQ - 0 7",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b4a5",
      "san": "bxa5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b4b5",
        "b4c5",
        "e4f5",
        "g4g5",
        "g4f5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b4b5",
          "san": "b5",
          "reasonItIsTempting": "b5 is legal and pursues a nearby plan.",
          "whyItFails": "b5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "b4c5",
          "san": "bxc5",
          "reasonItIsTempting": "bxc5 is legal and pursues a nearby plan.",
          "whyItFails": "bxc5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "intro",
      "prompt": "Change the pawn structure with bxa5.",
      "lessonObjective": "Change the pawn structure with bxa5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with bxa5.",
        "detailed": "bxa5 is structural because it changes the position before and after: no verified structural transformation. The move changes the b and a file(s), controls b6, and creates weaknesses on a5, c5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "b5 does not create the verified before/after feature: no verified structural transformation.",
          "bxc5 does not create the verified before/after feature: no verified structural transformation.",
          "exf5 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "a5",
        "from": "b4",
        "to": "a5",
        "capture": "a5",
        "beforeTags": [
          "locked:c4",
          "locked:e4"
        ],
        "afterTags": [
          "locked:c4",
          "locked:e4"
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
      "noveltyKey": "structure_builder|rnb2bnr/pp2k1pp/3p4/q1p1pp2/1PP1P1P1/B7/P2PBP1P/RN1QK1NR w KQ -|b4a5|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-structure_builder-874335a5",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "2a5d1b19c6a4c5760898c850608ba066f76e96c8",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "ruy-lopez-white"
    },
    "board": {
      "fen": "rnb2bnr/pp2k1pp/3p4/q1p1pp2/1PP1P1P1/B7/P2PBP1P/RN1QK1NR w KQ - 0 7",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b4c5",
      "san": "bxc5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b4b5",
        "b4a5",
        "e4f5",
        "g4g5",
        "g4f5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b4b5",
          "san": "b5",
          "reasonItIsTempting": "b5 is legal and pursues a nearby plan.",
          "whyItFails": "b5 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "b4a5",
          "san": "bxa5",
          "reasonItIsTempting": "bxa5 is legal and pursues a nearby plan.",
          "whyItFails": "bxa5 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "e4f5",
          "san": "exf5",
          "reasonItIsTempting": "exf5 is legal and pursues a nearby plan.",
          "whyItFails": "exf5 does not create the verified before/after feature: breaks a locked pawn pair."
        }
      ]
    },
    "pedagogy": {
      "concept": "locked_center_break",
      "subConcept": "locked_center_break",
      "difficultyBand": "easy",
      "prompt": "Change the pawn structure with bxc5.",
      "lessonObjective": "Change the pawn structure with bxc5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with bxc5.",
        "detailed": "bxc5 is structural because it changes the position before and after: breaks a locked pawn pair. The move changes the b and c file(s), controls b6, d6, and creates weaknesses on a5, c5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "b5 does not create the verified before/after feature: breaks a locked pawn pair.",
          "bxa5 does not create the verified before/after feature: breaks a locked pawn pair.",
          "exf5 does not create the verified before/after feature: breaks a locked pawn pair."
        ]
      },
      "proof": {
        "movedPawn": "c5",
        "from": "b4",
        "to": "c5",
        "capture": "c5",
        "beforeTags": [
          "locked:c4",
          "locked:e4"
        ],
        "afterTags": [
          "locked:e4"
        ],
        "removedBlocker": "c5",
        "openedFiles": [],
        "halfOpenedFiles": [
          "b",
          "c"
        ],
        "openedDiagonals": [
          "b4"
        ],
        "newlyWeakSquares": [
          "a5",
          "c5"
        ],
        "improvedSquares": [
          "b6",
          "d6"
        ],
        "changedFiles": [
          "b",
          "c"
        ],
        "summary": "breaks a locked pawn pair",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnb2bnr/pp2k1pp/3p4/q1p1pp2/1PP1P1P1/B7/P2PBP1P/RN1QK1NR w KQ -|b4c5|locked_center_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-structure_builder-49ccfe30",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "afa491a7cabdd6a0242873135b1078a800c83680",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "italian-white"
    },
    "board": {
      "fen": "rnbqkb1r/ppp2p1p/5n2/3pp1p1/2P4P/1Q6/PP1PPPPR/RNB1KBN1 w Qkq - 0 5",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c4d5",
      "san": "cxd5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "c4c5",
        "h4h5",
        "h4g5",
        "b3a4",
        "b3b4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c4c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "h4h5",
          "san": "h5",
          "reasonItIsTempting": "h5 is legal and pursues a nearby plan.",
          "whyItFails": "h5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "h4g5",
          "san": "hxg5",
          "reasonItIsTempting": "hxg5 is legal and pursues a nearby plan.",
          "whyItFails": "hxg5 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "medium",
      "prompt": "Change the pawn structure with cxd5.",
      "lessonObjective": "Change the pawn structure with cxd5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with cxd5.",
        "detailed": "cxd5 is structural because it changes the position before and after: no verified structural transformation. The move changes the c and d file(s), controls c6, e6, and creates weaknesses on b5, d5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "c5 does not create the verified before/after feature: no verified structural transformation.",
          "h5 does not create the verified before/after feature: no verified structural transformation.",
          "hxg5 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "d5",
        "from": "c4",
        "to": "d5",
        "capture": "d5",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "c",
          "d"
        ],
        "openedDiagonals": [
          "c4"
        ],
        "newlyWeakSquares": [
          "b5",
          "d5"
        ],
        "improvedSquares": [
          "c6",
          "e6"
        ],
        "changedFiles": [
          "c",
          "d"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnbqkb1r/ppp2p1p/5n2/3pp1p1/2P4P/1Q6/PP1PPPPR/RNB1KBN1 w Qkq -|c4d5|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-structure_builder-b7d5c5ae",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "db1707da5c0ba6317bd5cb8e80bcd46b90b71343",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "reti-white"
    },
    "board": {
      "fen": "rn1qkb1r/p1p1pppp/1p1p3n/8/1P2b2N/3P4/P1P1PPPP/RNBQKBR1 w Qkq - 3 6",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d3e4",
      "san": "dxe4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b4b5",
        "h4f5",
        "h4g6",
        "h4f3",
        "d3d4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b4b5",
          "san": "b5",
          "reasonItIsTempting": "b5 is legal and pursues a nearby plan.",
          "whyItFails": "b5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "h4f5",
          "san": "Nf5",
          "reasonItIsTempting": "Nf5 is legal and pursues a nearby plan.",
          "whyItFails": "Nf5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "h4g6",
          "san": "Ng6",
          "reasonItIsTempting": "Ng6 is legal and pursues a nearby plan.",
          "whyItFails": "Ng6 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "hard",
      "prompt": "Change the pawn structure with dxe4.",
      "lessonObjective": "Change the pawn structure with dxe4.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with dxe4.",
        "detailed": "dxe4 is structural because it changes the position before and after: no verified structural transformation. The move changes the d and e file(s), controls d5, f5, and creates weaknesses on c4, e4.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "b5 does not create the verified before/after feature: no verified structural transformation.",
          "Nf5 does not create the verified before/after feature: no verified structural transformation.",
          "Ng6 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "e4",
        "from": "d3",
        "to": "e4",
        "capture": "e4",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "d"
        ],
        "openedDiagonals": [
          "d3"
        ],
        "newlyWeakSquares": [
          "c4",
          "e4"
        ],
        "improvedSquares": [
          "d5",
          "f5"
        ],
        "changedFiles": [
          "d",
          "e"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rn1qkb1r/p1p1pppp/1p1p3n/8/1P2b2N/3P4/P1P1PPPP/RNBQKBR1 w Qkq -|d3e4|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-structure_builder-d6029ba1",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "26cd933aec389f4edf19278d96e139927ae76da8",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rn2kb1r/pb1p2pp/7n/1pp1ppq1/2P3P1/5P1P/PPQPP1B1/RNB1K1NR w KQkq - 0 8",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c4b5",
      "san": "cxb5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "g4f5",
        "f3f4",
        "h3h4",
        "a2a3",
        "a2a4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "g4f5",
          "san": "gxf5",
          "reasonItIsTempting": "gxf5 is legal and pursues a nearby plan.",
          "whyItFails": "gxf5 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "f3f4",
          "san": "f4",
          "reasonItIsTempting": "f4 is legal and pursues a nearby plan.",
          "whyItFails": "f4 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "h3h4",
          "san": "h4",
          "reasonItIsTempting": "h4 is legal and pursues a nearby plan.",
          "whyItFails": "h4 does not create the verified before/after feature: breaks a locked pawn pair."
        }
      ]
    },
    "pedagogy": {
      "concept": "locked_center_break",
      "subConcept": "locked_center_break",
      "difficultyBand": "expert",
      "prompt": "Change the pawn structure with cxb5.",
      "lessonObjective": "Change the pawn structure with cxb5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with cxb5.",
        "detailed": "cxb5 is structural because it changes the position before and after: breaks a locked pawn pair. The move changes the c and b file(s), controls a6, c6, and creates weaknesses on b5, d5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "gxf5 does not create the verified before/after feature: breaks a locked pawn pair.",
          "f4 does not create the verified before/after feature: breaks a locked pawn pair.",
          "h4 does not create the verified before/after feature: breaks a locked pawn pair."
        ]
      },
      "proof": {
        "movedPawn": "b5",
        "from": "c4",
        "to": "b5",
        "capture": "b5",
        "beforeTags": [
          "locked:c4"
        ],
        "afterTags": [],
        "removedBlocker": "b5",
        "openedFiles": [],
        "halfOpenedFiles": [
          "c",
          "b"
        ],
        "openedDiagonals": [
          "c4"
        ],
        "newlyWeakSquares": [
          "b5",
          "d5"
        ],
        "improvedSquares": [
          "a6",
          "c6"
        ],
        "changedFiles": [
          "c",
          "b"
        ],
        "summary": "breaks a locked pawn pair",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rn2kb1r/pb1p2pp/7n/1pp1ppq1/2P3P1/5P1P/PPQPP1B1/RNB1K1NR w KQkq -|c4b5|locked_center_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-structure_builder-ef23cfdf",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "26cd933aec389f4edf19278d96e139927ae76da8",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rn2kb1r/pb1p2pp/7n/1pp1ppq1/2P3P1/5P1P/PPQPP1B1/RNB1K1NR w KQkq - 0 8",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g4f5",
      "san": "gxf5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "c4b5",
        "f3f4",
        "h3h4",
        "a2a3",
        "a2a4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c4b5",
          "san": "cxb5",
          "reasonItIsTempting": "cxb5 is legal and pursues a nearby plan.",
          "whyItFails": "cxb5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "f3f4",
          "san": "f4",
          "reasonItIsTempting": "f4 is legal and pursues a nearby plan.",
          "whyItFails": "f4 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "h3h4",
          "san": "h4",
          "reasonItIsTempting": "h4 is legal and pursues a nearby plan.",
          "whyItFails": "h4 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "intro",
      "prompt": "Change the pawn structure with gxf5.",
      "lessonObjective": "Change the pawn structure with gxf5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with gxf5.",
        "detailed": "gxf5 is structural because it changes the position before and after: no verified structural transformation. The move changes the g and f file(s), controls e6, g6, and creates weaknesses on f5, h5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "cxb5 does not create the verified before/after feature: no verified structural transformation.",
          "f4 does not create the verified before/after feature: no verified structural transformation.",
          "h4 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "f5",
        "from": "g4",
        "to": "f5",
        "capture": "f5",
        "beforeTags": [
          "locked:c4"
        ],
        "afterTags": [
          "locked:c4"
        ],
        "openedFiles": [],
        "halfOpenedFiles": [
          "g",
          "f"
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
      "noveltyKey": "structure_builder|rn2kb1r/pb1p2pp/7n/1pp1ppq1/2P3P1/5P1P/PPQPP1B1/RNB1K1NR w KQkq -|g4f5|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-structure_builder-2173db95",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "a4b0e897a43f66dbe14cb1fa0d2bd827f2bd9d2c",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "london-white"
    },
    "board": {
      "fen": "r1bqkb1r/ppppp1p1/7n/2n4p/5pP1/NQPP4/PP2PP1P/RNB1KB1R w KQkq - 3 9",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "g4h5",
      "san": "gxh5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "g4g5",
        "a3b5",
        "a3c4",
        "a3c2",
        "b3a4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "g4g5",
          "san": "g5",
          "reasonItIsTempting": "g5 is legal and pursues a nearby plan.",
          "whyItFails": "g5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "a3b5",
          "san": "Nb5",
          "reasonItIsTempting": "Nb5 is legal and pursues a nearby plan.",
          "whyItFails": "Nb5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "a3c4",
          "san": "Nc4",
          "reasonItIsTempting": "Nc4 is legal and pursues a nearby plan.",
          "whyItFails": "Nc4 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "easy",
      "prompt": "Change the pawn structure with gxh5.",
      "lessonObjective": "Change the pawn structure with gxh5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with gxh5.",
        "detailed": "gxh5 is structural because it changes the position before and after: no verified structural transformation. The move changes the g and h file(s), controls g6, and creates weaknesses on f5, h5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "g5 does not create the verified before/after feature: no verified structural transformation.",
          "Nb5 does not create the verified before/after feature: no verified structural transformation.",
          "Nc4 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "h5",
        "from": "g4",
        "to": "h5",
        "capture": "h5",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "g",
          "h"
        ],
        "openedDiagonals": [
          "g4"
        ],
        "newlyWeakSquares": [
          "f5",
          "h5"
        ],
        "improvedSquares": [
          "g6"
        ],
        "changedFiles": [
          "g",
          "h"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|r1bqkb1r/ppppp1p1/7n/2n4p/5pP1/NQPP4/PP2PP1P/RNB1KB1R w KQkq -|g4h5|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-structure_builder-d5935b04",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "ed1814b878215f9816b3d3e6fe57b19f76bb7d60",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "caro-kann-black"
    },
    "board": {
      "fen": "rnb1k1nr/ppppqppp/B7/4p3/4P2P/b1P5/PP1P1PP1/RNBQK1NR b KQkq - 1 5",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "b7a6",
      "san": "bxa6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b8c6",
        "b8a6",
        "e8f8",
        "e8d8",
        "g8h6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "b8a6",
          "san": "Nxa6",
          "reasonItIsTempting": "Nxa6 is legal and pursues a nearby plan.",
          "whyItFails": "Nxa6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "e8f8",
          "san": "Kf8",
          "reasonItIsTempting": "Kf8 is legal and pursues a nearby plan.",
          "whyItFails": "Kf8 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "medium",
      "prompt": "Change the pawn structure with bxa6.",
      "lessonObjective": "Change the pawn structure with bxa6.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with bxa6.",
        "detailed": "bxa6 is structural because it changes the position before and after: no verified structural transformation. The move changes the b and a file(s), controls b5, and creates weaknesses on a6, c6.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Nc6 does not create the verified before/after feature: no verified structural transformation.",
          "Nxa6 does not create the verified before/after feature: no verified structural transformation.",
          "Kf8 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "a6",
        "from": "b7",
        "to": "a6",
        "capture": "a6",
        "beforeTags": [
          "locked:e4"
        ],
        "afterTags": [
          "locked:e4"
        ],
        "openedFiles": [],
        "halfOpenedFiles": [
          "b"
        ],
        "openedDiagonals": [
          "b7"
        ],
        "newlyWeakSquares": [
          "a6",
          "c6"
        ],
        "improvedSquares": [
          "b5"
        ],
        "changedFiles": [
          "b",
          "a"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnb1k1nr/ppppqppp/B7/4p3/4P2P/b1P5/PP1P1PP1/RNBQK1NR b KQkq -|b7a6|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-structure_builder-4cd641a6",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "97fce802a552c505047b2fd592459dbd980ed4cf",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "nimzo-indian-black"
    },
    "board": {
      "fen": "r1bqkbnr/pp3p2/4p1p1/2pp3p/1nP2B2/3P1PPP/PP2P2R/RN1QKBN1 w Qkq - 0 8",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c4d5",
      "san": "cxd5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "f4e5",
        "f4d6",
        "f4c7",
        "f4b8",
        "f4g5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "f4e5",
          "san": "Be5",
          "reasonItIsTempting": "Be5 is legal and pursues a nearby plan.",
          "whyItFails": "Be5 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "f4d6",
          "san": "Bd6",
          "reasonItIsTempting": "Bd6 is legal and pursues a nearby plan.",
          "whyItFails": "Bd6 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "f4c7",
          "san": "Bc7",
          "reasonItIsTempting": "Bc7 is legal and pursues a nearby plan.",
          "whyItFails": "Bc7 does not create the verified before/after feature: breaks a locked pawn pair."
        }
      ]
    },
    "pedagogy": {
      "concept": "locked_center_break",
      "subConcept": "locked_center_break",
      "difficultyBand": "hard",
      "prompt": "Change the pawn structure with cxd5.",
      "lessonObjective": "Change the pawn structure with cxd5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with cxd5.",
        "detailed": "cxd5 is structural because it changes the position before and after: breaks a locked pawn pair. The move changes the c and d file(s), controls c6, e6, and creates weaknesses on b5, d5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Be5 does not create the verified before/after feature: breaks a locked pawn pair.",
          "Bd6 does not create the verified before/after feature: breaks a locked pawn pair.",
          "Bc7 does not create the verified before/after feature: breaks a locked pawn pair."
        ]
      },
      "proof": {
        "movedPawn": "d5",
        "from": "c4",
        "to": "d5",
        "capture": "d5",
        "beforeTags": [
          "locked:c4"
        ],
        "afterTags": [],
        "removedBlocker": "d5",
        "openedFiles": [],
        "halfOpenedFiles": [
          "c",
          "d"
        ],
        "openedDiagonals": [
          "c4"
        ],
        "newlyWeakSquares": [
          "b5",
          "d5"
        ],
        "improvedSquares": [
          "c6",
          "e6"
        ],
        "changedFiles": [
          "c",
          "d"
        ],
        "summary": "breaks a locked pawn pair",
        "meaningful": true
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
      "noveltyKey": "structure_builder|r1bqkbnr/pp3p2/4p1p1/2pp3p/1nP2B2/3P1PPP/PP2P2R/RN1QKBN1 w Qkq -|c4d5|locked_center_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-structure_builder-c94ea938",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "e05d96a29d19109293917933a2075b2c274192e0",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "london-white"
    },
    "board": {
      "fen": "1nb1k1nr/r1ppbppp/1p2p3/p1P3q1/8/P5QN/1P1PPPPP/RNB1KB1R w KQk - 1 7",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c5b6",
      "san": "cxb6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "c5c6",
        "a3a4",
        "g3f4",
        "g3e5",
        "g3d6"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "c5c6",
          "san": "c6",
          "reasonItIsTempting": "c6 is legal and pursues a nearby plan.",
          "whyItFails": "c6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "a3a4",
          "san": "a4",
          "reasonItIsTempting": "a4 is legal and pursues a nearby plan.",
          "whyItFails": "a4 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "g3f4",
          "san": "Qf4",
          "reasonItIsTempting": "Qf4 is legal and pursues a nearby plan.",
          "whyItFails": "Qf4 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "expert",
      "prompt": "Change the pawn structure with cxb6.",
      "lessonObjective": "Change the pawn structure with cxb6.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with cxb6.",
        "detailed": "cxb6 is structural because it changes the position before and after: no verified structural transformation. The move changes the c and b file(s), controls a7, c7, and creates weaknesses on b6, d6.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "c6 does not create the verified before/after feature: no verified structural transformation.",
          "a4 does not create the verified before/after feature: no verified structural transformation.",
          "Qf4 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "b6",
        "from": "c5",
        "to": "b6",
        "capture": "b6",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "c",
          "b"
        ],
        "openedDiagonals": [
          "c5"
        ],
        "newlyWeakSquares": [
          "b6",
          "d6"
        ],
        "improvedSquares": [
          "a7",
          "c7"
        ],
        "changedFiles": [
          "c",
          "b"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|1nb1k1nr/r1ppbppp/1p2p3/p1P3q1/8/P5QN/1P1PPPPP/RNB1KB1R w KQk -|c5b6|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  },
  {
    "id": "stage8m-structure_builder-bc9253da",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "6587b79e2fe85c45a1bf1adb5744ed7cdbbfe21d",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "scotch-white"
    },
    "board": {
      "fen": "rnbqkb1r/pp1p1p1p/4p2B/2pn2p1/2PP4/P1N3P1/1P2PP1P/R2QKBNR b KQkq - 1 6",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "c5d4",
      "san": "cxd4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b8c6",
        "b8a6",
        "d8e7",
        "d8f6",
        "d8c7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: breaks a locked pawn pair."
        },
        {
          "moveUci": "d8e7",
          "san": "Qe7",
          "reasonItIsTempting": "Qe7 is legal and pursues a nearby plan.",
          "whyItFails": "Qe7 does not create the verified before/after feature: breaks a locked pawn pair."
        }
      ]
    },
    "pedagogy": {
      "concept": "locked_center_break",
      "subConcept": "locked_center_break",
      "difficultyBand": "intro",
      "prompt": "Change the pawn structure with cxd4.",
      "lessonObjective": "Change the pawn structure with cxd4.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with cxd4.",
        "detailed": "cxd4 is structural because it changes the position before and after: breaks a locked pawn pair. The move changes the c and d file(s), controls c3, e3, and creates weaknesses on b4, d4.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Nc6 does not create the verified before/after feature: breaks a locked pawn pair.",
          "Na6 does not create the verified before/after feature: breaks a locked pawn pair.",
          "Qe7 does not create the verified before/after feature: breaks a locked pawn pair."
        ]
      },
      "proof": {
        "movedPawn": "d4",
        "from": "c5",
        "to": "d4",
        "capture": "d4",
        "beforeTags": [
          "locked:c4"
        ],
        "afterTags": [],
        "removedBlocker": "d4",
        "openedFiles": [],
        "halfOpenedFiles": [
          "d",
          "c"
        ],
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
        "summary": "breaks a locked pawn pair",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnbqkb1r/pp1p1p1p/4p2B/2pn2p1/2PP4/P1N3P1/1P2PP1P/R2QKBNR b KQkq -|c5d4|locked_center_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 55
    }
  },
  {
    "id": "stage8m-structure_builder-28e1088c",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "c6bde5d06d1deb4a56616f00a1a2208247210956",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "italian-white"
    },
    "board": {
      "fen": "rnb1kbnr/p1qpp2p/1p3p2/2p1N1p1/2P5/1P1P4/PB2PPPP/RN1QKB1R b KQkq - 0 6",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "f6e5",
      "san": "fxe5",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "b8c6",
        "b8a6",
        "c8b7",
        "c8a6",
        "e8d8"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "b8a6",
          "san": "Na6",
          "reasonItIsTempting": "Na6 is legal and pursues a nearby plan.",
          "whyItFails": "Na6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "c8b7",
          "san": "Bb7",
          "reasonItIsTempting": "Bb7 is legal and pursues a nearby plan.",
          "whyItFails": "Bb7 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "easy",
      "prompt": "Change the pawn structure with fxe5.",
      "lessonObjective": "Change the pawn structure with fxe5.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with fxe5.",
        "detailed": "fxe5 is structural because it changes the position before and after: no verified structural transformation. The move changes the f and e file(s), controls d4, f4, and creates weaknesses on e5, g5.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Nc6 does not create the verified before/after feature: no verified structural transformation.",
          "Na6 does not create the verified before/after feature: no verified structural transformation.",
          "Bb7 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "e5",
        "from": "f6",
        "to": "e5",
        "capture": "e5",
        "beforeTags": [
          "locked:c4"
        ],
        "afterTags": [
          "locked:c4"
        ],
        "openedFiles": [],
        "halfOpenedFiles": [
          "f"
        ],
        "openedDiagonals": [
          "f6"
        ],
        "newlyWeakSquares": [
          "e5",
          "g5"
        ],
        "improvedSquares": [
          "d4",
          "f4"
        ],
        "changedFiles": [
          "f",
          "e"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnb1kbnr/p1qpp2p/1p3p2/2p1N1p1/2P5/1P1P4/PB2PPPP/RN1QKB1R b KQkq -|f6e5|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 65
    }
  },
  {
    "id": "stage8m-structure_builder-25f71380",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "9ab47207f98e213add4d80b0c4ed1f6bc6955741",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "rnbqkr2/pp1pn1pp/4pp2/2pP4/1P3P2/b1NQ3N/P1P1P1PP/R1B1KB1R w KQq - 1 8",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d5e6",
      "san": "dxe6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "d5d6",
        "b4b5",
        "b4c5",
        "f4f5",
        "c3a4"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d5d6",
          "san": "d6",
          "reasonItIsTempting": "d6 is legal and pursues a nearby plan.",
          "whyItFails": "d6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "b4b5",
          "san": "b5",
          "reasonItIsTempting": "b5 is legal and pursues a nearby plan.",
          "whyItFails": "b5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "b4c5",
          "san": "bxc5",
          "reasonItIsTempting": "bxc5 is legal and pursues a nearby plan.",
          "whyItFails": "bxc5 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "medium",
      "prompt": "Change the pawn structure with dxe6.",
      "lessonObjective": "Change the pawn structure with dxe6.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with dxe6.",
        "detailed": "dxe6 is structural because it changes the position before and after: no verified structural transformation. The move changes the d and e file(s), controls d7, f7, and creates weaknesses on c6, e6.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "d6 does not create the verified before/after feature: no verified structural transformation.",
          "b5 does not create the verified before/after feature: no verified structural transformation.",
          "bxc5 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "e6",
        "from": "d5",
        "to": "e6",
        "capture": "e6",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "d",
          "e"
        ],
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
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnbqkr2/pp1pn1pp/4pp2/2pP4/1P3P2/b1NQ3N/P1P1P1PP/R1B1KB1R w KQq -|d5e6|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 75
    }
  },
  {
    "id": "stage8m-structure_builder-209c3675",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "6cef70668deb6b29a240956043e67a0809188c6f",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "english-white"
    },
    "board": {
      "fen": "r2qkb1r/p1pp1pp1/b4n2/np1Pp2p/2P2B1P/N2Q4/PP2PPP1/R3KBNR w KQkq e6 0 8",
      "sideToMove": "w",
      "orientation": "white",
      "phase": "middlegame",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "d5e6",
      "san": "dxe6",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "d5d6",
        "c4c5",
        "c4b5",
        "f4e5",
        "f4g5"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "d5d6",
          "san": "d6",
          "reasonItIsTempting": "d6 is legal and pursues a nearby plan.",
          "whyItFails": "d6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "c4c5",
          "san": "c5",
          "reasonItIsTempting": "c5 is legal and pursues a nearby plan.",
          "whyItFails": "c5 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "c4b5",
          "san": "cxb5",
          "reasonItIsTempting": "cxb5 is legal and pursues a nearby plan.",
          "whyItFails": "cxb5 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "hard",
      "prompt": "Change the pawn structure with dxe6.",
      "lessonObjective": "Change the pawn structure with dxe6.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with dxe6.",
        "detailed": "dxe6 is structural because it changes the position before and after: no verified structural transformation. The move changes the d and e file(s), controls d7, f7, and creates weaknesses on c6, e6.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "d6 does not create the verified before/after feature: no verified structural transformation.",
          "c5 does not create the verified before/after feature: no verified structural transformation.",
          "cxb5 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "e6",
        "from": "d5",
        "to": "e6",
        "capture": "e6",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "d",
          "e"
        ],
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
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|r2qkb1r/p1pp1pp1/b4n2/np1Pp2p/2P2B1P/N2Q4/PP2PPP1/R3KBNR w KQkq e6|d5e6|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 86
    }
  },
  {
    "id": "stage8m-structure_builder-4b48133c",
    "miniGameId": "structure_builder",
    "version": "stage8m.v1",
    "source": {
      "kind": "opening_frame",
      "sourceId": "0a1d7a6c16d5edf9b4a4776f2a5e36a191442530",
      "seed": "stage-8m-plus:structure_builder",
      "generatorId": "structureBuilderGenerator",
      "openingId": "italian-white"
    },
    "board": {
      "fen": "rnbqkbnr/2pp1ppp/8/pp2p3/3P4/N1P3P1/PP2PP1P/R1BQKBNR b KQkq - 0 4",
      "sideToMove": "b",
      "orientation": "black",
      "phase": "opening",
      "materialSignature": "w:p8n2b2r2q1|b:p8n2b2r2q1",
      "pieceCount": 32,
      "pawnCount": 16
    },
    "solution": {
      "primaryMoveUci": "e5d4",
      "san": "exd4",
      "moveType": "pawn_break",
      "legalAlternatives": [
        "a8a7",
        "a8a6",
        "b8c6",
        "b8a6",
        "c8b7"
      ],
      "plausibleWrongMoves": [
        {
          "moveUci": "a8a7",
          "san": "Ra7",
          "reasonItIsTempting": "Ra7 is legal and pursues a nearby plan.",
          "whyItFails": "Ra7 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "a8a6",
          "san": "Ra6",
          "reasonItIsTempting": "Ra6 is legal and pursues a nearby plan.",
          "whyItFails": "Ra6 does not create the verified before/after feature: no verified structural transformation."
        },
        {
          "moveUci": "b8c6",
          "san": "Nc6",
          "reasonItIsTempting": "Nc6 is legal and pursues a nearby plan.",
          "whyItFails": "Nc6 does not create the verified before/after feature: no verified structural transformation."
        }
      ]
    },
    "pedagogy": {
      "concept": "pawn_break",
      "subConcept": "pawn_break",
      "difficultyBand": "expert",
      "prompt": "Change the pawn structure with exd4.",
      "lessonObjective": "Change the pawn structure with exd4.",
      "transferPattern": "A purposeful pawn move produces a measurable structural change, not merely space.",
      "explanation": {
        "short": "Change the pawn structure with exd4.",
        "detailed": "exd4 is structural because it changes the position before and after: no verified structural transformation. The move changes the e and d file(s), controls c3, e3, and creates weaknesses on d4, f4.",
        "coachNote": "Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.",
        "whyAlternativesFail": [
          "Ra7 does not create the verified before/after feature: no verified structural transformation.",
          "Ra6 does not create the verified before/after feature: no verified structural transformation.",
          "Nc6 does not create the verified before/after feature: no verified structural transformation."
        ]
      },
      "proof": {
        "movedPawn": "d4",
        "from": "e5",
        "to": "d4",
        "capture": "d4",
        "beforeTags": [],
        "afterTags": [],
        "openedFiles": [],
        "halfOpenedFiles": [
          "d",
          "e"
        ],
        "openedDiagonals": [
          "e5"
        ],
        "newlyWeakSquares": [
          "d4",
          "f4"
        ],
        "improvedSquares": [
          "c3",
          "e3"
        ],
        "changedFiles": [
          "e",
          "d"
        ],
        "summary": "no verified structural transformation",
        "meaningful": true
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
      "noveltyKey": "structure_builder|rnbqkbnr/2pp1ppp/8/pp2p3/3P4/N1P3P1/PP2PP1P/R1BQKBNR b KQkq -|e5d4|pawn_break",
      "densityScore": 100,
      "clarityScore": 88,
      "pedagogyScore": 88,
      "difficultyScore": 94
    }
  }
];
