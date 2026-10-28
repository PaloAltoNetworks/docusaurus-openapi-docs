/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { getMediaType } from "./mediaType";

it.each([
  [" Application/Problem+JSON ; charset=UTF-8", "application/problem+json"],
  ["multipart/form-data; boundary=x", "multipart/form-data"],
  ['text/plain; profile="application/json;version=1"', "text/plain"],
  ["application/json-seq", "application/json-seq"],
  ["", ""],
  [undefined, ""],
])("gets the media type from %s", (contentType, expected) => {
  expect(getMediaType(contentType)).toBe(expected);
});
