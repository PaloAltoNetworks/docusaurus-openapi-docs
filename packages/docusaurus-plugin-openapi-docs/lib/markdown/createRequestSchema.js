"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestSchema = void 0;
const createDescription_1 = require("./createDescription");
const createDetails_1 = require("./createDetails");
const createDetailsSummary_1 = require("./createDetailsSummary");
const createSchema_1 = require("./createSchema");
const utils_1 = require("./utils");
function createRequestSchema({ title, body, ...rest }) {
    var _a;
    if (body === undefined ||
        body.content === undefined ||
        Object.keys(body).length === 0 ||
        Object.keys(body.content).length === 0) {
        return undefined;
    }
    // Get all MIME types, including vendor-specific
    const mimeTypes = Object.keys(body.content);
    if (mimeTypes && mimeTypes.length > 1) {
        return (0, utils_1.create)("MimeTabs", {
            className: "openapi-tabs__mime",
            schemaType: "request",
            children: mimeTypes.map((mimeType) => {
                const firstBody = body.content[mimeType].schema;
                if (firstBody === undefined) {
                    return undefined;
                }
                if (firstBody.properties !== undefined) {
                    if (Object.keys(firstBody.properties).length === 0) {
                        return undefined;
                    }
                }
                return (0, utils_1.create)("TabItem", {
                    label: mimeType,
                    value: `${mimeType}`,
                    children: [
                        (0, createDetails_1.createDetails)({
                            className: "openapi-markdown__details mime",
                            "data-collapsed": false,
                            open: true,
                            ...rest,
                            children: [
                                (0, createDetailsSummary_1.createDetailsSummary)({
                                    className: "openapi-markdown__details-summary-mime",
                                    children: [
                                        (0, utils_1.create)("h3", {
                                            className: "openapi-markdown__details-summary-header-body",
                                            children: `${title}`,
                                        }),
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
                                                style: { marginTop: "1rem", marginBottom: "1rem" },
                                                children: (0, createDescription_1.createDescription)(body.description),
                                            }),
                                        ]),
                                    ],
                                }),
                                (0, utils_1.create)("ul", {
                                    style: { marginLeft: "1rem" },
                                    children: (0, createSchema_1.createNodes)(firstBody, "request"),
                                }),
                            ],
                        }),
                    ],
                });
            }),
        });
    }
    const randomFirstKey = Object.keys(body.content)[0];
    const firstBody = (_a = body.content[randomFirstKey].schema) !== null && _a !== void 0 ? _a : body.content[randomFirstKey];
    if (firstBody === undefined) {
        return undefined;
    }
    // we don't show the table if there is no properties to show
    if (firstBody.properties !== undefined) {
        if (Object.keys(firstBody.properties).length === 0) {
            return undefined;
        }
    }
    return (0, utils_1.create)("MimeTabs", {
        className: "openapi-tabs__mime",
        children: [
            (0, utils_1.create)("TabItem", {
                label: randomFirstKey,
                value: `${randomFirstKey}-schema`,
                children: [
                    (0, createDetails_1.createDetails)({
                        className: "openapi-markdown__details mime",
                        "data-collapsed": false,
                        open: true,
                        ...rest,
                        children: [
                            (0, createDetailsSummary_1.createDetailsSummary)({
                                className: "openapi-markdown__details-summary-mime",
                                children: [
                                    (0, utils_1.create)("h3", {
                                        className: "openapi-markdown__details-summary-header-body",
                                        children: `${title}`,
                                    }),
                                    (0, utils_1.guard)(firstBody.type === "array", (format) => (0, utils_1.create)("span", {
                                        style: { opacity: "0.6" },
                                        children: ` array`,
                                    })),
                                    (0, utils_1.guard)(body.required, () => [
                                        (0, utils_1.create)("strong", {
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
                                            style: { marginTop: "1rem", marginBottom: "1rem" },
                                            children: (0, createDescription_1.createDescription)(body.description),
                                        }),
                                    ]),
                                ],
                            }),
                            (0, utils_1.create)("ul", {
                                style: { marginLeft: "1rem" },
                                children: (0, createSchema_1.createNodes)(firstBody, "request"),
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });
}
exports.createRequestSchema = createRequestSchema;
