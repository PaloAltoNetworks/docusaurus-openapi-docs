"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadOpenapi = void 0;
// @ts-ignore - openapi-to-postmanv2 doesn't have types.
const openapi_to_postmanv2_1 = __importDefault(require("openapi-to-postmanv2"));
const postman_collection_1 = __importDefault(require("postman-collection"));
const import_fresh_1 = __importDefault(require("import-fresh"));
const json_refs_1 = __importDefault(require("json-refs"));
const lodash_kebabcase_1 = __importDefault(require("lodash.kebabcase"));
const createExample_1 = require("./createExample");
const utils_1 = require("@docusaurus/utils");
function isOperationObject(item) {
    return item.responses !== undefined;
}
function getPaths(spec) {
    const seen = {};
    return Object.entries(spec.paths)
        .map(([path, pathObject]) => {
        const entries = Object.entries(pathObject);
        return entries.map(([key, val]) => {
            if (isOperationObject(val)) {
                let method = key;
                let operationObject = val;
                let summary = operationObject.summary || operationObject.operationId || "Missing summary";
                const sp = summary.split("\n");
                if (sp.length > 1) {
                    summary = sp[0];
                }
                if (summary.length > 30) {
                    summary = summary.slice(0, 30);
                }
                if (!operationObject.description) {
                    operationObject.description = operationObject.summary || operationObject.operationId;
                }
                const baseId = lodash_kebabcase_1.default(summary);
                let count = seen[baseId];
                let hashId;
                if (count) {
                    hashId = `${baseId}-${count}`;
                    seen[baseId] = count + 1;
                }
                else {
                    hashId = baseId;
                    seen[baseId] = 1;
                }
                const servers = operationObject.servers || pathObject.servers || spec.servers;
                // NOTE: no security on the path level, only op level.
                // The following line is unneeded, but is just for piece of mind.
                const security = operationObject.security;
                return Object.assign(Object.assign({}, operationObject), { summary: summary, method: method, path: path, hashId: hashId, servers: servers, security: security });
            }
            return undefined;
        });
    })
        .flat()
        .filter((item) => item !== undefined);
}
function organizeSpec(spec) {
    const paths = getPaths(spec);
    let tagNames = [];
    let tagged = [];
    if (spec.tags) {
        tagged = spec.tags
            .map((tag) => {
            return {
                title: tag.name,
                description: tag.description || "",
                items: paths.filter((p) => p.tags && p.tags.includes(tag.name)),
            };
        })
            .filter((i) => i.items.length > 0);
        tagNames = tagged.map((t) => t.title);
    }
    const all = [
        ...tagged,
        {
            title: "API",
            description: "",
            items: paths.filter((p) => {
                if (p.tags === undefined || p.tags.length === 0) {
                    return true;
                }
                for (let tag of p.tags) {
                    if (tagNames.includes(tag)) {
                        return false;
                    }
                }
                return true;
            }),
        },
    ];
    return all;
}
async function convertToPostman(openapiData) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    // The conversions mutates whatever you pass here, create a new object.
    const openapiClone = JSON.parse(JSON.stringify(openapiData));
    // seems to be a weird bug with postman and servers...
    delete openapiClone.servers;
    for (let value of Object.values(openapiClone.paths)) {
        let pathItemObject = value;
        delete pathItemObject.servers;
        (_a = pathItemObject.get) === null || _a === void 0 ? true : delete _a.servers;
        (_b = pathItemObject.put) === null || _b === void 0 ? true : delete _b.servers;
        (_c = pathItemObject.post) === null || _c === void 0 ? true : delete _c.servers;
        (_d = pathItemObject.delete) === null || _d === void 0 ? true : delete _d.servers;
        (_e = pathItemObject.options) === null || _e === void 0 ? true : delete _e.servers;
        (_f = pathItemObject.head) === null || _f === void 0 ? true : delete _f.servers;
        (_g = pathItemObject.patch) === null || _g === void 0 ? true : delete _g.servers;
        (_h = pathItemObject.trace) === null || _h === void 0 ? true : delete _h.servers;
    }
    return await new Promise((resolve, reject) => {
        openapi_to_postmanv2_1.default.convert({
            type: "json",
            data: openapiClone,
        }, {}, (_, conversionResult) => {
            if (!conversionResult.result) {
                reject(conversionResult.reason);
                return;
            }
            else {
                return resolve(new postman_collection_1.default.Collection(conversionResult.output[0].data));
            }
        });
    });
}
async function loadOpenapi(openapiPath, baseUrl, routeBasePath) {
    const openapiData = import_fresh_1.default(openapiPath);
    // Attach a postman request object to the openapi spec.
    const postmanCollection = await convertToPostman(openapiData);
    postmanCollection.forEachItem((item) => {
        const method = item.request.method.toLowerCase();
        // NOTE: This doesn't catch all variables for some reason...
        // item.request.url.variables.each((pathVar) => {
        //   pathVar.value = `{${pathVar.key}}`;
        // });
        const path = item.request.url
            .getPath({ unresolved: true })
            .replace(/:([a-z0-9-_]+)/gi, "{$1}");
        switch (method) {
            case "get":
            case "put":
            case "post":
            case "delete":
            case "options":
            case "head":
            case "patch":
            case "trace":
                if (!openapiData.paths[path]) {
                    break;
                }
                const operationObject = openapiData.paths[path][method];
                if (operationObject) {
                    operationObject.postman = item.request;
                }
                break;
            default:
                break;
        }
    });
    const { resolved: dereffed } = await json_refs_1.default.resolveRefs(openapiData);
    const dereffedSpec = dereffed;
    const order = organizeSpec(dereffedSpec);
    order.forEach((category, i) => {
        category.items.forEach((item, ii) => {
            var _a, _b, _c;
            // don't override already defined servers.
            if (item.servers === undefined) {
                item.servers = dereffedSpec.servers;
            }
            if (item.security === undefined) {
                item.security = dereffedSpec.security;
            }
            if (i === 0 && ii === 0) {
                item.hashId = "/";
            }
            item.permalink = utils_1.normalizeUrl([baseUrl, routeBasePath, item.hashId]);
            const prev = order[i].items[ii - 1] || ((_a = order[i - 1]) === null || _a === void 0 ? void 0 : _a.items[order[i - 1].items.length - 1]);
            const next = order[i].items[ii + 1] || (order[i + 1] ? order[i + 1].items[0] : null);
            if (prev) {
                item.previous = {
                    title: prev.summary,
                    permalink: utils_1.normalizeUrl([baseUrl, routeBasePath, prev.hashId]),
                };
            }
            if (next) {
                item.next = {
                    title: next.summary,
                    permalink: utils_1.normalizeUrl([baseUrl, routeBasePath, next.hashId]),
                };
            }
            const content = (_b = item.requestBody) === null || _b === void 0 ? void 0 : _b.content;
            const schema = (_c = content === null || content === void 0 ? void 0 : content["application/json"]) === null || _c === void 0 ? void 0 : _c.schema;
            if (schema) {
                item.jsonRequestBodyExample = createExample_1.sampleFromSchema(schema);
            }
        });
    });
    return order;
}
exports.loadOpenapi = loadOpenapi;
