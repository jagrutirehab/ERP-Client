module.exports = {
  style: {
    sass: {
      // The theme stylesheets use older Sass syntax (@import, global colour
      // functions) and sass-loader uses Sass's legacy API. Each compile prints
      // deprecation notices for these; they are harmless until Dart Sass 2/3.
      loaderOptions: (options) => ({
        ...options,
        sassOptions: {
          ...(options.sassOptions || {}),
          quietDeps: true,
          silenceDeprecations: [
            "legacy-js-api",
            "import",
            "global-builtin",
            "color-functions",
            "if-function",
          ],
        },
      }),
    },
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.resolve.fallback = {
        fs: false,
        os: false,
        path: false,
      };
      // Some packages (html5-qrcode, react-zoom-pan-pinch, svg2pdf.js) ship
      // source maps that point at .ts files they don't publish. Harmless, but
      // it floods the dev terminal; our own code's source maps are unaffected.
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        (warning) =>
          /Failed to parse source map/.test(warning.message || "") &&
          /node_modules/.test(warning.module?.resource || warning.message || ""),
      ];
      return webpackConfig;
    },
  },
};
