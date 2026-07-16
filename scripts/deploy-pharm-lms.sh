#!/usr/bin/env bash
# Deploy Pharm LMS on EC2 after pulling latest code.
# Install once on the server:
#   cp ~/pharm-lms/scripts/deploy-pharm-lms.sh ~/deploy-pharm-lms.sh
#   chmod +x ~/deploy-pharm-lms.sh
#
# Run on every release (PM2 already running):
#   ~/deploy-pharm-lms.sh

set -euo pipefail

# Avoid OOM during next build on small EC2 instances
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"

APP_DIR="${PHARM_LMS_DIR:-$HOME/pharm-lms}"
BRANCH="${PHARM_LMS_BRANCH:-main}"

cd "$APP_DIR"

echo "==> Pharm LMS deploy"
echo "    Directory: $APP_DIR"
echo "    Branch:    $BRANCH"
echo "    NODE_OPTIONS: $NODE_OPTIONS"
echo ""

echo "==> Pulling latest code..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

# Keep ~/deploy-pharm-lms.sh in sync with the repo copy
if [[ -f "$APP_DIR/scripts/deploy-pharm-lms.sh" ]]; then
  cp "$APP_DIR/scripts/deploy-pharm-lms.sh" "$HOME/deploy-pharm-lms.sh"
  chmod +x "$HOME/deploy-pharm-lms.sh"
fi

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Running database migrations..."
pnpm db:migrate:deploy

# Free RAM during build if the app is already running
if pm2 describe pharm-lms >/dev/null 2>&1; then
  echo "==> Stopping pharm-lms briefly for build..."
  pm2 stop pharm-lms
fi

echo "==> Building production app..."
pnpm build

echo "==> Starting / restarting PM2 process..."
if pm2 describe pharm-lms >/dev/null 2>&1; then
  pm2 restart pharm-lms
else
  pm2 start "pnpm exec next start" --name pharm-lms
  pm2 save
fi

echo ""
echo "==> Deploy complete."
pm2 status pharm-lms
echo ""
echo "Tip: pm2 logs pharm-lms --lines 50"
