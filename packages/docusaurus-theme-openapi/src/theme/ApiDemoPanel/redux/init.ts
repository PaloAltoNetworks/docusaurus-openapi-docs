/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { ThemeConfig } from "../../../types";
import { loadAuth, loadSelectedAuth } from "./persistance";

function init(
  {
    path,
    method,
    parameters = [],
    requestBody = {},
    responses = {},
    "x-code-samples": codeSamples = [],
    postman,
    jsonRequestBodyExample,
    servers,
    security,
    securitySchemes,
  }: any,
  options: ThemeConfig["api"] = {}
) {
  const { content = {} } = requestBody;

  const contentTypeArray = Object.keys(content);

  const acceptArray = Array.from(
    new Set(
      Object.values(responses)
        .map((response: any) => Object.keys(response.content ?? {}))
        .flat()
    )
  );

  let params: any = {
    path: [],
    query: [],
    header: [],
    cookie: [],
  };

  parameters.forEach((param: any) => {
    params[param.in].push({
      ...param,
      name: param.name,
      value: undefined,
      description: param.description,
      type: param.in,
      required: param.required,
      schema: param.schema,
    });
  });

  if (!servers) {
    servers = [];
  }

  const auth = loadAuth({
    securitySchemes,
    security: security ?? [],
    persistance: options.authPersistance,
  });

  function createOptionIDs(auth: any): string[] {
    return auth
      .map((a: { key: string }[]) =>
        a.reduce((acc, cur) => {
          if (acc === undefined) {
            return cur.key;
          }
          return `${acc} and ${cur.key}`;
        }, undefined as string | undefined)
      )
      .filter(Boolean);
  }
  const authOptionIDs = createOptionIDs(auth);
  const _uniqueAuthKey = authOptionIDs.join("&");

  const selectedAuthID =
    loadSelectedAuth({
      key: _uniqueAuthKey,
      persistance: options.authPersistance,
    }) ?? authOptionIDs[0];

  return {
    jsonRequestBodyExample,
    requestBodyMetadata: requestBody, // TODO: no...
    acceptOptions: acceptArray,
    contentTypeOptions: contentTypeArray,
    path,
    method,
    params,
    contentType: contentTypeArray[0],
    codeSamples,
    accept: acceptArray[0],
    body: undefined,
    response: undefined,
    postman,
    servers,
    endpoint: servers[0],
    auth,
    selectedAuthID,
    authOptionIDs,
    _uniqueAuthKey,
    options,
  };
}

export default init;
