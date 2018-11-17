const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/Editor/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
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
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin(),
    // new WebpackNotifierPlugin(),
  ]
};
