#!/bin/bash
set -e

echo "Verifying project tooling..."

# GitHub CLI
if command -v gh &> /dev/null; then
  if gh auth status &> /dev/null; then
    echo "✓ GitHub CLI authenticated"
  else
    echo "✗ GitHub CLI not authenticated. Run: gh auth login"
    exit 1
  fi
else
  echo "⚠ GitHub CLI not installed. Run: brew install gh"
fi

# Node.js
if command -v node &> /dev/null; then
  echo "✓ Node.js installed ($(node --version))"
else
  echo "✗ Node.js not installed. Run: brew install node"
  exit 1
fi

# npm
if command -v npm &> /dev/null; then
  echo "✓ npm installed ($(npm --version))"
else
  echo "✗ npm not installed"
  exit 1
fi

echo ""
echo "Tooling verification complete!"
