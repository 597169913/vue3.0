<template>
  <div class="hello">
    <div class="draw-btns">
      <el-button
        size="small"
        @click="draw('line')"
      >折线</el-button>
      <el-button
        size="small"
        @click="draw('rectangle')"
      >矩形</el-button>
      <el-button
        size="small"
        @click="draw('polygon')"
      >多边形</el-button>
      <el-button
        size="small"
        @click="draw('parallelogram')"
      >平行四边形</el-button>
      <el-button
        size="small"
        @click="draw('regularPolygon')"
      >正多边形</el-button>
      <el-button
        size="small"
        @click="draw('circle')"
      >圆</el-button>
      <el-button
        size="small"
        @click="draw('ellipse')"
      >椭圆</el-button>
      <el-button
        size="small"
        @click="draw('bezier')"
      >贝塞尔曲线</el-button>
      <el-button
        size="small"
        @click="draw('commonArrow')"
      >普通箭头</el-button>
      <el-button
        size="small"
        @click="clear"
      >清除</el-button>
    </div>
    <div id="map"></div>
    <div
      class="drag-box"
      @mousedown="mousedown"
    >
      <span>测试拖动</span>
    </div>
    <div
      class="drag-box1"
      @mousemove="mousemove1"
      @mousedown="mousedown1"
    >
      <span>测试拉伸</span>
    </div>
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
import $ from 'jquery'
export default {
  props: {
    msg: String
  },
  data () {
    return {
      map: null,
      fetures: [],
      clickedPoints: []
    }
  },
  methods: {
    draw (drawType) {
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
    clickHandler (evt) {
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
    mouseDownHandler (evt) {
      this.startPoint = evt.latlng
    },
    mouseUpHandler () {
      if (this.drawType === 'rectangle') {
        this.drop()
      }
    },
    mouseMoveHandler (evt) {
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
    getGuid () {
      const S4 = () => {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    },
    addPolyline (points, groupLayer) {
      if (!this.polyline) {
        this.polyline = L.polyline(points, { color: '#f00', weight: 3, renderer: this.myRenderer }).addTo(groupLayer)
      } else {
        this.polyline.setLatLngs(points)
      }
    },
    // drawArrow(ctx, startX, startY, endX, endY, angle) {

    // },
    dbClickHandler () {
      this.clickedPoints.pop()
      // this.canvasLayer._setPoints(this.clickedPoints)
      this.drop()
    },
    drop () {
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
    clear () {
      const layers = this.layerGroup.getLayers()
      layers.forEach(val => {
        this.layerGroup.removeLayer(val)
      })
    },
    mousedown (event) {
      const $dragDom = $(this.$el).find('.drag-box')
      $dragDom.css({ cursor: 'move' })
      $dragDom[0].style.cursor = 'move'
      const dragDomOffsetLeft = $dragDom.offset().left
      const dragDomOffsetTop = $dragDom.offset().top
      const distanceX = event.clientX - dragDomOffsetLeft
      const distanceY = event.clientY - dragDomOffsetTop
      const screenWidth = document.documentElement.clientWidth
      const screenHeight = document.documentElement.clientHeight
      const dragDomWidth = $dragDom.outerWidth()
      const dragDomHeight = $dragDom.outerHeight()
      const minDragDomLeft = 0
      const minDragDomTop = 0
      let maxDragDomLeft = screenWidth - dragDomWidth - minDragDomLeft
      let maxDragDomTop = screenHeight - dragDomHeight - minDragDomTop
      document.onmousemove = ev => {
        const oevent = ev || event
        let left = oevent.clientX - distanceX
        let top = oevent.clientY - distanceY
        // 边界处理
        if (left < minDragDomLeft) {
          left = minDragDomLeft
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft
        }

        if (top < minDragDomTop) {
          top = minDragDomTop
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop
        }
        $dragDom.css({
          // width: newWidth + 'px',
          // height: newHeight + 'px',
          left: left + 'px',
          top: top + 'px'
          // cursor: this.getCursorType(direction)
        })
      }
      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
        $dragDom.css({
          cursor: 'default'
        })
      }
    },
    getCursorType (direction) {
      const CURSORTYPE = {
        top: 'n-resize',
        bottom: 's-resize',
        left: 'w-resize',
        right: 'e-resize',
        right_top: 'ne-resize', // right_top写法是便于后面代码数据处理
        left_top: 'nw-resize',
        left_bottom: 'sw-resize',
        right_bottom: 'se-resize',
        default: 'default',
      }
      return CURSORTYPE[direction]
    },
    mousemove1 (e) {
      const $dragDom = $(this.$el).find('.drag-box1')
      const x = e.clientX
      const y = e.clientY
      const left = $dragDom.offset().left
      const top = $dragDom.offset().top
      const width = $dragDom.outerWidth()
      const height = $dragDom.outerHeight()
      // this.type = this.checkType($dragDom[0], x, y, left, top, width, height)
      // $dragDom[0].style.cursor = this.getCursorType(this.type) || 'default'
      if (!this.isMoving) {
        this.type = this.checkType($dragDom[0], x, y, left, top, width, height)
        $dragDom[0].style.cursor = this.getCursorType(this.type) || 'default'
      }
    },
    // 判断鼠标悬浮指针类型
    checkType (el, x, y, left, top, width, height) {
      let type
      const margin = 15
      if (x > left + width - margin && el.scrollTop + y <= top + height - margin && top + margin <= y) {
        type = 'right'
      }
      else if (left + margin > x && el.scrollTop + y <= top + height - margin && top + margin <= y) {
        type = 'left'
      } else if (el.scrollTop + y > top + height - margin && x <= left + width - margin && left + margin <= x) {
        type = 'bottom'
      } else if (top + margin > y && x <= left + width - margin && left + margin <= x) {
        type = 'top'
      } else if (x > left + width - margin && el.scrollTop + y > top + height - margin) {
        type = 'right_bottom'
      } else if (left + margin > x && el.scrollTop + y > top + height - margin) {
        type = 'left_bottom'
      } else if (top + margin > y && x > left + width - margin) {
        type = 'right_top'
      } else if (top + margin > y && left + margin > x) {
        type = 'left_top'
      }
      return type || 'default'
    },
    mousedown1 (e) {
      const $dragDom = $(this.$el).find('.drag-box1')
      const x = e.clientX
      const y = e.clientY
      const width = $dragDom.outerWidth()
      const height = $dragDom.outerHeight()
      const left = $dragDom.offset().left
      const top = $dragDom.offset().top
      const screenWidth = document.documentElement.clientWidth || document.body.clientWidth
      const screenHeight = document.documentElement.clientHeight || document.body.clientHeight
      this.type = this.checkType($dragDom[0], x, y, left, top, width, height)
      $dragDom[0].style.cursor = this.getCursorType(this.type) || 'default'
      this.isMoving = true
      document.onmousemove = e => {
        // 移动时禁用默认事件
        e.preventDefault()
        let endX = e.clientX
        let endY = e.clientY
        let diffX = endX - x
        let diffY = endY - y
        let arr
        // 将type转换为数组格式，简化代码判断调用即可
        if (this.type) {
          if (this.type.indexOf('_') == -1) {
            arr = [this.type, '']
          } else {
            arr = this.type.split('_')
          }
          this.boundaryLimit({ left, top, width, height, diffX, diffY, screenHeight, screenWidth, arr })
        }
      }
      // 拉伸结束
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
        this.type = ''
        this.isMoving = false
        $dragDom[0].style.cursor = 'default'
      }
    },
    // 判断边界条件
    boundaryLimit (obj) {
      const $dragDom = $(this.$el).find('.drag-box1')
      const dragDom = $dragDom[0]
      const marginLeft = $dragDom.outerWidth() - $dragDom.width()
      const marginTop = $dragDom.outerHeight() - $dragDom.height()
      const { left, top, width, height, diffX, diffY, screenHeight, screenWidth, arr } = obj
      if (arr[0] === 'right' || arr[1] === 'right') {
        if (width + diffX > screenWidth - left) {
          dragDom.style.width = screenWidth - left + 'px'
        } else {
          dragDom.style.width = width + diffX + 'px'
        }
      }
      if (arr[0] === 'left' || arr[1] === 'left') {
        if (width - diffX > width + left) {
          dragDom.style.width = width + left + 'px'
          dragDom.style.left = - parseInt(marginLeft) + 'px'
        } else {
          dragDom.style.width = width - diffX + 'px'
          // left实际 = left + marginLeft 计算时需要将marginLeft减掉
          dragDom.style.left = left + diffX - parseInt(marginLeft) + 'px'
        }
      }
      if (arr[0] === 'top' || arr[1] === 'top') {
        if (height - diffY > height + top) {
          dragDom.style.height = height + top + 'px'
          dragDom.style.top = - parseInt(marginTop) + 'px'
        } else {
          dragDom.style.height = height - diffY + 'px'
          // top实际 = top + marginTop 计算时需要将marginTop减掉
          dragDom.style.top = top + diffY - parseInt(marginTop) + 'px'
        }
      }
      if (arr[0] === 'bottom' || arr[1] === 'bottom') {
        if (height + diffY > screenHeight - top) {
          dragDom.style.height = screenHeight - top
        } else {
          dragDom.style.height = height + diffY + 'px'
        }
      }
      if (arr[0] === 'default') {
        // let left = x - diffX
        // let top = y - diffY
        // // 边界处理
        // if (x < diffX) {
        //   left = 0
        // } else if (left > maxDragDomLeft) {
        //   left = maxDragDomLeft
        // }

        // if (top < minDragDomTop) {
        //   top = minDragDomTop
        // } else if (top > maxDragDomTop) {
        //   top = maxDragDomTop
        // }
      }
    }
  },
  mounted () {
    const map = L.map('map', { attributionControl: false }).setView([34.2212, 113.8196], 5)
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
  height: 500px;
  margin: 0 auto;
}
.drag-box {
  position: absolute;
  right: 20px;
  bottom: 50px;
  height: 180px;
  width: 200px;
  z-index: 99999;
  border: 1px solid #ccc;
  background-color: wheat;
  display: inline-block;
}
.drag-box1 {
  position: absolute;
  left: 100px;
  bottom: 50px;
  height: 180px;
  width: 200px;
  z-index: 99999;
  border: 1px solid #ccc;
  background-color: wheat;
  display: inline-block;
}
</style>
