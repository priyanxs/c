#!/usr/bin/env bash
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

echo "=========================================="
echo " Pushing Turbo C++ Online to GitHub (c)   "
echo "=========================================="

git remote set-url origin https://github.com/priyanxs/c.git 2>/dev/null || git remote add origin https://github.com/priyanxs/c.git

echo "Pushing 'main' branch to origin..."
git push -u origin main

echo ""
echo "=========================================="
echo " SUCCESS! Project pushed to GitHub.       "
echo " Live site will be deployed shortly at:   "
echo " https://priyanxs.github.io/c/            "
echo "=========================================="
