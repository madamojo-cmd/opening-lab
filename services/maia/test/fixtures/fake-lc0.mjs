#!/usr/bin/env node

import { createInterface } from "node:readline";

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
const version = process.env.FAKE_LC0_VERSION ?? "0.32.1";
const commit = process.env.FAKE_LC0_COMMIT ?? "fd71a2d";
input.on("line", (line) => {
  const command = line.trim();
  if (command === "uci") {
    process.stdout.write(`id name Lc0 v${version}+git.${commit} fake\nuciok\n`);
  } else if (command === "isready") {
    process.stdout.write("readyok\n");
  } else if (command === "go nodes 1") {
    process.stdout.write("info nodes 1\nbestmove e2e4 ponder e7e5\n");
  } else if (command === "quit") {
    process.exit(0);
  }
});
