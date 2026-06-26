const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, '../index.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      // JS / TS / TSX / JSX — transpile everything including node_modules that ship ESM
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(react-native|@react-navigation|react-navigation|react-native-safe-area-context|react-native-screens)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript'
            ],
            plugins: [
              ['babel-plugin-react-native-web', { commonjs: true }]
            ]
          }
        }
      },
      // Images — webpack 5 built-in asset handling (replaces url-loader / file-loader)
      {
        test: /\.(gif|jpe?g|png|svg|ttf|otf|woff|woff2|eot)$/,
        type: 'asset/inline'
      }
    ]
  },
  // Make require('url-loader!...') calls from @react-navigation/elements a no-op
  resolveLoader: {
    alias: {
      'url-loader': path.resolve(__dirname, 'null-loader.js')
    }
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web'
    },
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js'
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html')
    })
  ],
  devServer: {
    historyApiFallback: true,
    port: 8081,
    hot: true,
    static: {
      directory: path.join(__dirname, './')
    }
  }
};
