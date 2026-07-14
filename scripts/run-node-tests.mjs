import { readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const explicitRoots = process.argv.slice(2);
const testRoots = explicitRoots.length > 0 ? explicitRoots : ["lib", "tests"];

async function collect(directory) {
  if (
    explicitRoots.length === 0 &&
    ["tests/integration", "tests/security", "tests/e2e"].some(
      (prefix) => directory === prefix || directory.startsWith(`${prefix}/`),
    )
  ) {
    return [];
  }
  const entries = await readdir(join(root, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(path)));
    else if (/\.(test|spec)\.ts$/.test(entry.name)) files.push(path);
  }
  return files;
}

const files = (await Promise.all(testRoots.map(collect))).flat().sort();
if (files.length === 0) {
  console.error("No unit test files were discovered.");
  process.exit(1);
}

const child = spawn(
  process.execPath,
  [
    "--preserve-symlinks",
    "--import",
    "tsx",
    "--test",
    "--test-concurrency=1",
    ...files.map((file) => relative(root, file)),
  ],
  { stdio: "inherit" },
);
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
