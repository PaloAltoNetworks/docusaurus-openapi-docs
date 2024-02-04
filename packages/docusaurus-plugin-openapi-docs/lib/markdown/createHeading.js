"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHeading = void 0;
const utils_1 = require("./utils");
function createHeading(heading) {
    return [
        (0, utils_1.create)("h1", {
            className: "openapi__heading",
            children: `${heading}`,
        }),
        `\n\n`,
    ];
}
exports.createHeading = createHeading;
