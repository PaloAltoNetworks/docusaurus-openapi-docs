/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { MediaTypeObject, OperationObject } from "../openapi/types";
import { createDeprecationNotice } from "./createDeprecationNotice";
import { createDescription } from "./createDescription";
import { createMethodEndpoint } from "./createMethodEndpoint";
import { createOperationHeader } from "./createOperationHeader";
import { createRequestBodyDetails } from "./createRequestBodyDetails";
import { createStatusCodes } from "./createStatusCodes";
import { create } from "./utils";

interface Props {
  callbacks: OperationObject["callbacks"];
}
interface BodyProps {
  title: string;
  body: {
    content?: {
      [key: string]: MediaTypeObject;
    };
    description?: string;
    required?: boolean;
  };
}

export function createCallbacks({ callbacks, ...rest }: Props) {
  if (callbacks === undefined) {
    return undefined;
  }

  const names = Object.keys(callbacks);
  if (names.length === 0) {
    return undefined;
  }

  return create("div", {
    children: [
      create("div", {
        children: [
          create("CallbacksTabs", {
            children: names.map((name) => {
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
                children: [
                  Array.from(methods).flatMap(([method, operationObject]) => {
                    if (!operationObject) return [];

                    const { description, requestBody, responses } =
                      operationObject;

                    return [
                      createOperationHeader(name),
                      create("div", {
                        children: createMethodEndpoint(method, path),
                      }),
                      createDescription(description),
                      createRequestBodyDetails({
                        title: "Body",
                        body: requestBody,
                      } as BodyProps),
                      createStatusCodes({ responses }),
                    ];
                  }),
                ],
              });
            }),
          }),
        ],
      }),
    ],
  });
}
