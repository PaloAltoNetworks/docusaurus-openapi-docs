#!/usr/bin/env ts-node
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { execSync } from "child_process";

import semver from "semver";

import pkg from "../lerna.json";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

function generateVersion(
  bump:
    | "major"
    | "minor"
    | "patch"
    | "premajor"
    | "preminor"
    | "prepatch"
    | "prerelease"
    | "graduate"
    | "betamajor"
    | "betapatch"
) {
  if (bump === "betamajor") {
    const v = semver.parse(pkg.version);
    if (v === null) {
      console.error("Error: Invalid package version.");
      process.exit(1);
    }
    return `${v.major + 1}.0.0-beta.0`;
  }

  if (bump === "betapatch") {
    const v = semver.parse(pkg.version);
    if (v === null) {
      console.error("Error: Invalid package version.");
      process.exit(1);
    }
    const patch = (v.prerelease[1] as number) + 1;
    return `${v.major}.0.0-beta.${patch}`;
  }

  if (bump === "graduate") {
    const v = semver.parse(pkg.version);
    if (v === null) {
      console.error("Error: Invalid package version.");
      process.exit(1);
    }
    return `${v.major}.${v.minor}.${v.patch}`;
  }

  const newVersion = semver.inc(pkg.version, bump, "rc");
  if (newVersion === null) {
    console.error("Error: Invalid package version.");
    process.exit(1);
  }
  return newVersion;
}

function main() {
  const [bump] = process.argv.slice(2);

  let nextVersion;
  switch (bump) {
    case "major":
    case "minor":
    case "patch":
    case "premajor":
    case "preminor":
    case "prepatch":
    case "prerelease":
    case "graduate":
    case "betamajor":
    case "betapatch":
      nextVersion = generateVersion(bump);
      break;
    default:
      const v = semver.valid(bump);
      if (v === null) {
        console.error("Error: Invalid version bump.");
        process.exit(1);
      }
      nextVersion = v;
  }

  execSync(
    `lerna version ${nextVersion} --no-git-tag-version --no-push --yes`,
    { stdio: "ignore" }
  );
}

main();
