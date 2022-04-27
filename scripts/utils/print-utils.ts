/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

export function printBanner(title: string) {
  console.log();
  console.log("-".repeat(80));
  const titleWidth = title.length + 2;
  const left = Math.floor((80 - titleWidth) / 2);
  const right = Math.ceil((80 - titleWidth) / 2);
  console.log(`${"-".repeat(left)} ${title} ${"-".repeat(right)}`);
  console.log("-".repeat(80));
}

export function printSpacer() {
  console.log("-".repeat(80));
  console.log();
}

export function printValue(key: string, value: string) {
  console.log(`${key} \t\t-> ${value}`);
}
