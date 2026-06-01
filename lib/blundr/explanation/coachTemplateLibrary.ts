import type { CoachTemplate, TemplateCategory } from "./explanationTypes";

const CATEGORY_COUNTS: Record<TemplateCategory, number> = {
  castling: 20,
  king_safety: 20,
  development: 20,
  bishop_activity: 15,
  knight_activity: 15,
  center_control: 25,
  italian_c3_d4: 15,
  rook_activity: 15,
  pawn_structure: 20,
  piece_quality: 15,
  imbalance: 15,
  strategic_plan: 15,
  continuation: 15,
  plain_recall: 30,
  reveal_answer: 20,
  fallback: 10,
};

const CATEGORY_BODY: Record<TemplateCategory, string> = {
  castling: "{moveSan} moves the king toward safety and brings the rook closer to the center.",
  king_safety: "King safety matters here because the center can open soon.",
  development: "{moveSan} improves the {pieceName} and helps finish development.",
  bishop_activity: "{moveSan} develops a bishop to {toSquare} on an active diagonal.",
  knight_activity: "Improve the knight toward the center before forcing the position.",
  center_control: "The center is the main decision; support the {centerBreakSquare} break before opening it.",
  italian_c3_d4: "{moveSan} supports the later {centerBreakSquare} break.",
  rook_activity: "{moveSan} moves the rook toward the {fileName}-file so it can support the central plan.",
  pawn_structure: "The pawn structure points to {pawnStructureType}, so the plan should improve that feature.",
  piece_quality: "Improve the {pieceName}; it is the piece most tied to this plan.",
  imbalance: "The useful imbalance is {featureSummary}, so choose the move that supports it.",
  strategic_plan: "The plan is {planName}; make the move that supports that idea.",
  continuation: "Here is the plan: improve the piece tied to the center before forcing it open.",
  plain_recall: "Find the move by plan first: improve development while serving the center.",
  reveal_answer: "Play {moveSan}. It supports {planName}.",
  fallback: "Improve development and keep the center stable.",
};

export function getCoachTemplates(): CoachTemplate[] {
  const templates: CoachTemplate[] = [];
  for (const [category, count] of Object.entries(CATEGORY_COUNTS) as Array<[TemplateCategory, number]>) {
    for (let index = 1; index <= count; index += 1) {
      templates.push({
        id: `${category}_${index}`,
        category,
        intent:
          category === "plain_recall"
            ? "recall_prompt"
            : category === "reveal_answer"
              ? "reveal_answer"
              : category === "continuation"
                ? "show_continued_plan"
                : "explain_training_move",
        opportunityLayers: category === "continuation" ? ["strategic", "engine_candidate", "repertoire"] : ["expected_move", "visual_recipe", "strategic", "repertoire", "fallback"],
        conceptIds: [],
        planTypes: planTypesFor(category),
        requiredFeatureClaimTypes: featureTypesFor(category),
        requiredPlanTypes: planTypesFor(category),
        requiredVariables: variablesFor(category),
        ratingBuckets: ["beginner", "intermediate", "advanced"],
        tone: category === "king_safety" ? "urgent" : category === "reveal_answer" ? "review" : "plain",
        maxSentences: 2,
        maxTokensApprox: 60,
        titleTemplate: category === "continuation" ? "Position context" : "Opening pattern",
        bodyTemplate: CATEGORY_BODY[category],
        variableNames: variablesFor(category),
        safety: {
          leaksAnswerInPlain: category === "reveal_answer",
          mentionsTactic: false,
          mentionsPermanentWeakness: false,
          mentionsForcedLine: false,
          mentionsEvaluation: false,
          mentionsHumanPopulation: false,
          mentionsExactMove: ["reveal_answer", "castling", "development", "bishop_activity", "italian_c3_d4", "rook_activity"].includes(category),
        },
      });
    }
  }
  return templates;
}

function planTypesFor(category: TemplateCategory): string[] {
  if (category === "castling" || category === "king_safety") return ["castle_and_connect_rooks"];
  if (category === "development") return ["development_completion"];
  if (category === "bishop_activity") return ["bishop_diagonal_pressure", "development_completion"];
  if (category === "center_control" || category === "italian_c3_d4") return ["central_break_preparation", "central_break_execution", "maintain_center_tension"];
  if (category === "rook_activity") return ["rook_centralization", "open_file_control"];
  return [];
}

function featureTypesFor(category: TemplateCategory): string[] {
  if (category === "bishop_activity") return ["active_bishop"];
  if (category === "italian_c3_d4") return [];
  if (category === "center_control") return ["pawn_lever_support", "center_tension"];
  if (category === "rook_activity") return ["rook_on_open_file", "rook_on_semi_open_file"];
  if (category === "castling") return ["undeveloped_piece"];
  if (category === "king_safety") return ["king_safety_urgent"];
  return [];
}

function variablesFor(category: TemplateCategory): CoachTemplate["variableNames"] {
  if (category === "castling") return ["moveSan"];
  if (category === "development") return ["moveSan", "pieceName"];
  if (category === "bishop_activity") return ["moveSan", "toSquare"];
  if (category === "center_control" || category === "italian_c3_d4") return ["moveSan", "centerBreakSquare"];
  if (category === "rook_activity") return ["moveSan", "fileName"];
  if (category === "pawn_structure") return ["pawnStructureType"];
  if (category === "piece_quality") return ["pieceName"];
  if (category === "imbalance") return ["featureSummary"];
  if (category === "strategic_plan" || category === "reveal_answer") return ["moveSan", "planName"];
  return [];
}
