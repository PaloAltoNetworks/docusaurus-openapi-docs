/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// @ts-nocheck

import $RefParser from "@apidevtools/json-schema-ref-parser";
import type { Source, Document } from "@redocly/openapi-core";
import { bundle } from "@redocly/openapi-core/lib/bundle";
import type { ResolvedConfig } from "@redocly/openapi-core/lib/config";
import { Config } from "@redocly/openapi-core/lib/config/config";
import chalk from "chalk";
import { merge } from "lodash";
import { convertObj } from "swagger2openapi";

import { OpenAPIParser } from "./services/OpenAPIParser";
import { OpenAPISpec } from "./types";

async function resolveJsonRefs(specUrlOrObject: object | string) {
  try {
    let schema = await $RefParser.dereference(specUrlOrObject, {
      continueOnError: true,
      resolve: {
        http: {
          timeout: 15000, // 15 sec timeout
        },
      },
      dereference: {
        circular: "ignore",
      },
    });
    return schema;
  } catch (err) {
    console.error(chalk.yellow(err.errors[0]?.message ?? err));
    return;
  }
}

export async function loadAndBundleSpec(
  specUrlOrObject: object | string,
  parseJsonRefs: boolean | undefined
): Promise<OpenAPISpec> {
  const config = new Config({} as ResolvedConfig);
  const bundleOpts = {
    config,
    base: process.cwd(),
  };

  if (typeof specUrlOrObject === "object" && specUrlOrObject !== null) {
    bundleOpts["doc"] = {
      source: { absoluteRef: "" } as Source,
      parsed: specUrlOrObject,
    } as Document;
  } else {
    bundleOpts["ref"] = specUrlOrObject;
  }

  // Force dereference ?
  // bundleOpts["dereference"] = true;

  const {
    bundle: { parsed },
  } = await bundle(bundleOpts);
  if (parseJsonRefs) {
    const resolved = await resolveJsonRefs(parsed);
    const parser = new OpenAPIParser(resolved);
    const resolvedAgain = parser.deref(resolved, true, true);
    const body =
      resolvedAgain.paths["/search/history/{id}"].post.requestBody.content[
        "application/json"
      ];
    const schema = parser.deref(body.schema);
    const timeRange = schema.properties.timeRange;
    const mergedAllOf = parser.mergeAllOf(
      timeRange,
      "#/components/schemas/TimeRangeConfigModel"
    );
    console.log(mergedAllOf);
    return typeof resolved === Object
      ? resolved.swagger !== undefined
        ? convertSwagger2OpenAPI(resolved)
        : resolved
      : parsed;
  }
  return parsed.swagger !== undefined ? convertSwagger2OpenAPI(parsed) : parsed;
}

export function convertSwagger2OpenAPI(spec: any): Promise<OpenAPISpec> {
  console.warn(
    "[ReDoc Compatibility mode]: Converting OpenAPI 2.0 to OpenAPI 3.0"
  );
  return new Promise<OpenAPISpec>((resolve, reject) =>
    convertObj(
      spec,
      { patch: true, warnOnly: true, text: "{}", anchors: true },
      (err, res) => {
        // TODO: log any warnings
        if (err) {
          return reject(err);
        }
        resolve(res && (res.openapi as any));
      }
    )
  );
}
