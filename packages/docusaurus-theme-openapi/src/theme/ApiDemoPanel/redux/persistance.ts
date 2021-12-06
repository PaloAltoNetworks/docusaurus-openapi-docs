/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { getAuthDataKeys, Security } from "./auth-types";

type Persistance = false | "localStorage" | "sessionStorage" | undefined;

/**
 * OpenAPI security array has an and/or relationship:
 *
 *  // or ...
 * "security": [
 *   {
 *     "A": []
 *   },
 *   {
 *     "B": []
 *   },
 *   {
 *     "C": []
 *   }
 * ]
 *
 * // and ...
 * "security": [
 *   {
 *     "A": [],
 *     "B": [],
 *     "C": []
 *   }
 * ]
 *
 * This function merges the schemes into an array:
 *
 * security: [["A"], ["B"], ["C"]]
 *
 * security: [["A", "B", "C"]]
 */
function mergeSecurity({
  securitySchemes,
  security,
}: {
  securitySchemes: any;
  security: any;
}): Security[][] {
  return security.map(
    (item: any) =>
      Object.entries(item)
        .map(([key, value]) => {
          if (!securitySchemes[key]) {
            return undefined;
          }
          return {
            ...securitySchemes[key],
            key,
            scopes: value,
          };
        })
        .filter(Boolean) // throw out any schemes that can't be found.
  );
}

function hydrateObject(
  keys: string[],
  { prefix, persistance }: { prefix: string; persistance: Persistance }
) {
  if (persistance === false) {
    return {};
  }

  if (persistance === "sessionStorage") {
    return keys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: sessionStorage.getItem(`${prefix}-${key}`) ?? undefined,
      };
    }, {});
  }

  // Default to localStorage
  return keys.reduce((acc, key) => {
    return {
      ...acc,
      [key]: localStorage.getItem(`${prefix}-${key}`) ?? undefined,
    };
  }, {});
}

function storeObject(
  obj: { [key: string]: string },
  { prefix, persistance }: { prefix: string; persistance: Persistance }
) {
  if (persistance === false) {
    return;
  }

  if (persistance === "sessionStorage") {
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) {
        sessionStorage.removeItem(`${prefix}-${key}`);
      } else {
        sessionStorage.setItem(`${prefix}-${key}`, value);
      }
    }
    return;
  }

  // Default to localStorage
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      localStorage.removeItem(`${prefix}-${key}`);
    } else {
      localStorage.setItem(`${prefix}-${key}`, value);
    }
  }
}

function uniqueKey(relationship: Security[], security: Security) {
  return relationship.map((r) => r.key).join("+") + ":" + security.key;
}

export function loadAuth({
  securitySchemes,
  security,
  persistance,
}: {
  securitySchemes: any;
  security: any;
  persistance: Persistance;
}) {
  const securities = mergeSecurity({ securitySchemes, security });

  return securities.map((relationship) =>
    relationship.map((security) => {
      const data = hydrateObject(getAuthDataKeys(security), {
        prefix: uniqueKey(relationship, security),
        persistance,
      });
      return { ...security, data };
    })
  );
}

export function persistAuth({
  security: securities,
  persistance,
}: {
  security: Security[][];
  persistance: Persistance;
}) {
  if (persistance === false) {
    return;
  }

  for (const relationship of securities) {
    for (const security of relationship) {
      storeObject(security.data, {
        prefix: uniqueKey(relationship, security),
        persistance,
      });
    }
  }
}

export function persistSelectedAuth({
  key,
  selectedAuthID,
  persistance,
}: {
  key: string;
  selectedAuthID: string;
  persistance: Persistance;
}) {
  if (persistance === false) {
    return;
  }

  if (persistance === "sessionStorage") {
    sessionStorage.setItem(key, selectedAuthID);
  }

  localStorage.setItem(key, selectedAuthID);
}

export function loadSelectedAuth({
  key,
  persistance,
}: {
  key: string;
  persistance: Persistance;
}): string | undefined {
  if (persistance === false) {
    return undefined;
  }

  if (persistance === "sessionStorage") {
    return sessionStorage.getItem(key) ?? undefined;
  }

  return localStorage.getItem(key) ?? undefined;
}
