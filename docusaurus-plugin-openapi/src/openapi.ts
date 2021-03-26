// @ts-ignore - openapi-to-postmanv2 doesn't have types.
import Converter from "openapi-to-postmanv2";
import sdk, { Collection } from "postman-collection";
import importFresh from "import-fresh";
import JsonRefs from "json-refs";
import kebabCase from "lodash.kebabcase";

import { sampleFromSchema } from "./createExample";
import {
  OpenApiObject,
  PathItemObject,
  ApiSection,
  OperationObject,
  ServerObject,
  ReferenceObject,
  ParameterObject,
  ApiItem,
  RequestBodyObject,
  SchemaObject,
} from "./types";
import { normalizeUrl } from "@docusaurus/utils";

function isOperationObject(
  item:
    | string
    | PathItemObject
    | ServerObject[]
    | ReferenceObject[]
    | ParameterObject[]
): item is OperationObject {
  return (item as OperationObject).responses !== undefined;
}

function getPaths(spec: OpenApiObject): ApiItem[] {
  const seen: { [key: string]: number } = {};
  return Object.entries(spec.paths)
    .map(([path, pathObject]) => {
      const entries = Object.entries(pathObject);
      return entries.map(([key, val]) => {
        if (isOperationObject(val)) {
          let method = key;
          let operationObject = val as OperationObject;

          const summary =
            operationObject.summary ??
            operationObject.operationId ??
            "Missing summary";
          if (operationObject.description === undefined) {
            operationObject.description =
              operationObject.summary ?? operationObject.operationId ?? "";
          }

          const baseId = kebabCase(summary);
          let count = seen[baseId];

          let hashId;
          if (count) {
            hashId = `${baseId}-${count}`;
            seen[baseId] = count + 1;
          } else {
            hashId = baseId;
            seen[baseId] = 1;
          }

          const servers =
            operationObject.servers || pathObject.servers || spec.servers;

          // NOTE: no security on the path level, only op level.
          // The following line is unneeded, but is just for piece of mind.
          const security = operationObject.security;

          return {
            ...operationObject,
            summary: summary,
            method: method,
            path: path,
            hashId: hashId,
            servers: servers,
            security: security,
          };
        }
        return undefined;
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
  openapiData: OpenApiObject
): Promise<Collection> {
  // The conversions mutates whatever you pass here, create a new object.
  const openapiClone = JSON.parse(JSON.stringify(openapiData));

  // seems to be a weird bug with postman and servers...
  delete openapiClone.servers;
  for (let value of Object.values(openapiClone.paths)) {
    let pathItemObject = value as PathItemObject;
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

export async function loadOpenapi(
  openapiPath: string,
  baseUrl: string,
  routeBasePath: string
) {
  const openapiData = importFresh(openapiPath) as OpenApiObject;

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
          operationObject.postman = item.request;
        }
        break;
      default:
        break;
    }
  });

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

      if (i === 0 && ii === 0) {
        item.hashId = "/";
      }

      item.permalink = normalizeUrl([baseUrl, routeBasePath, item.hashId]);

      const prev =
        order[i].items[ii - 1] ||
        order[i - 1]?.items[order[i - 1].items.length - 1];
      const next =
        order[i].items[ii + 1] || (order[i + 1] ? order[i + 1].items[0] : null);

      if (prev) {
        item.previous = {
          title: prev.summary,
          permalink: normalizeUrl([baseUrl, routeBasePath, prev.hashId]),
        };
      }

      if (next) {
        item.next = {
          title: next.summary,
          permalink: normalizeUrl([baseUrl, routeBasePath, next.hashId]),
        };
      }

      const content = (item.requestBody as RequestBodyObject)?.content;
      const schema = content?.["application/json"]?.schema as SchemaObject;
      if (schema) {
        item.jsonRequestBodyExample = sampleFromSchema(schema);
      }
    });
  });

  return order;
}
