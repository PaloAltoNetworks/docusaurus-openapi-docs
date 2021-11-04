/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { Primitives, Schema, Type } from "./types";

const primitives: Primitives = {
  string: {
    default: () => "string",
    email: () => "user@example.com",
    date: () => new Date().toISOString().substring(0, 10),
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
    default: (schema: Schema) =>
      typeof schema.default === "boolean" ? schema.default : true,
  },
  object: {},
  array: {},
};

export const sampleFromSchema = (schema: Schema = {}): any => {
  let { type, example, properties, items } = schema;

  if (example !== undefined) {
    return example;
  }

  if (!type) {
    if (properties) {
      type = Type.object;
    } else if (items) {
      type = Type.array;
    } else {
      return;
    }
  }

  if (type === Type.object) {
    let obj: any = {};
    for (let [name, prop] of Object.entries(properties || {})) {
      if (prop && prop.deprecated) {
        continue;
      }
      obj[name] = sampleFromSchema(prop);
    }
    return obj;
  }

  if (type === Type.array) {
    if (Array.isArray(items?.anyOf)) {
      return items?.anyOf.map((item) => sampleFromSchema(item));
    }

    if (Array.isArray(items?.oneOf)) {
      return items?.oneOf.map((item) => sampleFromSchema(item));
    }

    return [sampleFromSchema(items)];
  }

  if (schema.enum) {
    if (schema.default) {
      return schema.default;
    }
    return normalizeArray(schema.enum)[0];
  }

  return primitive(schema);
};

function primitive(schema: Schema = {}) {
  let { type, format } = schema;

  if (type === undefined) {
    return;
  }

  let fn = primitives[type].default;

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
