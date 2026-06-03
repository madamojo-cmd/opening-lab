#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$ROOT_DIR/.maia"
ELO="${1:-1500}"
WEIGHTS_FILE="maia-${ELO}.pb.gz"
WEIGHTS_PATH="$TARGET_DIR/$WEIGHTS_FILE"
WEIGHTS_URL="https://github.com/CSSLab/maia-chess/releases/download/v1.0/${WEIGHTS_FILE}"

mkdir -p "$TARGET_DIR"

if ! grep -q '^\.maia/$' "$ROOT_DIR/.gitignore"; then
  echo ".maia/" >> "$ROOT_DIR/.gitignore"
fi

if [ -f "$WEIGHTS_PATH" ]; then
  echo "Maia weights already present: $WEIGHTS_PATH"
else
  if command -v curl >/dev/null 2>&1; then
    echo "Downloading $WEIGHTS_URL"
    curl -L --fail "$WEIGHTS_URL" -o "$WEIGHTS_PATH"
  elif command -v wget >/dev/null 2>&1; then
    echo "Downloading $WEIGHTS_URL"
    wget -O "$WEIGHTS_PATH" "$WEIGHTS_URL"
  else
    echo "No curl/wget available. Download manually: $WEIGHTS_URL"
    exit 1
  fi
fi

if [ ! -f "$WEIGHTS_PATH" ]; then
  echo "Weight download failed: $WEIGHTS_PATH"
  exit 1
fi

echo ""
echo "Maia setup complete"
echo "weights: $WEIGHTS_PATH"
echo ""
echo "Install lc0 (Leela Chess Zero) separately:"
echo "- macOS: brew install lc0 (or official release)"
echo "- Linux: distro package or official release"
echo "- Windows/WSL: install Linux binary and use absolute path"
echo ""
echo "Recommended env vars:"
echo "NEXT_PUBLIC_MAIA_API_ENABLED=true"
echo "MAIA_ENABLED=true"
echo "MAIA_LC0_PATH=/absolute/path/to/lc0"
echo "MAIA_WEIGHTS_PATH=$WEIGHTS_PATH"
echo "MAIA_SKILL_LEVEL=maia-$ELO"
echo "MAIA_TIMEOUT_MS=1500"
echo "MAIA_NODES=1"
