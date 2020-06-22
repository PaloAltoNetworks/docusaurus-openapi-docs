const primitives = {
  string: () => "string",
  string_email: () => "user@example.com",
  "string_date-time": () => new Date().toISOString(),
  string_date: () => new Date().toISOString().substring(0, 10),
  string_uuid: () => "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  string_hostname: () => "example.com",
  string_ipv4: () => "198.51.100.42",
  string_ipv6: () => "2001:0db8:5b96:0000:0000:426f:8e17:642a",
  number: () => 0,
  number_float: () => 0.0,
  integer: () => 0,
  boolean: (schema) =>
    typeof schema.default === "boolean" ? schema.default : true,
};

export const sampleFromSchema = (schema, config = {}) => {
  let { type, example, properties, additionalProperties, items } = objectify(
    schema
  );
  let { includeReadOnly, includeWriteOnly } = config;

  if (example !== undefined) {
    return example;
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
    let props = objectify(properties);
    let obj = {};
    for (var name in props) {
      if (props[name] && props[name].deprecated) {
        continue;
      }
      if (props[name] && props[name].readOnly && !includeReadOnly) {
        continue;
      }
      if (props[name] && props[name].writeOnly && !includeWriteOnly) {
        continue;
      }
      obj[name] = sampleFromSchema(props[name], config);
    }

    if (additionalProperties === true) {
      obj.additionalProp1 = {};
    } else if (additionalProperties) {
      let additionalProps = objectify(additionalProperties);
      let additionalPropVal = sampleFromSchema(additionalProps, config);

      for (let i = 1; i < 4; i++) {
        obj["additionalProp" + i] = additionalPropVal;
      }
    }
    return obj;
  }

  if (type === "array") {
    if (Array.isArray(items.anyOf)) {
      return items.anyOf.map((i) => sampleFromSchema(i, config));
    }

    if (Array.isArray(items.oneOf)) {
      return items.oneOf.map((i) => sampleFromSchema(i, config));
    }

    return [sampleFromSchema(items, config)];
  }

  if (schema["enum"]) {
    if (schema["default"]) return schema["default"];
    return normalizeArray(schema["enum"])[0];
  }

  if (type === "file") {
    return;
  }

  return primitive(schema);
};

const primitive = (schema) => {
  schema = objectify(schema);
  let { type, format } = schema;

  let fn = primitives[`${type}_${format}`] || primitives[type];

  if (isFunc(fn)) return fn(schema);

  return "Unknown Type: " + schema.type;
};

function isFunc(thing) {
  return typeof thing === "function";
}

function isObject(obj) {
  return !!obj && typeof obj === "object";
}

function normalizeArray(arr) {
  if (Array.isArray(arr)) {
    return arr;
  }
  return [arr];
}

function objectify(thing) {
  if (!isObject(thing)) {
    return {};
  }
  // if (isImmutable(thing)) return thing.toJS();
  return thing;
}
