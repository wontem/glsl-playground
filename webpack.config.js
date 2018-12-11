const path = require('path');
const webpack = require('webpack');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const WebpackNotifierPlugin = require('webpack-notifier');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/Editor/index.tsx',
  devServer: {
    hot: true
  },
  module: {
    defaultRules: [
      {
        type: 'javascript/auto',
        resolve: {}
      }
    ],
    rules: [
      // {
      //   test: /\.worker\.ts$/,
      //   use: [
      //     {
      //       loader: 'worker-loader',
      //     },
      //     {
      //       loader: 'ts-loader',
      //       options: {
      //         configFile: 'tsconfig.worker.json',
      //       },
      //     },
      //   ],
      // },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
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
        test: /\.wasm$/,
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
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new MonacoWebpackPlugin({
      languages: [],
    }),
    new webpack.HotModuleReplacementPlugin(),
    // new WebpackNotifierPlugin(),
  ]
};
