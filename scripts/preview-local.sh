#!/usr/bin/env bash
# ============================================================================
# preview-local.sh
#
# Sobe só o servidor local (sem túnel) para testar o app no PRÓPRIO
# computador. Use sempre este script (ou o preview-online.sh) para abrir o
# app — NUNCA clique direto no index.html pela pasta/explorador de arquivos.
#
# Por quê: o app salva o progresso do POP (checklist, página liberada) no
# localStorage do navegador. Abrindo por file:// (clique duplo no arquivo),
# cada página vira uma "origem" isolada e esse progresso não passa de uma
# página pra outra — o app te manda de volta pro início sem parar. Servido
# via http://localhost, isso não acontece.
#
# USO:
#   ./scripts/preview-local.sh
#
# Depois abra no navegador o link que aparecer (http://localhost:8642/index.html).
# Ctrl+C encerra o servidor.
# ============================================================================
set -euo pipefail

PORT="${1:-8642}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../app" && pwd)"

cleanup() {
  echo ""
  echo "Encerrando..."
  pkill -9 -f "http.server $PORT" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

pkill -9 -f "http.server $PORT" 2>/dev/null || true

echo "→ Subindo servidor local em $APP_DIR (porta $PORT)..."
(cd "$APP_DIR" && exec python3 -m http.server "$PORT") &
SERVER_PID=$!

sleep 1
if ! curl -s -o /dev/null "http://localhost:$PORT/index.html"; then
  echo "ERRO: servidor não respondeu."
  exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo " Abra no navegador:"
echo ""
echo "   http://localhost:$PORT/index.html"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Rodando... pressione Ctrl+C para encerrar."
echo ""

wait "$SERVER_PID"
