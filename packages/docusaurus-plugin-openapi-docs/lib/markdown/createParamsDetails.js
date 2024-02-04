"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParamsDetails = void 0;
const createDetails_1 = require("./createDetails");
const createDetailsSummary_1 = require("./createDetailsSummary");
const utils_1 = require("./utils");
function createParamsDetails({ parameters, type }) {
    if (parameters === undefined) {
        return undefined;
    }
    const params = parameters.filter((param) => (param === null || param === void 0 ? void 0 : param.in) === type);
    if (params.length === 0) {
        return undefined;
    }
    return (0, createDetails_1.createDetails)({
        className: "openapi-markdown__details",
        "data-collapsed": false,
        open: true,
        style: { marginBottom: "1rem" },
        children: [
            (0, createDetailsSummary_1.createDetailsSummary)({
                children: [
                    (0, utils_1.create)("h3", {
                        className: "openapi-markdown__details-summary-header-params",
                        children: `${type.charAt(0).toUpperCase() + type.slice(1)} Parameters`,
                    }),
                ],
            }),
            (0, utils_1.create)("div", {
                children: [
                    (0, utils_1.create)("ul", {
                        children: params.map((param) => (0, utils_1.create)("ParamsItem", {
                            className: "paramsItem",
                            param: param,
                        })),
                    }),
                ],
            }),
        ],
    });
}
exports.createParamsDetails = createParamsDetails;
