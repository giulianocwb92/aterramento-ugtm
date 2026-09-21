#!/usr/bin/env bash
# ============================================================================
# preview-online.sh
#
# Sobe o app (pasta app/) num servidor local e abre um túnel HTTPS público
# temporário (localtunnel), pra testar em celular/tablet fora da sua rede
# Wi-Fi e conseguir instalar o PWA de verdade (instalação de PWA só funciona
# em HTTPS ou localhost — daqui vem a necessidade do túnel).
#
# USO:
#   ./scripts/preview-online.sh
#
# Isso é só para TESTE/DEMO. A URL gerada é pública (sem senha de acesso) e
# muda toda vez que você roda o script. Para os operadores de verdade, o app
# precisa estar num endereço fixo (ex: GitHub Pages) — este script não serve
# para isso.
#
# Ctrl+C encerra tanto o túnel quanto o servidor local.
# ============================================================================
set -euo pipefail

PORT="${1:-8642}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../app" && pwd)"
LOG_DIR="$(mktemp -d)"
SERVER_LOG="$LOG_DIR/server.log"
TUNNEL_LOG="$LOG_DIR/tunnel.log"

SERVER_PID=""
TUNNEL_PID=""

cleanup() {
  echo ""
  echo "Encerrando..."
  # mata pelo padrão do comando (mais confiável que PID isolado — o npx/localtunnel
  # sobe processos-filho que não morrem só com kill no PID do npx)
  pkill -9 -f "http.server $PORT" 2>/dev/null || true
  pkill -9 -f "localtunnel --port $PORT" 2>/dev/null || true
  rm -rf "$LOG_DIR"
}
trap cleanup EXIT INT TERM

# limpa qualquer processo de uma execução anterior que não tenha sido encerrado
# corretamente (ex: terminal fechado sem Ctrl+C), pra nunca dar "porta em uso"
pkill -9 -f "http.server $PORT" 2>/dev/null || true
pkill -9 -f "localtunnel --port $PORT" 2>/dev/null || true

echo "→ Subindo servidor local em $APP_DIR (porta $PORT)..."
(cd "$APP_DIR" && exec python3 -m http.server "$PORT" >"$SERVER_LOG" 2>&1) &
SERVER_PID=$!

sleep 1
if ! curl -s -o /dev/null "http://localhost:$PORT/index.html"; then
  echo "ERRO: servidor local não respondeu. Log:"
  cat "$SERVER_LOG"
  exit 1
fi

echo "→ Abrindo túnel HTTPS (localtunnel)..."
(exec npx --yes localtunnel --port "$PORT" >"$TUNNEL_LOG" 2>&1) &
TUNNEL_PID=$!

TUNNEL_URL=""
for i in $(seq 1 30); do
  TUNNEL_URL="$(grep -oE 'https://[a-zA-Z0-9.-]+\.loca\.lt' "$TUNNEL_LOG" 2>/dev/null | head -1 || true)"
  [ -n "$TUNNEL_URL" ] && break
  sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
  echo "ERRO: túnel não abriu a tempo. Log:"
  cat "$TUNNEL_LOG"
  exit 1
fi

TUNNEL_PASS="$(curl -s https://loca.lt/mytunnelpassword || echo '(não foi possível obter — tente sem senha)')"

echo ""
echo "════════════════════════════════════════════════════════"
echo " Link para abrir no celular/tablet (fora da sua rede Wi-Fi):"
echo ""
echo "   $TUNNEL_URL/index.html"
echo ""
echo " Se pedir 'Tunnel Password', use:"
echo ""
echo "   $TUNNEL_PASS"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Rodando... pressione Ctrl+C para encerrar o servidor e o túnel."
echo ""

wait "$TUNNEL_PID"
