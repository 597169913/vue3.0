<template>
  <div class="cesium-home">
    <div id="cesium-container"></div>
  </div>
</template>
<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6"
// import '../../../static/js/lib'
export default {
  data () {
    return {
    }
  },
  mounted () {
    // const $el = document.getElementById('cesium-container')
    // const viewer = new Cesium.Viewer($el, {
    //   imageryProvider: new Cesium.UrlTemplateImageryProvider({
    //     url: 'http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}'
    //   })
    // })
    // this.viewer = viewer
    // const token = '6224bf8cd1e456a8692bba30318fe7b3'
    // const tdtUrl = 'https://t{s}.tianditu.gov.cn/'
    // const subdomains=['0','1','2','3','4','5','6','7']
    let viewer = new Cesium.Viewer("cesium-container", {
      animation: false,  //是否显示动画控件
      baseLayerPicker: false, //是否显示图层选择控件
      geocoder: false, //是否显示地名查找控件
      timeline: false, //是否显示时间线控件
      sceneModePicker: true, //是否显示投影方式控件
      navigationHelpButton: false, //是否显示帮助信息控件
      infoBox: true,  //是否显示点击要素之后显示的信息
      imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=6224bf8cd1e456a8692bba30318fe7b3",
        layer: "tdtBasicLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
        show: false
      })
    })
    // 全球影像中文注记服务
    viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
      url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=6224bf8cd1e456a8692bba30318fe7b3",
      layer: "tdtAnnoLayer",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible",
      show: false
    }))
    // fly
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(103.84, 31.15, 17850000),
      orientation: {
        heading: Cesium.Math.toRadians(348.4202942851978),
        pitch: Cesium.Math.toRadians(-89.74026687972041),
        roll: Cesium.Math.toRadians(0)
      }
    })
    const options = {
      // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
      defaultResetView: Cesium.Rectangle.fromDegrees(80, 22, 130, 50),
      // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
      enableCompass: true,
      // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
      enableZoomControls: true,
      // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
      enableDistanceLegend: true,
      // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
      enableCompassOuterRing: true
    }
    options.defaultResetView = Cesium.Rectangle.fromDegrees(80, 22, 130, 50)
    CesiumNavigation(viewer, options)
  }
}
</script>
<style scoped>
.cesium-home {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>