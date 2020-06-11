const config = require('../webpack.config')

module.exports = {
  ...config,
  output: {
    path: __dirname,
    filename: '[name].js',
  },
  devtool: 'inline-source-map',

  devServer: {
    open: true,
    openPage: 'index.html',
    contentBase: __dirname,
    watchContentBase: true,
    host: 'localhost',
    port: 3000,
    disableHostCheck: true
  },
}
