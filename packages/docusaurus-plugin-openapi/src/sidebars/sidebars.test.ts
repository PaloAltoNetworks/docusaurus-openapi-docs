/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { generateSidebars } from ".";
import type {
  PropSidebarItemCategory,
  SidebarItemLink,
  PropSidebarItem,
} from "../types";

// npx jest packages/docusaurus-plugin-openapi/src/sidebars/sidebars.test.ts --watch

function isCategory(item: PropSidebarItem): item is PropSidebarItemCategory {
  return item.type === "category";
}
function isLink(item: PropSidebarItem): item is SidebarItemLink {
  return item.type === "link";
}

describe("sidebars", () => {
  const getOpts = () => ({
    sidebarCollapsible: true,
    sidebarCollapsed: true,
  });

  const getIntro = (overrides = {}) => ({
    type: "info" as const,
    id: "introduction",
    unversionedId: "introduction",
    title: "Introduction",
    description: "Sample description.",
    slug: "/introduction",
    frontMatter: {},
    info: {
      title: "YAML Example",
      version: "1.0.0",
      description: "Sample description.",
    },
    source: "@site/examples/openapi.yaml",
    sourceDirName: ".",
    permalink: "/yaml/introduction",
    next: {
      title: "Hello World",
      permalink: "/yaml/hello-world",
    },
    ...overrides,
  });

  describe("Single Spec - YAML", () => {
    it("base case - single spec with untagged routes should render flat with a default category", () => {
      const input = [
        getIntro(),
        {
          type: "api" as const,
          id: "hello-world",
          title: "Hello World",
          api: {
            tags: [],
          },
          source: "@site/examples/openapi.yaml",
          sourceDirName: ".",
          permalink: "/yaml/hello-world",
        },
      ];

      const output = generateSidebars(input, getOpts());
      // console.log(JSON.stringify(output, null, 2));

      // intro.md
      const info = output.find(
        (x) => x.type === "link" && x.docId === "introduction"
      ) as SidebarItemLink;
      expect(info?.type).toBe("link");
      expect(info?.label).toBe("Introduction");
      expect(info?.href).toBe("/yaml/introduction");

      const category = output.find(isCategory);
      expect(category?.label).toBe("API");

      const api = category?.items.find(isLink);
      expect(api?.label).toBe("Hello World");
      expect(api?.docId).toBe("hello-world");
    });

    it("single spec tags case - should render root level categories per tag", () => {
      const input = [
        getIntro(),
        {
          type: "api" as const,
          id: "hello-world",
          title: "Hello World",
          api: {
            tags: ["stuff"],
          },
          source: "@site/examples/openapi.yaml",
          sourceDirName: ".",
          permalink: "/yaml/hello-world",
        },
      ];

      const output = generateSidebars(input, getOpts());
      // console.log(JSON.stringify(output, null, 2));

      // intro.md
      const info = output.find(
        (x) => x.type === "link" && x.docId === "introduction"
      ) as SidebarItemLink;
      expect(info?.type).toBe("link");
      expect(info?.label).toBe("Introduction");
      expect(info?.href).toBe("/yaml/introduction");

      // swagger rendering
      const api = output.find(
        (x) => x.type === "category"
      ) as PropSidebarItemCategory;
      expect(api?.label).toBe("stuff");
      expect(api?.items).toBeInstanceOf(Array);
      expect(api?.items).toHaveLength(1);

      const [helloWorld] = api?.items ?? [];
      expect(helloWorld.type).toBe("link");
      expect(helloWorld.label).toBe("Hello World");
    });
  });
  describe("Multi Spec", () => {
    it("should leverage the info.title if provided for spec name @ root category", () => {
      const input = [
        {
          type: "api" as const,
          id: "cats",
          title: "Cats",
          api: {
            info: { title: "Cats" },
            tags: [],
          },
          source: "@site/examples/cats.yaml",
          sourceDirName: ".",
          permalink: "/yaml/cats",
        },
        {
          type: "api" as const,
          id: "dogs",
          title: "Dogs",
          api: {
            info: { title: "Dogs" },
            tags: [],
          },
          source: "@site/examples/dogs.yaml",
          sourceDirName: ".",
          permalink: "/yaml/dogs",
        },
      ];

      const output = generateSidebars(
        input,
        getOpts()
      ) as PropSidebarItemCategory[];

      // console.log(JSON.stringify(output, null, 2));
      expect(output).toHaveLength(2);
      const [cats, dogs] = output;
      expect(cats.type).toBe("category");
      expect(cats.items).toHaveLength(1);

      const [catApi] = (cats.items ?? []).filter(isCategory);
      expect(catApi.type).toBe("category");
      const [catLink] = catApi?.items;
      expect(catLink.type).toBe("link");
      expect(dogs.type).toBe("category");
      expect(dogs.items).toHaveLength(1);
      expect(dogs.label).toBe("Dogs");
    });

    it("empty title should render the filename.", () => {
      const input = [
        {
          type: "api" as const,
          id: "cats",
          title: "Cats",
          api: {
            info: { title: "Cats" },
            tags: [],
          },
          source: "@site/examples/cats.yaml",
          sourceDirName: ".",
          permalink: "/yaml/cats",
        },
        {
          type: "api" as const,
          id: "dogs",
          title: "List Dogs",
          api: {
            info: { title: "" },
            tags: [],
          },
          source: "@site/examples/dogs.yaml",
          sourceDirName: ".",
          permalink: "/yaml/dogs",
        },
        {
          type: "api" as const,
          id: "dogs-id",
          title: "Dog By Id",
          api: {
            info: { title: "" },
            tags: [],
          },
          source: "@site/examples/dogs.yaml",
          sourceDirName: ".",
          permalink: "/yaml/dogs-id",
        },
      ];

      const output = generateSidebars(
        input,
        getOpts()
      ) as PropSidebarItemCategory[];

      // console.log(JSON.stringify(output, null, 2));
      const [cats, dogsSpec] = output;
      expect(cats.items).toHaveLength(1);
      expect(dogsSpec.type).toBe("category");
      const [dogApi] = dogsSpec.items.filter(isCategory);
      expect(dogApi?.items).toHaveLength(2);
      expect(dogApi.label).toBe("API");
      const [dogsItem] = dogApi.items;
      expect(dogsItem.label).toBe("List Dogs");
    });

    it("multi spec, multi tag", () => {
      const input = [
        {
          type: "api" as const,
          id: "tails",
          title: "List Tails",
          api: {
            info: { title: "Cats" },
            tags: ["Tails"],
          },
          source: "@site/examples/cats.yaml",
          sourceDirName: ".",
          permalink: "/yaml/tails",
        },
        {
          type: "api" as const,
          id: "tails-by-id",
          title: "Tails By Id",
          api: {
            info: { title: "Cats" },
            tags: ["Tails"],
          },
          source: "@site/examples/cats.yaml",
          sourceDirName: ".",
          permalink: "/yaml/tails-by-id",
        },
        {
          type: "api" as const,
          id: "whiskers",
          title: "List whiskers",
          api: {
            info: { title: "Cats" },
            tags: ["Whiskers"],
          },
          source: "@site/examples/cats.yaml",
          sourceDirName: ".",
          permalink: "/yaml/whiskers",
        },
        {
          type: "api" as const,
          id: "dogs",
          title: "List Dogs",
          api: {
            info: { title: "Dogs" },
            tags: ["Doggos"],
          },
          source: "@site/examples/dogs.yaml",
          sourceDirName: ".",
          permalink: "/yaml/dogs",
        },
        {
          type: "api" as const,
          id: "dogs-id",
          title: "Dogs By Id",
          api: {
            info: { title: "Dogs" },
            tags: ["Doggos"],
          },
          source: "@site/examples/dogs.yaml",
          sourceDirName: ".",
          permalink: "/yaml/dogs-id",
        },
        {
          type: "api" as const,
          id: "toys",
          title: "Toys",
          api: {
            info: { title: "Dogs" },
            tags: ["Toys"],
          },
          source: "@site/examples/dogs.yaml",
          sourceDirName: ".",
          permalink: "/yaml/toys",
        },
      ];

      const output = generateSidebars(
        input,
        getOpts()
      ) as PropSidebarItemCategory[];

      // console.log(JSON.stringify(output, null, 2));
      const [cats, dogs] = output;
      expect(cats.type).toBe("category");
      expect(cats.items).toHaveLength(3); // extra api item category is included but gets filtered out later
      const [tails, whiskers] = (cats.items || []).filter(isCategory);
      expect(tails.type).toBe("category");
      expect(whiskers.type).toBe("category");
      expect(tails.items).toHaveLength(2);
      expect(whiskers.items).toHaveLength(1);
      expect(tails.items?.[0].type).toBe("link");
      expect(whiskers.items?.[0].type).toBe("link");
      expect(tails.items?.[0].label).toBe("List Tails");
      expect(whiskers.items?.[0].label).toBe("List whiskers");

      expect(dogs.type).toBe("category");
      expect(dogs.items).toHaveLength(3); // extra api item category is included but gets filtered out later
      expect(dogs.label).toBe("Dogs");
      const [doggos, toys] = (dogs.items || []) as PropSidebarItemCategory[];
      expect(doggos.type).toBe("category");
      expect(toys.type).toBe("category");
      expect(doggos.items).toHaveLength(2);
      expect(toys.items).toHaveLength(1);
    });
  });
});
