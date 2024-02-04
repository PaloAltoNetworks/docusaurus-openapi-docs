"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestHeader = void 0;
function createRequestHeader(header) {
    return `## ${header}\n\n`;
}
exports.createRequestHeader = createRequestHeader;
