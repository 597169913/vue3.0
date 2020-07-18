import L from 'leaflet'
import CustomLayer from '../layer/CustomLayer'
import Bezier from './Bezier'
export const Curve = CustomLayer.extend({
  initialize(options) {
    L.setOptions(this, options);
    this.drawGraphicsMap = new Map();
    // this._setPoints(this.options.points)
  },
  _setPoints(points) {
    this.points = points
    this._redrawCanvas()
  },
  drawGraphic(points, id) {
    const ctx = this._container.getContext('2d')
    if (id) {
      if (this.drawGraphicsMap.has(id)) {
        const graphic = this.drawGraphicsMap.get(id)
        graphic._setPoints(points)         
      } else {
        const graphic = new Bezier(ctx, {points, id, map: this._map})
        this.drawGraphicsMap.set(id, graphic)
      }
    }
  },
  getGuid() {
    const S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  },
  _requestRedraw() {
    this._redrawRequest = L.Util.requestAnimFrame(this._redrawCanvas, this)
  },
  _redrawCanvas() {
    if (this._container) {
      const ctx = this._container.getContext('2d');
      ctx.clearRect(0, 0, this._container.width, this._container.height);
      this.drawGraphicsMap.forEach(value => {
        value.redraw();
      })
      
    }
  }
})
export default Curve