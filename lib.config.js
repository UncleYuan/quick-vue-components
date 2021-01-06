var path = require("path");
var VueLoaderPlugin = require("vue-loader/lib/plugin");
var ProgressBarPlugin = require("progress-bar-webpack-plugin");

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

module.exports = {
  entry: {
    index: "./lib/index.js",
  },
  mode: "production",
  output: {
    path: path.resolve(__dirname, "./libdist"),
    publicPath: "./",
    libraryExport: "default", // 对外暴露default属性，就可以直接调用default里的属性
    library: "QuickVueComponents", // // 指定类库名,主要用于直接引用的方式(比如使用script 标签)
    libraryTarget: "umd", // 定义打包方式
    globalObject: "this",
    umdNamedDefine: true,
    filename: "index.js",
  },
  resolve: {
    extensions: [".js", ".vue"],
  },
  externals: {
    jquery: {
      commonjs: "jquery",
      commonjs2: "jquery",
      amd: "jquery",
      root: "jQuery",
    },
    "element-ui": {
      commonjs: "element-ui",
      commonjs2: "element-ui",
      amd: "element-ui",
      root: "elementUi",
    },
    moment: {
      commonjs: "moment",
      commonjs2: "moment",
      amd: "moment",
      root: "moment",
    },
    axios: {
      commonjs: "axios",
      commonjs2: "axios",
      amd: "axios",
      root: "axios",
    },
    lodash: {
      commonjs: "lodash",
      commonjs2: "lodash",
      amd: "lodash",
      root: "_",
    },
    "vue-quill-editor": {
      commonjs: "vue-quill-editor",
      commonjs2: "vue-quill-editor",
      amd: "vue-quill-editor",
      root: "VueQuillEditor",
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.s?css$/,
        loader: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    new ProgressBarPlugin(),
    new VueLoaderPlugin(), // 开启 BundleAnalyzerPlugin
    new BundleAnalyzerPlugin(),
  ],
};
