import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { evaluateOpeningAccess } from "./openingAccessPolicy";
import type {
  OpeningAccessRepository,
  OpeningAccessRequest,
} from "./openingAccessTypes";

export class RepertoireOpeningAccessRepository
  implements OpeningAccessRepository
{
  constructor(
    private readonly loadRepertoire: (
      userId: string,
    ) => RepertoireProgress | null,
    private readonly planPolicy: {
      activeOpeningIds?: ReadonlySet<string> | null;
      selectionRequired?: boolean;
    } = {},
  ) {}
  get(input: OpeningAccessRequest) {
    return evaluateOpeningAccess({
      ...input,
      repertoire: this.loadRepertoire(input.userId),
      ...this.planPolicy,
    });
  }
}
