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
      <el-button size="small" @click="draw('bezier')">贝塞尔曲线</el-button>
      <el-button size="small" @click="draw('commonArrow')">普通箭头</el-button>
      <el-button size="small" @click="clear">清除</el-button>
    </div>
    <div id="map"></div>
  </div>
</template>

<script>
import L from 'leaflet'
import MapEvent from 'views/base/MapEvent'
// import Ellipse from './draw/Ellipse'
// import CanvasLayer from './layer/CustomLayer'
// import '@elfalem/leaflet-curve'
// import Vector from './draw/Vector'
// import Curve from './draw/Curve'
import CanvasLayer from './layer/CanvasLayer'
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
        case 'bezier':
          this.mapEvent.addEventHandler('click', this.clickHandler)
          this.mapEvent.addEventHandler('dblclick', this.dbClickHandler)
          this.guid = this.getGuid()
          break
        case 'rectangle':
        case 'circle':
        case 'parallelogram':
        case 'ellipse':
        case 'commonArrow':
          this.mapEvent.addEventHandler('click', this.clickHandler)
          // this.mapEvent.addEventHandler('dbclick', this.dbClickHandler)
          break
      }
      this.mapEvent.addEventHandler('mousemove', this.mouseMoveHandler)
    },
    clickHandler(evt) {
      const circleMarker = L.circleMarker(evt.latlng, { fillColor: '#fff', weight: 2, fillOpacity: 1, radius: 6 })
      circleMarker.addTo(this.featureGroup)
      const drawTypes = ['rectangle', 'circle', 'parallelogram', 'ellipse', 'commonArrow']
      if (drawTypes.includes(this.drawType)) {
        if (this.rectangle || this.circle || this.polygon || this.canvasLayer) {
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
          this.addPolyline(points, this.layerGroup)
          break
        case 'rectangle':
          if (!this.rectangle) {
            if (this.startPoint) {
              const rectangle = L.rectangle([this.startPoint, evt.latlng], { color: '#f00', weight: 3, fillColor: '#ffffff', renderer: this.myRenderer })
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
              this.polygon = L.polygon(points, { color: '#f00', weight: 3, fillColor: '#ffffff', renderer: this.myRenderer }).addTo(this.layerGroup)
            } else {
              this.polygon.setLatLngs(points)
            }
          } else {
            this.addPolyline(points, this.featureGroup)
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
              this.polygon = L.polygon(points, { color: '#f00', weight: 3, fillColor: '#ffffff', renderer: this.myRenderer }).addTo(this.layerGroup)
            } else {
              this.polygon.setLatLngs(points)
            }
          } else {
            this.addPolyline(points, this.featureGroup)
          }
          break
        case 'regularPolygon':
          if (this.clickedPoints.length > 0) {
            const n = this.clickedPoints.length + 2
            const centerPoint = crs.project(points[0])
            const point1 = crs.project(evt.latlng)
            const radius = centerPoint.distanceTo(point1)
            const startAnagle = (180 / Math.PI) * Math.atan((point1.y - centerPoint.y) / (point1.x - centerPoint.x))
            const step = 360 / n
            for (let i = 0; i < n; i++) {
              const angle = -((step * i + startAnagle) * 2 * Math.PI) / 360
              const disX = centerPoint.x + Math.sin(angle) * radius
              const disY = centerPoint.y + Math.cos(angle) * radius
              const newPoint = new L.point(disX, disY)
              newPoints.push(crs.unproject(newPoint))
            }
          }
          if (!this.polygon) {
            this.polygon = L.polygon(newPoints, { color: '#f00', weight: 3, fillColor: '#ffffff', renderer: this.myRenderer }).addTo(this.layerGroup)
          } else {
            this.polygon.setLatLngs(newPoints)
          }
          break
        case 'circle':
          if (this.startPoint) {
            // 利用投影坐标计算会有误差，改用经度计算距离
            // const p1 = crs.project(points[0])
            // const p2 = crs.project(evt.latlng)
            const distance = points[0].distanceTo(evt.latlng)
            if (!this.circle) {
              this.circle = L.circle(points[0], { radius: distance, color: '#f00', weight: 3, fillColor: '#ffffff', renderer: this.myRenderer }).addTo(this.layerGroup)
            } else {
              this.circle.setRadius(distance)
            }
          }
          break
        case 'ellipse':
          if (points.length >= 3) {
            const centerPoint = crs.project(points[0])
            // const point1 = crs.project(points[1])
            const point2 = crs.project(points[2])
            const a = points[0].distanceTo(points[1])
            const deg1 = 90 - (180 / Math.PI) * Math.atan((point2.y - centerPoint.y) / (point2.x - centerPoint.x))
            const b = Math.abs(centerPoint.distanceTo(point2) * Math.cos((deg1 * 2 * Math.PI) / 360))
            const canvas = document.createElement('canvas')
            canvas.width = 1000
            canvas.height = 800
            const ctx = canvas.getContext('2d')
            const cp = this.map.latLngToContainerPoint(points[0])
            const k = 0.5522848
            const x = cp.x
            const y = cp.y
            const ox = a * k // 水平控制点偏移量
            const oy = b * k // 垂直控制点偏移量
            // 从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
            ctx.beginPath()
            ctx.moveTo(x - a, y)
            ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b)
            ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y)
            ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b)
            ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y)
            ctx.closePath()
            if (!this.canvasLayer) {
              this.canvasLayer = new CanvasLayer({
                container: canvas,
                opacity: 1, // Opacity of the layer.
                visible: true, // Visible of the layer.
                zIndex: 100 // The explicit zIndex of the layer.
              }).addTo(this.layerGroup)
            } else {
              this.canvasLayer.setContainer(canvas)
            }
          } else {
            this.addPolyline(points, this.featureGroup)
          }
          break
        case 'bezier':
          if (points.length >= 3) {
            this.featureGroup.removeLayer(this.polyline)
            if (!this.canvasLayer) {
              this.canvasLayer = new CanvasLayer({
                opacity: 1, // Opacity of the layer.
                visible: true, // Visible of the layer.
                zIndex: 100 // The explicit zIndex of the layer.
              }).addTo(this.map)
            } else {
              this.canvasLayer.setPoints(points)
            }
          } else {
            this.addPolyline(points, this.featureGroup)
          }
          break
        case 'commonArrow':
          if (this.clickedPoints.length > 0) {
            const newPs = points.map(val => this.map.latLngToLayerPoint(val))
            const canvas = document.createElement('canvas')
            canvas.width = 1000
            canvas.height = 800
            const ctx = canvas.getContext('2d')
            ctx.lineWidth = 3
            ctx.strokeStyle = 'red'
            ctx.beginPath()
            ctx.moveTo(newPs[0].x, newPs[0].y)
            ctx.lineTo(newPs[1].x, newPs[1].y)
            ctx.closePath()
            ctx.stroke()
            if (!this.canvasLayer) {
              this.canvasLayer = new CanvasLayer({
                container: canvas,
                opacity: 1, // Opacity of the layer.
                visible: true, // Visible of the layer.
                zIndex: 100 // The explicit zIndex of the layer.
              }).addTo(this.layerGroup)
            } else {
              this.canvasLayer.setContainer(canvas)
            }
          }
          break
      }
    },
  getGuid() {
    const S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  },
    addPolyline(points, groupLayer) {
      if (!this.polyline) {
        this.polyline = L.polyline(points, { color: '#f00', weight: 3, renderer: this.myRenderer }).addTo(groupLayer)
      } else {
        this.polyline.setLatLngs(points)
      }
    },
    // drawArrow(ctx, startX, startY, endX, endY, angle) {

    // },
    dbClickHandler() {
      this.clickedPoints.pop()
      // this.canvasLayer._setPoints(this.clickedPoints)
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
      this.canvasLayer = null
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
    const map = L.map('map', {attributionControl: false}).setView([34.2212, 113.8196], 5)
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
    this.myRenderer = L.canvas({ padding: 0.5 })
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
