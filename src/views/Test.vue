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
import customLayer from './layer/CustomLayer'
import '@elfalem/leaflet-curve'
import Vector from './draw/Vector'
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
              this.polygon = L.polygon(points, { color: '#f00', weight: 3, fillColor: '#ffffff' }).addTo(this.layerGroup)
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
            this.polygon = L.polygon(newPoints, { color: '#f00', weight: 3, fillColor: '#ffffff' }).addTo(this.layerGroup)
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
              this.circle = L.circle(points[0], { radius: distance, color: '#f00', weight: 3, fillColor: '#ffffff' }).addTo(this.layerGroup)
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
            canvas.width = 1200
            canvas.height = 960
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
              this.canvasLayer = new customLayer({
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
            const canvas = document.createElement('canvas')
            canvas.width = 1000
            canvas.height = 800
            const ctx = canvas.getContext('2d')
            this.drawBezier(ctx, points)
            if (!this.canvasLayer) {
              this.canvasLayer = new customLayer({
                container: canvas,
                redrawCanvas: context => this.drawBezier(context, this.clickedPoints),
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
              this.canvasLayer = new customLayer({
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
    addPolyline(points, groupLayer) {
      if (!this.polyline) {
        this.polyline = L.polyline(points, { color: '#f00', weight: 3 }).addTo(groupLayer)
      } else {
        this.polyline.setLatLngs(points)
      }
    },
    drawBezier(ctx, points) {
      const newPs = points.map(val => this.map.latLngToContainerPoint(val))
      const controlPoints = this.getControlPoints(newPs)
      ctx.lineWidth = 3
      ctx.strokeStyle = 'red'
      ctx.beginPath()
      const len = newPs.length
      let int = 0
      for (let i = 0; i < len - 1; i++) {
        ctx.moveTo(newPs[i].x, newPs[i].y)
        const p = newPs[i + 1]
        // let cp1 = controlPoints[i * 2]
        // let cp2 = controlPoints[i * 2 + 1]
        // ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y)
        let cp1
        let cp2
        if (i === 0) {
          ctx.quadraticCurveTo(controlPoints[0].x, controlPoints[0].y, p.x, p.y)
          int++
        } else if (i < len - 2) {
          cp1 = controlPoints[int]
          cp2 = controlPoints[int + 1]
          ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y)
          int += 2
        } else if (i === len - 2) {
          ctx.quadraticCurveTo(controlPoints[controlPoints.length - 1].x, controlPoints[controlPoints.length - 1].y, newPs[newPs.length - 1].x, newPs[newPs.length - 1].y)
        }
      }
      ctx.stroke()
    },
    getControlPoints(points) {
      const rt = 0.333
      // const n = points.length - 2
      const arr = []
      for (let i = 0; i < points.length - 2; i++) {
        const a = points[i]
        const b = points[i + 1]
        const c = points[i + 2]
        const v1 = Vector.sub(a, b)
        const v2 = Vector.sub(c, b)
        const v1Len = Vector.length(v1),
          v2Len = Vector.length(v2)
        const centerV = Vector.normalize(Vector.add(Vector.normalize(v1), Vector.normalize(v2)))
        var ncp1 = { x: centerV.y, y: centerV.x * -1 }
        var ncp2 = { x: centerV.y * -1, y: centerV.x }
        if (Vector.angle(ncp1, v1) < 90) {
          const p1 = Vector.add(Vector.multiply(ncp1, v1Len * rt), b)
          const p2 = Vector.add(Vector.multiply(ncp2, v2Len * rt), b)
          arr.push(p1, p2)
        } else {
          const p1 = Vector.add(Vector.multiply(ncp1, v2Len * rt), b)
          const p2 = Vector.add(Vector.multiply(ncp2, v1Len * rt), b)
          arr.push(p2, p1)
        }
      }
      return arr
    },
    getControlPoints1(points) {
      const rt = 0.333
      // const n = points.length - 2
      const arr = []
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i]
        const b = points[i + 1]
        const c = points[i + 2]
        const d = points[i - 1]
        let A = { x: 0, y: 0 }
        let B = { x: 0, y: 0 }
        // 控制点获取算法说明：
        if (i === 0) {
          A.x = a.x + rt * (b.x - a.x)
          A.y = a.y + rt * (b.y - a.y)
          B.x = b.x - rt * (c.x - a.x)
          B.y = b.y - rt * (c.y - a.y)
        } else if (i === points.length - 2) {
          A.x = a.x + rt * (b.x - d.x)
          A.y = a.y + rt * (b.y - d.y)
          B.x = b.x - rt * (b.x - a.x)
          B.y = b.y - rt * (b.y - a.y)
        } else if (i < points.length - 2) {
          A.x = a.x + rt * (b.x - d.x)
          A.y = a.y + rt * (b.y - d.y)
          B.x = b.x - rt * (c.x - a.x)
          B.y = b.y - rt * (c.y - a.y)
        }
        arr.push(A, B)
      }
      return arr
    },
    getControlPoints2(points) {
      const rt = 0.333
      // const n = points.length - 2
      const arr = []
      for (let i = 0; i < points.length; i++) {
        const a = points[i]
        const b = points[i + 1]
        const d = points[i - 1]
        if (i === 0 || i === points.length - 1) {
          arr.push(a)
        } else {
          const v = Vector.scale(Vector.sub(b, d), rt)
          let d0 = Vector.distance(a, d)
          let d1 = Vector.distance(a, b)
          let sum = d0 + d1
          if (sum !== 0) {
            d0 /= sum
            d1 /= sum
          }
          const v1 = Vector.scale(v, -d0)
          const v2 = Vector.scale(v, d1)
          let cp0 = Vector.add(a, v1)
          let cp1 = Vector.add(a, v2)
          arr.push(cp0, cp1)
        }
      }
      return arr
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
      this.curve = null
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
