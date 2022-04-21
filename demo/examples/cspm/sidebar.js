const globby = require("globby");
const yaml = require("js-yaml");
const fs = require("fs");
// Use the following to frontload docs
var docs = [
  "cloud/cspm/cspm-api",
  "cloud/basic-request",
  "cloud/api-urls",
  "cloud/api-headers",
  "cloud/api-time-range-model",
  "cloud/api-integration-config",
  "cloud/api-errors",
];
// Change these variables to match your doc path
const relativePath = "cloud/cspm";
const absolutePath = "/api/cloud/cspm";
function genEndpoints() {
  const endpoints = [];
  var endEndpoints = [];
  var pushToEnd = [
    "IacScan",
    "IAM",
    "IAMIdp",
    "DataSecurityDashboard",
    "DataSecurityInventory",
    "DataSecuritySettings",
  ];
  // Absolute path from project root
  specs = globby.sync(["./static/oas/cspm/*.yaml"], {
    absolute: false,
    objectMode: true,
    deep: 1,
    onlyDirectories: false,
  });
  specs.map((spec) => {
    const specContents = fs.readFileSync(spec.path, "utf8");
    const data = yaml.load(specContents);
    const specSplit = spec.path.split("/");
    const categoryLabel = specSplit[specSplit.length - 1].replace(".yaml", "");
    const docId = categoryLabel
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
    const paths = data.paths;
    var category = {
      type: "category",
      label: categoryLabel,
    };
    var items = [`${relativePath}/${docId}`];
    for ([path, methods] of Object.entries(paths)) {
      for ([method, attributes] of Object.entries(methods)) {
        const operationId = attributes.operationId;
        const linkLabel = attributes.summary;
        const item = {
          type: "link",
          label: linkLabel,
          href: `${absolutePath}/${docId}#operation/${operationId}`,
          customProps: {
            method: method,
          },
        };
        items.push(item);
      }
    }
    category.items = items;
    if (pushToEnd.includes(category.label)) {
      endEndpoints.push(category);
    } else {
      endpoints.push(category);
    }
  });
  return [endpoints, endEndpoints];
}
const [endpoints, endEndpoints] = genEndpoints();
const sidebar = docs.concat(endpoints).concat(endEndpoints);
console.log(sidebar);
module.exports = {
  sidebar: sidebar,
};
