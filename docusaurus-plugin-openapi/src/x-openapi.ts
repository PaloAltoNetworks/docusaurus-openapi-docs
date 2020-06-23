// @ts-ignore - openapi-to-postmanv2 doesn't have types.
import Converter from "openapi-to-postmanv2";
import sdk from "postman-collection";
import importFresh from "import-fresh";
import JsonRefs from "json-refs";

import { sampleFromSchema } from "./createExample";

function getPaths(spec) {
  const seen = {};
  return Object.entries(spec.paths)
    .map(([path, pathObj]) => {
      const entries = Object.entries(pathObj);
      return entries.map(([method, methodObj]) => {
        let summary = methodObj.summary || "Missing summary";
        const baseId = summary.toLowerCase().replace(/ /g, "-");
        let count = seen[baseId];

        let hashId;
        if (count) {
          hashId = `${baseId}-${count}`;
          seen[baseId] = count + 1;
        } else {
          hashId = baseId;
          seen[baseId] = 1;
        }

        return {
          ...methodObj,
          summary: summary,
          method: method,
          path: path,
          hashId: hashId,
        };
      });
    })
    .flat();
}

function organizeSpec(spec) {
  const paths = getPaths(spec);

  let tagNames = [];
  let tagged = [];
  if (spec.tags) {
    tagged = spec.tags
      .map((tag) => {
        return {
          title: tag.name,
          description: tag.description,
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

export async function loadOpenapi(openapiPath) {
  const openapiData = importFresh(openapiPath);

  const postmanSpec = await new Promise((resolve, reject) => {
    Converter.convert(
      // don't mutate.
      { type: "json", data: JSON.parse(JSON.stringify(openapiData)) },
      {},
      (_, conversionResult) => {
        if (!conversionResult.result) {
          reject(conversionResult.reason);
          return;
        } else {
          const myCollection = new sdk.Collection(
            conversionResult.output[0].data
          );
          myCollection.forEachItem((item) => {
            const method = item.request.method.toLowerCase();
            const path =
              "/" +
              item.request.url.path
                .filter((p) => p)
                .map((p) => {
                  if (p.startsWith(":")) {
                    return `{${p.slice(1)}}`;
                  }
                  return p;
                })
                .join("/");
            openapiData.paths[path][method].postman = item.request;
          });
          return resolve(openapiData);
        }
      }
    );
  });

  const { resolved: dereffed } = await JsonRefs.resolveRefs(postmanSpec);

  const order = organizeSpec(dereffed);

  order.forEach((x, i) => {
    x.items.forEach((y, ii) => {
      // don't override already defined servers.
      if (y.servers === undefined) {
        y.servers = dereffed.servers;
      }

      if (i === 0 && ii === 0) {
        y.hashId = "";
      }
      if (y.requestBody?.content?.["application/json"]?.schema) {
        y.jsonRequestBodyExample = sampleFromSchema(
          y.requestBody.content["application/json"].schema
        );
      }
    });
  });

  return order;
}
