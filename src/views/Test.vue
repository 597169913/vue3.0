<template>
  <div class="hello">
    <div class="draw-btns">
      <el-button size="small" @click="draw('line')">折线</el-button>
      <el-button size="small" @click="draw('rectangle')">矩形</el-button>
      <el-button size="small" @click="draw('polygon')">多边形</el-button>
      <el-button size="small" @click="draw('parallelogram')">平行四边形</el-button>
      <el-button size="small" @click="draw('regularPolygon')">正多边形</el-button>
      <el-button size="small" @click="draw('circle')">圆</el-button>
      <el-button size="small" @click="draw('ellipse')">椭圆</el-button>
      <el-button size="small" @click="clear">清除</el-button>
    </div>
    <div id="map"></div>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import L from 'leaflet'
import MapEvent from 'views/base/MapEvent'
import Ellipse from './draw/Ellipse'
// import axios from 'axios'
// import geojsonvt from 'geojson-vt'
export default {
  props: {
    msg: String
  },
  data() {
    return {
      map: null,
      fetures: [],
      clickedPoints: []
    }
  },
  methods: {
    draw(drawType) {
      this.map.doubleClickZoom.disable()
      this.map.dragging.disable()
      this.drawType = drawType
      this.clickedPoints = []
      switch (drawType) {
        case 'line':
        case 'polygon':
        case 'regularPolygon':
          this.mapEvent.addEventHandler('click', this.clickHandler)
          this.mapEvent.addEventHandler('dblclick', this.dbClickHandler)
          break
        case 'rectangle':
        case 'circle':
        case 'parallelogram':
        case 'ellipse':
          this.mapEvent.addEventHandler('click', this.clickHandler)
          // this.mapEvent.addEventHandler('dbclick', this.dbClickHandler)
          break
      }
      this.mapEvent.addEventHandler('mousemove', this.mouseMoveHandler)
    },
    clickHandler(evt) {
      const circleMarker = L.circleMarker(evt.latlng, { fillColor: '#fff', weight: 2, fillOpacity: 1, radius: 6 })
      circleMarker.addTo(this.featureGroup)
      if (this.drawType === 'rectangle' || this.drawType === 'circle' || this.drawType === 'parallelogram' || this.drawType === 'ellipse') {
        if (this.rectangle || this.circle || this.polygon) {
          this.drop()
        } else {
          this.startPoint = evt.latlng
          this.onAttach = true
        }
      }
      this.clickedPoints.push(evt.latlng)
    },
    mouseDownHandler(evt) {
      this.startPoint = evt.latlng
    },
    mouseUpHandler() {
      if (this.drawType === 'rectangle') {
        this.drop()
      }
    },
    mouseMoveHandler(evt) {
      const points = [...this.clickedPoints]
      points.push(evt.latlng)
      const crs = this.map.options.crs
      const newPoints = []
      switch (this.drawType) {
        case 'line':
          this.addPolyline(points)
          break
        case 'rectangle':
          if (!this.rectangle) {
            if (this.startPoint) {
              const rectangle = L.rectangle([this.startPoint, evt.latlng], { color: '#f00', weight: 3, fillColor: '#ffffff' })
              this.layerGroup.addLayer(rectangle)
              this.rectangle = rectangle
            }
          } else {
            this.rectangle.setBounds([this.startPoint, evt.latlng])
          }
          break
        case 'polygon':
          if (points.length >= 3) {
            if (!this.polygon) {
              this.polygon = L.polygon(points, { color: '#f00', weight: 3, fillColor: '#ffffff' }).addTo(this.layerGroup)
            } else {
              this.polygon.setLatLngs(points)
            }
          } else {
            this.addPolyline(points)
          }
          break
        case 'parallelogram':
          if (points.length >= 3) {
            // 计算平行四边形第四个顶点坐标
            const point1 = crs.project(points[0])
            const point2 = crs.project(points[1])
            const point3 = crs.project(evt.latlng)
            const x = point3.x - (point2.x - point1.x)
            const y = point3.y - (point2.y - point1.y)
            const point4 = new L.point(x, y)
            points.push(crs.unproject(point4))
            if (!this.polygon) {
              this.polygon = L.polygon(points, { color: '#f00', weight: 3, fillColor: '#ffffff' }).addTo(this.layerGroup)
            } else {
              this.polygon.setLatLngs(points)
            }
          } else {
            this.addPolyline(points)
          }
          break
        case 'regularPolygon':
          if (this.clickedPoints.length > 0) {
            const count = this.clickedPoints.length + 2
            // newPoints.push(evt.latlng)
            const centerPoint = crs.project(points[0])
            const point1 = crs.project(evt.latlng)
            const radius = centerPoint.distanceTo(point1)
            const startAnagle = (180 / Math.PI) * Math.atan((point1.y - centerPoint.y) / (point1.x - centerPoint.x))
            const step = 360 / count
            for (let i = 0; i < count; i++) {
              const angle = -((step * i + startAnagle) * 2 * Math.PI) / 360
              const disX = centerPoint.x - Math.sin(angle) * radius
              const disY = centerPoint.y - Math.cos(angle) * radius
              const newPoint = new L.point(disX, disY)
              newPoints.push(crs.unproject(newPoint))
            }
          }
          if (!this.polygon) {
            this.polygon = L.polygon(newPoints, { color: '#f00', weight: 3, fillColor: '#ffffff' }).addTo(this.layerGroup)
          } else {
            this.polygon.setLatLngs(newPoints)
          }
          break
        case 'circle':
          if (this.startPoint) {
            const p1 = crs.project(points[0])
            const p2 = crs.project(evt.latlng)
            const distance = p1.distanceTo(p2)
            if (!this.circle) {
              this.circle = L.circle(points[0], { radius: distance, color: '#f00', weight: 3, fillColor: '#ffffff' }).addTo(this.layerGroup)
            } else {
              this.circle.setRadius(distance)
            }
          }
          break
        case 'ellipse':
          if (points.length >= 3) {
            const centerPoint = crs.project(points[0])
            const point1 = crs.project(points[1])
            const point2 = crs.project(points[2])
            const a = points[0].distanceTo(points[1])
            const tilt = -(180 / Math.PI) * Math.atan((point1.y - centerPoint.y) / (point1.x - centerPoint.x))
            const deg1 = -(180 / Math.PI) * Math.atan((point2.y - centerPoint.y) / (point2.x - centerPoint.x))
            const b = points[0].distanceTo(points[2]) * Math.cos(deg1 * Math.PI)
            if (!this.polygon) {
              this.polygon = new Ellipse(points[0], [a, b], tilt, { color: '#f00', weight: 3, fillColor: '#ffffff' }).addTo(this.layerGroup)
            } else {
              let tilt = 0
              if (a > b) {
                tilt = -(180 / Math.PI) * Math.atan((point1.y - centerPoint.y) / (point1.x - centerPoint.x))
              } else {
                tilt = -(180 / Math.PI) * Math.atan((point2.y - centerPoint.y) / (point2.x - centerPoint.x))
              }
              this.polygon.setTilt(tilt)
              this.polygon.setRadius(a > b ? [a, b] : [b, a])
            }
          } else {
            this.addPolyline(points)
          }
          break
      }
    },
    addPolyline(points) {
      if (!this.polyline) {
        this.polyline = L.polyline(points, { color: '#f00', weight: 3 }).addTo(this.layerGroup)
      } else {
        this.polyline.setLatLngs(points)
      }
    },
    dbClickHandler() {
      this.drop()
    },
    drop() {
      this.onAttach = false
      this.startPoint = null
      this.mapEvent.deactive()
      this.rectangle = null
      this.circle = null
      this.polyline = null
      this.polygon = null
      const layers = this.featureGroup.getLayers()
      layers.forEach(val => {
        this.featureGroup.removeLayer(val)
      })
    },
    clear() {
      const layers = this.layerGroup.getLayers()
      layers.forEach(val => {
        this.layerGroup.removeLayer(val)
      })
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
    const layerGroup = new L.layerGroup().addTo(this.map)
    this.layerGroup = layerGroup
    this.mapEvent = new MapEvent(this.map)
    this.featureGroup = L.featureGroup().addTo(this.map)
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
