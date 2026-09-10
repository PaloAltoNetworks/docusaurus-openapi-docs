/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import fs from "fs";
import os from "os";
import path from "path";

import pluginOpenAPIDocs from "./index";

const GENERATED = [
  "petstore.api.mdx",
  "petstore.info.mdx",
  "petstore.tag.mdx",
  "sidebar.js",
  "get-pet.StatusCodes.json",
  "get-pet.StatusCodes.2.json",
  "get-pet.ParamsDetails.json",
];
const GENERATED_SCHEMAS = ["pet.schema.mdx", "pet.RequestSchema.json"];

// The command unlinks with callbacks it does not await, so wait for the files it
// must remove before asserting on the ones it must keep.
async function settle(files: string[]) {
  const left = () => files.filter((file) => fs.existsSync(file));
  for (let i = 0; i < 500 && left().length > 0; i++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  if (left().length > 0) {
    throw new Error(`clean-api-docs never removed ${left().join(", ")}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 20));
}

function cleanApiDocs(siteDir: string) {
  const plugin: any = pluginOpenAPIDocs(
    { siteDir, siteConfig: { presets: [], plugins: [] } } as any,
    {
      id: "openapi",
      config: {
        petstore: { specPath: "petstore.yaml", outputDir: "docs/petstore" },
      },
    } as any
  );
  const actions: Record<string, any> = {};
  let command = "";
  const cli: any = {
    command: (name: string) => {
      command = name;
      return cli;
    },
    description: () => cli,
    usage: () => cli,
    arguments: () => cli,
    option: () => cli,
    action: (fn: any) => {
      actions[command] = fn;
      return cli;
    },
  };
  plugin.extendCli(cli);
  return actions["clean-api-docs"]("petstore", { opts: () => ({}) });
}

describe("clean-api-docs", () => {
  let siteDir: string;
  let apiDir: string;
  let schemasDir: string;

  const write = (dir: string, name: string) =>
    fs.writeFileSync(path.join(dir, name), "{}");
  const exists = (dir: string, name: string) =>
    fs.existsSync(path.join(dir, name));

  beforeEach(() => {
    siteDir = fs.mkdtempSync(path.join(os.tmpdir(), "openapi-docs-"));
    apiDir = path.join(siteDir, "docs", "petstore");
    schemasDir = path.join(apiDir, "schemas");
    fs.mkdirSync(schemasDir, { recursive: true });
    for (const name of GENERATED) write(apiDir, name);
    for (const name of GENERATED_SCHEMAS) write(schemasDir, name);
    write(apiDir, "versions.json");
    write(apiDir, "_category_.json");
    write(schemasDir, "_category_.json");
  });

  afterEach(() => fs.rmSync(siteDir, { recursive: true, force: true }));

  async function run() {
    await cleanApiDocs(siteDir);
    await settle([
      ...GENERATED.map((name) => path.join(apiDir, name)),
      ...GENERATED_SCHEMAS.map((name) => path.join(schemasDir, name)),
    ]);
  }

  it("keeps a file it did not generate in the output directory", async () => {
    await run();
    expect(exists(apiDir, "_category_.json")).toBe(true);
    expect(exists(apiDir, "versions.json")).toBe(true);
  });

  it("keeps a file it did not generate under schemas", async () => {
    await run();
    expect(exists(schemasDir, "_category_.json")).toBe(true);
  });

  it("removes every file it generated", async () => {
    await run();
    for (const name of GENERATED) expect(exists(apiDir, name)).toBe(false);
    for (const name of GENERATED_SCHEMAS) {
      expect(exists(schemasDir, name)).toBe(false);
    }
  });

  it("removes the schemas directory once it holds nothing else", async () => {
    fs.unlinkSync(path.join(schemasDir, "_category_.json"));
    await run();
    expect(fs.existsSync(schemasDir)).toBe(false);
  });
});
