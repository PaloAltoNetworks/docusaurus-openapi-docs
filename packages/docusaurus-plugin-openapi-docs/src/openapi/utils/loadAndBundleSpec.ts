/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// @ts-nocheck

import type { Source, Document } from "@redocly/openapi-core";
import { bundle } from "@redocly/openapi-core/lib/bundle";
import type { ResolvedConfig } from "@redocly/openapi-core/lib/config";
import { Config } from "@redocly/openapi-core/lib/config/config";
import { convertObj } from "swagger2openapi";

import { OpenAPISpec } from "./types";

export async function loadAndBundleSpec(
  specUrlOrObject: object | string
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
