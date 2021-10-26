const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const cesiumSource = './node_modules/cesium/Source'
const cesiumWorkers = '../Build/Cesium/Workers'

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
      // .set('cesium', resolve(__dirname, cesiumSource)) 
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
      // config.module
      // .rule('js')
      // .test(/\.js$/)
      // .use(require.resolve('@open-wc/webpack-import-meta-loader'))
      // .end()
  },
  configureWebpack: config => {
    config.devtool = '#cheap-module-eval-source-map'
    // config.amd = {
    //   toUrlUndefined: true
    // }
    // config.module.unknownContextCritical = false
    // config.module.rules.push({
    //   test: /\.js$/,
    //   loader: 'babel-loader',
    //   include: [/tlw-leaflet/]
    // })
    config.plugins.push(new CopyWebpackPlugin([{ from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' }]))
    config.plugins.push(new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Assets'), to: 'Assets' }]))
    config.plugins.push(new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }]))
    config.plugins.push(new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'ThirdParty/Workers'), to: 'ThirdParty/Workers' }]))
    config.plugins.push(new webpack.DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify('./')
    }))
    // config.plugins = [
    //   new CopyWebpackPlugin([{ from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' }]),
    //   new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Assets'), to: 'Assets' }]),
    //   new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }]),
    //   new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'ThirdParty/Workers'), to: 'ThirdParty/Workers' }]),
    //   new webpack.DefinePlugin({
    //     CESIUM_BASE_URL: JSON.stringify('./')
    //   })
    // ]
    config.module.unknownContextCritical = false
    config.module.rules.push({
      test: /.js$/,
      use: { loader: require.resolve('@open-wc/webpack-import-meta-loader') }
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
