import assert from "node:assert/strict";
import fs from "node:fs";

function readJsonlOpenings(filePath: string): string[] {
  const text = fs.readFileSync(filePath, "utf8");
  return [...new Set(text.split(/\r?\n/).filter((line) => line.trim().length > 0).map((line) => (JSON.parse(line) as { openingId?: string }).openingId ?? ""))].filter(Boolean);
}

async function main(): Promise<void> {
  const batch1Path = "data/blundr/stage2-approved-content-approved-5openings-v1/approved-packets.jsonl";
  const batch234Path = "data/blundr/stage2-approved-content-approved-batches2to4-16openings-v1/approved-packets.jsonl";

  assert.equal(fs.existsSync(batch1Path), true, `missing_batch1_bundle:${batch1Path}`);
  assert.equal(fs.existsSync(batch234Path), true, `missing_batch234_bundle:${batch234Path}`);

  const openings = new Set([...readJsonlOpenings(batch1Path), ...readJsonlOpenings(batch234Path)]);
  assert.equal(openings.size, 21);
  assert.deepEqual([...openings].sort(), [
    "caro-kann-black",
    "colle-white",
    "english-white",
    "french-black",
    "italian-black",
    "italian-white",
    "kings-indian-black",
    "london-white",
    "nimzo-indian-black",
    "petroff-black",
    "pirc-black",
    "qgd-black",
    "queens-gambit-white",
    "queens-indian-black",
    "reti-white",
    "ruy-lopez-white",
    "scandinavian-black",
    "scotch-white",
    "sicilian-black",
    "slav-black",
    "vienna-white",
  ]);
}

main()
  .then(() => {
    console.log("stage2Approved21OpeningCoverage ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
