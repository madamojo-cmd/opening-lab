import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

async function main() {
  const directory = path.resolve("supabase/migrations");
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  if (!files.length) throw new Error("No migration files found.");
  const versions = files.map((file) => file.split("_")[0]);
  if (new Set(versions).size !== versions.length)
    throw new Error(`Duplicate migration version: ${versions.join(", ")}`);
  const checksums: string[] = [];
  for (const file of files) {
    const sql = await readFile(path.join(directory, file), "utf8");
    if (!sql.trim()) throw new Error(`Empty migration: ${file}`);
    if (
      /\bDROP\s+DATABASE\b|\bTRUNCATE\b|\bDROP\s+TABLE\b|\bDROP\s+COLUMN\b/i.test(
        sql,
      )
    )
      throw new Error(`Destructive migration operation: ${file}`);
    if (
      /create\s+table/i.test(sql) &&
      !/enable\s+row\s+level\s+security/i.test(sql)
    )
      throw new Error(`Table without explicit RLS enablement: ${file}`);
    checksums.push(createHash("sha256").update(sql).digest("hex"));
  }
  console.log(
    `Verified ${files.length} local migrations. checksum=${createHash("sha256").update(checksums.join("\n")).digest("hex")}`,
  );
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
