/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import fs from "fs";
import path from "path";

import spawn from "cross-spawn";
import prompts from "prompts";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../package.json");

const TEMPLATE_DIR = path.join(__dirname, "..", "templates", "default");

const PACKAGE_MANAGERS = ["npm", "yarn", "pnpm", "bun"] as const;
type PackageManager = (typeof PACKAGE_MANAGERS)[number];

const LOCKFILE_NAMES: Record<PackageManager, string> = {
  npm: "package-lock.json",
  yarn: "yarn.lock",
  pnpm: "pnpm-lock.yaml",
  bun: "bun.lockb",
};

function siteNameToPackageName(siteName: string): string {
  const match = siteName.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+\d*|\b|_)|[A-Z]?[a-z]+\d*|[A-Z]|\d+/g
  );
  return match ? match.map((x) => x.toLowerCase()).join("-") : siteName;
}

function findPackageManagerFromLockFile(
  dir: string
): PackageManager | undefined {
  for (const pm of PACKAGE_MANAGERS) {
    if (fs.existsSync(path.join(dir, LOCKFILE_NAMES[pm]))) {
      return pm;
    }
  }
  return undefined;
}

function findPackageManagerFromUserAgent(): PackageManager | undefined {
  return PACKAGE_MANAGERS.find((pm) =>
    process.env.npm_config_user_agent?.startsWith(pm)
  );
}

function runCommand(command: string, args: string[]): number {
  const result = spawn.sync(command, args, { stdio: "inherit" });
  return result.status ?? 1;
}

async function getPackageManager(
  dest: string,
  cliOption?: string
): Promise<PackageManager> {
  if (cliOption) {
    if (!PACKAGE_MANAGERS.includes(cliOption as PackageManager)) {
      throw new Error(
        `Invalid package manager "${cliOption}". Must be one of: ${PACKAGE_MANAGERS.join(", ")}`
      );
    }
    return cliOption as PackageManager;
  }

  // Check for lockfile in destination
  const fromDest = findPackageManagerFromLockFile(dest);
  if (fromDest) return fromDest;

  // Check for lockfile in current directory
  const fromCwd = findPackageManagerFromLockFile(process.cwd());
  if (fromCwd) return fromCwd;

  // Check user agent
  const fromAgent = findPackageManagerFromUserAgent();
  if (fromAgent) return fromAgent;

  // Prompt user
  const { packageManager } = await prompts({
    type: "select",
    name: "packageManager",
    message: "Select a package manager:",
    choices: PACKAGE_MANAGERS.map((pm) => ({ title: pm, value: pm })),
  });

  return packageManager ?? "npm";
}

async function getSiteName(
  reqName: string | undefined,
  rootDir: string
): Promise<string> {
  if (reqName) {
    const dest = path.resolve(rootDir, reqName);
    if (reqName !== "." && fs.existsSync(dest)) {
      throw new Error(`Directory already exists at ${dest}`);
    }
    if (reqName === "." && fs.readdirSync(dest).length > 0) {
      throw new Error(`Directory not empty at ${dest}`);
    }
    return reqName;
  }

  const { siteName } = await prompts(
    {
      type: "text",
      name: "siteName",
      message: "What should we name this site?",
      initial: "my-website",
      validate: (name: string) => {
        if (!name) return "A website name is required.";
        const dest = path.resolve(rootDir, name);
        if (name !== "." && fs.existsSync(dest)) {
          return `Directory already exists at ${dest}`;
        }
        return true;
      },
    },
    {
      onCancel() {
        console.error("A website name is required.");
        process.exit(1);
      },
    }
  );

  return siteName;
}

export async function init(
  rootDir: string,
  reqName: string | undefined,
  options: { packageManager?: string; skipInstall?: boolean }
): Promise<void> {
  const siteName = await getSiteName(reqName, rootDir);
  const dest = path.resolve(rootDir, siteName);

  console.log();
  console.log("Creating new Docusaurus site with OpenAPI docs...");
  console.log();

  // Copy template files
  fs.cpSync(TEMPLATE_DIR, dest, { recursive: true });

  // Rename gitignore to .gitignore (npm strips dotfiles from published packages)
  const gitignoreSrc = path.join(dest, "gitignore");
  const gitignoreDest = path.join(dest, ".gitignore");
  if (!fs.existsSync(gitignoreDest) && fs.existsSync(gitignoreSrc)) {
    fs.renameSync(gitignoreSrc, gitignoreDest);
  }
  if (fs.existsSync(gitignoreSrc)) {
    fs.rmSync(gitignoreSrc);
  }

  // Update package.json with site name and correct plugin/theme versions
  const pkgJsonPath = path.join(dest, "package.json");
  const sitePkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));

  sitePkg.name = siteNameToPackageName(siteName);
  sitePkg.version = "0.0.0";
  sitePkg.private = true;

  // Inject the correct plugin/theme version (matches this CLI's version via lerna)
  const openapiVersion = pkg.version;
  if (sitePkg.dependencies["docusaurus-plugin-openapi-docs"]) {
    sitePkg.dependencies["docusaurus-plugin-openapi-docs"] = openapiVersion;
  }
  if (sitePkg.dependencies["docusaurus-theme-openapi-docs"]) {
    sitePkg.dependencies["docusaurus-theme-openapi-docs"] = openapiVersion;
  }

  fs.writeFileSync(pkgJsonPath, JSON.stringify(sitePkg, null, 2) + "\n");

  const pkgManager = await getPackageManager(dest, options.packageManager);
  const cdPath = path.relative(process.cwd(), dest);

  if (!options.skipInstall) {
    console.log(`Installing dependencies with ${pkgManager}...`);
    console.log();

    const prevDir = process.cwd();
    process.chdir(dest);

    const installCmd =
      pkgManager === "yarn"
        ? "yarn"
        : pkgManager === "bun"
          ? "bun"
          : pkgManager;
    const installArgs = pkgManager === "yarn" ? [] : ["install"];

    const exitCode = runCommand(installCmd, installArgs);

    process.chdir(prevDir);

    if (exitCode !== 0) {
      console.error("Dependency installation failed.");
      console.log(`You can retry by typing:`);
      console.log();
      console.log(`  cd ${cdPath}`);
      console.log(`  ${pkgManager} install`);
      console.log();
      process.exit(1);
    }
  }

  const runPrefix = pkgManager === "npm" || pkgManager === "bun" ? "run " : "";

  console.log();
  console.log(`Success! Created ${cdPath}`);
  console.log();
  console.log("Inside that directory, you can run several commands:");
  console.log();
  console.log(`  ${pkgManager} start`);
  console.log("    Starts the development server.");
  console.log();
  console.log(`  ${pkgManager} ${runPrefix}build`);
  console.log("    Bundles your website into static files for production.");
  console.log();
  console.log(`  ${pkgManager} ${runPrefix}serve`);
  console.log("    Serves the built website locally.");
  console.log();
  console.log(`  ${pkgManager} ${runPrefix}gen-api-docs`);
  console.log("    Generates API docs from your OpenAPI spec.");
  console.log();
  console.log(`  ${pkgManager} ${runPrefix}clean-api-docs`);
  console.log("    Removes generated API docs.");
  console.log();
  console.log("We recommend that you begin by typing:");
  console.log();
  console.log(`  cd ${cdPath}`);
  console.log(`  ${pkgManager} start`);
  console.log();
}
