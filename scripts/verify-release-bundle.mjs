import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), ".next", "static");
const forbidden =
  /service_role|SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|BLUNDR_RLS_TEST_|private[_-]?key|BEGIN (?:RSA |EC )?PRIVATE KEY/i;
const files = [];
function walk(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory)) {
    const file = join(directory, entry);
    if (statSync(file).isDirectory()) walk(file);
    else files.push(file);
  }
}
walk(root);
const violations = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  if (forbidden.test(text))
    violations.push(file.replace(`${process.cwd()}/`, ""));
}
if (violations.length) {
  console.error(
    `Forbidden credential material found in browser bundle:\n${violations.join("\n")}`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `Browser bundle credential scan passed (${files.length} assets scanned).`,
  );
}
