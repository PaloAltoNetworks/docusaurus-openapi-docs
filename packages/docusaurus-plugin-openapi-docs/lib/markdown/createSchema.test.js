"use strict";
/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const prettier = __importStar(require("prettier"));
const createSchema_1 = require("./createSchema");
describe("createNodes", () => {
    it("should create readable MODs for oneOf primitive properties", () => {
        const schema = {
            type: "object",
            properties: {
                oneOfProperty: {
                    oneOf: [
                        {
                            type: "object",
                            properties: {
                                noseLength: {
                                    type: "number",
                                },
                            },
                            required: ["noseLength"],
                            description: "Clown's nose length",
                        },
                        {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            description: "Array of strings",
                        },
                        {
                            type: "boolean",
                        },
                        {
                            type: "number",
                        },
                        {
                            type: "string",
                        },
                    ],
                },
            },
        };
        expect((0, createSchema_1.createNodes)(schema, "request").map((md) => prettier.format(md, { parser: "babel" }))).toMatchSnapshot();
    });
});
