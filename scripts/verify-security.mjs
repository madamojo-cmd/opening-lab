import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const tracked = execFileSync(
  "git",
  ["ls-files", "app", "components", "lib", "scripts"],
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);
const clientFiles = tracked.filter(
  (file) =>
    /\.(tsx|ts|js|mjs)$/.test(file) &&
    (file.startsWith("app/") || file.startsWith("components/")) &&
    /^\s*["']use client["']/m.test(readFileSync(file, "utf8")),
);
const restrictedClient =
  /service_role|SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|BLUNDR_RLS_TEST_|acceptedMoves|solutionRoute|opponentReplyMap|tablebaseProof|validatorOnly/i;
const rawDatasetImport =
  /(?:opening-nodes|candidate-moves).*\.(?:csv|jsonl)|(?:\.\/|@\/)[^\n]*(?:opening-nodes|candidate-moves)/i;
const violations = [];
for (const file of clientFiles) {
  const text = readFileSync(file, "utf8");
  if (restrictedClient.test(text))
    violations.push(`${file}: restricted client token`);
  if (rawDatasetImport.test(text))
    violations.push(`${file}: raw opening dataset import`);
}
for (const file of clientFiles) {
  const text = readFileSync(file, "utf8");
  if (/process\.env\.[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD)/i.test(text))
    violations.push(`${file}: secret environment variable in client bundle`);
}
if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Security source scan passed (${clientFiles.length} client files scanned).`,
  );
}
