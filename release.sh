#!/bin/bash

set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "You must install jq to use this script."
  exit 1
fi

if [ "$#" -ne 2 ]; then
  echo "Must provide exactly two arguments."
  echo "First argument: new plugin version."
  echo "Second argument: minimum Obsidian version."
  echo ""
  echo "Example usage:"
  echo "./release.sh 0.0.1 1.0.0"
  echo "Exiting."
  exit 1
fi

if [[ $(git status --porcelain) ]]; then
  echo "Working tree is not clean. Commit or stash changes first."
  exit 1
fi

NEW_VERSION=$1
MINIMUM_OBSIDIAN_VERSION=$2

echo "Releasing ${NEW_VERSION} (min Obsidian ${MINIMUM_OBSIDIAN_VERSION}) directly on main."
echo "This will: update version files, commit, push main, create tag, push tag."
read -p "Continue? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Exiting."
  exit 1
fi

git checkout main
git fetch
git pull

if git rev-parse -q --verify "refs/tags/${NEW_VERSION}" >/dev/null; then
  echo "Tag ${NEW_VERSION} already exists locally."
  exit 1
fi

if git ls-remote --exit-code --tags origin "refs/tags/${NEW_VERSION}" >/dev/null 2>&1; then
  echo "Tag ${NEW_VERSION} already exists on origin."
  exit 1
fi

echo "Updating package.json"
TEMP_FILE=$(mktemp)
jq ".version |= \"${NEW_VERSION}\"" package.json > "$TEMP_FILE" || exit 1
mv "$TEMP_FILE" package.json

echo "Updating manifest.json"
TEMP_FILE=$(mktemp)
jq ".version |= \"${NEW_VERSION}\" | .minAppVersion |= \"${MINIMUM_OBSIDIAN_VERSION}\"" manifest.json > "$TEMP_FILE" || exit 1
mv "$TEMP_FILE" manifest.json

echo "Updating versions.json"
TEMP_FILE=$(mktemp)
jq ". += {\"${NEW_VERSION}\": \"${MINIMUM_OBSIDIAN_VERSION}\"}" versions.json > "$TEMP_FILE" || exit 1
mv "$TEMP_FILE" versions.json

git add package.json manifest.json versions.json

if git diff --cached --quiet; then
  echo "No version file changes detected. Exiting."
  exit 1
fi

git commit -m "ops: release ${NEW_VERSION}"
git push origin main

git tag "${NEW_VERSION}"
git push origin "${NEW_VERSION}"

echo "Release ${NEW_VERSION} completed."
