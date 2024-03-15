#!/usr/bin/env ts-node
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

import { createDryRun } from "./utils/dry-run";
import { getOutput } from "./utils/get-output";
import { printBanner } from "./utils/print-utils";
import { version } from "../lerna.json";

const ORG = "PaloAltoNetworks";
const REPO = "docusaurus-openapi-docs";
let REPO_ROOT = undefined;

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

const safeExec = createDryRun(execSync);
const safeRmdir = createDryRun(fs.rmSync);
const safeMkdir = createDryRun(fs.mkdirSync);

function getGitUserName() {
  return getOutput("git config user.name");
}

function getGitUserEmail() {
  return getOutput("git config user.email");
}

function ensureCleanDir(path: string) {
  if (fs.existsSync(path)) {
    safeRmdir(path, { recursive: true });
  }
  safeMkdir(path, { recursive: true });
}

function checkoutCode() {
  printBanner("Retrieving source code");

  const BUILD_PATH = "build";
  ensureCleanDir(BUILD_PATH);

  safeExec(`git clone git@github.com:${ORG}/${REPO}.git ${REPO}`, {
    cwd: BUILD_PATH,
  });

  REPO_ROOT = path.join(BUILD_PATH, REPO);
}

function configureGit() {
  const gitUserName = getGitUserName();
  const gitUserEmail = getGitUserEmail();
  safeExec(`git config user.name ${gitUserName}`, {
    cwd: REPO_ROOT,
  });
  safeExec(`git config user.email ${gitUserEmail}`, {
    cwd: REPO_ROOT,
  });
}

function buildAndPublish() {
  safeExec(`yarn install --frozen-lockfile`, {
    cwd: REPO_ROOT,
    stdio: "ignore",
  });

  printBanner("Building Packages");

  safeExec(`yarn lerna run build --no-private`, {
    cwd: REPO_ROOT,
  });

  printBanner("Publishing Packages");

  // --no-verify-access enables lerna publish to work in ci with access token.
  safeExec(
    `lerna publish --yes from-package --no-verify-access --dist-tag beta`,
    {
      cwd: REPO_ROOT,
    }
  );
}

function tag() {
  const tag = `v${version}`;
  const message = `Version ${version}`;
  safeExec(`git tag -a ${tag} -m "${message}"`, {
    cwd: REPO_ROOT,
  });
  safeExec(`git push origin ${tag}`, {
    cwd: REPO_ROOT,
  });
}

function versions() {
  return getOutput(`git tag --list 'v*'`).split("\n");
}

function main() {
  if (versions().includes(`v${version}`)) {
    console.log(`\x1b[33mSKIPPING: Version ${version} already exists.\x1b[0m`);
    return;
  }
  if (!process.env.CI) {
    checkoutCode();
  }
  configureGit();
  buildAndPublish();
  tag();
}

main();
