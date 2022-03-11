module.exports = function bundleOptimizer() {
  return {
    name: "webpack-bundle-optimizer",
    configureWebpack() {
      return {
        // Excludes faker library
        externals: {
          "postman-code-generators": "faker",
        },
      };
    },
  };
};
