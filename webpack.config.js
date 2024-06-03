const path = require("path");

module.exports = {
  entry: "./src/main.tsx",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(?:jsx|js|mjs|cjs|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-typescript"],
              [
                "@babel/preset-react",
                {
                  runtime: "automatic", // defaults to classic
                  importSource: "veles", // defaults to react
                },
              ],
              ["@babel/preset-env", { targets: "defaults" }],
            ],
          },
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 9000,
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx", ".jsx"],
  },
};
