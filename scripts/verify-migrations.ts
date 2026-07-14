import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

async function main() {
  const directory = path.resolve("supabase/migrations");
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  if (!files.length) throw new Error("No migration files found.");
  for (const file of files) {
    const sql = await readFile(path.join(directory, file), "utf8");
    if (!sql.trim()) throw new Error(`Empty migration: ${file}`);
    if (/\bDROP\s+DATABASE\b|\bTRUNCATE\b/i.test(sql))
      throw new Error(`Destructive migration operation: ${file}`);
  }
  console.log(`Verified ${files.length} local migrations.`);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
