const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "node_modules", "stockfish.wasm");
const outDir = path.join(projectRoot, "public", "stockfish");

fs.mkdirSync(outDir, { recursive: true });

for (const file of fs.readdirSync(outDir)) {
  if (/^(stockfish.*\.(js|wasm|nnue|bin|data)|stockfish\.worker\.js)$/i.test(file)) {
    try { fs.unlinkSync(path.join(outDir, file)); } catch {}
  }
}

const required = ["stockfish.js", "stockfish.wasm", "stockfish.worker.js"];
const copied = [];

for (const file of required) {
  const src = path.join(sourceDir, file);
  const dst = path.join(outDir, file);

  if (fs.existsSync(src)) {
    const sizeMb = fs.statSync(src).size / 1024 / 1024;
    if (sizeMb > 5) {
      console.warn(`[Blundr] Refusing to copy unexpectedly large ${file}: ${sizeMb.toFixed(2)} MB`);
      continue;
    }
    fs.copyFileSync(src, dst);
    copied.push(file);
  }
}

if (copied.length < required.length) {
  fs.writeFileSync(
    path.join(outDir, "manifest.json"),
    JSON.stringify({
      enginePath: null,
      source: "stockfish.wasm-copy-failed",
      copied,
      missing: required.filter((f) => !copied.includes(f)),
      note: "Browser Stockfish unavailable. Falling back to engine-style analysis."
    }, null, 2)
  );
  console.warn("[Blundr] stockfish.wasm copy incomplete:", copied);
  process.exit(0);
}

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify({
    enginePath: "/stockfish/stockfish.worker.js",
    loaderPath: "/stockfish/stockfish.js",
    wasmPath: "/stockfish/stockfish.wasm",
    source: "npm:stockfish.wasm",
    copied,
    note: "Small browser Stockfish WASM worker copied successfully. No Stockfish API required."
  }, null, 2)
);

console.log("[Blundr] Copied stockfish.wasm browser worker:", copied.join(", "));
