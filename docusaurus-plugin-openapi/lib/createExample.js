"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleFromSchema = void 0;
const types_1 = require("./types");
const primitives = {
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
        default: (schema) => typeof schema.default === "boolean" ? schema.default : true,
    },
    object: {},
    array: {},
};
exports.sampleFromSchema = (schema = {}) => {
    let { type, example, properties, items } = schema;
    if (example !== undefined) {
        return example;
    }
    if (!type) {
        if (properties) {
            type = types_1.Type.object;
        }
        else if (items) {
            type = types_1.Type.array;
        }
        else {
            return;
        }
    }
    if (type === types_1.Type.object) {
        let obj = {};
        for (let [name, prop] of Object.entries(properties || {})) {
            if (prop && prop.deprecated) {
                continue;
            }
            obj[name] = exports.sampleFromSchema(prop);
        }
        return obj;
    }
    if (type === types_1.Type.array) {
        if (Array.isArray(items === null || items === void 0 ? void 0 : items.anyOf)) {
            return items === null || items === void 0 ? void 0 : items.anyOf.map((item) => exports.sampleFromSchema(item));
        }
        if (Array.isArray(items === null || items === void 0 ? void 0 : items.oneOf)) {
            return items === null || items === void 0 ? void 0 : items.oneOf.map((item) => exports.sampleFromSchema(item));
        }
        return [exports.sampleFromSchema(items)];
    }
    if (schema.enum) {
        if (schema.default) {
            return schema.default;
        }
        return normalizeArray(schema.enum)[0];
    }
    return primitive(schema);
};
function primitive(schema = {}) {
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
function normalizeArray(arr) {
    if (Array.isArray(arr)) {
        return arr;
    }
    return [arr];
}
