const path = require("path");
// const webpack = require("webpack");
// const createStyledComponentsTransformer = require("typescript-plugin-styled-components")
//   .default;
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const WebpackNotifierPlugin = require('webpack-notifier');
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const WorkerPlugin = require("worker-plugin");

// const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

// const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = {
  context: path.resolve(__dirname, "./src"),
  mode: "development",
  devtool: "inline-source-map",
  entry: ["./Editor/index.tsx"],
  devServer: {
    hot: true
  },
  module: {
    defaultRules: [
      {
        type: "javascript/auto",
        resolve: {}
      }
    ],
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
          babelrc: false,
          plugins: [
            "@babel/plugin-transform-runtime",
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
            "@babel/proposal-object-rest-spread"
            // "react-hot-loader/babel"
          ],
          presets: [
            [
              "@babel/env",
              {
                targets: {
                  chrome: "72"
                }
              }
            ],
            "@babel/preset-react",
            "@babel/preset-typescript"
          ]
          // getCustomTransformers: () => ({
          //   before: [styledComponentsTransformer]
          // })
        }
      },
      {
        test: /\.(glsl|json)$/,
        loader: "raw-loader"
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: "file-loader"
      },
      {
        test: /\.tmLanguage$/,
        loader: "raw-loader"
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
            // options: {
            //   modules: true,
            //   localIdentName: '[path][name]__[local]--[hash:base64:5]'
            // },
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/"
  },
  plugins: [
    new HtmlWebpackPlugin(),
    // new ForkTsCheckerWebpackPlugin({
    //   tsconfig: "../tsconfig.json",
    //   tslint: "../tslint.json"
    // }),
    new MonacoWebpackPlugin({
      languages: []
    }),
    new WorkerPlugin()
    // new CheckerPlugin(),
    // new webpack.HotModuleReplacementPlugin(), // enable HMR globally
    // new webpack.NamedModulesPlugin() // prints more readable module names in the browser console on HMR updates
    // new WebpackNotifierPlugin(),
  ]
};
