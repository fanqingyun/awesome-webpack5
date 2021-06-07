// 这个文件是运行在Node.js环境下的，所以应该使用commonJS的方式来撰写代码，因此也可以使用Node.js的内置模块，如path
// import { Configuration } from 'webpack' // 这一步只是为了智能提示，node环境不支持import
/**
 * @type {import('webpack').Configuration}
 */
const path = require('path')
const SelfPlugin  = require('./plugins/self-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const config = {
  entry: path.join(__dirname, 'src/index.js'),
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.(md|png|css|jpg)$/,
        use: [
          {
            loader: './loaders/self-loader',
            options: {
              name: '参数'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new SelfPlugin({
      name: 'testName'
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
}
module.exports = config