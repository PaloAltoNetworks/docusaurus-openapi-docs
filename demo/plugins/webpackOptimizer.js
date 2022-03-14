const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = function webpackOptimizer() {
  return {
    name: "docusaurus-webpack-optimizer",
    configureWebpack() {
      return {
        plugins: [
          new BundleAnalyzerPlugin({
            analyzerMode: "static", // Uncomment for production builds
            generateStatsFile: true,
            openAnalyzer: false,
          }),
        ],
      };
    },
  };
};
