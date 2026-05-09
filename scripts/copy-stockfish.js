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

fs.mkdirSync(outDir, { recursive: true });

// Clean all generated Stockfish engine files first.
for (const file of fs.readdirSync(outDir)) {
  if (/^stockfish.*\.(js|wasm|nnue|bin|data)$/i.test(file)) {
    try { fs.unlinkSync(path.join(outDir, file)); } catch {}
  }
}

const all = walk(stockfishRoot);
const js = all.find((file) => /stockfish-18-lite-single\.js$/i.test(path.basename(file)))
  || all.find((file) => /stockfish.*lite.*single.*\.js$/i.test(path.basename(file)))
  || all.find((file) => /stockfish.*single.*\.js$/i.test(path.basename(file)));

if (!js) {
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify({
    enginePath: null,
    source: "stockfish-lite-single-not-found",
    note: "Could not find a browser Stockfish lite/single worker. Fallback analysis will be used."
  }, null, 2));
  console.warn("[Blundr] Could not find Stockfish lite-single worker.");
  process.exit(0);
}

const jsBase = path.basename(js);
const stem = jsBase.replace(/\.js$/i, "");
const jsDir = path.dirname(js);
const wasm =
  all.find((file) => path.basename(file).toLowerCase() === `${stem.toLowerCase()}.wasm`) ||
  all.find((file) => /stockfish.*lite.*single.*\.wasm$/i.test(path.basename(file)));

if (!wasm) {
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify({
    enginePath: null,
    selectedJs: jsBase,
    source: "stockfish-lite-single-wasm-not-found",
    note: "Found JS worker but not matching WASM. Fallback analysis will be used."
  }, null, 2));
  console.warn("[Blundr] Found Stockfish JS but not matching WASM.");
  process.exit(0);
}

const wasmBase = path.basename(wasm);
const jsSizeMb = fs.statSync(js).size / 1024 / 1024;
const wasmSizeMb = fs.statSync(wasm).size / 1024 / 1024;

// Prevent accidentally committing 100MB full builds again.
if (jsSizeMb > 50 || wasmSizeMb > 50) {
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify({
    enginePath: null,
    selectedJs: jsBase,
    selectedWasm: wasmBase,
    jsSizeMb,
    wasmSizeMb,
    source: "stockfish-too-large",
    note: "Refused to copy heavyweight Stockfish files. Fallback analysis will be used."
  }, null, 2));
  console.warn("[Blundr] Refusing to copy large Stockfish files:", jsBase, wasmBase);
  process.exit(0);
}

fs.copyFileSync(js, path.join(outDir, jsBase));
fs.copyFileSync(wasm, path.join(outDir, wasmBase));

fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify({
  enginePath: `/stockfish/${jsBase}`,
  wasmPath: `/stockfish/${wasmBase}`,
  selectedJs: jsBase,
  selectedWasm: wasmBase,
  source: "npm:stockfish-lite-single",
  note: "Stockfish lite single-thread browser worker copied successfully. No engine API required."
}, null, 2));

console.log(`[Blundr] Copied Stockfish lite single worker: ${jsBase}, ${wasmBase}`);
