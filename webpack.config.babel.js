const fs = require('fs');
const webpack = require('webpack');
const path = require('path');
const resolve = path.resolve;
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: resolve('./'),
    entry: {
        content:'./content.js'
    },
    output: {
      filename: 'content.js',
      path: resolve('dist'),
      pathinfo: true,
      publicPath: '/'
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['*', '.js', '.jsx'],
      alias: {
      }
    },
    externals:
      function(context, request, callback) {
      if(/eslint/.test(request)) {
        return callback(null, request);
      }
      callback();
    },
    devServer: {
      historyApiFallback: true,
      noInfo: true,
      quiet: true,
      publicPath: resolve('/')
    },
    plugins: process.env.NODE_ENV==='development'?[
        new ExtractTextPlugin('style.css')
    ]:[
      new ExtractTextPlugin('style.css'),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          // warnings: true,
          properties: true,
          sequences: true,
          dead_code: true,
          conditionals: true,
          comparisons: true,
          cascade: true,
          collapse_vars: true,
          reduce_vars: true,
          evaluate: true,
          booleans: true,
          unused: true,
          loops: true,
          hoist_funs: true,
          cascade: true,
          if_return: true,
          join_vars: true,
          //drop_console: true,
          drop_debugger: true,
          negate_iife: true,
          unsafe: true,
          hoist_vars: true,
          hoist_funs: true,
          side_effects: true,
          screw_ie8: true,
          global_defs: {
            _isDevelopmentMode: false
          }
        },
        output: {comments: false},
        sourceMap: false
      })
    ],
    module: {
      loaders: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules\/(?!@cybs)/,
          loaders: 'babel-loader?' + JSON.stringify({
            cacheDirectory: true,
            plugins: [
              ["transform-replace-object-assign", "simple-assign"],
              "transform-dev-warning",
              "add-module-exports",
              "transform-decorators-legacy"
            ],
            presets: ['es2015', 'react', 'stage-1']
          })
        }
      , {
          test: /\.(css|scss)$/
          // Development mode uses inline CSS and sourcemaps
        , use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
              // "style-loader",
              "css-loader"
            , {
                loader: "sass-loader"
                // Development mode uses inline CSS and sourcemaps
              , options: {
                  sourceMap: false
                }
              }
            ]
          })
        }
      ]
    }
};
