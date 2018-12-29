const path = require('path');
const webpack = require('webpack');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const WebpackNotifierPlugin = require('webpack-notifier');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
// const { CheckerPlugin } = require('awesome-typescript-loader');

const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = {
  context: path.resolve(__dirname, './src'),
  mode: 'development',
  devtool: 'inline-source-map',
  entry: [
    // 'react-hot-loader/patch', // activate HMR for React
    // 'webpack-dev-server/client?http://localhost:8080',// bundle the client for webpack-dev-server and connect to the provided endpoint
    // 'webpack/hot/only-dev-server', // bundle the client for hot reloading, only- means to only hot reload for successful updates
    './Editor/index.tsx'
  ],
  devServer: {
    hot: true,
  },
  module: {
    defaultRules: [
      {
        type: 'javascript/auto',
        resolve: {}
      }
    ],
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          getCustomTransformers: () => ({ before: [styledComponentsTransformer] }),
        }
      },
      {
        test: /\.glsl$/,
        loader: 'raw-loader',
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
      },
      {
        test: /\.tmLanguage$/,
        loader: 'raw-loader',
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
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
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new MonacoWebpackPlugin({
      languages: [],
    }),
    // new CheckerPlugin(),
    new webpack.HotModuleReplacementPlugin(), // enable HMR globally
    new webpack.NamedModulesPlugin(), // prints more readable module names in the browser console on HMR updates
    // new WebpackNotifierPlugin(),
  ]
};
