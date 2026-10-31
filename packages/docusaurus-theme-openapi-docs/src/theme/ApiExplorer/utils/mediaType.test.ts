/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { getContentTypeHeader, getMediaType } from "./mediaType";

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

it.each([
  ["application/json; charset=UTF-8", "application/json; charset=UTF-8"],
  ["multipart/form-data; boundary=old", "multipart/form-data"],
  [
    "Multipart/Form-Data; charset=UTF-8; BOUNDARY=old",
    "Multipart/Form-Data; charset=UTF-8",
  ],
  [
    'multipart/form-data; profile="a;b"; boundary="old;value"',
    'multipart/form-data; profile="a;b"',
  ],
  [
    'multipart/form-data; profile="a;\\"b"; boundary=old',
    'multipart/form-data; profile="a;\\"b"',
  ],
  ["text/plain; boundary=ordinary", "text/plain; boundary=ordinary"],
])("removes only the multipart boundary from %s", (contentType, expected) => {
  expect(getContentTypeHeader(contentType)).toBe(expected);
});
