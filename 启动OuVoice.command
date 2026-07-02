#!/bin/zsh

set -u

PROJECT_DIR="/Users/buibuibui/Documents/Codex/2026-06-30/role-you-are-an-expert-full-2"
CODEX_RUNTIME="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"

cd "$PROJECT_DIR" || exit 1

if [[ -d "$CODEX_RUNTIME/node/bin" && -d "$CODEX_RUNTIME/bin" ]]; then
  export PATH="$CODEX_RUNTIME/node/bin:$CODEX_RUNTIME/bin:$PATH"
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "未找到 pnpm。请先安装 Node.js 20+，然后执行：corepack enable"
  echo
  read -k 1 "?按任意键关闭窗口…"
  exit 1
fi

echo "正在启动 OuVoice…"
echo "启动完成后请打开：http://localhost:5173/"
echo "请不要关闭此终端窗口。"
echo

pnpm --filter @ouvoice/web dev
STATUS=$?

echo
echo "OuVoice 已停止（退出状态：$STATUS）。"
read -k 1 "?按任意键关闭窗口…"

