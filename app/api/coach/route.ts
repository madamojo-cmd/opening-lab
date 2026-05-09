import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function validSquare(square: unknown) {
  return typeof square === "string" && /^[a-h][1-8]$/.test(square);
}

function sanitizeLine(line: any, fallbackKind = "plan") {
  const kind = ["attack", "defense", "plan", "opponent"].includes(line?.kind) ? line.kind : fallbackKind;
  if (!validSquare(line?.from) || !validSquare(line?.to)) return null;
  return {
    from: line.from,
    to: line.to,
    kind,
    label: typeof line?.label === "string" ? line.label.slice(0, 28) : "",
  };
}

function fallbackAnnotation(body: any) {
  const selectedView = body?.selectedView || "plan";
  const expectedMove = body?.expectedMove || body?.engineTopMoves?.[0]?.san || "the highlighted idea";
  const candidateSquares = Array.isArray(body?.candidateSquares) ? body.candidateSquares.filter(validSquare).slice(0, 3) : [];
  const candidateArrows = Array.isArray(body?.candidateArrows)
    ? body.candidateArrows.map((line: any) => sanitizeLine(line, selectedView)).filter(Boolean).slice(0, 2)
    : [];

  return {
    source: "static-fallback",
    fallback: true,
    selectedView,
    headline:
      selectedView === "attack"
        ? "Attacking cue"
        : selectedView === "defense"
        ? "Defensive cue"
        : "Next training move",
    mainExplanation: `${expectedMove} is the key idea in this restricted opening position.`,
    visualExplanation: "The board shows the verified cue selected from the legal position and training context.",
    planExplanation:
      body?.trainingMode === "restricted"
        ? "Because this is restricted opening training, the move must match the approved opening line."
        : "In continuation mode, legal moves are accepted and then evaluated.",
    nextPlan: body?.expectedMove ? `Play ${body.expectedMove} when it is your turn.` : "Use the highlighted cue to continue development, center control, and king safety.",
    keySquares: candidateSquares,
    planArrows: candidateArrows,
    attack: {
      title: "Your attack",
      message: "This view shows what your side is pressuring from the current position.",
      lines: candidateArrows.filter((l: any) => l.kind === "attack").slice(0, 2),
      cues: candidateSquares.slice(0, 2).map((square: string) => ({ square, kind: "target" })),
    },
    defense: {
      title: "Your defense",
      message: "This view shows what your side is protecting or what needs attention.",
      lines: candidateArrows.filter((l: any) => l.kind === "defense").slice(0, 2),
      cues: candidateSquares.slice(0, 2).map((square: string) => ({ square, kind: "support" })),
    },
    plan: {
      title: body?.expectedMove ? `Next move: ${body.expectedMove}` : "Next plan",
      message: body?.expectedMove
        ? `The restricted trainer expects ${body.expectedMove} from this position.`
        : "The plan view shows the next verified idea from this position.",
      lines: candidateArrows.length ? candidateArrows.slice(0, 1).map((l: any) => ({ ...l, kind: "plan" })) : [],
      cues: candidateSquares.slice(0, 1).map((square: string) => ({ square, kind: "target" })),
    },
    suppress: [],
    confidence: "fallback",
  };
}

function sanitizeAnnotation(annotation: any, body: any) {
  const base = fallbackAnnotation(body);
  const selectedView = ["attack", "defense", "plan"].includes(annotation?.selectedView) ? annotation.selectedView : base.selectedView;

  function sanitizeView(viewName: "attack" | "defense" | "plan") {
    const raw = annotation?.[viewName] || {};
    const lines = Array.isArray(raw?.lines)
      ? raw.lines.map((line: any) => sanitizeLine(line, viewName)).filter(Boolean).slice(0, viewName === "plan" ? 1 : 2)
      : base[viewName].lines;
    const cues = Array.isArray(raw?.cues)
      ? raw.cues
          .filter((cue: any) => validSquare(cue?.square))
          .slice(0, 3)
          .map((cue: any) => ({
            square: cue.square,
            kind: ["origin", "target", "support", "danger", "opponent"].includes(cue?.kind) ? cue.kind : viewName === "defense" ? "support" : "target",
          }))
      : base[viewName].cues;

    return {
      title: typeof raw?.title === "string" && raw.title.trim() ? raw.title.slice(0, 80) : base[viewName].title,
      message: typeof raw?.message === "string" && raw.message.trim() ? raw.message.slice(0, 280) : base[viewName].message,
      lines,
      cues,
    };
  }

  return {
    source: annotation?.source || "openai",
    fallback: Boolean(annotation?.fallback),
    selectedView,
    headline: typeof annotation?.headline === "string" && annotation.headline.trim() ? annotation.headline.slice(0, 90) : base.headline,
    mainExplanation:
      typeof annotation?.mainExplanation === "string" && annotation.mainExplanation.trim()
        ? annotation.mainExplanation.slice(0, 420)
        : base.mainExplanation,
    visualExplanation:
      typeof annotation?.visualExplanation === "string" && annotation.visualExplanation.trim()
        ? annotation.visualExplanation.slice(0, 320)
        : base.visualExplanation,
    planExplanation:
      typeof annotation?.planExplanation === "string" && annotation.planExplanation.trim()
        ? annotation.planExplanation.slice(0, 360)
        : base.planExplanation,
    nextPlan: typeof annotation?.nextPlan === "string" && annotation.nextPlan.trim() ? annotation.nextPlan.slice(0, 220) : base.nextPlan,
    keySquares: Array.isArray(annotation?.keySquares) ? annotation.keySquares.filter(validSquare).slice(0, 3) : base.keySquares,
    planArrows: Array.isArray(annotation?.planArrows)
      ? annotation.planArrows.map((line: any) => sanitizeLine(line, "plan")).filter(Boolean).slice(0, 2)
      : base.planArrows,
    attack: sanitizeView("attack"),
    defense: sanitizeView("defense"),
    plan: sanitizeView("plan"),
    threatNote: typeof annotation?.threatNote === "string" ? annotation.threatNote.slice(0, 260) : "",
    suppress: Array.isArray(annotation?.suppress) ? annotation.suppress.slice(0, 8) : [],
    confidence: typeof annotation?.confidence === "string" ? annotation.confidence : "medium",
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_COACH_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return NextResponse.json(fallbackAnnotation(body));
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.15,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are Blundr's chess opening teaching selector. You receive verified legal facts, opening context, repertoire expectations, Lichess/engine results, and candidate visual lines/cues. Return strict JSON only. Do not invent legal moves, tactics, coordinates, or engine claims. Choose visual highlights/arrows only from candidateArrows/candidateSquares or obvious lastMove coordinates included in the input. Output keys: selectedView, headline, mainExplanation, visualExplanation, planExplanation, nextPlan, keySquares, planArrows, attack, defense, plan, threatNote, suppress, confidence. Each of attack/defense/plan must include title, message, lines, cues. Keep text concise and useful for training.",
          },
          {
            role: "user",
            content: JSON.stringify(body),
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ ...fallbackAnnotation(body), reason: `OpenAI returned ${response.status}` });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;
    const parsed = raw ? JSON.parse(raw) : {};
    return NextResponse.json(sanitizeAnnotation({ source: "openai", fallback: false, ...parsed }, body));
  } catch (error) {
    return NextResponse.json({
      ...fallbackAnnotation(body),
      reason: error instanceof Error ? error.message : "Coach request failed",
    });
  }
}
