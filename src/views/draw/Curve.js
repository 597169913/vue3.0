import L from 'leaflet'
import CustomLayer from '../layer/CustomLayer'
import Vector from './Vector'
export const Curve = CustomLayer.extend({
  initialize(options) {
    L.setOptions(this, options);
    this._setPoints(this.options.points)
  },
  _setPoints(points) {
    this.points = points
    this._redrawCanvas()
  },
  _requestRedraw() {
    this._redrawRequest = L.Util.requestAnimFrame(this._redrawCanvas, this)
  },
  _redrawCanvas() {
    if (this._container) {
      const ctx = this._container.getContext('2d');
      ctx.clearRect(0, 0, this._container.width, this._container.height);
      if (this.points.length > 0) {
        const newPs = this.points.map(val => this._map.latLngToContainerPoint(val))
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
      }
    }
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
  }
})
export default Curve