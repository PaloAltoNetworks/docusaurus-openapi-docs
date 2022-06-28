/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import { Globby, GlobExcludeDefault } from "@docusaurus/utils";
import Converter from "@paloaltonetworks/openapi-to-postmanv2";
import sdk from "@paloaltonetworks/postman-collection";
import Collection from "@paloaltonetworks/postman-collection";
import chalk from "chalk";
import fs from "fs-extra";
import JsonRefs from "json-refs";
import { kebabCase } from "lodash";

import { isURL } from "../index";
import {
  ApiMetadata,
  APIOptions,
  ApiPageMetadata,
  ExtensionsMetadata,
  InfoPageMetadata,
  SidebarOptions,
  TagPageMetadata,
} from "../types";
import { sampleFromSchema } from "./createExample";
import { OpenApiObject, OpenApiObjectWithRef, TagObject } from "./types";
import { loadAndBundleSpec } from "./utils/loadAndBundleSpec";

/**
 * Finds any reference objects in the OpenAPI definition and resolves them to a finalized value.
 */
async function resolveRefs(openapiData: OpenApiObjectWithRef) {
  const { resolved } = await JsonRefs.resolveRefs(openapiData);
  return resolved as OpenApiObject;
}

/**
 * Convenience function for converting raw JSON to a Postman Collection object.
 */
function jsonToCollection(data: OpenApiObject): Promise<Collection> {
  return new Promise((resolve, reject) => {
    let schemaPack = new Converter.SchemaPack(
      { type: "json", data },
      { schemaFaker: false }
    );
    schemaPack.computedOptions.schemaFaker = false;
    schemaPack.convert((_err: any, conversionResult: any) => {
      if (!conversionResult.result) {
        return reject(conversionResult.reason);
      }
      return resolve(new sdk.Collection(conversionResult.output[0].data));
    });
  });
}

/**
 * Creates a Postman Collection object from an OpenAPI definition.
 */
async function createPostmanCollection(
  openapiData: OpenApiObject
): Promise<Collection> {
  const data = JSON.parse(JSON.stringify(openapiData)) as OpenApiObject;

  // Including `servers` breaks postman, so delete all of them.
  delete data.servers;
  for (let pathItemObject of Object.values(data.paths)) {
    delete pathItemObject.servers;
    delete pathItemObject.get?.servers;
    delete pathItemObject.put?.servers;
    delete pathItemObject.post?.servers;
    delete pathItemObject.delete?.servers;
    delete pathItemObject.options?.servers;
    delete pathItemObject.head?.servers;
    delete pathItemObject.patch?.servers;
    delete pathItemObject.trace?.servers;
  }

  return await jsonToCollection(data);
}

type PartialPage<T> = Omit<T, "permalink" | "source" | "sourceDirName">;

function createItems(
  openapiData: OpenApiObject,
  sidebarOptions: SidebarOptions
): ApiMetadata[] {
  // TODO: Find a better way to handle this
  let items: PartialPage<ApiMetadata>[] = [];
  const infoId = kebabCase(openapiData.info.title);

  if (sidebarOptions?.categoryLinkSource === "tag") {
    // Only create an tag pages if categoryLinkSource set to tag.
    const tags: TagObject[] = openapiData.tags ?? [];
    // eslint-disable-next-line array-callback-return
    tags
      .filter((tag) => !tag.description?.includes("SchemaDefinition"))
      // eslint-disable-next-line array-callback-return
      .map((tag) => {
        const description = getTagDisplayName(
          tag.name!,
          openapiData.tags ?? []
        );
        const tagId = kebabCase(tag.name);
        const tagPage: PartialPage<TagPageMetadata> = {
          type: "tag",
          id: tagId,
          unversionedId: tagId,
          title: description ?? "",
          description: description ?? "",
          slug: "/" + tagId,
          frontMatter: {},
          tag: {
            ...tag,
          },
        };
        items.push(tagPage);
      });
  }

  if (openapiData.info.description) {
    // Only create an info page if we have a description.
    const infoPage: PartialPage<InfoPageMetadata> = {
      type: "info",
      id: infoId,
      unversionedId: infoId,
      title: openapiData.info.title,
      description: openapiData.info.description,
      slug: "/" + infoId,
      frontMatter: {},
      securitySchemes: openapiData.components?.securitySchemes,
      info: {
        ...openapiData.info,
        tags: openapiData.tags?.map((tagName) =>
          getTagDisplayName(tagName.name!, openapiData.tags ?? [])
        ),
        title: openapiData.info.title ?? "Introduction",
      },
    };
    items.push(infoPage);
  }

  if (openapiData["x-docusaurus-extensions"]) {
    const extensions: ExtensionsMetadata = {
      type: "extensions",
      extensions: openapiData["x-docusaurus-extensions"],
    };
    items.push(extensions);
  }

  for (let [path, pathObject] of Object.entries(openapiData.paths)) {
    const { $ref, description, parameters, servers, summary, ...rest } =
      pathObject;
    for (let [method, operationObject] of Object.entries({ ...rest })) {
      const title =
        operationObject.summary ??
        operationObject.operationId ??
        "Missing summary";
      if (operationObject.description === undefined) {
        operationObject.description =
          operationObject.summary ?? operationObject.operationId ?? "";
      }

      const baseId = kebabCase(title);

      const servers =
        operationObject.servers ?? pathObject.servers ?? openapiData.servers;

      const security = operationObject.security ?? openapiData.security;

      // Add security schemes so we know how to handle security.
      const securitySchemes = openapiData.components?.securitySchemes;

      // Make sure schemes are lowercase. See: https://github.com/cloud-annotations/docusaurus-plugin-openapi/issues/79
      if (securitySchemes) {
        for (let securityScheme of Object.values(securitySchemes)) {
          if (securityScheme.type === "http") {
            securityScheme.scheme = securityScheme.scheme.toLowerCase();
          }
        }
      }

      let jsonRequestBodyExample;
      const body = operationObject.requestBody?.content?.["application/json"];
      if (body?.schema) {
        jsonRequestBodyExample = sampleFromSchema(body.schema);
      }

      // TODO: Don't include summary temporarilly
      const { summary, ...defaults } = operationObject;

      const apiPage: PartialPage<ApiPageMetadata> = {
        type: "api",
        id: baseId,
        infoId: infoId ?? "",
        unversionedId: baseId,
        title: title,
        description: description ?? "",
        slug: "/" + baseId,
        frontMatter: {},
        api: {
          ...defaults,
          tags: operationObject.tags?.map((tagName) =>
            getTagDisplayName(tagName, openapiData.tags ?? [])
          ),
          method,
          path,
          servers,
          security,
          securitySchemes,
          jsonRequestBodyExample,
          info: openapiData.info,
        },
      };

      items.push(apiPage);
    }
  }

  return items as ApiMetadata[];
}

/**
 * Attach Postman Request objects to the corresponding ApiItems.
 */
function bindCollectionToApiItems(
  items: ApiMetadata[],
  postmanCollection: sdk.Collection
) {
  postmanCollection.forEachItem((item: any) => {
    const method = item.request.method.toLowerCase();
    const path = item.request.url
      .getPath({ unresolved: true }) // unresolved returns "/:variableName" instead of "/<type>"
      .replace(/:([a-z0-9-_]+)/gi, "{$1}"); // replace "/:variableName" with "/{variableName}"

    const apiItem = items.find((item) => {
      if (
        item.type === "info" ||
        item.type === "tag" ||
        item.type === "extensions"
      ) {
        return false;
      }
      return item.api.path === path && item.api.method === method;
    });

    if (apiItem?.type === "api") {
      apiItem.api.postman = item.request;
    }
  });
}

interface OpenApiFiles {
  source: string;
  sourceDirName: string;
  data: OpenApiObjectWithRef;
}

export async function readOpenapiFiles(
  openapiPath: string,
  options: APIOptions
): Promise<OpenApiFiles[]> {
  // TODO: determine if this should be an API option
  // Forces the json-schema-ref-parser
  const parseJsonRefs = true;

  if (!isURL(openapiPath)) {
    const stat = await fs.lstat(openapiPath);
    if (stat.isDirectory()) {
      console.warn(
        chalk.yellow(
          "WARNING: Loading a directory of OpenAPI definitions is experimental and subject to unannounced breaking changes."
        )
      );

      // TODO: Add config for inlcude/ignore
      const allFiles = await Globby(["**/*.{json,yaml,yml}"], {
        cwd: openapiPath,
        ignore: GlobExcludeDefault,
        deep: 1,
      });
      const sources = allFiles.filter((x) => !x.includes("_category_")); // todo: regex exclude?
      return Promise.all(
        sources.map(async (source) => {
          // TODO: make a function for this
          const fullPath = path.join(openapiPath, source);
          const data = (await loadAndBundleSpec(
            fullPath,
            parseJsonRefs
          )) as OpenApiObjectWithRef;
          return {
            source: fullPath, // This will be aliased in process.
            sourceDirName: path.dirname(source),
            data,
          };
        })
      );
    }
  }
  const data = (await loadAndBundleSpec(
    openapiPath,
    parseJsonRefs
  )) as OpenApiObjectWithRef;
  return [
    {
      source: openapiPath, // This will be aliased in process.
      sourceDirName: ".",
      data,
    },
  ];
}

export async function processOpenapiFiles(
  files: OpenApiFiles[],
  sidebarOptions: SidebarOptions
): Promise<[ApiMetadata[], TagObject[]]> {
  const promises = files.map(async (file) => {
    const processedFile = await processOpenapiFile(file.data, sidebarOptions);
    const itemsObjectsArray = processedFile[0].map((item) => ({
      ...item,
    }));
    const tags = processedFile[1];
    return [itemsObjectsArray, tags];
  });
  const metadata = await Promise.all(promises);
  const items = metadata
    .map(function (x) {
      return x[0];
    })
    .flat();
  const tags = metadata.map(function (x) {
    return x[1];
  });
  return [items as ApiMetadata[], tags as TagObject[]];
}

export async function processOpenapiFile(
  openapiDataWithRefs: OpenApiObjectWithRef,
  sidebarOptions: SidebarOptions
): Promise<[ApiMetadata[], TagObject[]]> {
  const openapiData = await resolveRefs(openapiDataWithRefs);
  const postmanCollection = await createPostmanCollection(openapiData);
  const items = createItems(openapiData, sidebarOptions);

  bindCollectionToApiItems(items, postmanCollection);

  let tags: TagObject[] = [];
  if (openapiData.tags !== undefined) {
    tags = openapiData.tags;
  }
  return [items, tags];
}

// order for picking items as a display name of tags
const tagDisplayNameProperties = ["x-displayName", "name"] as const;

export function getTagDisplayName(tagName: string, tags: TagObject[]): string {
  // find the very own tagObject
  const tagObject = tags.find((tagObject) => tagObject.name === tagName) ?? {
    // if none found, just fake one
    name: tagName,
  };

  // return the first found and filled value from the property list
  for (const property of tagDisplayNameProperties) {
    const displayName = tagObject[property];
    if (typeof displayName === "string") {
      return displayName;
    }
  }

  // always default to the tagName
  return tagName;
}
