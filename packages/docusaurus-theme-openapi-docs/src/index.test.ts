/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import fs from "fs";
import path from "path";

import docusaurusThemeOpenAPI from "./index";

class ProvidePlugin {
  constructor(public definitions: unknown) {}
}

class NormalModuleReplacementPlugin {
  constructor(
    public resourceRegExp: RegExp,
    public newResource: string
  ) {}
}

const postmanLib = path.dirname(
  require.resolve("postman-collection/lib/index.js")
);

function configureWebpack(rules: any[]) {
  const plugin = docusaurusThemeOpenAPI() as any;
  return plugin.configureWebpack({ module: { rules } }, false, {
    getStyleLoaders: () => [],
    currentBundler: {
      instance: { ProvidePlugin, NormalModuleReplacementPlugin },
    },
  });
}

function fakerReplacement(config: any) {
  return config.plugins.find(
    (p: unknown) => p instanceof NormalModuleReplacementPlugin
  );
}

function filesUnder(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(full) : [full];
  });
}

describe("configureWebpack", () => {
  it.each([
    ["without docusaurus-plugin-sass", []],
    ["with docusaurus-plugin-sass", [{ test: /\.s[ca]ss$/ }]],
  ])("excludes faker %s", (_name, rules) => {
    const replacement = fakerReplacement(configureWebpack(rules));
    expect(replacement).toBeDefined();
    expect(
      replacement.resourceRegExp.test(
        path.join(postmanLib, "superstring", "dynamic-variables.js")
      )
    ).toBe(true);
    expect(fs.existsSync(replacement.newResource)).toBe(true);
  });

  it("matches the only postman-collection module that imports faker", () => {
    const importers = filesUnder(postmanLib).filter(
      (file) =>
        file.endsWith(".js") &&
        fs.readFileSync(file, "utf8").includes("@faker-js/faker")
    );
    expect(importers).toEqual([
      path.join(postmanLib, "superstring", "dynamic-variables.js"),
    ]);
  });
});

describe("getClientModules", () => {
  const clientModules = (api?: Record<string, unknown>) =>
    (
      docusaurusThemeOpenAPI({
        siteConfig: { themeConfig: { api } },
      } as any) as any
    )
      .getClientModules()
      .map((m: string) => path.basename(m));

  it("loads only the base styles by default", () => {
    expect(clientModules()).toEqual(["styles.scss"]);
  });

  it("adds sidebar badge styles when sidebarMethodBadges is enabled", () => {
    expect(clientModules({ sidebarMethodBadges: true })).toEqual([
      "styles.scss",
      "sidebar-badges.scss",
    ]);
  });
});
