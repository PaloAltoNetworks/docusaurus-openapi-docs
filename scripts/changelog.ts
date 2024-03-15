#!/usr/bin/env ts-node
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { getOutput } from "./utils/get-output";
import { printBanner, printSpacer } from "./utils/print-utils";
import pkg from "../lerna.json";

const ORG = "PaloAltoNetworks";
const REPO = "docusaurus-openapi-docs";
const BRANCH = "main";

const COMMIT_FILTERS = [/\(release\) v.*/];

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

function findUpstreamMaster() {
  const remotes = getOutput("git remote -v").split(/\r?\n/);

  for (const remote of remotes) {
    const [name, url, method] = remote.split(/\s/);

    const r = new RegExp(`${ORG}\\/${REPO}(\\.git)?$`);

    if (r.test(url) && method === "(push)") {
      return `${name}/${BRANCH}`;
    }
  }
  return undefined;
}

function findLatestTag() {
  return getOutput(`git describe --tags --abbrev=0 --match "v*"`);
}

function getCommits(commitRange: string) {
  return getOutput(`git log --pretty="%s" ${commitRange}`).split(/\r?\n/);
}

function formatCommits(commits: string[]) {
  return commits
    .filter((c) => {
      for (const filter of COMMIT_FILTERS) {
        if (filter.test(c)) {
          return false;
        }
      }
      return true;
    })
    .map((c) => {
      const r = /\(#(\d+)\)$/;
      return `- ${c.replace(
        r,
        `([#$1](https://github.com/${ORG}/${REPO}/pull/$1))`
      )}`;
    });
}

function main() {
  const args = process.argv.slice(2);
  let commitRange;
  if (args.length > 0) {
    commitRange = args.join(" ");
  } else {
    const latestTag = findLatestTag();
    if (latestTag === undefined) {
      console.error("Error: Unable to find the latest tag.");
      process.exit(1);
    }

    const upstream = findUpstreamMaster();
    if (upstream === undefined) {
      console.error("Error: Unable to find the upstream.");
      process.exit(1);
    }
    commitRange = `${latestTag}...${upstream}`;
  }

  console.log(`Comparing ${commitRange}`);

  const commits = getCommits(commitRange);
  const formattedCommits = formatCommits(commits);

  if (formattedCommits.length === 0) {
    console.error("Error: There has been no changes since last release.");
    process.exit(1);
  }

  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const changelog = `
## ${pkg.version} (${date})

High level enhancements

- TODO HIGHLIGHTS

Other enhancements and bug fixes

${formattedCommits.join("\n")}
  `;

  printBanner("Prepend the following to CHANGELOG.md");
  console.log(changelog);
  printSpacer();
}

main();
