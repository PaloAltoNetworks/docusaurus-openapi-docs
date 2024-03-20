/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { ReactNode } from "react";

export type Children = ReactNode | string | undefined | (string | undefined)[];

export type Props = Record<string, any> & { children?: Children };

export function create(tag: string, props: Props): string {
  const { children, ...rest } = props;

  let propString = "";
  for (const [key, value] of Object.entries(rest)) {
    propString += ` ${key}={${JSON.stringify(value)}}`;
  }

  return `<${tag}${propString}>${render(children)}</${tag}>`;
}

export function guard<T>(
  value: T | undefined | string,
  cb: (value: T) => Children
): string {
  if (!!value || value === 0) {
    const children = cb(value as T);
    return render(children);
  }
  return "";
}

export function render(children: Children): string {
  if (Array.isArray(children)) {
    return children.filter((c) => c !== undefined).join("");
  }
  return (children as string) ?? "";
}

export function toString(value: any): string | undefined {
  // Return as-is if already string
  if (typeof value === "string") {
    return value;
  }
  // Return undefined if null or undefined
  if (value == null) {
    return undefined;
  }
  // Return formatted array if Array
  if (Array.isArray(value)) {
    return `[${value.join(", ")}]`;
  }
  // Coerce to string in all other cases,
  return value + "";
}
