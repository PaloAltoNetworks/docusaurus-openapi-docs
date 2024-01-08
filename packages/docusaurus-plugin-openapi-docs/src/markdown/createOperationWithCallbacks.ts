/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { MediaTypeObject } from "../openapi/types";
import { ApiItem } from "../types";
import { createDescription } from "./createDescription";
import { createMethodEndpoint } from "./createMethodEndpoint";
import { createParamsDetails } from "./createParamsDetails";
import { createRequestBodyDetails } from "./createRequestBodyDetails";
import { createStatusCodes } from "./createStatusCodes";
import { create } from "./utils";

interface Props
  extends Pick<
    ApiItem,
    | "method"
    | "path"
    | "callbacks"
    | "description"
    | "parameters"
    | "responses"
    | "requestBody"
  > {}

interface RequestBodyProps {
  title: string;
  body: {
    content?: {
      [key: string]: MediaTypeObject;
    };
    description?: string;
    required?: boolean;
  };
}

export function createOperationWithCallbacks({
  path,
  parameters,
  requestBody,
  responses,
  callbacks,
}: Props) {
  const operations = [
    createParamsDetails({ parameters, type: "path" }),
    createParamsDetails({ parameters, type: "query" }),
    createParamsDetails({ parameters, type: "header" }),
    createParamsDetails({ parameters, type: "cookie" }),
    createRequestBodyDetails({
      title: "Body",
      body: requestBody,
    } as RequestBodyProps),
    createStatusCodes({ responses }),
  ];

  if (callbacks === undefined) {
    return operations;
  }

  const callbacksNames = Object.keys(callbacks);
  if (callbacksNames.length === 0) {
    return operations;
  }

  return create("OperationTabs", {
    className: "openapi-tabs__operation",
    children: [
      create("TabItem", {
        label: "Operations",
        value: `Operations-${path}`,
        children: [
          create("h2", {
            children: "Request",
            id: "request",
          }),
          ...operations,
        ],
      }),
      ...callbacksNames.map((name) => {
        const path = Object.keys(callbacks[name])[0];
        const methods = new Map([
          ["delete", callbacks[name][path].delete],
          ["get", callbacks[name][path].get],
          ["head", callbacks[name][path].head],
          ["options", callbacks[name][path].options],
          ["patch", callbacks[name][path].patch],
          ["post", callbacks[name][path].post],
          ["put", callbacks[name][path].put],
          ["trace", callbacks[name][path].trace],
        ]);

        return create("TabItem", {
          label: name,
          value: name,
          children: Array.from(methods).flatMap(([method, operationObject]) => {
            if (!operationObject) return [];

            const { description, requestBody, responses } = operationObject;

            return [
              create("h2", {
                children: "Callback Request",
                id: "callback-request",
              }),
              createMethodEndpoint(method, path),
              // TODO: add `deprecation notice` and `description` when markdown support is added
              createDescription(description),
              createRequestBodyDetails({
                title: "Body",
                body: requestBody,
              } as RequestBodyProps),
              createStatusCodes({ label: "Callbacks Responses", responses }),
            ];
          }),
        });
      }),
    ],
  });
}
