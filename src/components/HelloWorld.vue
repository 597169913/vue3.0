<template>
  <div class="hello">
    <div class="draw-btns"></div>
    <div id="map"></div>
    <!-- <canvas id="canvas"></canvas> -->
  </div>
</template>

<script>
import L from 'leaflet'
// import axios from 'axios'
// import geojsonvt from 'geojson-vt'
import '@elfalem/leaflet-curve'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      map: null,
      fetures: []
    }
  },
  mounted() {
    const map = L.map('map').setView([34.2212, 113.8196], 5)
    const myRenderer = L.canvas({ padding: 0.5 })
    const marker = L.circle([34.2212, 113.8196], { renderer: myRenderer })
    marker.addTo(map)
    const marker2 = L.circle([35.2212, 113.8196], { renderer: myRenderer })
    marker2.addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: ''
    }).addTo(map)
    this.map = map
    var path = L.curve(
      [
        'M',
        [50.54136296522163, 28.520507812500004],
        'Q',
        [52.214338608258224, 28.564453125000004],
        [48.45835188280866, 33.57421875000001],
        [50.680797145321655, 33.83789062500001],
        'V',
        [48.40003249610685],
        'L',
        [47.45839225859763, 31.201171875],
        [48.40003249610685, 28.564453125000004],
        'Z'
      ],
      { color: 'red', fill: true }
    ).addTo(map)
    this.map.flyToBounds(path.getBounds())
    // const image = new Image()
    // image.src = '/grass.jpg'
    // image.onload = () => {
    //   this.image = image
    //   const canvas = document.getElementById('canvas')
    //   canvas.width = 300
    //   canvas.height = 300
    //   const ctx = canvas.getContext('2d')
    //   var pattern = ctx.createPattern(image, 'repeat')
    //   ctx.fillStyle = pattern
    //   ctx.fillRect(0, 0, 800, 600)
    // }
    // const gridLayer = L.gridLayer({ maxZoom: 18 })
    // gridLayer.createTile = coords => {
    //   const tile = L.DomUtil.create('canvas', 'leaflet-tile')
    //   const ctx = tile.getContext('2d')
    //   const size = gridLayer.getTileSize()
    //   tile.width = size.x
    //   tile.height = size.y
    //   // 将切片号乘以切片分辨率，默认为256pixel,得到切片左上角的绝对像素坐标
    //   const nwPoint = coords.scaleBy(size)
    //   // 根据绝对像素坐标，以及缩放层级，反投影得到其经纬度
    //   // const nw = map.unproject(nwPoint, coords.z)
    //   //从该切片左上角开始画，画一个切片大小的无填充矩形
    //   ctx.strokeRect(nwPoint.x, nwPoint.y, size.x, size.y)
    //   // ctx.fillStyle = 'black'
    //   //x,y,z显示
    //   // ctx.fillText('x: ' + coords.x + ', y: ' + coords.y + ', zoom: ' + coords.z, 50, 60)
    //   // //经纬度坐标
    //   // ctx.fillText('lat: ' + nw.lat + ', lon: ' + nw.lng, 50, 80)
    //   //线的颜色
    //   // ctx.strokeStyle = 'black'
    //   var pattern = ctx.createPattern(image, 'repeat')
    //   ctx.fillStyle = pattern
    //   //这是canvans的方法
    //   // ctx.beginPath()
    //   // ctx.moveTo(0, 0)
    //   // ctx.lineTo(size.x - 1, 0)
    //   // ctx.lineTo(size.x - 1, size.y - 1)
    //   // ctx.lineTo(0, size.y - 1)
    //   // ctx.closePath()
    //   ctx.stroke()
    //   return tile
    // }
    // gridLayer.addTo(map)
    // // const canvasLayer = new L.CanvasGeojsonLayer()
    // // canvasLayer.render = function() {}
    // // const image = new Image()
    // // image.src = '/grass.jpg'
    // // image.onload = () => {
    // //   this.image = image
    // //   const canvas = document.getElementById('canvas')
    // //   canvas.width = 300
    // //   canvas.height = 300
    // //   const ctx = canvas.getContext('2d')
    // //   var pattern = ctx.createPattern(image, 'repeat')
    // //   ctx.fillStyle = pattern
    // //   ctx.fillRect(0, 0, 800, 600)
    // // }
    // axios.get('http://10.0.4.4/portal-service/rest/district-geo-json/children/410000').then(res => {
    //   if (res.status === 200) {
    //     this.geoJson = res.data
    //     this.fetures = res.data.features
    //     const geoJsonLayer = L.geoJson(res.data, {
    //       renderer: myRenderer
    //     })
    //     geoJsonLayer.addTo(map)
    //   }
    // })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#map {
  width: 1000px;
  height: 500px;
  margin: 0 auto;
}
</style>
