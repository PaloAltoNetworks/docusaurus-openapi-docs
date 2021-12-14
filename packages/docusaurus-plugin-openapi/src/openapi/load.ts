/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { normalizeUrl } from "@docusaurus/utils";
import fs from "fs-extra";
import yaml from "js-yaml";
import JsonRefs from "json-refs";
import { kebabCase } from "lodash";
import Converter from "openapi-to-postmanv2";
import sdk, { Collection } from "postman-collection";

import { ApiItem, ApiSection } from "../types";
import { sampleFromSchema } from "./createExample";
import { OpenApiObject, OpenApiObjectWithRef } from "./types";

function getPaths(spec: OpenApiObject): ApiItem[] {
  const seen: { [key: string]: number } = {};
  return Object.entries(spec.paths)
    .map(([path, pathObject]) => {
      const entries = Object.entries(pathObject);
      return entries.map(([key, val]) => {
        let method = key;
        let operationObject = val;

        const title =
          operationObject.summary ??
          operationObject.operationId ??
          "Missing summary";
        if (operationObject.description === undefined) {
          operationObject.description =
            operationObject.summary ?? operationObject.operationId ?? "";
        }

        const baseId = kebabCase(title);
        let count = seen[baseId];

        let id;
        if (count) {
          id = `${baseId}-${count}`;
          seen[baseId] = count + 1;
        } else {
          id = baseId;
          seen[baseId] = 1;
        }

        const servers =
          operationObject.servers ?? pathObject.servers ?? spec.servers;

        // TODO: Don't include summary temporarilly
        const { summary, ...defaults } = operationObject;

        return {
          ...defaults,
          id,
          title,
          method,
          path,
          servers,
        };
      });
    })
    .flat()
    .filter((item) => item !== undefined) as ApiItem[];
}

function organizeSpec(spec: OpenApiObject) {
  const paths = getPaths(spec);

  let tagNames: string[] = [];
  let tagged: ApiSection[] = [];
  if (spec.tags) {
    tagged = spec.tags
      .map((tag) => {
        return {
          title: tag.name,
          description: tag.description || "",
          items: paths.filter((p) => p.tags && p.tags.includes(tag.name)),
        };
      })
      .filter((i) => i.items.length > 0);
    tagNames = tagged.map((t) => t.title);
  }

  const all = [
    ...tagged,
    {
      title: "API",
      description: "",
      items: paths.filter((p) => {
        if (p.tags === undefined || p.tags.length === 0) {
          return true;
        }
        for (let tag of p.tags) {
          if (tagNames.includes(tag)) {
            return false;
          }
        }
        return true;
      }),
    },
  ];

  return all;
}

async function convertToPostman(
  openapiData: OpenApiObjectWithRef
): Promise<Collection> {
  // The conversions mutates whatever you pass here, create a new object.
  const openapiClone = JSON.parse(
    JSON.stringify(openapiData)
  ) as OpenApiObjectWithRef;

  // seems to be a weird bug with postman and servers...
  delete openapiClone.servers;
  for (let pathItemObject of Object.values(openapiClone.paths)) {
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

  return await new Promise((resolve, reject) => {
    Converter.convert(
      {
        type: "json",
        data: openapiClone,
      },
      {},
      (_: any, conversionResult: any) => {
        if (!conversionResult.result) {
          reject(conversionResult.reason);
          return;
        } else {
          return resolve(new sdk.Collection(conversionResult.output[0].data));
        }
      }
    );
  });
}

export async function _loadOpenapi(
  openapiData: OpenApiObjectWithRef,
  baseUrl: string,
  routeBasePath: string
) {
  // Attach a postman request object to the openapi spec.
  const postmanCollection = await convertToPostman(openapiData);
  postmanCollection.forEachItem((item) => {
    const method = item.request.method.toLowerCase();
    // NOTE: This doesn't catch all variables for some reason...
    // item.request.url.variables.each((pathVar) => {
    //   pathVar.value = `{${pathVar.key}}`;
    // });
    const path = item.request.url
      .getPath({ unresolved: true })
      .replace(/:([a-z0-9-_]+)/gi, "{$1}");

    switch (method) {
      case "get":
      case "put":
      case "post":
      case "delete":
      case "options":
      case "head":
      case "patch":
      case "trace":
        if (!openapiData.paths[path]) {
          break;
        }

        const operationObject = openapiData.paths[path][method];
        if (operationObject) {
          // TODO
          (operationObject as any).postman = item.request;
        }
        break;
      default:
        break;
    }
  });

  // TODO: Why do we dereff here and not earlier? I think it had something to do with object names?
  const { resolved: dereffed } = await JsonRefs.resolveRefs(openapiData);

  const dereffedSpec = dereffed as OpenApiObject;

  const order = organizeSpec(dereffedSpec);

  order.forEach((category, i) => {
    category.items.forEach((item, ii) => {
      // don't override already defined servers.
      if (item.servers === undefined) {
        item.servers = dereffedSpec.servers;
      }

      if (item.security === undefined) {
        item.security = dereffedSpec.security;
      }

      // Add security schemes so we know how to handle security.
      item.securitySchemes = dereffedSpec.components?.securitySchemes;

      // Make sure schemes are lowercase. See: https://github.com/cloud-annotations/docusaurus-plugin-openapi/issues/79
      Object.values(item.securitySchemes ?? {}).forEach((auth) => {
        if (auth.type === "http") {
          auth.scheme = auth.scheme.toLowerCase();
        }
      });

      item.permalink = normalizeUrl([baseUrl, routeBasePath, item.id]);

      const prev =
        order[i].items[ii - 1] ||
        order[i - 1]?.items[order[i - 1].items.length - 1];
      const next =
        order[i].items[ii + 1] || (order[i + 1] ? order[i + 1].items[0] : null);

      if (prev) {
        item.previous = {
          title: prev.title,
          permalink: normalizeUrl([baseUrl, routeBasePath, prev.id]),
        };
      }

      if (next) {
        item.next = {
          title: next.title,
          permalink: normalizeUrl([baseUrl, routeBasePath, next.id]),
        };
      }

      const content = item.requestBody?.content;
      const schema = content?.["application/json"]?.schema;
      if (schema) {
        item.jsonRequestBodyExample = sampleFromSchema(schema);
      }
    });
  });

  return order;
}

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
    Converter.convert(
      { type: "json", data },
      {},
      (_err: any, conversionResult: any) => {
        if (!conversionResult.result) {
          return reject(conversionResult.reason);
        }
        return resolve(new sdk.Collection(conversionResult.output[0].data));
      }
    );
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

/**
 * Find the ApiItem, given the method and path.
 */
function findApiItem(sections: ApiSection[], method: string, path: string) {
  for (const section of sections) {
    const found = section.items.find(
      (item) => item.path === path && item.method === method
    );
    if (found) {
      return found;
    }
  }
  return;
}

function createItems(openapiData: OpenApiObject): ApiItem[] {
  const seen: { [key: string]: number } = {};

  // TODO
  let items: Omit<ApiItem, "permalink" | "next" | "previous">[] = [];

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
      let count = seen[baseId];

      let id;
      if (count) {
        id = `${baseId}-${count}`;
        seen[baseId] = count + 1;
      } else {
        id = baseId;
        seen[baseId] = 1;
      }

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

      items.push({
        ...defaults,
        id,
        title,
        method,
        path,
        servers,
        security,
        securitySchemes,
        jsonRequestBodyExample,
      });
    }
  }

  // TODO
  return items as ApiItem[];
}

function createSections(spec: OpenApiObject) {
  const paths = createItems(spec);

  let tagNames: string[] = [];
  let tagged: ApiSection[] = [];
  if (spec.tags) {
    tagged = spec.tags
      .map((tag) => {
        return {
          title: tag.name,
          description: tag.description || "",
          items: paths.filter((p) => p.tags && p.tags.includes(tag.name)),
        };
      })
      .filter((i) => i.items.length > 0);
    tagNames = tagged.map((t) => t.title);
  }

  const all = [
    ...tagged,
    {
      title: "API",
      description: "",
      items: paths.filter((p) => {
        if (p.tags === undefined || p.tags.length === 0) {
          return true;
        }
        for (let tag of p.tags) {
          if (tagNames.includes(tag)) {
            return false;
          }
        }
        return true;
      }),
    },
  ];

  return all;
}

/**
 * Attach Postman Request objects to the corresponding ApiItems.
 */
function bindCollectionToSections(
  sections: ApiSection[],
  postmanCollection: sdk.Collection
) {
  postmanCollection.forEachItem((item) => {
    const method = item.request.method.toLowerCase();
    const path = item.request.url
      .getPath({ unresolved: true }) // unresolved returns "/:variableName" instead of "/<type>"
      .replace(/:([a-z0-9-_]+)/gi, "{$1}"); // replace "/:variableName" with "/{variableName}"

    const apiItem = findApiItem(sections, method, path);
    if (apiItem) {
      apiItem.postman = item.request;
    }
  });
}

export async function _newLoadOpenapi(
  openapiDataWithRefs: OpenApiObjectWithRef,
  baseUrl: string,
  routeBasePath: string
) {
  const openapiData = await resolveRefs(openapiDataWithRefs);
  const postmanCollection = await createPostmanCollection(openapiData);

  const sections = createSections(openapiData);

  bindCollectionToSections(sections, postmanCollection);

  // flatten the references to make creating the previous/next data easier.
  const items = sections.flatMap((s) => s.items);
  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    const prev = items[i - 1];
    const next = items[i + 1];

    current.permalink = normalizeUrl([baseUrl, routeBasePath, current.id]);

    if (prev) {
      current.previous = {
        title: prev.title,
        permalink: normalizeUrl([baseUrl, routeBasePath, prev.id]),
      };
    }

    if (next) {
      current.next = {
        title: next.title,
        permalink: normalizeUrl([baseUrl, routeBasePath, next.id]),
      };
    }
  }

  return sections;
}

export async function loadOpenapi(
  openapiPath: string,
  baseUrl: string,
  routeBasePath: string
) {
  const openapiString = await fs.readFile(openapiPath, "utf-8");
  const openapiData = yaml.load(openapiString) as OpenApiObjectWithRef;

  return _loadOpenapi(openapiData, baseUrl, routeBasePath);
}
