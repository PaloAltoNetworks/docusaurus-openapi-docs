const config = [
  {
    id: "cspm",
    specPath: "examples/cspm",
    outputDir: "api/cspm",
    sidebarOptions: {
      groupPathsBy: "tags",
    },
  },
  {
    id: "petstore",
    specPath: "examples/petstore.yaml",
    outputDir: "api/petstore",
    sidebarOptions: {
      groupPathsBy: "tags",
    },
  },
  {
    id: "cos",
    specPath: "examples/openapi-cos.json",
    outputDir: "api/cos",
    sidebarOptions: {
      groupPathsBy: "tags",
    },
  },
  {
    id: "openapi-issue",
    specPath: "examples/openapi-issue-21.json",
    outputDir: "api/openapi-issue",
    sidebarOptions: {
      groupPathsBy: "tags",
    },
  },
  {
    id: "burgers",
    specPath: "examples/food/burgers",
    outputDir: "api/food/burgers",
    sidebarOptions: {
      groupPathsBy: "tags",
    },
  },
  {
    id: "yogurt",
    specPath: "examples/food/yogurtstore",
    outputDir: "api/food/yogurtstore",
    sidebarOptions: {
      groupPathsBy: "tags",
    },
  },
];
module.exports = config;
