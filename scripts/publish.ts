/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

import pkg from "../lerna.json";
import { createDryRun } from "./utils/dry-run";
import { getOutput } from "./utils/get-output";
import { printBanner } from "./utils/print-utils";

const ORG = "cloud-annotations";
const REPO = "docusaurus-plugin-openapi";
const BUILD_PATH = "build";
const REPO_ROOT = path.join(BUILD_PATH, REPO);

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

const safeExec = createDryRun(execSync);
const safeRmdir = createDryRun(fs.rmdirSync);
const safeMkdir = createDryRun(fs.mkdirSync);

function getGitUserName() {
  return getOutput("git config user.name");
}

function getGitUserEmail() {
  return getOutput("git config user.email");
}

function ensureCleanDir(path: string) {
  safeRmdir(path, { recursive: true });
  safeMkdir(path);
}

function checkoutCode() {
  printBanner("Retrieving source code");

  ensureCleanDir(BUILD_PATH);

  const gitUserName = getGitUserName();
  const gitUserEmail = getGitUserEmail();

  safeExec(`git clone git@github.com:${ORG}/${REPO}.git ${REPO}`, {
    cwd: BUILD_PATH,
  });
  safeExec(`git config user.name ${gitUserName}`, {
    cwd: REPO_ROOT,
  });
  safeExec(`git config user.email ${gitUserEmail}`, {
    cwd: REPO_ROOT,
  });
}

function buildAndPublish() {
  printBanner("Building Packages");

  safeExec(`yarn install`, {
    cwd: REPO_ROOT,
    stdio: "ignore",
  });

  safeExec(`yarn lerna run build --no-private`, {
    cwd: REPO_ROOT,
  });

  printBanner("Publishing Packages");

  safeExec(
    `lerna publish --yes from-package --no-git-tag-version --no-verify-access --no-push`,
    {
      cwd: REPO_ROOT,
    }
  );
}

function tag() {
  const tag = `v${pkg.version}`;
  const message = `Version ${pkg.version}`;
  safeExec(`git tag -a ${tag} -m "${message}"`, {
    cwd: REPO_ROOT,
  });
  safeExec(`git push origin ${tag}`, {
    cwd: REPO_ROOT,
  });
}

function main() {
  checkoutCode();
  buildAndPublish();
  tag();
}

main();
