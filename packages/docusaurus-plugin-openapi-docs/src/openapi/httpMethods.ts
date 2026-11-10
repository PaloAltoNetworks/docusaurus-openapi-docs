/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/**
 * The Path Item Object fields that hold an operation, in alphabetical order
 * (the order of the callback tabs). `query` is a field from OpenAPI 3.2.
 */
export const HTTP_METHODS = [
  "delete",
  "get",
  "head",
  "options",
  "patch",
  "post",
  "put",
  "query",
  "trace",
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export function isHttpMethod(key: string): key is HttpMethod {
  return (HTTP_METHODS as readonly string[]).includes(key);
}
