/* Copies browser Stockfish worker files from node_modules into /public/stockfish.
   This lets Blundr run Stockfish locally in the user's browser with no Stockfish API. */
const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const stockfishRoot = path.join(projectRoot, "node_modules", "stockfish");
const outDir = path.join(projectRoot, "public", "stockfish");

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function scoreFile(file) {
  const name = path.basename(file).toLowerCase();
  let score = 0;
  if (name.includes("lite")) score += 100;
  if (name.includes("single")) score += 90;
  if (name.includes("18")) score += 60;
  if (name.includes("17")) score += 40;
  if (name.includes("stockfish")) score += 20;
  if (name.endsWith(".js")) score += 10;
  if (name.includes("asm")) score -= 100;
  return score;
}

fs.mkdirSync(outDir, { recursive: true });

const all = walk(stockfishRoot);
const jsCandidates = all
  .filter((file) => /stockfish.*\.js$/i.test(path.basename(file)))
  .sort((a, b) => scoreFile(b) - scoreFile(a));

if (!jsCandidates.length) {
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify({
    enginePath: null,
    source: "not-found",
    note: "No stockfish worker file was found in node_modules/stockfish. Browser engine will fall back to app heuristic."
  }, null, 2));
  console.warn("[Blundr] No Stockfish JS worker found. The app will still build and use fallback analysis.");
  process.exit(0);
}

const selectedJs = jsCandidates[0];
const selectedDir = path.dirname(selectedJs);
const selectedBase = path.basename(selectedJs);
fs.copyFileSync(selectedJs, path.join(outDir, selectedBase));

// Copy nearby required resources that the worker may request by relative URL.
for (const file of fs.readdirSync(selectedDir)) {
  const full = path.join(selectedDir, file);
  const sizeMb = fs.existsSync(full) ? fs.statSync(full).size / 1024 / 1024 : 0;
  if (/\.(wasm|nnue|bin|data)$/i.test(file) && sizeMb < 95) {
    fs.copyFileSync(full, path.join(outDir, file));
  }
}

// Copy same-family resources anywhere in the package.
const stem = selectedBase.replace(/\.js$/i, "");
for (const file of all) {
  const base = path.basename(file);
  if ((base.includes(stem) || base.toLowerCase().includes("stockfish")) && /\.(wasm|nnue|bin|data)$/i.test(base)) {
    const sizeMb = fs.statSync(file).size / 1024 / 1024;
    if (sizeMb < 95) {
      try { fs.copyFileSync(file, path.join(outDir, base)); } catch {}
    }
  }
}

fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify({
  enginePath: `/stockfish/${selectedBase}`,
  selectedFile: selectedBase,
  source: "npm:stockfish",
  copiedAt: new Date().toISOString(),
  note: "Runs Stockfish locally in a browser Web Worker. No external Stockfish API required."
}, null, 2));

console.log(`[Blundr] Copied Stockfish worker: ${selectedBase}`);
