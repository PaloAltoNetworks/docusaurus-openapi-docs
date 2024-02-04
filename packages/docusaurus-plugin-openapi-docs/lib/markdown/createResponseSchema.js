"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponseSchema = void 0;
const createDescription_1 = require("./createDescription");
const createDetails_1 = require("./createDetails");
const createDetailsSummary_1 = require("./createDetailsSummary");
const createSchema_1 = require("./createSchema");
const createStatusCodes_1 = require("./createStatusCodes");
const utils_1 = require("./utils");
function createResponseSchema({ title, body, ...rest }) {
    if (body === undefined ||
        body.content === undefined ||
        Object.keys(body).length === 0 ||
        Object.keys(body.content).length === 0) {
        return undefined;
    }
    // Get all MIME types, including vendor-specific
    const mimeTypes = Object.keys(body.content);
    if (mimeTypes && mimeTypes.length) {
        return (0, utils_1.create)("MimeTabs", {
            className: "openapi-tabs__mime",
            schemaType: "response",
            children: mimeTypes.map((mimeType) => {
                var _a;
                const responseExamples = body.content[mimeType].examples;
                const responseExample = body.content[mimeType].example;
                const firstBody = (_a = body.content[mimeType].schema) !== null && _a !== void 0 ? _a : body.content[mimeType];
                if (firstBody === undefined &&
                    responseExample === undefined &&
                    responseExamples === undefined) {
                    return undefined;
                }
                if ((firstBody === null || firstBody === void 0 ? void 0 : firstBody.properties) !== undefined) {
                    if (Object.keys(firstBody === null || firstBody === void 0 ? void 0 : firstBody.properties).length === 0) {
                        return undefined;
                    }
                }
                return (0, utils_1.create)("TabItem", {
                    label: `${mimeType}`,
                    value: `${mimeType}`,
                    children: [
                        (0, utils_1.create)("SchemaTabs", {
                            className: "openapi-tabs__schema",
                            // TODO: determine if we should persist this
                            // groupId: "schema-tabs",
                            children: [
                                firstBody &&
                                    (0, utils_1.create)("TabItem", {
                                        label: `${title}`,
                                        value: `${title}`,
                                        children: [
                                            (0, createDetails_1.createDetails)({
                                                className: "openapi-markdown__details response",
                                                "data-collapsed": false,
                                                open: true,
                                                ...rest,
                                                children: [
                                                    (0, createDetailsSummary_1.createDetailsSummary)({
                                                        className: "openapi-markdown__details-summary-response",
                                                        children: [
                                                            (0, utils_1.create)("strong", { children: `${title}` }),
                                                            (0, utils_1.guard)(body.required && body.required === true, () => [
                                                                (0, utils_1.create)("span", {
                                                                    className: "openapi-schema__required",
                                                                    children: "required",
                                                                }),
                                                            ]),
                                                        ],
                                                    }),
                                                    (0, utils_1.create)("div", {
                                                        style: { textAlign: "left", marginLeft: "1rem" },
                                                        children: [
                                                            (0, utils_1.guard)(body.description, () => [
                                                                (0, utils_1.create)("div", {
                                                                    style: {
                                                                        marginTop: "1rem",
                                                                        marginBottom: "1rem",
                                                                    },
                                                                    children: (0, createDescription_1.createDescription)(body.description),
                                                                }),
                                                            ]),
                                                        ],
                                                    }),
                                                    (0, utils_1.create)("ul", {
                                                        style: { marginLeft: "1rem" },
                                                        children: (0, createSchema_1.createNodes)(firstBody, "response"),
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                firstBody && (0, createStatusCodes_1.createExampleFromSchema)(firstBody, mimeType),
                                responseExamples &&
                                    (0, createStatusCodes_1.createResponseExamples)(responseExamples, mimeType),
                                responseExample &&
                                    (0, createStatusCodes_1.createResponseExample)(responseExample, mimeType),
                            ],
                        }),
                    ],
                });
            }),
        });
    }
    return undefined;
}
exports.createResponseSchema = createResponseSchema;
