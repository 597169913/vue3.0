/**
 * 执行命令，替换cesium源码包 , 修改了源码使其支持4490
 */
const fs = require('fs')
const path = require('path')
const ArcGisMapServerImageryProviderTargetPath = path.join(__dirname, '../../node_modules/cesium/Source/Scene/ArcGisMapServerImageryProvider.js')
const GeographicTilingSchemeTargetPath = path.join(__dirname, '../../node_modules/cesium/Source/Core/GeographicTilingScheme.js')
const EllipsoidTargetPath = path.join(__dirname, '../../node_modules/cesium/Source/Core/Ellipsoid.js')

const ArcGisMapServerImageryProviderPath = path.join(__dirname, './lib/ArcGisMapServerImageryProvider.js')
const EllipsoidPath = path.join(__dirname, '../lib/Ellipsoid.js')
const GeographicTilingSchemePath = path.join(__dirname, '../lib/GeographicTilingScheme.js')

copyFile(ArcGisMapServerImageryProviderPath, ArcGisMapServerImageryProviderTargetPath)
copyFile(EllipsoidPath, EllipsoidTargetPath)
copyFile(GeographicTilingSchemePath, GeographicTilingSchemeTargetPath)

// 复制文件
function copyFile (srcPath, tarPath, cb) {
  var rs = fs.createReadStream(srcPath)
  rs.on('error', function (err) {
    if (err) {
      console.log('read error', srcPath)
    }
    cb && cb(err)
  })

  var ws = fs.createWriteStream(tarPath)
  ws.on('error', function (err) {
    if (err) {
      console.log('write error', tarPath)
    }
    cb && cb(err)
  })

  ws.on('close', function (ex) {
    cb && cb(ex)
  })

  rs.pipe(ws)
  console.log('复制文件完成', srcPath)
}
