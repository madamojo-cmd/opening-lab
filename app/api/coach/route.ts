import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CoachRequest = {
  openingName?: string;
  color?: "white" | "black";
  fen?: string;
  history?: string;
  expectedMove?: string;
  candidateMoves?: string[];
  ratingPool?: string;
  explorerOpening?: string;
  engineSuggestion?: string;
};

const coachSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    openingName: { type: "string" },
    summary: { type: "string" },
    mainPlan: { type: "string" },
    goals: { type: "array", items: { type: "string" } },
    attackingIdeas: { type: "array", items: { type: "string" } },
    pawnBreaks: { type: "array", items: { type: "string" } },
    idealPiecePlacement: { type: "array", items: { type: "string" } },
    variations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          goal: { type: "string" },
          keyMoves: { type: "array", items: { type: "string" } }
        },
        required: ["name", "goal", "keyMoves"]
      }
    },
    moveFeedback: {
      type: "object",
      additionalProperties: false,
      properties: {
        move: { type: "string" },
        whyMove: { type: "string" },
        planConnection: { type: "string" },
        nextGoal: { type: "string" },
        warning: { type: "string" },
        alternatives: { type: "array", items: { type: "string" } }
      },
      required: ["move", "whyMove", "planConnection", "nextGoal", "warning", "alternatives"]
    },
    confidenceNote: { type: "string" },
    fallback: { type: "boolean" }
  },
  required: [
    "openingName",
    "summary",
    "mainPlan",
    "goals",
    "attackingIdeas",
    "pawnBreaks",
    "idealPiecePlacement",
    "variations",
    "moveFeedback",
    "confidenceNote",
    "fallback"
  ]
};

function fallbackCoach(input: CoachRequest) {
  const opening = input.openingName || input.explorerOpening || "Current opening";
  const move = input.expectedMove || input.engineSuggestion || input.candidateMoves?.[0] || "the candidate move";
  const isSicilian = /sicilian/i.test(opening);
  const isItalian = /italian/i.test(opening);
  const isRuy = /ruy|lopez/i.test(opening);
  const isCaro = /caro/i.test(opening);
  const isQueenPawn = /queen|d4|london|indian|slav|nimzo|king/i.test(opening);

  let mainPlan = "Develop pieces toward the center, keep the king safe, and use the pawn breaks that match the structure instead of memorizing moves in isolation.";
  let goals = ["Control central squares", "Develop minor pieces before launching tactics", "Castle before opening the position", "Identify the correct pawn break"];
  let attackingIdeas = ["Improve piece activity before forcing contact", "Create pressure on a weak pawn or color complex", "Use open files after the center changes"];
  let pawnBreaks = ["d4", "c4", "e5", "c5"];
  let variations = [
    { name: "Main line", goal: "Follow the most principled development scheme first.", keyMoves: [move] },
    { name: "Sideline response", goal: "Use the same plan but adapt the pawn break timing.", keyMoves: [] },
    { name: "Exploration branch", goal: "Use engine/Lichess suggestions to add missing responses.", keyMoves: input.candidateMoves?.slice(0, 3) || [] },
  ];

  if (isItalian) {
    mainPlan = "The Italian Game builds fast development, pressure on f7, quick castling, and a controlled c3-d4 central break.";
    goals = ["Develop Bc4 to pressure f7", "Castle quickly", "Prepare c3 and d4", "Preserve the bishop with Bb3 when attacked"];
    attackingIdeas = ["Bishop plus knight pressure around f7", "c3-d4 opens the center when development is ready", "Re1 supports central expansion"];
    pawnBreaks = ["c3-d4", "a4", "h3", "d4"];
  } else if (isRuy) {
    mainPlan = "The Ruy Lopez pressures the e5 pawn, builds long-term central control, and prepares c3-d4 while keeping flexible piece tension.";
    goals = ["Pressure e5 with Bb5", "Castle and play Re1", "Prepare c3-d4", "Avoid releasing tension too early"];
    attackingIdeas = ["Central pressure after Re1 and d4", "Queenside space with a4 in closed structures", "Kingside expansion when Black is passive"];
    pawnBreaks = ["d4", "a4", "c3-d4", "h3"];
  } else if (isSicilian) {
    mainPlan = "The Sicilian creates an imbalanced fight where White often uses central development and kingside/queenside attacking setups while Black fights for counterplay on c-file and dark squares.";
    goals = ["Develop quickly after d4", "Coordinate pieces before attacking", "Watch c-file counterplay", "Use the correct setup for the Sicilian branch"];
    attackingIdeas = ["Be3-Qd2-O-O-O setups", "f3-g4 pawn storms in sharp lines", "Control d5 as a key square"];
    pawnBreaks = ["d4", "f4/f3", "g4", "c4"];
  } else if (isCaro) {
    mainPlan = "The Caro-Kann is about solid development, challenging White's center, and reaching sound structures where Black can counterattack without early weaknesses.";
    goals = ["Challenge the center with ...d5", "Develop the light bishop before ...e6 when possible", "Trade central tension carefully", "Reach a healthy structure"];
    attackingIdeas = ["Pressure d4/e4", "Use ...c5 breaks", "Develop safely before counterattacking"];
    pawnBreaks = ["...c5", "...e5", "...dxe4", "...f6"];
  } else if (isQueenPawn) {
    mainPlan = "Queen's pawn openings usually focus on central tension, piece development behind the pawn chain, and a timely c4/c5 or e4/e5 break.";
    goals = ["Control d4/e5/c5", "Develop pieces before resolving the center", "Choose a queenside or central break", "Avoid locking in bad bishops"];
    attackingIdeas = ["Minor-piece pressure on central squares", "Queenside expansion", "Kingside attack after central stability"];
    pawnBreaks = ["c4", "e4", "c5", "b4"];
  }

  return {
    openingName: opening,
    summary: `${opening}: plan-first coaching generated locally because the AI key is not configured or the API was unavailable.`,
    mainPlan,
    goals,
    attackingIdeas,
    pawnBreaks,
    idealPiecePlacement: ["King castled", "Rooks on central/open files", "Knights developed toward central squares", "Bishops aimed at useful diagonals"],
    variations,
    moveFeedback: {
      move,
      whyMove: `${move} is treated as the current training move or leading suggestion. It should be understood as part of the opening plan, not only memorized as a symbol.`,
      planConnection: "It supports development, center control, king safety, or the main pawn break for this opening family.",
      nextGoal: "Look for the next developing move, castling opportunity, or pawn break that improves your structure.",
      warning: "This is a deploy-safe fallback explanation. Use OPENAI_API_KEY for richer position-specific coaching.",
      alternatives: input.candidateMoves?.slice(0, 4) || [],
    },
    confidenceNote: "Fallback content is useful for UI/testing but should be replaced by AI-generated or curated notes for production polish.",
    fallback: true,
  };
}

function extractOutputText(data: any) {
  if (typeof data?.output_text === "string") return data.output_text;
  for (const item of data?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (content?.type === "output_text" && typeof content?.text === "string") return content.text;
    }
  }
  return "";
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CoachRequest;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallbackCoach(body));
  }

  const prompt = `Generate concise chess-opening coaching content for a mobile opening trainer.\n\nOpening: ${body.openingName}\nColor trained: ${body.color}\nRating pool: ${body.ratingPool}\nFEN: ${body.fen}\nMove history: ${body.history || "start"}\nExpected/current move: ${body.expectedMove}\nCandidate moves: ${(body.candidateMoves || []).join(", ")}\nLichess opening name if known: ${body.explorerOpening}\nEngine suggestion if known: ${body.engineSuggestion}\n\nRequirements:\n- Teach plan first, variations second.\n- Be honest: call it a repertoire move if it is not necessarily the objective best move.\n- Keep explanations practical for the rating pool.\n- No long paragraphs.\n- Do not invent forced tactics unless clearly implied.\n- Return only schema-valid JSON.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_COACH_MODEL || "gpt-5.4-mini",
        input: prompt,
        text: {
          format: {
            type: "json_schema",
            name: "opening_coach_content",
            strict: true,
            schema: coachSchema,
          },
        },
        temperature: 0.4,
        max_output_tokens: 1200,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ ...fallbackCoach(body), confidenceNote: `OpenAI API fallback: ${data?.error?.message ?? response.status}` });
    }

    const text = extractOutputText(data);
    const parsed = JSON.parse(text);
    return NextResponse.json({ ...parsed, fallback: false });
  } catch (error) {
    return NextResponse.json({
      ...fallbackCoach(body),
      confidenceNote: error instanceof Error ? `OpenAI API fallback: ${error.message}` : "OpenAI API fallback.",
    });
  }
}
