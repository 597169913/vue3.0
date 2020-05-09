const path = require('path')
// const CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: process.env.NODE_ENV !== 'production' ? './' : '/geoplanningadmin/',
  assetsDir: 'static',
  productionSourceMap: false,
  filenameHashing: false,
  chainWebpack: config => {
    config.resolve.alias
      .set('vue$', 'vue/dist/vue.esm.js')
      .set('@', resolve('src'))
      .set('src', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
      .set('views', resolve('src/views'))
      .end()
    config.module
      .rule('file')
      .test(/\.cur$/)
      .use('file-loader')
      .loader('file-loader')
      .tap(() => ({
        name: 'static/cursor/[name].[ext]'
      }))
      .end()
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
      .use('url-loader')
      .tap(() => ({
        limit: 10000,
        name: 'static/img/[name].[hash:7].[ext]'
      }))
      .end()
  },
  configureWebpack: config => {
    config.devtool = '#cheap-module-eval-source-map'
    config.module.rules.push({
      test: /\.js$/,
      loader: 'babel-loader',
      include: [/tlw-leaflet/]
    })
  },
  css: {
    extract: process.env.NODE_ENV === 'production'
  },
  devServer: {
    open: true,
    host: '0.0.0.0',
    port: 9100
  }
}
