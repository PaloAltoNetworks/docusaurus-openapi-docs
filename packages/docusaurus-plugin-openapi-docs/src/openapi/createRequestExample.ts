/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import chalk from "chalk";

import { mergeAllOf } from "../markdown/createRequestSchema";
import { SchemaObject } from "./types";

interface OASTypeToTypeMap {
  string: string;
  number: number;
  integer: number;
  boolean: boolean;
  object: any;
  array: any[];
}

type Primitives = {
  [OASType in keyof OASTypeToTypeMap]: {
    [format: string]: (schema: SchemaObject) => OASTypeToTypeMap[OASType];
  };
};

const primitives: Primitives = {
  string: {
    default: () => "string",
    email: () => "user@example.com",
    date: () => new Date().toISOString().substring(0, 10),
    "date-time": () => new Date().toISOString().substring(0, 10),
    uuid: () => "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    hostname: () => "example.com",
    ipv4: () => "198.51.100.42",
    ipv6: () => "2001:0db8:5b96:0000:0000:426f:8e17:642a",
  },
  number: {
    default: () => 0,
    float: () => 0.0,
  },
  integer: {
    default: () => 0,
  },
  boolean: {
    default: (schema) =>
      typeof schema.default === "boolean" ? schema.default : true,
  },
  object: {},
  array: {},
};

function sampleRequestFromProp(name: string, prop: any, obj: any): any {
  // Handle resolved circular props
  if (typeof prop === "object" && Object.keys(prop).length === 0) {
    obj[name] = prop;
    return obj;
  }

  // TODO: handle discriminators

  if (prop.oneOf) {
    obj[name] = sampleRequestFromSchema(prop.oneOf[0]);
  } else if (prop.anyOf) {
    obj[name] = sampleRequestFromSchema(prop.anyOf[0]);
  } else if (prop.allOf) {
    const { mergedSchemas }: { mergedSchemas: SchemaObject } = mergeAllOf(
      prop.allOf
    );
    sampleRequestFromProp(name, mergedSchemas, obj);
  } else {
    obj[name] = sampleRequestFromSchema(prop);
  }
  return obj;
}

export const sampleRequestFromSchema = (schema: SchemaObject = {}): any => {
  try {
    let { type, example, allOf, properties, items, oneOf, anyOf } = schema;

    if (example !== undefined) {
      return example;
    }

    if (oneOf) {
      // Just go with first schema
      return sampleRequestFromSchema(oneOf[0]);
    }

    if (anyOf) {
      // Just go with first schema
      return sampleRequestFromSchema(anyOf[0]);
    }

    if (allOf) {
      const { mergedSchemas }: { mergedSchemas: SchemaObject } =
        mergeAllOf(allOf);
      if (mergedSchemas.properties) {
        for (const [key, value] of Object.entries(mergedSchemas.properties)) {
          if (value.readOnly && value.readOnly === true) {
            delete mergedSchemas.properties[key];
          }
        }
      }
      return sampleRequestFromSchema(mergedSchemas);
    }

    if (!type) {
      if (properties) {
        type = "object";
      } else if (items) {
        type = "array";
      } else {
        return;
      }
    }

    if (type === "object") {
      let obj: any = {};
      for (let [name, prop] of Object.entries(properties ?? {})) {
        if (prop.properties) {
          for (const [key, value] of Object.entries(prop.properties)) {
            if (value.readOnly && value.readOnly === true) {
              delete prop.properties[key];
            }
          }
        }

        if (prop.items && prop.items.properties) {
          for (const [key, value] of Object.entries(prop.items.properties)) {
            if (value.readOnly && value.readOnly === true) {
              delete prop.items.properties[key];
            }
          }
        }

        if (prop.deprecated) {
          continue;
        }

        // Resolve schema from prop recursively
        obj = sampleRequestFromProp(name, prop, obj);
      }
      return obj;
    }

    if (type === "array") {
      if (Array.isArray(items?.anyOf)) {
        return items?.anyOf.map((item) => sampleRequestFromSchema(item));
      }

      if (Array.isArray(items?.oneOf)) {
        return items?.oneOf.map((item) => sampleRequestFromSchema(item));
      }

      return [sampleRequestFromSchema(items)];
    }

    if (schema.enum) {
      if (schema.default) {
        return schema.default;
      }
      return normalizeArray(schema.enum)[0];
    }

    if (schema.readOnly && schema.readOnly === true) {
      return undefined;
    }

    return primitive(schema);
  } catch (err) {
    console.error(
      chalk.yellow("WARNING: failed to create example from schema object:", err)
    );
    return;
  }
};

function primitive(schema: SchemaObject = {}) {
  let { type, format } = schema;

  if (type === undefined) {
    return;
  }

  let fn = schema.default ? () => schema.default : primitives[type].default;

  if (format !== undefined) {
    fn = primitives[type][format] || fn;
  }

  if (fn) {
    return fn(schema);
  }

  return "Unknown Type: " + schema.type;
}

function normalizeArray(arr: any) {
  if (Array.isArray(arr)) {
    return arr;
  }
  return [arr];
}
