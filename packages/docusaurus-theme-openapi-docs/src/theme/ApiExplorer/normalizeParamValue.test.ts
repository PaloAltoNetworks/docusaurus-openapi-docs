/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import {
  normalizeEnumOptions,
  normalizeParamValue,
} from "./normalizeParamValue";

test("normalizes scalar, object, array and absent prefill values", () => {
  expect(normalizeParamValue(0)).toBe("0");
  expect(normalizeParamValue(false)).toBe("false");
  expect(normalizeParamValue({ a: 1 })).toBe('{"a":1}');
  expect(normalizeParamValue([1, false])).toEqual(["1", "false"]);
  expect(normalizeParamValue(null)).toBeUndefined();
});

test("numeric enum options match normalized prefill values", () => {
  const options = normalizeEnumOptions([0, 2, 5]);
  expect(options).toContain(normalizeParamValue(2));
});
