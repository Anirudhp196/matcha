module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        stream: false, // disable stream instead of polyfill
      };
      return webpackConfig;
    },
  },
};