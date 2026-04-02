#!/usr/bin/env ts-node
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import pkg from "../lerna.json";
import { getOutput } from "./utils/get-output";
import { printBanner, printSpacer } from "./utils/print-utils";

const ORG = "PaloAltoNetworks";
const REPO = "docusaurus-openapi-docs";
const BRANCH = "main";

const COMMIT_FILTERS = [/\(release\) v.*/];

// Commit categorization patterns
const CATEGORY_PATTERNS: {
  pattern: RegExp;
  category: string;
  emoji: string;
}[] = [
  { pattern: /^feat/i, category: "New Feature", emoji: ":rocket:" },
  { pattern: /^fix/i, category: "Bug Fix", emoji: ":bug:" },
  { pattern: /^bugfix/i, category: "Bug Fix", emoji: ":bug:" },
  { pattern: /^perf/i, category: "Performance", emoji: ":running_woman:" },
  { pattern: /^refactor/i, category: "Refactoring", emoji: ":house:" },
  { pattern: /^docs/i, category: "Documentation", emoji: ":memo:" },
  { pattern: /^chore\(deps\)/i, category: "Dependencies", emoji: ":robot:" },
  { pattern: /^chore/i, category: "Maintenance", emoji: ":wrench:" },
  { pattern: /^test/i, category: "Testing", emoji: ":test_tube:" },
  { pattern: /^style/i, category: "Polish", emoji: ":nail_care:" },
];

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

interface CommitInfo {
  message: string;
  author: string;
  hash: string;
}

function getCommits(commitRange: string): CommitInfo[] {
  const output = getOutput(
    `git log --pretty=format:"%H|%an|%s" ${commitRange}`
  );
  if (!output.trim()) return [];

  return output.split(/\r?\n/).map((line) => {
    const [hash, author, ...messageParts] = line.split("|");
    return {
      hash: hash || "",
      author: author || "",
      message: messageParts.join("|") || "",
    };
  });
}

function categorizeCommit(message: string): {
  category: string;
  emoji: string;
} {
  for (const { pattern, category, emoji } of CATEGORY_PATTERNS) {
    if (pattern.test(message)) {
      return { category, emoji };
    }
  }
  return { category: "Other", emoji: ":sparkles:" };
}

function formatCommitMessage(message: string): string {
  const r = /\(#(\d+)\)$/;
  return message.replace(
    r,
    `([#$1](https://github.com/${ORG}/${REPO}/pull/$1))`
  );
}

function filterCommits(commits: CommitInfo[]): CommitInfo[] {
  return commits.filter((c) => {
    for (const filter of COMMIT_FILTERS) {
      if (filter.test(c.message)) {
        return false;
      }
    }
    return true;
  });
}

function groupCommitsByCategory(
  commits: CommitInfo[]
): Map<string, { emoji: string; commits: CommitInfo[] }> {
  const grouped = new Map<string, { emoji: string; commits: CommitInfo[] }>();

  for (const commit of commits) {
    const { category, emoji } = categorizeCommit(commit.message);
    if (!grouped.has(category)) {
      grouped.set(category, { emoji, commits: [] });
    }
    grouped.get(category)!.commits.push(commit);
  }

  return grouped;
}

function getUniqueCommitters(commits: CommitInfo[]): string[] {
  const authors = new Set<string>();
  for (const commit of commits) {
    if (commit.author && commit.author.trim()) {
      authors.add(commit.author);
    }
  }
  return Array.from(authors).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
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
  const filteredCommits = filterCommits(commits);

  if (filteredCommits.length === 0) {
    console.error("Error: There has been no changes since last release.");
    process.exit(1);
  }

  const groupedCommits = groupCommitsByCategory(filteredCommits);
  const committers = getUniqueCommitters(filteredCommits);

  // Format date as YYYY-MM-DD
  const date = new Date().toISOString().split("T")[0];

  // Build changelog sections
  const sections: string[] = [];

  // Category order for consistent output
  const categoryOrder = [
    "New Feature",
    "Bug Fix",
    "Performance",
    "Polish",
    "Refactoring",
    "Documentation",
    "Testing",
    "Dependencies",
    "Maintenance",
    "Other",
  ];

  for (const category of categoryOrder) {
    const group = groupedCommits.get(category);
    if (group && group.commits.length > 0) {
      const commitLines = group.commits
        .map((c) => `- ${formatCommitMessage(c.message)}`)
        .join("\n");
      sections.push(`#### ${group.emoji} ${category}\n\n${commitLines}`);
    }
  }

  const changelog = `## ${pkg.version} (${date})

TODO: Add high-level summary of major changes

${sections.join("\n\n")}

#### Committers: ${committers.length}

${committers.map((c) => `- ${c}`).join("\n")}
`;

  printBanner("Prepend the following to CHANGELOG.md");
  console.log(changelog);
  printSpacer();
}

main();
