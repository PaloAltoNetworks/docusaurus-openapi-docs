/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import crypto from "crypto-js";

export function hashArray(arr: string[]) {
  function hash(message: string) {
    return crypto.SHA1(message).toString();
  }
  const hashed = arr.map((item) => hash(item));
  hashed.sort();
  const res = hashed.join();
  return hash(res);
}

type Persistence = false | "localStorage" | "sessionStorage" | undefined;

export function createStorage(persistence: Persistence): Storage {
  if (persistence === false) {
    return {
      getItem: () => null,
      setItem: () => {},
      clear: () => {},
      key: () => null,
      removeItem: () => {},
      length: 0,
    };
  }

  if (persistence === "sessionStorage") {
    return sessionStorage;
  }

  return localStorage;
}
