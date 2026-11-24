/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

/** Normalize schema defaults and examples without losing scalar values or objects. */
export function normalizeParamValue(
  value: unknown
): string | string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** HTML select values are strings, including when the schema enum is numeric. */
export function normalizeEnumOptions(values: unknown[]): string[] {
  return values.map(String);
}
