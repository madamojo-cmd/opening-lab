import { Chess } from "chess.js";

export type MaiaLegalityContractInput = {
  requestFen: string;
  selectedUci: string | null | undefined;
  legalMovesUci?: string[] | null;
};

export type MaiaLegalityContractResult = {
  requestFen4: string;
  selectedUci: string | null;
  legalOnRequestFen: boolean;
  applied: boolean;
  appliedMoveUci: string | null;
  appliedMoveSan: string | null;
  appliedFromFen4: string;
  appliedToFen4: string | null;
  appliedFen: string | null;
  rejectedReason: "missing_selected_uci" | "uci_not_in_legal_moves" | "illegal_on_request_fen" | null;
};

function normalizeFen4(fen: string): string {
  return String(fen).split(" ").slice(0, 4).join(" ");
}

function normalizeUci(uci: string | null | undefined): string | null {
  const value = String(uci ?? "").trim().toLowerCase();
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value) ? value : null;
}

function moveToUci(move: any): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase();
}

export function applyMaiaMoveOnRequestFen(input: MaiaLegalityContractInput): MaiaLegalityContractResult {
  const requestFen4 = normalizeFen4(input.requestFen);
  const selectedUci = normalizeUci(input.selectedUci);
  const legalSet = new Set((input.legalMovesUci ?? []).map((move) => String(move).toLowerCase()));

  if (!selectedUci) {
    return {
      requestFen4,
      selectedUci: null,
      legalOnRequestFen: false,
      applied: false,
      appliedMoveUci: null,
      appliedMoveSan: null,
      appliedFromFen4: requestFen4,
      appliedToFen4: null,
      appliedFen: null,
      rejectedReason: "missing_selected_uci",
    };
  }

  if (legalSet.size > 0 && !legalSet.has(selectedUci)) {
    return {
      requestFen4,
      selectedUci,
      legalOnRequestFen: false,
      applied: false,
      appliedMoveUci: null,
      appliedMoveSan: null,
      appliedFromFen4: requestFen4,
      appliedToFen4: null,
      appliedFen: null,
      rejectedReason: "uci_not_in_legal_moves",
    };
  }

  try {
    const game = new Chess(input.requestFen);
    const appliedMove = game.move({
      from: selectedUci.slice(0, 2),
      to: selectedUci.slice(2, 4),
      promotion: selectedUci.length > 4 ? selectedUci.slice(4, 5) : "q",
    });
    if (!appliedMove) {
      return {
        requestFen4,
        selectedUci,
        legalOnRequestFen: false,
        applied: false,
        appliedMoveUci: null,
        appliedMoveSan: null,
        appliedFromFen4: requestFen4,
        appliedToFen4: null,
        appliedFen: null,
        rejectedReason: "illegal_on_request_fen",
      };
    }
    return {
      requestFen4,
      selectedUci,
      legalOnRequestFen: true,
      applied: true,
      appliedMoveUci: moveToUci(appliedMove),
      appliedMoveSan: String(appliedMove.san ?? selectedUci),
      appliedFromFen4: requestFen4,
      appliedToFen4: normalizeFen4(game.fen()),
      appliedFen: game.fen(),
      rejectedReason: null,
    };
  } catch {
    return {
      requestFen4,
      selectedUci,
      legalOnRequestFen: false,
      applied: false,
      appliedMoveUci: null,
      appliedMoveSan: null,
      appliedFromFen4: requestFen4,
      appliedToFen4: null,
      appliedFen: null,
      rejectedReason: "illegal_on_request_fen",
    };
  }
}
