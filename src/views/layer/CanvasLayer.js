import L from 'leaflet'
import Vector from 'views/draw/Vector'
const CanvasLayer = L.Layer.extend({
  options: {},
  initialize(options) {
    L.setOptions(this, options);
    this.points = [];
    this._canvas = null;
  },
  onAdd(map) {
    this._map = map;

    if (!this._canvas) {
        this._initCanvas();
    }

    if (this.options.pane) {
        this.getPane().appendChild(this._canvas);
    }else{
        map._panes.overlayPane.appendChild(this._canvas);
    }

    map.on('moveend', this._reset, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this);
    }

    this._reset();
},
setPoints(points){
  this.points = points;
  this._redraw()
},

onRemove (map) {
    if (this.options.pane) {
        this.getPane().removeChild(this._canvas);
    }else{
        map.getPanes().overlayPane.removeChild(this._canvas);
    }

    map.off('moveend', this._reset, this);

    if (map.options.zoomAnimation) {
        map.off('zoomanim', this._animateZoom, this);
    }
},

addTo(map) {
    map.addLayer(this);
    return this;
},

_initCanvas () {
    var canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-layer leaflet-layer');

    var originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
    canvas.style[originProp] = '50% 50%';

    var size = this._map.getSize();
    canvas.width  = size.x;
    canvas.height = size.y;

    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));
    
    // this._heat = simpleheat(canvas);
    this._ctx = canvas.getContext('2d');
    // this._updateOptions();
},
_reset() {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);

    var size = this._map.getSize();

    if (this._canvas.width !== size.x) {
        this._canvas.width  = size.x;
    }
    if (this._canvas.width !== size.y) {
        this._canvas.height = size.y;
    }

    this._redraw();
},
_redraw() {
    var size = this._map.getSize();
    const ctx = this._ctx
    ctx.clearRect(0, 0,size.x, size.y);
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
  _animateZoom: function (e) {
    var scale = this._map.getZoomScale(e.zoom),
        offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

    if (L.DomUtil.setTransform) {
        L.DomUtil.setTransform(this._canvas, offset, scale);

    } else {
        this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
    }
}
})
export default CanvasLayer;