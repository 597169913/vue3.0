<template>
  <div class="hello">
    <div class="draw-btns">
      <el-button size="small">折线</el-button>
      <el-button size="small">矩形</el-button>
      <el-button size="small">多边形</el-button>
      <el-button size="small">平行四边形</el-button>
      <el-button size="small">正多边形</el-button>
    </div>
    <div id="map"></div>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import L from 'leaflet'
// import axios from 'axios'
// import geojsonvt from 'geojson-vt'
export default {
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
    // const myRenderer = L.canvas({ padding: 0.5 })
    // const marker = L.circle([34.2212, 113.8196], { renderer: myRenderer })
    // marker.addTo(map)
    // const marker2 = L.circle([35.2212, 113.8196], { renderer: myRenderer })
    // marker2.addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: ''
    }).addTo(map)
    this.map = map
    const featurGroup = new L.featurGroup()
    this.featurGroup = featurGroup
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#map {
  width: 1000px;
  height: 800px;
  margin: 0 auto;
}
</style>
