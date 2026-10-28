#!/bin/sh
set -eu

# Ejecutar desde la raiz del frontend. No modifica ni corrige el codigo.
test -f pom.xml
test -d src/main
SEMGREP_BIN="${SEMGREP_BIN:-semgrep}"
SEMGREP_REPORT_DIR="${SEMGREP_REPORT_DIR:-target/semgrep}"
mkdir -p "$SEMGREP_REPORT_DIR"

"$SEMGREP_BIN" --version
"$SEMGREP_BIN" scan \
    --config p/java \
    --config p/javascript \
    --metrics off \
    --disable-version-check \
    --jobs 2 \
    --strict \
    --error \
    --json-output "$SEMGREP_REPORT_DIR/semgrep.json" \
    --sarif-output "$SEMGREP_REPORT_DIR/semgrep.sarif" \
    --text-output "$SEMGREP_REPORT_DIR/semgrep.txt" \
    src/main
