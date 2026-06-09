#!/usr/bin/env bash
set -e

PROJECT="kurva-konik-parametrik"
TMPDIR=$(mktemp -d /tmp/vercel-deploy-XXXXXX)

echo "=== Copying files ==="
cp -r public server.js package.json package-lock.json vercel.json "$TMPDIR/"

cd "$TMPDIR"

echo "=== Linking to Vercel project ==="
npx vercel link --project "$PROJECT" --yes 2>/dev/null

echo "=== Deploying to production ==="
npx vercel --prod --yes

cd - > /dev/null
rm -rf "$TMPDIR"

echo "=== Done ==="
