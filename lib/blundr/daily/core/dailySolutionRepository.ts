export type DailySolution = {
  cardFingerprint: string;
  acceptedMoves: readonly string[];
  correctSquares: readonly string[];
  explanation: string;
};
export interface DailySolutionRepository {
  get(userId: string, cardFingerprint: string): Promise<DailySolution | null>;
}
export class InMemoryDailySolutionRepository
  implements DailySolutionRepository
{
  constructor(private readonly solutions: ReadonlyMap<string, DailySolution>) {}
  async get(
    _userId: string,
    cardFingerprint: string,
  ): Promise<DailySolution | null> {
    return this.solutions.get(cardFingerprint) ?? null;
  }
}
