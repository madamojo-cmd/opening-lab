
import "./styles.css";

const app = document.getElementById("app");

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const PIECE_GLYPHS = {
  "white-king": "♔",
  "white-queen": "♕",
  "white-rook": "♖",
  "white-bishop": "♗",
  "white-knight": "♘",
  "white-pawn": "♙",
  "black-king": "♚",
  "black-queen": "♛",
  "black-rook": "♜",
  "black-bishop": "♝",
  "black-knight": "♞",
  "black-pawn": "♟"
};

const SYSTEMS = {
  "bifurcation-chamber": "Bifurcation Chamber",
  "compression-clamp": "Compression Clamp",
  "occlusion-lens": "Occlusion Lens",
  "burden-lattice": "Burden Lattice",
  "oxygen-dome": "Oxygen Dome",
  "stress-fracture": "Stress Fracture Plate",
  "gravity-anchor": "Gravity Anchor",
  "current-field": "Current Field",
  "warning-ledger": "Warning Ledger",
  "sink-cell": "Sink Cell",
  "predator-prey": "Predator / Prey",
  "temporal-gate": "Temporal Gate",
  "neural-constellation": "Neural Constellation"
};

function pkg(id, name, description, system, palette, opts = {}) {
  return {
    id,
    name,
    description,
    system,
    speed: opts.speed ?? 1,
    intensity: opts.intensity ?? 1,
    complexity: opts.complexity ?? 1,
    palette,
    notes: opts.notes ?? [
      "This is a motif-object renderer, not a themed arrow.",
      "Tune speed, intensity, complexity, and palette through uploaded JSON."
    ]
  };
}

const defaultPackages = [
  pkg(
    "fork-bifurcation-chamber",
    "Fork: Bifurcation Chamber",
    "A source square opens a split chamber into two target compartments. The graphic teaches simultaneous threats instead of drawing one arrow.",
    "bifurcation-chamber",
    ["#ff4fd8", "#7aa7ff", "#fff06a", "#160617"],
    { speed: 1.05, intensity: 1.12, complexity: 1.2, notes: ["Best for knight forks, queen forks, and double attacks.", "The chamber shows that the opponent cannot answer both targets."] }
  ),
  pkg(
    "pin-compression-clamp",
    "Pin: Compression Clamp",
    "The pinned piece is physically clamped between attacker and anchor. Escape directions shrink and the piece loses visual freedom.",
    "compression-clamp",
    ["#f7efb6", "#ffc857", "#ff6b6b", "#1b1508"],
    { speed: 0.82, intensity: 1.08, complexity: 1.05, notes: ["Best for absolute pins and relative pins.", "The user sees immobilization, not just a line."] }
  ),
  pkg(
    "xray-occlusion-lens",
    "X-Ray: Occlusion Lens",
    "A refractive lens passes through blockers and reveals the hidden target behind them. The blocker becomes a visual curtain.",
    "occlusion-lens",
    ["#66f2ff", "#d3fff7", "#ffdf80", "#061416"],
    { speed: 0.95, intensity: 1.18, complexity: 1.1, notes: ["Best for x-rays, skewers, batteries, and discovered geometry.", "Teaches that danger existed behind obstruction."] }
  ),
  pkg(
    "overload-burden-lattice",
    "Overload: Burden Lattice",
    "The defender carries weighted responsibility nodes. Multiple tethers strain until the visual workload becomes impossible.",
    "burden-lattice",
    ["#8fd3ff", "#d5a6ff", "#ff7070", "#07131e"],
    { speed: 1, intensity: 1.05, complexity: 1.25, notes: ["Best for overload, deflection, and removal of the guard.", "Shows defensive workload as physical weight."] }
  ),
  pkg(
    "king-oxygen-dome",
    "King Safety: Oxygen Dome",
    "The king zone becomes a breathing shell. Escape pockets shrink as attackers drain oxygen around the king.",
    "oxygen-dome",
    ["#c9f7ff", "#88a6ff", "#ff4d6d", "#050d18"],
    { speed: 0.72, intensity: 1.15, complexity: 1.2, notes: ["Best for mating nets, back-rank threats, and escape-square counting.", "Checkmate becomes spatial suffocation."] }
  ),
  pkg(
    "pawn-stress-fracture",
    "Pawn Break: Stress Fracture Plate",
    "The pawn chain behaves like loaded architecture. Crack systems propagate from the break point into the position.",
    "stress-fracture",
    ["#ff9f6e", "#ffd166", "#ffffff", "#170c07"],
    { speed: 0.92, intensity: 1.1, complexity: 1.35, notes: ["Best for pawn breaks, center tension, and undermining.", "Makes structure collapse visible before the move lands."] }
  ),
  pkg(
    "outpost-gravity-anchor",
    "Outpost: Gravity Anchor",
    "A strategically important square becomes a gravitational basin. Rings and vector pulls show why pieces want to occupy it.",
    "gravity-anchor",
    ["#bda7ff", "#7ee7ff", "#ffe66d", "#0b0717"],
    { speed: 0.78, intensity: 1.06, complexity: 1.15, notes: ["Best for outposts, weak-square occupation, and rerouting.", "Shows positional magnets rather than tactical explosions."] }
  ),
  pkg(
    "initiative-current-field",
    "Initiative: Current Field",
    "Active pieces emit flowing currents through open channels. Passive regions stagnate while forcing lines gather momentum.",
    "current-field",
    ["#6ee7ff", "#6affb3", "#fff176", "#061316"],
    { speed: 1.18, intensity: 1.0, complexity: 1.28, notes: ["Best for development, activity, and attacking continuation.", "Shows who controls the conversation."] }
  ),
  pkg(
    "threat-warning-ledger",
    "Threat Debt: Warning Ledger",
    "Unresolved threats leave accumulating ledger marks. Passive play visibly compounds tactical debt.",
    "warning-ledger",
    ["#ff5555", "#f5b841", "#ffffff", "#130606"],
    { speed: 1.05, intensity: 1.15, complexity: 1.1, notes: ["Best for blunder prevention and delayed consequences.", "Turns neglected threats into visible debt."] }
  ),
  pkg(
    "weak-square-sink-cell",
    "Weak Square: Sink Cell",
    "Weak squares become dark sink cells that bend pressure inward. The board shows absence and vulnerability rather than decoration.",
    "sink-cell",
    ["#b4f1ff", "#6270ff", "#000000", "#050711"],
    { speed: 0.9, intensity: 1.18, complexity: 1.05, notes: ["Best for weak squares, holes, and unprotected territory.", "Animates absence as the main object."] }
  ),
  pkg(
    "hunt-predator-prey",
    "Tactical Hunt: Predator / Prey",
    "Targets behave like prey and attackers create stalking cones. The tactic feels hunted before it is drawn.",
    "predator-prey",
    ["#ff5d5d", "#ffb15d", "#ffe66d", "#1b090c"],
    { speed: 1.2, intensity: 1.1, complexity: 1.2, notes: ["Best for loose pieces, king hunts, and tactical punishment.", "Motion emphasizes the victim, not only the attack path."] }
  ),
  pkg(
    "timing-temporal-gate",
    "Timing: Temporal Gate",
    "Move-order gates rotate, lock, and unlock in sequence. Premature ideas feel incomplete until the timing aligns.",
    "temporal-gate",
    ["#93f5c8", "#f8f0a6", "#ff8a70", "#07150f"],
    { speed: 0.74, intensity: 1.0, complexity: 1.1, notes: ["Best for move order, waiting moves, and opening timing.", "Makes now versus not-yet visually testable."] }
  ),
  pkg(
    "coordination-neural-constellation",
    "Coordination: Neural Constellation",
    "Pieces become connected nodes in a tactical neural map. Relationships illuminate in layers until the motif appears as a network.",
    "neural-constellation",
    ["#8ca7ff", "#ff7ad9", "#fff0a8", "#090617"],
    { speed: 1.08, intensity: 1.08, complexity: 1.4, notes: ["Best for multi-piece coordination, mating nets, and complex motifs.", "Shows chess ideas as relationship networks."] }
  )
];

function piece(square, color, type, label = "") {
  return { square, color, type, label };
}
function cue(square, role, label = "", weight = 1) {
  return { square, role, label, weight };
}
function line(from, to, role, label = "", curve = 0, weight = 1) {
  return { from, to, role, label, curve, weight };
}


const defaultScenes = [
  {
    id: "legal-knight-fork-e5",
    name: "Legal Knight Fork: Ne5",
    motif: "Fork / Double Attack",
    responsibility: "See that the knight's landing square attacks two real targets.",
    headline: "A knight fork is only true if the knight actually attacks both targets from the landing square.",
    coach: "From f3 to e5, the knight attacks c6, d7, f7, g6, c4, d3, g4, and h4. In this scene, the key fork targets are c6 and f7, with f7 also weakened by the bishop on c4.",
    timeline: [
      "Find the knight on f3.",
      "Confirm that Ne5 is a legal knight move.",
      "From e5, identify the real attacked target squares.",
      "Notice that c6 and f7 are both under knight pressure."
    ],
    pieces: [
      piece("g1", "white", "king"),
      piece("d1", "white", "queen"),
      piece("c4", "white", "bishop", "supports f7"),
      piece("f3", "white", "knight", "attacker"),
      piece("e4", "white", "pawn"),
      piece("g8", "black", "king"),
      piece("a8", "black", "rook"),
      piece("f8", "black", "rook"),
      piece("c6", "black", "knight", "target"),
      piece("f7", "black", "pawn", "target"),
      piece("d7", "black", "pawn", "also attacked")
    ],
    cues: [
      cue("f3", "source", "source"),
      cue("e5", "destination", "Ne5", 2),
      cue("c6", "target", "attacked", 2),
      cue("f7", "target", "attacked", 2),
      cue("d7", "target", "also attacked", 1),
      cue("c4", "anchor", "bishop support", 1)
    ],
    lines: [
      Object.assign(line("f3", "e5", "primary", "Ne5", 0, 3), { pathStyle: "knight-l", knightCorner: "rank-first" }),
      line("e5", "c6", "secondary", "knight attacks", 0, 2),
      line("e5", "f7", "secondary", "knight attacks", 0, 2),
      line("e5", "d7", "secondary", "knight attacks", 0, 1),
      line("c4", "f7", "background", "bishop pressure", 0, 1)
    ]
  },
  {
    id: "absolute-pin-b5-c6-e8",
    name: "Absolute Pin: Bb5",
    motif: "Pin / Immobilization",
    responsibility: "See the attacker, pinned piece, and king on one true line.",
    headline: "The knight on c6 is pinned because moving it would expose the king on e8.",
    coach: "This is a legal absolute pin geometry: bishop b5, knight c6, and king e8 are on the same diagonal. The pinned knight cannot freely move because the king behind it would be exposed.",
    timeline: [
      "Find the bishop on b5.",
      "Trace the diagonal through c6.",
      "Confirm the king sits behind the pinned piece on e8.",
      "Treat the knight as tactically restricted."
    ],
    pieces: [
      piece("e1", "white", "king"),
      piece("d1", "white", "queen"),
      piece("b5", "white", "bishop", "attacker"),
      piece("g1", "white", "knight"),
      piece("e4", "white", "pawn"),
      piece("e8", "black", "king", "anchor"),
      piece("c6", "black", "knight", "pinned"),
      piece("a8", "black", "rook"),
      piece("h8", "black", "rook"),
      piece("e5", "black", "pawn")
    ],
    cues: [
      cue("b5", "source", "attacker"),
      cue("c6", "blocker", "pinned", 2),
      cue("e8", "anchor", "king", 3)
    ],
    lines: [
      line("b5", "c6", "primary", "pin pressure", 0, 2),
      line("c6", "e8", "pin", "king behind", 0, 2)
    ]
  },
  {
    id: "rook-xray-a-file",
    name: "Rook X-Ray on the a-file",
    motif: "X-Ray / Hidden Geometry",
    responsibility: "See through the blocker to the real target behind it.",
    headline: "The rook line is tactically meaningful because the blocker and hidden target share the same file.",
    coach: "This is a true rook x-ray: the rook on a1, blocker on a5, and queen on a8 all sit on the a-file. The first piece blocks the line, but the hidden target is aligned behind it.",
    timeline: [
      "Identify the rook on a1.",
      "Find the blocker on a5.",
      "Look beyond it to the queen on a8.",
      "Understand why removing or moving the blocker exposes the target."
    ],
    pieces: [
      piece("a1", "white", "rook", "rook"),
      piece("e1", "white", "king"),
      piece("d4", "white", "queen"),
      piece("a5", "black", "pawn", "blocker"),
      piece("a8", "black", "queen", "hidden target"),
      piece("g8", "black", "king")
    ],
    cues: [
      cue("a1", "source", "source"),
      cue("a5", "blocker", "blocker", 2),
      cue("a8", "target", "hidden", 3)
    ],
    lines: [
      line("a1", "a5", "primary", "visible file", 0, 2),
      line("a5", "a8", "xray", "hidden file", 0, 3)
    ]
  },
  {
    id: "overloaded-defender-queen-rook",
    name: "Overloaded Defender: Queen and Rook",
    motif: "Overload / Defender Workload",
    responsibility: "See a defender protecting two real pieces at once.",
    headline: "The defender on e7 is overloaded because it guards both d8 and f8.",
    coach: "The bishop on e7 protects the queen on d8 and the rook on f8. If a tactic forces it to choose, one responsibility may fail. The rendering should show true defender workload, not invented attacks.",
    timeline: [
      "Find the defender on e7.",
      "Confirm it protects d8 diagonally.",
      "Confirm it protects f8 diagonally.",
      "Look for a forcing move that makes one duty impossible."
    ],
    pieces: [
      piece("g1", "white", "king"),
      piece("d1", "white", "queen"),
      piece("c4", "white", "bishop"),
      piece("g5", "white", "knight", "pressure"),
      piece("g8", "black", "king"),
      piece("d8", "black", "queen", "protected"),
      piece("f8", "black", "rook", "protected"),
      piece("e7", "black", "bishop", "overworked"),
      piece("f7", "black", "pawn")
    ],
    cues: [
      cue("e7", "overloaded", "defender", 3),
      cue("d8", "target", "queen", 2),
      cue("f8", "target", "rook", 2),
      cue("g8", "anchor", "king", 2)
    ],
    lines: [
      line("e7", "d8", "burden", "guards queen", 0, 2),
      line("e7", "f8", "burden", "guards rook", 0, 2),
      line("g5", "f7", "secondary", "pressure", 0.1, 1),
      line("c4", "f7", "background", "bishop pressure", 0, 1)
    ]
  },
  {
    id: "legal-king-suffocation",
    name: "King Suffocation: Escape Squares",
    motif: "King Safety / Escape Squares",
    responsibility: "Count real escape squares and attacking lines around the king.",
    headline: "King danger becomes concrete when escape squares are covered or occupied.",
    coach: "The black king on g8 has limited air. Own pieces occupy g7 and h7, the rook occupies f8, and White's bishop on c4 attacks f7. The display should show shrinking safe space rather than claiming checkmate too early.",
    timeline: [
      "Locate the king on g8.",
      "Mark occupied escape squares.",
      "Mark soft squares near the king.",
      "Ask what attacking move would reduce the remaining air."
    ],
    pieces: [
      piece("g1", "white", "king"),
      piece("f3", "white", "knight", "attacker"),
      piece("c4", "white", "bishop", "pressure"),
      piece("d1", "white", "queen"),
      piece("g8", "black", "king", "king"),
      piece("f8", "black", "rook", "occupied"),
      piece("g7", "black", "pawn", "occupied"),
      piece("h7", "black", "pawn", "occupied"),
      piece("f7", "black", "pawn", "soft")
    ],
    cues: [
      cue("g8", "king", "king", 3),
      cue("h8", "escape", "escape", 1),
      cue("f8", "escape", "occupied", 2),
      cue("g7", "shield", "occupied", 1),
      cue("h7", "shield", "occupied", 1),
      cue("f7", "target", "bishop target", 2)
    ],
    lines: [
      line("c4", "f7", "secondary", "bishop attacks", 0, 2),
      Object.assign(line("f3", "g5", "primary", "knight jump", 0, 2), { pathStyle: "knight-l", knightCorner: "file-first" }),
      line("d1", "h5", "background", "queen route", 0.2, 1)
    ]
  },
  {
    id: "central-pawn-break-d4-e5",
    name: "Central Pawn Break: d4xe5",
    motif: "Pawn Break / Structure Stress",
    responsibility: "See the legal pawn break and the structure it challenges.",
    headline: "A pawn break is accurate when the pawn can actually capture or advance into the contact point.",
    coach: "White's pawn on d4 can capture e5. That makes e5 the real contact point, while black's d6 pawn supports the e5 pawn. The stress-fracture rendering should show that structural relationship.",
    timeline: [
      "Find the white pawn on d4.",
      "Confirm d4xe5 is a legal capture.",
      "See the e5 pawn as the contact point.",
      "Notice black's d6 pawn supporting the structure."
    ],
    pieces: [
      piece("g1", "white", "king"),
      piece("d1", "white", "queen"),
      piece("c4", "white", "bishop"),
      piece("f3", "white", "knight"),
      piece("d4", "white", "pawn", "breaker"),
      piece("e5", "black", "pawn", "contact"),
      piece("d6", "black", "pawn", "support"),
      piece("g8", "black", "king"),
      piece("c6", "black", "knight")
    ],
    cues: [
      cue("d4", "break", "breaker", 3),
      cue("e5", "weak", "contact", 2),
      cue("d6", "anchor", "support", 1)
    ],
    lines: [
      line("d4", "e5", "primary", "dxe5", 0, 3),
      line("d6", "e5", "secondary", "supports", 0, 1),
      line("c4", "f7", "background", "future pressure", 0, 1)
    ]
  },
  {
    id: "midgame-attack-kingside",
    name: "Midgame Attack: Kingside Build-Up",
    motif: "General Attack / Development",
    responsibility: "See real attacking coordination against the king zone.",
    headline: "A midgame attack is credible when multiple pieces point at real squares around the king.",
    coach: "White's bishop on c4 attacks f7, the queen can route to h5, and the knight can jump from f3 to g5. The rook lift h1-h3 is a legal rook move if the h-file is clear, preparing a possible swing toward the kingside.",
    timeline: [
      "Identify the king zone.",
      "Confirm each attacking line is geometrically real.",
      "See the knight's legal L-shaped route.",
      "Understand the rook lift as attack development."
    ],
    pieces: [
      piece("g1", "white", "king"),
      piece("d1", "white", "queen", "queen route"),
      piece("h1", "white", "rook", "rook lift"),
      piece("c4", "white", "bishop", "bishop line"),
      piece("f3", "white", "knight", "knight jump"),
      piece("e4", "white", "pawn"),
      piece("g8", "black", "king", "target"),
      piece("f8", "black", "rook"),
      piece("g7", "black", "pawn", "shield"),
      piece("h7", "black", "pawn", "hook"),
      piece("f7", "black", "pawn", "soft")
    ],
    cues: [
      cue("g8", "king", "king zone", 3),
      cue("h7", "target", "hook", 2),
      cue("f7", "target", "bishop target", 2),
      cue("h1", "source", "rook"),
      cue("h3", "destination", "lift", 2),
      cue("g5", "destination", "knight jump", 2)
    ],
    lines: [
      line("h1", "h3", "primary", "Rh3", 0, 3),
      line("d1", "h5", "secondary", "queen route", 0.18, 2),
      line("c4", "f7", "secondary", "bishop attacks", 0, 2),
      Object.assign(line("f3", "g5", "primary", "Ng5", 0, 2), { pathStyle: "knight-l", knightCorner: "file-first" }),
      line("h3", "g3", "background", "rook swing", 0, 1)
    ]
  },
  {
    id: "defensive-consolidation-kingside",
    name: "Defensive Consolidation: Kingside",
    motif: "General Defense / Consolidation",
    responsibility: "See how defenders cover real entry squares and reduce attacking access.",
    headline: "Good defense is not passive decoration. It covers real lanes, entry squares, and tactical targets.",
    coach: "Black's queen on e7 supports e8 and helps defend the seventh rank. The knight on f6 covers h7 and g4. The rook on f8 and pawns on g7/h7 form a defensive shell, while White's attacking lanes remain visible in the background.",
    timeline: [
      "Find the attacked sector near the king.",
      "Identify real defensive coverage.",
      "Notice which entry squares remain weak.",
      "Compare defensive organization against attacking lanes."
    ],
    pieces: [
      piece("g8", "black", "king", "defending king"),
      piece("f8", "black", "rook", "defender"),
      piece("e7", "black", "queen", "reinforcer"),
      piece("g7", "black", "pawn", "shield"),
      piece("h7", "black", "pawn", "shield"),
      piece("f6", "black", "knight", "covers h7"),
      piece("g1", "white", "king"),
      piece("d1", "white", "queen", "attacker"),
      piece("c4", "white", "bishop"),
      piece("g5", "white", "knight", "pressure")
    ],
    cues: [
      cue("g8", "king", "king zone", 3),
      cue("f7", "weak", "entry", 2),
      cue("h7", "shield", "covered", 2),
      cue("e7", "anchor", "queen support", 2),
      cue("f8", "source", "rook"),
      cue("e8", "destination", "cover", 2)
    ],
    lines: [
      line("f8", "e8", "primary", "rook cover", 0, 2),
      line("e7", "e8", "secondary", "queen support", 0, 2),
      Object.assign(line("f6", "h7", "secondary", "knight guards", 0, 1), { pathStyle: "knight-l", knightCorner: "file-first" }),
      line("d1", "h5", "background", "attack lane", 0.2, 1),
      line("c4", "f7", "background", "bishop pressure", 0, 1)
    ]
  },
  {
    id: "central-development-pressure",
    name: "Central Development Pressure",
    motif: "Midgame Development / Piece Improvement",
    responsibility: "See how improving pieces creates real central pressure.",
    headline: "Midgame development means improving piece influence toward meaningful files and squares.",
    coach: "The rook on e1 pressures the e-file, the bishop on c4 eyes d5 and f7, and the knight on f3 can support central squares. This is not a tactic yet; it is a truthful picture of improving pieces.",
    timeline: [
      "Find the central file.",
      "See the rook's file pressure.",
      "Confirm the bishop's diagonal pressure.",
      "Use piece improvement to prepare the next plan."
    ],
    pieces: [
      piece("g1", "white", "king"),
      piece("d1", "white", "queen"),
      piece("e1", "white", "rook", "central rook"),
      piece("c4", "white", "bishop", "active bishop"),
      piece("f3", "white", "knight", "improver"),
      piece("d4", "white", "pawn"),
      piece("g8", "black", "king"),
      piece("d8", "black", "queen"),
      piece("e8", "black", "rook"),
      piece("c6", "black", "knight"),
      piece("e5", "black", "pawn")
    ],
    cues: [
      cue("e1", "source", "rook"),
      cue("e4", "destination", "e-file pressure", 2),
      cue("d5", "target", "central square", 2),
      cue("e5", "target", "central pawn", 2),
      cue("f3", "source", "knight")
    ],
    lines: [
      line("e1", "e4", "primary", "e-file pressure", 0, 3),
      Object.assign(line("f3", "d4", "secondary", "knight supports", 0, 1), { pathStyle: "knight-l", knightCorner: "rank-first" }),
      line("c4", "d5", "secondary", "bishop eyes", 0, 2),
      line("d4", "e5", "secondary", "central tension", 0, 2)
    ]
  },
  {
    id: "active-defense-counterpunch",
    name: "Active Defense: Counterpunch",
    motif: "Defense / Counterattack",
    responsibility: "See a defensive move that also creates a real counter-threat.",
    headline: "The strongest defense often parries pressure while creating a threat of its own.",
    coach: "Black's bishop on c5 attacks f2 along the diagonal c5-d4-e3-f2, which is a real target near White's king. This scene shows active defense as counter-pressure rather than passive blocking.",
    timeline: [
      "Find White's attacking pressure.",
      "Find Black's active defender.",
      "Confirm the bishop's real diagonal target on f2.",
      "Recognize how counterplay can change the initiative."
    ],
    pieces: [
      piece("g8", "black", "king"),
      piece("d8", "black", "queen", "counter support"),
      piece("f8", "black", "rook"),
      piece("c5", "black", "bishop", "active defender"),
      piece("f6", "black", "knight"),
      piece("g1", "white", "king"),
      piece("d1", "white", "queen", "attacker"),
      piece("c4", "white", "bishop"),
      piece("g5", "white", "knight", "pressure"),
      piece("h5", "white", "queen", "pressure"),
      piece("f2", "white", "pawn", "target")
    ],
    cues: [
      cue("h7", "weak", "white threat", 2),
      cue("c5", "source", "bishop"),
      cue("f2", "target", "counter target", 2),
      cue("d8", "anchor", "queen"),
      cue("e7", "destination", "organize", 1)
    ],
    lines: [
      line("c5", "f2", "primary", "bishop attacks f2", 0, 3),
      line("d8", "e7", "secondary", "organize", 0, 1),
      line("h5", "h7", "background", "white threat", 0, 1),
      Object.assign(line("g5", "f7", "background", "knight idea", 0, 1), { pathStyle: "knight-l", knightCorner: "rank-first" })
    ]
  }
];

const state = {
  scenes: structuredClone(defaultScenes),
  packages: structuredClone(defaultPackages),
  sceneId: "knight-fork",
  primaryId: "fork-bifurcation-chamber",
  compareId: "pin-compression-clamp",
  density: "balanced",
  compare: false,
  coords: true,
  labels: true,
  motion: true,
  jsonText: "",
  status: "Ready. Upload packages or scenes as JSON."
};

let boards = [];
let animationId = 0;

function squareToXY(square, size) {
  const file = square?.[0];
  const rank = Number(square?.[1]);
  const xIndex = FILES.indexOf(file);
  const yIndex = RANKS.indexOf(rank);
  if (xIndex < 0 || yIndex < 0) return { x: size / 2, y: size / 2 };
  const cell = size / 8;
  return {
    x: xIndex * cell + cell / 2,
    y: yIndex * cell + cell / 2,
    cell
  };
}

function getScene() {
  return state.scenes.find((s) => s.id === state.sceneId) || state.scenes[0];
}

function getPrimaryPackage() {
  return state.packages.find((p) => p.id === state.primaryId) || state.packages[0];
}

function getComparePackage() {
  return state.packages.find((p) => p.id === state.compareId) || state.packages[1] || state.packages[0];
}

function visibleLines(scene) {
  if (state.density === "minimal") {
    return scene.lines.filter((l) => ["primary", "pin", "xray"].includes(l.role));
  }
  if (state.density === "balanced") {
    return scene.lines.filter((l) => l.role !== "background");
  }
  return scene.lines;
}

function visibleCues(scene) {
  if (state.density === "minimal") {
    return scene.cues.filter((c) => ["destination", "target", "weak", "king", "blocker", "overloaded", "break"].includes(c.role));
  }
  if (state.density === "balanced") {
    return scene.cues.filter((c) => c.role !== "anchor" || c.weight > 1);
  }
  return scene.cues;
}

function pathPoints(line, size) {
  const a = squareToXY(line.from, size);
  const b = squareToXY(line.to, size);

  if (line.pathStyle === "knight-l") {
    const corner = (line.knightCorner || "file-first") === "rank-first"
      ? { x: a.x, y: b.y }
      : { x: b.x, y: a.y };
    const seg1 = Math.max(1, Math.hypot(corner.x - a.x, corner.y - a.y));
    const seg2 = Math.max(1, Math.hypot(b.x - corner.x, b.y - corner.y));
    return {
      a,
      b,
      c1: corner,
      curve: 0,
      style: "knight-l",
      seg1,
      seg2,
      total: seg1 + seg2
    };
  }

  const curve = line.curve || 0;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const c = curve * size * 0.16;
  return {
    a,
    b,
    c: { x: mx + nx * c, y: my + ny * c },
    curve,
    style: "curve"
  };
}

function quadraticPoint(p, t) {
  if (p.style === "knight-l") {
    const split = p.seg1 / p.total;
    if (t <= split) {
      const tt = split <= 0 ? 0 : t / split;
      return {
        x: mix(p.a.x, p.c1.x, tt),
        y: mix(p.a.y, p.c1.y, tt)
      };
    }
    const tt = split >= 1 ? 1 : (t - split) / (1 - split);
    return {
      x: mix(p.c1.x, p.b.x, tt),
      y: mix(p.c1.y, p.b.y, tt)
    };
  }

  const mt = 1 - t;
  return {
    x: mt * mt * p.a.x + 2 * mt * t * p.c.x + t * t * p.b.x,
    y: mt * mt * p.a.y + 2 * mt * t * p.c.y + t * t * p.b.y
  };
}

function drawQuad(ctx, p) {
  ctx.beginPath();
  ctx.moveTo(p.a.x, p.a.y);
  if (p.style === "knight-l") {
    ctx.lineTo(p.c1.x, p.c1.y);
    ctx.lineTo(p.b.x, p.b.y);
  } else if (Math.abs(p.curve) > 0.001) {
    ctx.quadraticCurveTo(p.c.x, p.c.y, p.b.x, p.b.y);
  } else {
    ctx.lineTo(p.b.x, p.b.y);
  }
}

function getArrowVector(p) {
  if (p.style === "knight-l") {
    return { from: p.c1, to: p.b };
  }
  return { from: p.c || p.a, to: p.b };
}

function withGlow(ctx, color, blur = 20) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

function rgba(hex, alpha) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function drawArrowHead(ctx, from, to, color, scale = 1) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const s = 11 * scale;
  ctx.save();
  ctx.translate(to.x, to.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-s, -s * 0.55);
  ctx.lineTo(-s * 0.75, 0);
  ctx.lineTo(-s, s * 0.55);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.76;
  ctx.fill();
  ctx.restore();
}

function drawBoardBase(ctx, scene, pkg, t, size) {
  const cell = size / 8;
  ctx.save();

  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, rgba(pkg.palette[3], 0.65));
  bg.addColorStop(1, "#05070b");
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, size, size, cell * 0.18);
  ctx.fill();

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const isLight = (x + y) % 2 === 0;
      const px = x * cell;
      const py = y * cell;
      ctx.fillStyle = isLight ? "#d9e1c8" : "#769656";
      ctx.fillRect(px, py, cell, cell);

      const gx = px + cell * 0.5;
      const gy = py + cell * 0.5;
      const highlight = ctx.createRadialGradient(gx, gy - cell * 0.18, 2, gx, gy, cell * 0.62);
      highlight.addColorStop(0, "rgba(255,255,255,0.16)");
      highlight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = highlight;
      ctx.fillRect(px, py, cell, cell);
    }
  }

  drawBoardReactions(ctx, scene, pkg, t, size);

  if (state.coords) {
    ctx.font = `${Math.max(10, cell * 0.12)}px Inter, Arial`;
    ctx.fontWeight = "900";
    ctx.fillStyle = "rgba(16, 24, 32, 0.55)";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    RANKS.forEach((rank, y) => {
      ctx.fillText(String(rank), 6, y * cell + 5);
    });
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    FILES.forEach((file, x) => {
      ctx.fillText(file, x * cell + cell - 6, size - 5);
    });
  }

  ctx.restore();
}

function drawBoardReactions(ctx, scene, pkg, t, size) {
  const cues = visibleCues(scene);
  for (const cue of cues) {
    const p = squareToXY(cue.square, size);
    const w = (cue.weight || 1);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.1 + p.x * 0.01);
    if (["target", "weak", "king", "overloaded", "break", "blocker"].includes(cue.role)) {
      const grd = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.cell * (0.95 + pulse * 0.3));
      grd.addColorStop(0, rgba(pkg.palette[2], 0.16 + 0.12 * pulse));
      grd.addColorStop(0.55, rgba(pkg.palette[0], 0.09 * w));
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(p.x - p.cell, p.y - p.cell, p.cell * 2, p.cell * 2);
    }
  }
}

function drawLines(ctx, scene, pkg, size) {
  const lines = visibleLines(scene);
  for (const line of lines) {
    const p = pathPoints(line, size);
    ctx.save();
    drawQuad(ctx, p);
    ctx.lineWidth = line.role === "primary" ? size * 0.008 : line.role === "background" ? size * 0.0035 : size * 0.0056;
    ctx.strokeStyle = line.role === "primary" ? rgba(pkg.palette[0], 0.78) : rgba(pkg.palette[1], line.role === "background" ? 0.24 : 0.44);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (line.role === "background") ctx.setLineDash([size * 0.012, size * 0.018]);
    ctx.stroke();
    if (line.role === "primary") {
      const arrow = getArrowVector(p);
      drawArrowHead(ctx, arrow.from, arrow.to, pkg.palette[0], size / 620);
    }
    ctx.restore();
  }
}

function drawPieces(ctx, scene, size) {
  const cell = size / 8;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const piece of scene.pieces) {
    const p = squareToXY(piece.square, size);
    const key = `${piece.color}-${piece.type}`;
    const glyph = PIECE_GLYPHS[key] || "?";
    ctx.save();
    ctx.font = `${cell * 0.66}px Georgia, "Times New Roman", serif`;
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = cell * 0.18;
    ctx.shadowOffsetY = cell * 0.08;
    ctx.fillStyle = piece.color === "white" ? "#fffdf5" : "#151821";
    ctx.strokeStyle = piece.color === "white" ? "rgba(40,40,40,0.25)" : "rgba(255,255,255,0.25)";
    ctx.lineWidth = Math.max(1, cell * 0.018);
    ctx.strokeText(glyph, p.x, p.y + cell * 0.02);
    ctx.fillText(glyph, p.x, p.y + cell * 0.02);

    if (state.labels && piece.label) {
      drawLabel(ctx, piece.label, p.x, p.y + cell * 0.38, size, "rgba(0,0,0,0.58)");
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawCuesAndLabels(ctx, scene, pkg, size, t) {
  const cues = visibleCues(scene);
  const cell = size / 8;
  for (const cue of cues) {
    const p = squareToXY(cue.square, size);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + p.x * 0.01);
    const color = cue.role === "target" || cue.role === "weak" ? pkg.palette[2] : cue.role === "destination" || cue.role === "break" ? pkg.palette[0] : pkg.palette[1];

    ctx.save();
    ctx.globalAlpha = 0.45 + pulse * 0.3;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.3, cell * 0.025);
    withGlow(ctx, color, cell * 0.18);
    ctx.beginPath();
    ctx.arc(p.x, p.y, cell * (0.32 + pulse * 0.08), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (state.labels && cue.label && state.density !== "minimal") {
      drawLabel(ctx, cue.label, p.x, p.y - cell * 0.46, size, "rgba(0,0,0,0.58)");
    }
  }
}

function drawLabel(ctx, text, x, y, size, bg) {
  const cell = size / 8;
  ctx.save();
  ctx.font = `${Math.max(10, cell * 0.125)}px Inter, Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const metrics = ctx.measureText(text);
  const w = metrics.width + cell * 0.22;
  const h = cell * 0.24;
  ctx.fillStyle = bg;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.fillText(text, x, y + 0.5);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawMotif(ctx, scene, pkg, size, t) {
  const lines = visibleLines(scene);
  const cues = visibleCues(scene);
  const name = pkg.system;
  if (name === "bifurcation-chamber") return drawBifurcationChamber(ctx, scene, pkg, size, t, lines, cues);
  if (name === "compression-clamp") return drawCompressionClamp(ctx, scene, pkg, size, t, lines, cues);
  if (name === "occlusion-lens") return drawOcclusionLens(ctx, scene, pkg, size, t, lines, cues);
  if (name === "burden-lattice") return drawBurdenLattice(ctx, scene, pkg, size, t, lines, cues);
  if (name === "oxygen-dome") return drawOxygenDome(ctx, scene, pkg, size, t, lines, cues);
  if (name === "stress-fracture") return drawStressFracture(ctx, scene, pkg, size, t, lines, cues);
  if (name === "gravity-anchor") return drawGravityAnchor(ctx, scene, pkg, size, t, lines, cues);
  if (name === "current-field") return drawCurrentField(ctx, scene, pkg, size, t, lines, cues);
  if (name === "warning-ledger") return drawWarningLedger(ctx, scene, pkg, size, t, lines, cues);
  if (name === "sink-cell") return drawSinkCell(ctx, scene, pkg, size, t, lines, cues);
  if (name === "predator-prey") return drawPredatorPrey(ctx, scene, pkg, size, t, lines, cues);
  if (name === "temporal-gate") return drawTemporalGate(ctx, scene, pkg, size, t, lines, cues);
  if (name === "neural-constellation") return drawNeuralConstellation(ctx, scene, pkg, size, t, lines, cues);
}

function drawBifurcationChamber(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  const source = cues.find((c) => c.role === "destination") || cues.find((c) => c.role === "source");
  const targets = cues.filter((c) => c.role === "target").slice(0, 3);
  if (!source || !targets.length) return;
  const s = squareToXY(source.square, size);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2 * pkg.speed);
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (const target of targets) {
    const p = squareToXY(target.square, size);
    const grad = ctx.createLinearGradient(s.x, s.y, p.x, p.y);
    grad.addColorStop(0, rgba(pkg.palette[0], 0.18));
    grad.addColorStop(0.55, rgba(pkg.palette[1], 0.09));
    grad.addColorStop(1, rgba(pkg.palette[2], 0.24 + pulse * 0.1));

    const dx = p.x - s.x;
    const dy = p.y - s.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / len;
    const ny = dx / len;
    const width = cell * (0.35 + pulse * 0.08) * pkg.intensity;

    ctx.beginPath();
    ctx.moveTo(s.x + nx * width * 0.35, s.y + ny * width * 0.35);
    ctx.lineTo(p.x + nx * width, p.y + ny * width);
    ctx.lineTo(p.x - nx * width, p.y - ny * width);
    ctx.lineTo(s.x - nx * width * 0.35, s.y - ny * width * 0.35);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = cell * 0.02;
    ctx.strokeStyle = rgba(pkg.palette[2], 0.35 + pulse * 0.35);
    ctx.stroke();
  }

  withGlow(ctx, pkg.palette[0], cell * 0.45);
  ctx.strokeStyle = pkg.palette[0];
  ctx.lineWidth = cell * 0.035;
  for (const line of lines.filter((l) => l.role !== "background")) {
    const p = pathPoints(line, size);
    drawQuad(ctx, p);
    ctx.globalAlpha = 0.2 + pulse * 0.6;
    ctx.stroke();
  }

  targets.forEach((target, i) => {
    const p = squareToXY(target.square, size);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(t * (0.8 + i * 0.12));
    ctx.strokeStyle = pkg.palette[2];
    ctx.globalAlpha = 0.62;
    ctx.lineWidth = cell * 0.02;
    polygon(ctx, 0, 0, cell * (0.33 + pulse * 0.05), 6);
    ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

function drawCompressionClamp(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  const blocker = cues.find((c) => c.role === "blocker") || cues.find((c) => c.role === "overloaded") || cues.find((c) => c.role === "target");
  const anchor = cues.find((c) => c.role === "anchor") || cues.find((c) => c.role === "king");
  if (!blocker) return;
  const b = squareToXY(blocker.square, size);
  const a = anchor ? squareToXY(anchor.square, size) : { x: b.x + cell, y: b.y };
  const angle = Math.atan2(a.y - b.y, a.x - b.x);
  const squeeze = 0.78 + 0.16 * Math.sin(t * 3 * pkg.speed);
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  lines.forEach((line) => {
    const p = pathPoints(line, size);
    ctx.strokeStyle = rgba(pkg.palette[0], 0.6);
    ctx.lineWidth = cell * 0.045;
    withGlow(ctx, pkg.palette[0], cell * 0.25);
    drawQuad(ctx, p);
    ctx.stroke();
  });

  ctx.translate(b.x, b.y);
  ctx.rotate(angle);
  ctx.scale(squeeze, 1);
  ctx.strokeStyle = pkg.palette[2];
  ctx.lineWidth = cell * 0.04;
  withGlow(ctx, pkg.palette[2], cell * 0.28);

  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * cell * 0.58, -cell * 0.46);
    ctx.lineTo(side * cell * 0.33, -cell * 0.22);
    ctx.lineTo(side * cell * 0.33, cell * 0.22);
    ctx.lineTo(side * cell * 0.58, cell * 0.46);
    ctx.stroke();
  }

  ctx.strokeStyle = rgba(pkg.palette[1], 0.78);
  ctx.lineWidth = cell * 0.018;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(-cell * 0.72, i * cell * 0.14);
    ctx.lineTo(cell * 0.72, i * cell * 0.14);
    ctx.stroke();
  }
  ctx.restore();
}

function drawOcclusionLens(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  lines.forEach((line, i) => {
    const p = pathPoints(line, size);
    const phase = (t * pkg.speed + i * 0.35) % 1;
    const scan = quadraticPoint(p, phase);
    const grad = ctx.createLinearGradient(p.a.x, p.a.y, p.b.x, p.b.y);
    grad.addColorStop(0, rgba(pkg.palette[0], 0.04));
    grad.addColorStop(0.5, rgba(pkg.palette[0], 0.84));
    grad.addColorStop(1, rgba(pkg.palette[1], 0.18));

    ctx.strokeStyle = grad;
    ctx.lineWidth = cell * 0.055;
    ctx.setLineDash([cell * 0.22, cell * 0.1]);
    ctx.lineDashOffset = -t * cell * 2.4;
    withGlow(ctx, pkg.palette[0], cell * 0.36);
    drawQuad(ctx, p);
    ctx.stroke();

    ctx.save();
    ctx.translate(scan.x, scan.y);
    ctx.rotate(t * 1.8);
    const lens = ctx.createRadialGradient(0, 0, cell * 0.08, 0, 0, cell * 0.68);
    lens.addColorStop(0, rgba(pkg.palette[1], 0.46));
    lens.addColorStop(0.62, rgba(pkg.palette[0], 0.18));
    lens.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = lens;
    ctx.beginPath();
    ctx.ellipse(0, 0, cell * 0.7, cell * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  cues.filter((c) => ["blocker", "target"].includes(c.role)).forEach((c, i) => {
    const p = squareToXY(c.square, size);
    ctx.strokeStyle = c.role === "blocker" ? pkg.palette[1] : pkg.palette[2];
    ctx.lineWidth = cell * 0.02;
    ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 2 + i);
    ctx.beginPath();
    ctx.rect(p.x - cell * 0.36, p.y - cell * 0.36, cell * 0.72, cell * 0.72);
    ctx.stroke();
  });
  ctx.restore();
}

function drawBurdenLattice(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  const defender = cues.find((c) => c.role === "overloaded") || cues.find((c) => c.role === "source");
  if (!defender) return;
  const d = squareToXY(defender.square, size);
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const burdenLines = lines.filter((l) => ["burden", "secondary", "primary"].includes(l.role));
  burdenLines.forEach((line, i) => {
    const p = pathPoints(line, size);
    const target = squareToXY(line.to, size);
    const strain = 0.5 + 0.5 * Math.sin(t * (2.4 + i * 0.25) * pkg.speed);
    ctx.strokeStyle = line.role === "burden" ? rgba(pkg.palette[2], 0.42 + strain * 0.32) : rgba(pkg.palette[1], 0.42);
    ctx.lineWidth = cell * (0.025 + 0.012 * strain);
    ctx.setLineDash([cell * 0.09, cell * 0.08]);
    ctx.lineDashOffset = -t * cell * (0.7 + i * 0.2);
    withGlow(ctx, pkg.palette[2], cell * 0.18);
    drawQuad(ctx, p);
    ctx.stroke();

    ctx.fillStyle = rgba(pkg.palette[2], 0.48 + strain * 0.3);
    ctx.beginPath();
    ctx.arc(target.x, target.y, cell * (0.13 + strain * 0.08), 0, Math.PI * 2);
    ctx.fill();
  });

  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  withGlow(ctx, pkg.palette[2], cell * 0.35);
  ctx.strokeStyle = pkg.palette[2];
  ctx.lineWidth = cell * 0.03;
  ctx.beginPath();
  ctx.arc(d.x, d.y, cell * (0.43 + pulse * 0.08), 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = `${cell * 0.32}px ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText("LOAD", d.x, d.y);
  ctx.restore();
}

function drawOxygenDome(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  const king = cues.find((c) => c.role === "king") || cues.find((c) => c.role === "anchor") || cues.find((c) => c.role === "target");
  if (!king) return;
  const k = squareToXY(king.square, size);
  const escapes = cues.filter((c) => ["escape", "shield", "target"].includes(c.role));

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const breathe = 0.5 + 0.5 * Math.sin(t * 1.8 * pkg.speed);
  const radius = cell * (1.38 - breathe * 0.16) * pkg.intensity;

  const dome = ctx.createRadialGradient(k.x, k.y, cell * 0.2, k.x, k.y, radius * 1.18);
  dome.addColorStop(0, rgba(pkg.palette[0], 0.16));
  dome.addColorStop(0.52, rgba(pkg.palette[1], 0.08));
  dome.addColorStop(0.78, rgba(pkg.palette[2], 0.16 + breathe * 0.12));
  dome.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = dome;
  ctx.beginPath();
  ctx.arc(k.x, k.y, radius * 1.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = rgba(pkg.palette[0], 0.72);
  ctx.lineWidth = cell * 0.025;
  withGlow(ctx, pkg.palette[0], cell * 0.3);
  ctx.beginPath();
  ctx.arc(k.x, k.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (const c of escapes) {
    const p = squareToXY(c.square, size);
    const dx = p.x - k.x;
    const dy = p.y - k.y;
    const rr = c.role === "target" ? cell * 0.2 : cell * (0.28 - breathe * 0.09);
    ctx.strokeStyle = c.role === "target" ? pkg.palette[2] : pkg.palette[0];
    ctx.fillStyle = rgba(c.role === "target" ? pkg.palette[2] : pkg.palette[0], 0.12);
    ctx.lineWidth = cell * 0.018;
    ctx.beginPath();
    ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = rgba(pkg.palette[2], 0.48);
    ctx.lineWidth = cell * 0.012;
    ctx.setLineDash([cell * 0.08, cell * 0.08]);
    ctx.lineDashOffset = t * cell * 0.5;
    ctx.beginPath();
    ctx.moveTo(k.x, k.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStressFracture(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const cracks = [...lines.filter((l) => ["primary", "collapse", "flow"].includes(l.role)), ...scene.lines.filter((l) => l.role === "primary")];

  cracks.forEach((line, i) => {
    const p = pathPoints(line, size);
    const steps = 8 + Math.floor(pkg.complexity * 5);
    ctx.strokeStyle = i === 0 ? pkg.palette[2] : pkg.palette[0];
    ctx.lineWidth = cell * (0.018 + (i === 0 ? 0.012 : 0));
    withGlow(ctx, i === 0 ? pkg.palette[2] : pkg.palette[0], cell * 0.22);
    ctx.beginPath();
    for (let s = 0; s <= steps; s++) {
      const tt = s / steps;
      const q = quadraticPoint(p, tt);
      const jag = Math.sin((s * 17.3 + i * 31.1)) * cell * 0.08 * pkg.intensity;
      const q2 = { x: q.x + Math.cos(s * 2.2) * jag, y: q.y + Math.sin(s * 2.0) * jag };
      if (s === 0) ctx.moveTo(q2.x, q2.y);
      else ctx.lineTo(q2.x, q2.y);
    }
    ctx.stroke();

    for (let s = 2; s < steps; s += 2) {
      const tt = (s / steps + t * 0.08) % 1;
      const q = quadraticPoint(p, tt);
      ctx.strokeStyle = rgba(pkg.palette[1], 0.55);
      ctx.lineWidth = cell * 0.01;
      ctx.beginPath();
      ctx.moveTo(q.x, q.y);
      ctx.lineTo(q.x + Math.cos(s) * cell * 0.32, q.y + Math.sin(s * 1.4) * cell * 0.32);
      ctx.stroke();
    }
  });

  cues.filter((c) => ["break", "weak"].includes(c.role)).forEach((c, i) => {
    const p = squareToXY(c.square, size);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.sin(t * 2 + i) * 0.15);
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI * 2 * k) / 6 + t * 0.2;
      ctx.strokeStyle = rgba(pkg.palette[2], 0.38);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * cell * 0.1, Math.sin(a) * cell * 0.1);
      ctx.lineTo(Math.cos(a) * cell * 0.55, Math.sin(a) * cell * 0.55);
      ctx.stroke();
    }
    ctx.restore();
  });
  ctx.restore();
}

function drawGravityAnchor(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  const gravityCues = cues.filter((c) => ["target", "weak", "destination", "anchor", "break", "king"].includes(c.role));
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  gravityCues.forEach((c, i) => {
    const p = squareToXY(c.square, size);
    const spin = t * (0.4 + i * 0.05) * pkg.speed;
    for (let r = 1; r <= 4; r++) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(spin * (r % 2 ? 1 : -1));
      const rad = cell * (0.24 + r * 0.17 + 0.04 * Math.sin(t * 2 + r));
      ctx.strokeStyle = rgba(r % 2 ? pkg.palette[0] : pkg.palette[1], 0.56 / r + 0.08);
      ctx.lineWidth = cell * 0.012;
      ctx.beginPath();
      ctx.ellipse(0, 0, rad * (1.25 + 0.08 * Math.sin(t + r)), rad * 0.68, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const grd = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, cell * 0.9);
    grd.addColorStop(0, rgba(pkg.palette[2], 0.16));
    grd.addColorStop(0.5, rgba(pkg.palette[0], 0.08));
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(p.x, p.y, cell * 0.9, 0, Math.PI * 2);
    ctx.fill();
  });

  lines.forEach((line) => {
    const p = pathPoints(line, size);
    ctx.strokeStyle = rgba(pkg.palette[1], 0.38);
    ctx.lineWidth = cell * 0.015;
    ctx.setLineDash([cell * 0.06, cell * 0.08]);
    ctx.lineDashOffset = -t * cell * 0.4;
    drawQuad(ctx, p);
    ctx.stroke();
  });
  ctx.restore();
}

function drawCurrentField(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  lines.forEach((line, i) => {
    const p = pathPoints(line, size);
    for (let ribbon = 0; ribbon < 3; ribbon++) {
      const offset = (ribbon - 1) * cell * 0.06;
      ctx.strokeStyle = rgba(ribbon === 1 ? pkg.palette[0] : pkg.palette[1], ribbon === 1 ? 0.68 : 0.32);
      ctx.lineWidth = cell * (0.025 - ribbon * 0.003);
      ctx.setLineDash([cell * 0.18, cell * 0.16]);
      ctx.lineDashOffset = -t * cell * (0.9 + i * 0.2 + ribbon * 0.13) * pkg.speed;
      ctx.beginPath();
      ctx.moveTo(p.a.x + offset, p.a.y - offset);
      if (Math.abs(p.curve) > 0.001) ctx.quadraticCurveTo(p.c.x + offset, p.c.y - offset, p.b.x + offset, p.b.y - offset);
      else ctx.lineTo(p.b.x + offset, p.b.y - offset);
      ctx.stroke();
    }

    for (let k = 0; k < 5; k++) {
      const tt = (t * 0.24 * pkg.speed + k / 5 + i * 0.13) % 1;
      const q = quadraticPoint(p, tt);
      ctx.fillStyle = rgba(pkg.palette[2], 0.65);
      withGlow(ctx, pkg.palette[2], cell * 0.16);
      ctx.beginPath();
      ctx.arc(q.x, q.y, cell * 0.045, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.restore();
}

function drawWarningLedger(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  lines.forEach((line, i) => {
    const p = pathPoints(line, size);
    ctx.strokeStyle = rgba(line.role === "primary" ? pkg.palette[2] : pkg.palette[1], 0.58);
    ctx.lineWidth = cell * 0.026;
    ctx.setLineDash([cell * 0.04, cell * 0.08]);
    ctx.lineDashOffset = -t * cell * 0.5;
    drawQuad(ctx, p);
    ctx.stroke();
  });

  cues.filter((c) => ["target", "weak", "king", "overloaded"].includes(c.role)).forEach((c, i) => {
    const p = squareToXY(c.square, size);
    const stamp = Math.floor((t * 2 + i) % 4);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(-0.12 + Math.sin(t * 4 + i) * 0.05);
    ctx.strokeStyle = pkg.palette[2];
    ctx.lineWidth = cell * 0.018;
    ctx.globalAlpha = 0.45 + 0.12 * stamp;
    ctx.strokeRect(-cell * 0.38, -cell * 0.38, cell * 0.76, cell * 0.76);
    ctx.font = `${cell * 0.22}px ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = pkg.palette[2];
    ctx.fillText(`D${stamp + 1}`, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

function drawSinkCell(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  const sinks = cues.filter((c) => ["weak", "target", "destination", "break"].includes(c.role));
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  sinks.forEach((c, i) => {
    const p = squareToXY(c.square, size);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i);
    const grd = ctx.createRadialGradient(p.x, p.y, cell * 0.05, p.x, p.y, cell * (0.75 + pulse * 0.12));
    grd.addColorStop(0, "rgba(0,0,0,0.95)");
    grd.addColorStop(0.45, "rgba(0,0,0,0.72)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(p.x, p.y, cell * 0.9, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  sinks.forEach((c, i) => {
    const p = squareToXY(c.square, size);
    for (let r = 0; r < 3; r++) {
      ctx.strokeStyle = rgba(r % 2 ? pkg.palette[0] : pkg.palette[1], 0.45 - r * 0.1);
      ctx.lineWidth = cell * 0.01;
      ctx.beginPath();
      ctx.arc(p.x, p.y, cell * (0.3 + r * 0.18 + 0.03 * Math.sin(t * 2 + r + i)), 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  ctx.restore();
}

function drawPredatorPrey(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  lines.forEach((line, i) => {
    const p = pathPoints(line, size);
    const dx = p.b.x - p.a.x;
    const dy = p.b.y - p.a.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / len;
    const ny = dx / len;
    const w = cell * (0.24 + 0.05 * Math.sin(t * 3 + i));
    const grad = ctx.createLinearGradient(p.a.x, p.a.y, p.b.x, p.b.y);
    grad.addColorStop(0, rgba(pkg.palette[0], 0.04));
    grad.addColorStop(0.55, rgba(pkg.palette[0], 0.14));
    grad.addColorStop(1, rgba(pkg.palette[2], 0.26));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(p.a.x + nx * w * 0.25, p.a.y + ny * w * 0.25);
    ctx.lineTo(p.b.x + nx * w, p.b.y + ny * w);
    ctx.lineTo(p.b.x - nx * w, p.b.y - ny * w);
    ctx.lineTo(p.a.x - nx * w * 0.25, p.a.y - ny * w * 0.25);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = rgba(pkg.palette[0], 0.75);
    ctx.lineWidth = cell * 0.024;
    ctx.setLineDash([cell * 0.16, cell * 0.12]);
    ctx.lineDashOffset = -t * cell * 0.8;
    drawQuad(ctx, p);
    ctx.stroke();
  });

  cues.filter((c) => ["target", "weak", "king"].includes(c.role)).forEach((c, i) => {
    const p = squareToXY(c.square, size);
    const recoil = 0.5 + 0.5 * Math.sin(t * 4 + i);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.sin(t * 3 + i) * 0.18);
    ctx.strokeStyle = pkg.palette[2];
    ctx.lineWidth = cell * 0.018;
    withGlow(ctx, pkg.palette[2], cell * 0.22);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * cell * (0.36 + recoil * 0.08), -cell * 0.36);
      ctx.lineTo(side * cell * (0.12 + recoil * 0.06), 0);
      ctx.lineTo(side * cell * (0.36 + recoil * 0.08), cell * 0.36);
      ctx.stroke();
    }
    ctx.restore();
  });
  ctx.restore();
}

function drawTemporalGate(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  cues.forEach((c, i) => {
    const p = squareToXY(c.square, size);
    const open = 0.5 + 0.5 * Math.sin(t * (1.3 + i * 0.05) * pkg.speed);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(t * (0.7 + i * 0.1));
    ctx.strokeStyle = i % 2 ? pkg.palette[1] : pkg.palette[0];
    ctx.lineWidth = cell * 0.015;
    ctx.setLineDash([cell * 0.1, cell * 0.08]);
    ctx.beginPath();
    ctx.arc(0, 0, cell * (0.35 + open * 0.08), 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(-t * 1.8);
    ctx.strokeStyle = pkg.palette[2];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(open * Math.PI * 2) * cell * 0.32, Math.sin(open * Math.PI * 2) * cell * 0.32);
    ctx.stroke();
    ctx.restore();
  });

  lines.forEach((line) => {
    const p = pathPoints(line, size);
    ctx.strokeStyle = rgba(pkg.palette[0], 0.38);
    ctx.lineWidth = cell * 0.016;
    ctx.setLineDash([cell * 0.06, cell * 0.08]);
    drawQuad(ctx, p);
    ctx.stroke();
  });
  ctx.restore();
}

function drawNeuralConstellation(ctx, scene, pkg, size, t, lines, cues) {
  const cell = size / 8;
  const nodes = [
    ...scene.pieces.filter((p) => p.label || ["king", "queen", "bishop", "knight", "rook"].includes(p.type)).map((p) => ({ square: p.square, role: p.type })),
    ...visibleCues(scene)
  ];
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  lines.forEach((line, i) => {
    const p = pathPoints(line, size);
    ctx.strokeStyle = rgba(i % 2 ? pkg.palette[1] : pkg.palette[0], 0.46);
    ctx.lineWidth = cell * 0.013;
    ctx.setLineDash([cell * 0.055, cell * 0.09]);
    ctx.lineDashOffset = -t * cell * (0.35 + i * 0.05);
    drawQuad(ctx, p);
    ctx.stroke();
  });

  nodes.slice(0, Math.floor(8 + pkg.complexity * 8)).forEach((node, i) => {
    const p = squareToXY(node.square, size);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + i);
    ctx.fillStyle = rgba(i % 3 === 0 ? pkg.palette[2] : i % 2 ? pkg.palette[1] : pkg.palette[0], 0.65 + pulse * 0.22);
    withGlow(ctx, pkg.palette[0], cell * 0.2);
    ctx.beginPath();
    ctx.arc(p.x, p.y, cell * (0.045 + pulse * 0.025), 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rgba(pkg.palette[1], 0.25);
    ctx.lineWidth = cell * 0.008;
    polygon(ctx, p.x, p.y, cell * (0.18 + pulse * 0.03), 5);
    ctx.stroke();
  });
  ctx.restore();
}

function polygon(ctx, x, y, r, n) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / n;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawCanvas(canvas, scene, pkg, time) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const cssSize = Math.floor(Math.min(rect.width, rect.height));
  const pixelSize = Math.floor(cssSize * dpr);
  if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
    canvas.width = pixelSize;
    canvas.height = pixelSize;
  }

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssSize, cssSize);

  const t = state.motion ? time / 1000 : 0;
  drawBoardBase(ctx, scene, pkg, t, cssSize);
  drawLines(ctx, scene, pkg, cssSize);
  drawMotif(ctx, scene, pkg, cssSize, t);
  drawCuesAndLabels(ctx, scene, pkg, cssSize, t);
  drawPieces(ctx, scene, cssSize);
}

function animationLoop(time) {
  const scene = getScene();
  boards.forEach((board) => drawCanvas(board.canvas, scene, board.pkg(), time));
  animationId = requestAnimationFrame(animationLoop);
}

function render() {
  const scene = getScene();
  const primary = getPrimaryPackage();
  const comparePkg = getComparePackage();

  app.innerHTML = `
    <main class="shell">
      <aside class="panel left">
        <div class="kicker">Blundr Vision Engine</div>
        <div class="title">Motif Object Lab</div>
        <p class="muted">
          A multi-primitive Canvas graphics lab for chess perception. This build uses no Next,
          no Tailwind, no PostCSS dependency, no engine, and no backend.
        </p>

        <div class="section">
          <div class="section-title">Scene</div>
          <select id="sceneSelect" class="select">
            ${state.scenes.map((s) => `<option value="${s.id}" ${s.id === state.sceneId ? "selected" : ""}>${s.name}</option>`).join("")}
          </select>
        </div>

        <div class="section">
          <div class="section-title">Primary Graphic Object</div>
          <select id="primarySelect" class="select">
            ${state.packages.map((p) => `<option value="${p.id}" ${p.id === state.primaryId ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
        </div>

        <div class="section">
          <div class="section-title">Comparison</div>
          <div class="segment two">
            <button id="singleBtn" class="${!state.compare ? "active" : ""}">Single</button>
            <button id="compareBtn" class="${state.compare ? "active" : ""}">Compare</button>
          </div>
          <div style="height: 10px;"></div>
          <select id="compareSelect" class="select">
            ${state.packages.map((p) => `<option value="${p.id}" ${p.id === state.compareId ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
        </div>

        <div class="section">
          <div class="section-title">Density</div>
          <div class="segment three">
            ${["minimal", "balanced", "rich"].map((d) => `<button data-density="${d}" class="${state.density === d ? "active" : ""}">${d}</button>`).join("")}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Display</div>
          <div class="segment three">
            <button id="coordsBtn" class="${state.coords ? "active" : ""}">Coords</button>
            <button id="labelsBtn" class="${state.labels ? "active" : ""}">Labels</button>
            <button id="motionBtn" class="${state.motion ? "active" : ""}">Motion</button>
          </div>
        </div>

        <div class="section card">
          <div class="section-title">Responsibility</div>
          <p class="muted">${escapeHtml(scene.responsibility)}</p>
          <div class="badges">
            <span class="badge">${escapeHtml(scene.motif)}</span>
            <span class="badge">${state.density}</span>
          </div>
        </div>
      </aside>

      <section class="stage">
        <div class="stage-header">
          <div>
            <div class="kicker">${escapeHtml(scene.motif)}</div>
            <div class="stage-title">${escapeHtml(scene.name)}</div>
            <div class="muted">${escapeHtml(scene.headline)}</div>
          </div>
          <div class="badges">
            <span class="badge">${SYSTEMS[primary.system] || primary.system}</span>
            ${state.compare ? `<span class="badge">vs ${SYSTEMS[comparePkg.system] || comparePkg.system}</span>` : ""}
          </div>
        </div>

        <div id="boardArea" class="board-area ${state.compare ? "compare" : "single"}">
          ${boardCard("Primary", primary)}
          ${state.compare ? boardCard("Compare", comparePkg) : ""}
        </div>

        <div class="coach-grid">
          <div class="card">
            <div class="card-title">Coach Card</div>
            <p class="muted">${escapeHtml(scene.coach)}</p>
            <div class="badges" style="margin-top: 12px;">
              <span class="badge">Canvas object engine</span>
              <span class="badge">Editable JSON</span>
              <span class="badge">Renderer-independent schema</span>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Move Meaning Timeline</div>
            <ol class="timeline">
              ${scene.timeline.map((item, i) => `<li><span class="index">${i + 1}</span><span>${escapeHtml(item)}</span></li>`).join("")}
            </ol>
          </div>
        </div>
      </section>

      <aside class="panel right">
        <div class="card">
          <div class="section-title">Active Graphic Object</div>
          <h3 class="package-title">${escapeHtml(primary.name)}</h3>
          <p class="muted">${escapeHtml(primary.description)}</p>
          <ul class="package-notes">
            ${(primary.notes || []).map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
          </ul>
        </div>

        <div class="section warning-box">
          <strong>Why this is different:</strong> these are motif objects, not themed arrows.
          Forks use chambers, pins use clamps, x-rays use lenses, overloads use lattices,
          and king danger uses an oxygen dome.
        </div>

        <div class="section">
          <div class="section-title">JSON Upload / Paste</div>
          <input id="fileInput" class="file-input" type="file" accept=".json,application/json" />
          <div style="height: 10px;"></div>
          <textarea id="jsonEditor" class="textarea" placeholder="Paste graphicsPackages or scenes JSON here...">${escapeTextarea(state.jsonText)}</textarea>
          <div class="action-grid" style="margin-top: 10px;">
            <button id="loadJsonBtn" class="action-btn primary">Load JSON</button>
            <button id="editActiveBtn" class="action-btn">Edit Active</button>
            <button id="templateBtn" class="action-btn">Template</button>
            <button id="resetBtn" class="action-btn">Reset</button>
          </div>
          <div id="status" class="status">${escapeHtml(state.status)}</div>
        </div>

        <div class="section">
          <div class="section-title">Export</div>
          <div class="action-grid">
            <button id="exportActiveBtn" class="action-btn">Active Object</button>
            <button id="exportAllBtn" class="action-btn">Full Lab Data</button>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Supported Object Systems</div>
          <div class="help">${Object.entries(SYSTEMS).map(([key, label]) => `${key} = ${label}`).join("\n")}</div>
        </div>
      </aside>
    </main>
  `;

  bindControls();

  boards = [...document.querySelectorAll(".board-canvas")].map((canvas) => ({
    canvas,
    pkg: () => state.compare && canvas.dataset.slot === "compare" ? getComparePackage() : getPrimaryPackage()
  }));
}

function boardCard(label, pkg) {
  const slot = label.toLowerCase() === "compare" ? "compare" : "primary";
  return `
    <div class="canvas-card">
      <div class="preview-label">
        <span>${label}: <strong>${escapeHtml(pkg.name)}</strong></span>
        <span>${SYSTEMS[pkg.system] || pkg.system}</span>
      </div>
      <div class="canvas-wrap">
        <canvas class="board-canvas" data-slot="${slot}" aria-label="${escapeHtml(pkg.name)} board preview"></canvas>
      </div>
    </div>
  `;
}

function bindControls() {
  document.getElementById("sceneSelect").addEventListener("change", (e) => {
    state.sceneId = e.target.value;
    render();
  });
  document.getElementById("primarySelect").addEventListener("change", (e) => {
    state.primaryId = e.target.value;
    render();
  });
  document.getElementById("compareSelect").addEventListener("change", (e) => {
    state.compareId = e.target.value;
    render();
  });
  document.getElementById("singleBtn").addEventListener("click", () => {
    state.compare = false;
    render();
  });
  document.getElementById("compareBtn").addEventListener("click", () => {
    state.compare = true;
    render();
  });
  document.querySelectorAll("[data-density]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.density = btn.dataset.density;
      render();
    });
  });
  document.getElementById("coordsBtn").addEventListener("click", () => {
    state.coords = !state.coords;
    render();
  });
  document.getElementById("labelsBtn").addEventListener("click", () => {
    state.labels = !state.labels;
    render();
  });
  document.getElementById("motionBtn").addEventListener("click", () => {
    state.motion = !state.motion;
    render();
  });
  document.getElementById("jsonEditor").addEventListener("input", (e) => {
    state.jsonText = e.target.value;
  });
  document.getElementById("loadJsonBtn").addEventListener("click", () => loadJson(state.jsonText));
  document.getElementById("editActiveBtn").addEventListener("click", () => {
    state.jsonText = JSON.stringify(getPrimaryPackage(), null, 2);
    state.status = "Active object copied into editor.";
    render();
  });
  document.getElementById("templateBtn").addEventListener("click", () => {
    state.jsonText = JSON.stringify({
      graphicsPackages: [
        {
          id: "custom-oxygen-dome-v2",
          name: "Custom Oxygen Dome v2",
          description: "Describe what the user sees, how the object behaves, and what chess vision skill this teaches.",
          system: "oxygen-dome",
          speed: 0.85,
          intensity: 1.15,
          complexity: 1.2,
          palette: ["#c9f7ff", "#88a6ff", "#ff4d6d", "#050d18"],
          notes: [
            "Use one supported system value.",
            "Supported systems are listed below."
          ]
        }
      ]
    }, null, 2);
    state.status = "Template inserted. Edit values and click Load JSON.";
    render();
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    state.scenes = structuredClone(defaultScenes);
    state.packages = structuredClone(defaultPackages);
    state.sceneId = "knight-fork";
    state.primaryId = "fork-bifurcation-chamber";
    state.compareId = "pin-compression-clamp";
    state.jsonText = "";
    state.status = "Reset to default graphics lab data.";
    render();
  });
  document.getElementById("fileInput").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.jsonText = String(reader.result || "");
      loadJson(state.jsonText);
    };
    reader.readAsText(file);
  });
  document.getElementById("exportActiveBtn").addEventListener("click", () => {
    downloadJson("blundr-active-graphic-object.json", getPrimaryPackage());
  });
  document.getElementById("exportAllBtn").addEventListener("click", () => {
    downloadJson("blundr-vision-engine-data.json", {
      graphicsPackages: state.packages,
      scenes: state.scenes
    });
  });
}

function validatePackage(raw) {
  if (!raw || !raw.id || !raw.name || !raw.system || !SYSTEMS[raw.system]) return null;
  const palette = Array.isArray(raw.palette) && raw.palette.length >= 4
    ? raw.palette
    : ["#ffffff", "#8fd3ff", "#ff5d5d", "#05070b"];
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: String(raw.description || "Custom graphic object."),
    system: String(raw.system),
    speed: Math.max(0.2, Math.min(3.8, Number(raw.speed || 1))),
    intensity: Math.max(0.2, Math.min(2.5, Number(raw.intensity || 1))),
    complexity: Math.max(0.2, Math.min(2.5, Number(raw.complexity || 1))),
    palette: palette.slice(0, 4).map(String),
    notes: Array.isArray(raw.notes) ? raw.notes.map(String) : []
  };
}

function validateScene(raw) {
  if (!raw || !raw.id || !raw.name || !Array.isArray(raw.pieces)) return null;
  return {
    id: String(raw.id),
    name: String(raw.name),
    motif: String(raw.motif || "Custom Motif"),
    responsibility: String(raw.responsibility || "Notice the idea this scene is testing."),
    headline: String(raw.headline || "Custom scene loaded."),
    coach: String(raw.coach || "This scene was loaded from JSON."),
    timeline: Array.isArray(raw.timeline) ? raw.timeline.map(String) : [],
    pieces: raw.pieces || [],
    cues: Array.isArray(raw.cues) ? raw.cues : [],
    lines: Array.isArray(raw.lines) ? raw.lines : []
  };
}

function loadJson(raw) {
  try {
    const parsed = JSON.parse(raw);
    let newPackages = [];
    let newScenes = [];

    if (Array.isArray(parsed)) {
      if (parsed[0]?.system) newPackages = parsed.map(validatePackage).filter(Boolean);
      if (parsed[0]?.pieces) newScenes = parsed.map(validateScene).filter(Boolean);
    } else {
      if (parsed.system) {
        const one = validatePackage(parsed);
        if (one) newPackages = [one];
      }
      if (parsed.pieces) {
        const oneScene = validateScene(parsed);
        if (oneScene) newScenes = [oneScene];
      }
      if (Array.isArray(parsed.graphicsPackages)) newPackages = parsed.graphicsPackages.map(validatePackage).filter(Boolean);
      if (Array.isArray(parsed.motionPackages)) newPackages = parsed.motionPackages.map(validatePackage).filter(Boolean);
      if (Array.isArray(parsed.scenes)) newScenes = parsed.scenes.map(validateScene).filter(Boolean);
    }

    if (!newPackages.length && !newScenes.length) {
      state.status = "JSON parsed, but no valid graphicsPackages or scenes were found.";
      render();
      return;
    }

    if (newPackages.length) {
      const incoming = new Map(newPackages.map((p) => [p.id, p]));
      state.packages = state.packages.map((p) => incoming.get(p.id) || p);
      newPackages.forEach((p) => {
        if (!state.packages.some((existing) => existing.id === p.id)) state.packages.push(p);
      });
      state.primaryId = newPackages[0].id;
    }

    if (newScenes.length) {
      const incoming = new Map(newScenes.map((s) => [s.id, s]));
      state.scenes = state.scenes.map((s) => incoming.get(s.id) || s);
      newScenes.forEach((s) => {
        if (!state.scenes.some((existing) => existing.id === s.id)) state.scenes.push(s);
      });
      state.sceneId = newScenes[0].id;
    }

    state.status = `Loaded ${newPackages.length} graphic package(s) and ${newScenes.length} scene(s).`;
    render();
  } catch (error) {
    state.status = `Invalid JSON: ${error.message}`;
    render();
  }
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeTextarea(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;");
}

function start() {
  render();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(animationLoop);
  window.addEventListener("resize", () => render(), { passive: true });
}

start();
