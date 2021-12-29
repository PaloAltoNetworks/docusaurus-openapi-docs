/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { execSync } from "child_process";
import os from "os";
import path from "path";

import logger from "@docusaurus/logger";
import fs from "fs-extra";
import { kebabCase } from "lodash";
import prompts from "prompts";
import shell from "shelljs";
import supportsColor from "supports-color";

const RecommendedTemplate = "openapi";

function hasYarn() {
  try {
    execSync("yarnpkg --version", { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

function isValidGitRepoUrl(gitRepoUrl: string) {
  return ["https://", "git@"].some((item) => gitRepoUrl.startsWith(item));
}

async function updatePkg(pkgPath: string, obj: Record<string, unknown>) {
  const content = await fs.readFile(pkgPath, "utf-8");
  const pkg = JSON.parse(content);
  const newPkg = Object.assign(pkg, obj);

  await fs.outputFile(pkgPath, `${JSON.stringify(newPkg, null, 2)}\n`);
}

function getTemplateInstallPackage(
  template: string,
  originalDirectory: string
) {
  let templateToInstall = "docusaurus-template";
  if (template) {
    const match = template.match(/^file:(.*)?$/);
    if (match) {
      templateToInstall = `file:${path.resolve(originalDirectory, match[1])}`;
    } else if (
      template.includes("://") ||
      template.match(/^.+\.(tgz|tar\.gz)$/)
    ) {
      // for tar.gz or alternative paths
      templateToInstall = template;
    } else {
      // Add prefix 'cra-template-' to non-prefixed templates, leaving any
      // @scope/ and @version intact.
      const packageMatch = template.match(/^(@[^/]+\/)?([^@]+)?(@.+)?$/);
      const scope = packageMatch?.[1] || "";
      const templateName = packageMatch?.[2] || "";
      const version = packageMatch?.[3] || "";

      if (
        templateName === templateToInstall ||
        templateName.startsWith(`${templateToInstall}-`)
      ) {
        // Covers:
        // - cra-template
        // - @SCOPE/cra-template
        // - cra-template-NAME
        // - @SCOPE/cra-template-NAME
        templateToInstall = `${scope}${templateName}${version}`;
      } else if (version && !scope && !templateName) {
        // Covers using @SCOPE only
        templateToInstall = `${version}/${templateToInstall}`;
      } else {
        // Covers templates without the `cra-template` prefix:
        // - NAME
        // - @SCOPE/NAME
        templateToInstall = `${scope}${templateToInstall}-${templateName}${version}`;
      }
    }
  }

  return templateToInstall;
}

// Extract package name from tarball url or path.
function getPackageInfo(installPackage: string) {
  const match = installPackage.match(/^file:(.*)?$/);
  if (match) {
    const installPackagePath = match[1];
    const { name, version } = require(path.join(
      installPackagePath,
      "package.json"
    ));
    return { name, version };
  }
  return { name: installPackage };
}

function createPackageJson(appPath: string, templateName: string) {
  const appPackage = require(path.join(appPath, "package.json"));

  const templatePath = path.dirname(
    require.resolve(`${templateName}/package.json`, { paths: [appPath] })
  );

  const templateJsonPath = path.join(templatePath, "template.json");

  let templateJson: any = {};
  if (fs.existsSync(templateJsonPath)) {
    templateJson = require(templateJsonPath);
  }

  const templatePackage = templateJson.package || {};

  // Keys to ignore in templatePackage
  const templatePackageIgnorelist = [
    "name",
    "version",
    "description",
    "keywords",
    "bugs",
    "license",
    "author",
    "contributors",
    "files",
    "browser",
    "bin",
    "man",
    "directories",
    "repository",
    "peerDependencies",
    "bundledDependencies",
    "optionalDependencies",
    "engineStrict",
    "os",
    "cpu",
    "preferGlobal",
    "private",
    "publishConfig",
  ];

  // Keys from templatePackage that will be merged with appPackage
  const templatePackageToMerge = ["dependencies"]; // "dependencies", "scripts"

  // Keys from templatePackage that will be added to appPackage,
  // replacing any existing entries.
  const templatePackageToReplace = Object.keys(templatePackage).filter(
    (key) => {
      return (
        !templatePackageIgnorelist.includes(key) &&
        !templatePackageToMerge.includes(key)
      );
    }
  );

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};
  const templateDependencies = templatePackage.dependencies || {};
  appPackage.dependencies = {
    ...appPackage.dependencies,
    ...templateDependencies,
  };

  // Add templatePackage keys/values to appPackage, replacing existing entries
  templatePackageToReplace.forEach((key) => {
    appPackage[key] = templatePackage[key];
  });

  fs.writeFileSync(
    path.join(appPath, "package.json"),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );
}

export default async function init(
  rootDir: string,
  siteName?: string,
  reqTemplate?: string,
  cliOptions: Partial<{
    useNpm: boolean;
    skipInstall: boolean;
    typescript: boolean;
  }> = {}
): Promise<void> {
  const useYarn = cliOptions.useNpm ? false : hasYarn();

  let name = siteName;

  // Prompt if siteName is not passed from CLI.
  if (!name) {
    const prompt = await prompts({
      type: "text",
      name: "name",
      message: "What should we name this site?",
      initial: "website",
    });
    name = prompt.name;
  }

  if (!name) {
    logger.error("A website name is required.");
    process.exit(1);
  }

  const dest = path.resolve(rootDir, name);
  if (fs.existsSync(dest)) {
    logger.error`Directory already exists at path=${dest}!`;
    process.exit(1);
  }

  let template = reqTemplate ?? RecommendedTemplate;

  logger.info("Creating new Docusaurus project...");

  if (isValidGitRepoUrl(template)) {
    logger.info`Cloning Git template path=${template}...`;
    if (
      shell.exec(`git clone --recursive ${template} ${dest}`, { silent: true })
        .code !== 0
    ) {
      logger.error`Cloning Git template name=${template} failed!`;
      process.exit(1);
    }
  } else if (fs.existsSync(path.resolve(process.cwd(), template))) {
    const templateDir = path.resolve(process.cwd(), template);
    try {
      await fs.copy(templateDir, dest);
    } catch (err) {
      logger.error`Copying local template path=${templateDir} failed!`;
      throw err;
    }
  } else {
    const appName = path.basename(dest);
    fs.ensureDirSync(name);
    const packageJson = {
      name: appName,
      version: "0.1.0",
      private: true,
    };
    fs.writeFileSync(
      path.join(dest, "package.json"),
      JSON.stringify(packageJson, null, 2) + os.EOL
    );

    const originalDirectory = process.cwd();
    const templatePackageName = getTemplateInstallPackage(
      template,
      originalDirectory
    );
    const templateInfo = getPackageInfo(templatePackageName);
    const templateName = templateInfo.name;

    shell.exec(
      `cd "${name}" && ${
        useYarn ? "yarn add" : "npm install --color always"
      } ${templatePackageName}`,
      {
        env: {
          ...process.env,
          // Force coloring the output, since the command is invoked by shelljs, which is not the interactive shell
          ...(supportsColor.stdout ? { FORCE_COLOR: "1" } : {}),
        },
      }
    );

    const templatePath = path.dirname(
      require.resolve(`${templateName}/package.json`, { paths: [dest] })
    );

    createPackageJson(dest, templateName);

    const templateDir = path.join(templatePath, "template");
    if (fs.existsSync(templateDir)) {
      fs.copySync(templateDir, dest);
    } else {
      logger.error("Could not locate supplied template.");
      process.exit(1);
    }

    shell.exec(
      `cd "${name}" && ${
        useYarn ? "yarn remove" : "npm uninstall --color always"
      } ${templateName}`,
      {
        env: {
          ...process.env,
          // Force coloring the output, since the command is invoked by shelljs, which is not the interactive shell
          ...(supportsColor.stdout ? { FORCE_COLOR: "1" } : {}),
        },
      }
    );
  }

  // Update package.json info.
  try {
    await updatePkg(path.join(dest, "package.json"), {
      name: kebabCase(name),
      version: "0.0.0",
      private: true,
    });
  } catch (err) {
    logger.error("Failed to update package.json.");
    throw err;
  }

  // We need to rename the gitignore file to .gitignore
  if (
    !fs.pathExistsSync(path.join(dest, ".gitignore")) &&
    fs.pathExistsSync(path.join(dest, "gitignore"))
  ) {
    await fs.move(path.join(dest, "gitignore"), path.join(dest, ".gitignore"));
  }
  if (fs.pathExistsSync(path.join(dest, "gitignore"))) {
    fs.removeSync(path.join(dest, "gitignore"));
  }

  const pkgManager = useYarn ? "yarn" : "npm";
  // Display the most elegant way to cd.
  const cdpath =
    path.join(process.cwd(), name) === dest
      ? name
      : path.relative(process.cwd(), name);
  if (!cliOptions.skipInstall) {
    logger.info`Installing dependencies with name=${pkgManager}...`;
    if (
      shell.exec(
        `cd "${name}" && ${useYarn ? "yarn" : "npm install --color always"}`,
        {
          env: {
            ...process.env,
            // Force coloring the output, since the command is invoked by shelljs, which is not the interactive shell
            ...(supportsColor.stdout ? { FORCE_COLOR: "1" } : {}),
          },
        }
      ).code !== 0
    ) {
      logger.error("Dependency installation failed.");
      logger.info`The site directory has already been created, and you can retry by typing:

  code=${`cd ${cdpath}`}
  code=${`${pkgManager} install`}`;
      process.exit(0);
    }
  }

  logger.success`Created path=${cdpath}.`;
  logger.info`Inside that directory, you can run several commands:

  code=${`${pkgManager} start`}
    Starts the development server.

  code=${`${pkgManager} ${useYarn ? "" : "run "}build`}
    Bundles your website into static files for production.

  code=${`${pkgManager} ${useYarn ? "" : "run "}serve`}
    Serves the built website locally.

  code=${`${pkgManager} deploy`}
    Publishes the website to GitHub pages.

We recommend that you begin by typing:

  code=${`cd ${cdpath}`}
  code=${`${pkgManager} start`}

Happy building awesome websites!
`;
}
