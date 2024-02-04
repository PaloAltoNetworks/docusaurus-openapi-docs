"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStatusCodes = exports.createExampleFromSchema = exports.createResponseExample = exports.createResponseExamples = void 0;
const xml_formatter_1 = __importDefault(require("xml-formatter"));
const createResponseExample_1 = require("../openapi/createResponseExample");
const createDescription_1 = require("./createDescription");
const createDetails_1 = require("./createDetails");
const createDetailsSummary_1 = require("./createDetailsSummary");
const createResponseSchema_1 = require("./createResponseSchema");
const utils_1 = require("./utils");
const utils_2 = require("./utils");
function json2xml(o, tab) {
    var toXml = function (v, name, ind) {
        var xml = "";
        if (v instanceof Array) {
            for (var i = 0, n = v.length; i < n; i++)
                xml += ind + toXml(v[i], name, ind + "\t") + "\n";
        }
        else if (typeof v == "object") {
            var hasChild = false;
            xml += ind + "<" + name;
            for (var m in v) {
                if (m.charAt(0) === "@")
                    xml += " " + m.substr(1) + '="' + v[m].toString() + '"';
                else
                    hasChild = true;
            }
            xml += hasChild ? ">" : "/>";
            if (hasChild) {
                for (var m2 in v) {
                    if (m2 === "#text")
                        xml += v[m2];
                    else if (m2 === "#cdata")
                        xml += "<![CDATA[" + v[m2] + "]]>";
                    else if (m2.charAt(0) !== "@")
                        xml += toXml(v[m2], m2, ind + "\t");
                }
                xml +=
                    (xml.charAt(xml.length - 1) === "\n" ? ind : "") +
                        "</" +
                        name +
                        ">";
            }
        }
        else {
            xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
        }
        return xml;
    }, xml = "";
    for (var m3 in o)
        xml += toXml(o[m3], m3, "");
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}
exports.default = json2xml;
function createResponseHeaders(responseHeaders) {
    return (0, utils_2.guard)(responseHeaders, () => (0, utils_1.create)("ul", {
        style: { marginLeft: "1rem" },
        children: [
            Object.entries(responseHeaders).map(([headerName, headerObj]) => {
                var _a, _b;
                const { description, example } = headerObj;
                const type = (_b = (_a = headerObj.schema) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : "any";
                return (0, utils_1.create)("li", {
                    className: "schemaItem",
                    children: [
                        (0, createDetailsSummary_1.createDetailsSummary)({
                            children: [
                                (0, utils_1.create)("strong", { children: headerName }),
                                (0, utils_2.guard)(type, () => [
                                    (0, utils_1.create)("span", {
                                        style: { opacity: "0.6" },
                                        children: ` ${type}`,
                                    }),
                                ]),
                            ],
                        }),
                        (0, utils_1.create)("div", {
                            children: [
                                (0, utils_2.guard)(description, (description) => (0, utils_1.create)("div", {
                                    style: {
                                        marginTop: ".5rem",
                                        marginBottom: ".5rem",
                                    },
                                    children: [
                                        (0, utils_2.guard)(example, () => `Example: ${example}`),
                                        (0, createDescription_1.createDescription)(description),
                                    ],
                                })),
                            ],
                        }),
                    ],
                });
            }),
        ],
    }));
}
function createResponseExamples(responseExamples, mimeType) {
    let language = "shell";
    if (mimeType.endsWith("json")) {
        language = "json";
    }
    if (mimeType.endsWith("xml")) {
        language = "xml";
    }
    return Object.entries(responseExamples).map(([exampleName, exampleValue]) => {
        if (typeof exampleValue.value === "object") {
            return (0, utils_1.create)("TabItem", {
                label: `${exampleName}`,
                value: `${exampleName}`,
                children: [
                    (0, utils_2.guard)(exampleValue.summary, (summary) => [
                        (0, utils_1.create)("Markdown", {
                            children: ` ${summary}`,
                        }),
                    ]),
                    (0, utils_1.create)("ResponseSamples", {
                        responseExample: JSON.stringify(exampleValue.value, null, 2),
                        language: language,
                    }),
                ],
            });
        }
        return (0, utils_1.create)("TabItem", {
            label: `${exampleName}`,
            value: `${exampleName}`,
            children: [
                (0, utils_2.guard)(exampleValue.summary, (summary) => [
                    (0, utils_1.create)("Markdown", {
                        children: ` ${summary}`,
                    }),
                ]),
                (0, utils_1.create)("ResponseSamples", {
                    responseExample: exampleValue.value,
                    language: language,
                }),
            ],
        });
    });
}
exports.createResponseExamples = createResponseExamples;
function createResponseExample(responseExample, mimeType) {
    let language = "shell";
    if (mimeType.endsWith("json")) {
        language = "json";
    }
    if (mimeType.endsWith("xml")) {
        language = "xml";
    }
    if (typeof responseExample === "object") {
        return (0, utils_1.create)("TabItem", {
            label: `Example`,
            value: `Example`,
            children: [
                (0, utils_2.guard)(responseExample.summary, (summary) => [
                    (0, utils_1.create)("Markdown", {
                        children: ` ${summary}`,
                    }),
                ]),
                (0, utils_1.create)("ResponseSamples", {
                    responseExample: JSON.stringify(responseExample, null, 2),
                    language: language,
                }),
            ],
        });
    }
    return (0, utils_1.create)("TabItem", {
        label: `Example`,
        value: `Example`,
        children: [
            (0, utils_2.guard)(responseExample.summary, (summary) => [
                (0, utils_1.create)("Markdown", {
                    children: ` ${summary}`,
                }),
            ]),
            (0, utils_1.create)("ResponseSamples", {
                responseExample: responseExample,
                language: language,
            }),
        ],
    });
}
exports.createResponseExample = createResponseExample;
function createExampleFromSchema(schema, mimeType) {
    const responseExample = (0, createResponseExample_1.sampleResponseFromSchema)(schema);
    if (mimeType.endsWith("xml")) {
        let responseExampleObject;
        try {
            responseExampleObject = JSON.parse(JSON.stringify(responseExample));
        }
        catch {
            return undefined;
        }
        if (typeof responseExampleObject === "object") {
            let xmlExample;
            try {
                xmlExample = (0, xml_formatter_1.default)(json2xml(responseExampleObject, ""), {
                    indentation: "  ",
                    lineSeparator: "\n",
                    collapseContent: true,
                });
            }
            catch {
                const xmlExampleWithRoot = { root: responseExampleObject };
                try {
                    xmlExample = (0, xml_formatter_1.default)(json2xml(xmlExampleWithRoot, ""), {
                        indentation: "  ",
                        lineSeparator: "\n",
                        collapseContent: true,
                    });
                }
                catch {
                    xmlExample = json2xml(responseExampleObject, "");
                }
            }
            return (0, utils_1.create)("TabItem", {
                label: `Example (from schema)`,
                value: `Example (from schema)`,
                children: [
                    (0, utils_1.create)("ResponseSamples", {
                        responseExample: xmlExample,
                        language: "xml",
                    }),
                ],
            });
        }
    }
    if (typeof responseExample === "object") {
        return (0, utils_1.create)("TabItem", {
            label: `Example (from schema)`,
            value: `Example (from schema)`,
            children: [
                (0, utils_1.create)("ResponseSamples", {
                    responseExample: JSON.stringify(responseExample, null, 2),
                    language: "json",
                }),
            ],
        });
    }
    return undefined;
}
exports.createExampleFromSchema = createExampleFromSchema;
function createStatusCodes({ label, id, responses }) {
    if (responses === undefined) {
        return undefined;
    }
    const codes = Object.keys(responses);
    if (codes.length === 0) {
        return undefined;
    }
    return (0, utils_1.create)("div", {
        children: [
            (0, utils_1.create)("div", {
                children: [
                    (0, utils_1.create)("ApiTabs", {
                        label,
                        id,
                        children: codes.map((code) => {
                            const responseHeaders = responses[code].headers;
                            return (0, utils_1.create)("TabItem", {
                                label: code,
                                value: code,
                                children: [
                                    (0, utils_1.create)("div", {
                                        children: (0, createDescription_1.createDescription)(responses[code].description),
                                    }),
                                    responseHeaders &&
                                        (0, createDetails_1.createDetails)({
                                            className: "openapi-markdown__details",
                                            "data-collaposed": true,
                                            open: false,
                                            style: { textAlign: "left", marginBottom: "1rem" },
                                            children: [
                                                (0, createDetailsSummary_1.createDetailsSummary)({
                                                    children: [
                                                        (0, utils_1.create)("strong", {
                                                            children: "Response Headers",
                                                        }),
                                                    ],
                                                }),
                                                createResponseHeaders(responseHeaders),
                                            ],
                                        }),
                                    (0, utils_1.create)("div", {
                                        children: (0, createResponseSchema_1.createResponseSchema)({
                                            title: "Schema",
                                            body: {
                                                content: responses[code].content,
                                            },
                                        }),
                                    }),
                                ],
                            });
                        }),
                    }),
                ],
            }),
        ],
    });
}
exports.createStatusCodes = createStatusCodes;
