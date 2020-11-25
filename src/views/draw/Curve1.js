/*
 * Leaflet.curve v0.6.0 - a plugin for Leaflet mapping library. https://github.com/elfalem/Leaflet.curve
 * (c) elfalem 2015-2020
 */
/*
 * note that SVG (x, y) corresponds to (long, lat)
 */
import L from 'leaflet'
import '@tweenjs/tween.js'
export const Curve = L.Path.extend({
  options: {
  },

  initialize(path, options) {
    L.setOptions(this, options);
    this._setPath(path);
  },

  // Added to follow the naming convention of L.Polyline and other Leaflet component classes:
  // (https://leafletjs.com/reference-1.6.0.html#polyline-setlatlngs)
  setLatLngs(path) {
    return this.setPath(path);
  },

  _updateBounds() {
    // Empty function to satisfy L.Path.setStyle() method
  },

  getPath() {
    return this._coords;
  },

  setPath(path) {
    this._setPath(path);
    return this.redraw();
  },

  getBounds() {
    return this._bounds;
  },

  _setPath(path) {
    this._coords = path;
    this._bounds = this._computeBounds()
  },

  _computeBounds() {
    const bound = new L.LatLngBounds()
    let lastPoint
    let lastCommand
    let coord
    for (let i = 0; i < this._coords.length; i++) {
      coord = this._coords[i];
      if (typeof coord == 'string' || coord instanceof String) {
        lastCommand = coord;
      } else if (lastCommand == 'H') {
        bound.extend([lastPoint.lat, coord[0]]);
        lastPoint = new L.latLng(lastPoint.lat, coord[0]);
      } else if (lastCommand == 'V') {
        bound.extend([coord[0], lastPoint.lng]);
        lastPoint = new L.latLng(coord[0], lastPoint.lng);
      } else if (lastCommand == 'C') {
        const controlPoint1 = new L.latLng(coord[0], coord[1]);
        coord = this._coords[++i];
        const controlPoint2 = new L.latLng(coord[0], coord[1]);
        coord = this._coords[++i];
        const endPoint = new L.latLng(coord[0], coord[1]);

        bound.extend(controlPoint1);
        bound.extend(controlPoint2);
        bound.extend(endPoint);

        endPoint.controlPoint1 = controlPoint1;
        endPoint.controlPoint2 = controlPoint2;
        lastPoint = endPoint;
      } else if (lastCommand == 'S') {
        const controlPoint2 = new L.latLng(coord[0], coord[1]);
        coord = this._coords[++i];
        const endPoint = new L.latLng(coord[0], coord[1]);

        let controlPoint1 = lastPoint;
        if (lastPoint.controlPoint2) {
          const diffLat = lastPoint.lat - lastPoint.controlPoint2.lat;
          const diffLng = lastPoint.lng - lastPoint.controlPoint2.lng;
          controlPoint1 = new L.latLng(lastPoint.lat + diffLat, lastPoint.lng + diffLng);
        }

        bound.extend(controlPoint1);
        bound.extend(controlPoint2);
        bound.extend(endPoint);

        endPoint.controlPoint1 = controlPoint1;
        endPoint.controlPoint2 = controlPoint2;
        lastPoint = endPoint;
      } else if (lastCommand == 'Q') {
        const controlPoint = new L.latLng(coord[0], coord[1]);
        coord = this._coords[++i];
        const endPoint = new L.latLng(coord[0], coord[1]);

        bound.extend(controlPoint);
        bound.extend(endPoint);

        endPoint.controlPoint = controlPoint;
        lastPoint = endPoint;
      } else if (lastCommand == 'T') {
        const endPoint = new L.latLng(coord[0], coord[1]);

        let controlPoint = lastPoint;
        if (lastPoint.controlPoint) {
          const diffLat = lastPoint.lat - lastPoint.controlPoint.lat;
          const diffLng = lastPoint.lng - lastPoint.controlPoint.lng;
          controlPoint = new L.latLng(lastPoint.lat + diffLat, lastPoint.lng + diffLng);
        }

        bound.extend(controlPoint);
        bound.extend(endPoint);

        endPoint.controlPoint = controlPoint;
        lastPoint = endPoint;
      } else {
        bound.extend(coord);
        lastPoint = new L.latLng(coord[0], coord[1]);
      }
    }
    return bound;
  },

  getCenter() {
    return this._bounds.getCenter();
  },

  _update() {
    if (!this._map) { return; }

    this._updatePath();
  },

  _updatePath() {
    if (this._usingCanvas) {
      this._updateCurveCanvas();
    } else {
      this._updateCurveSvg();
    }
  },

  _project() {
    let coord, lastCoord, curCommand, curPoint;

    this._points = [];

    for (let i = 0; i < this._coords.length; i++) {
      coord = this._coords[i];
      if (typeof coord == 'string' || coord instanceof String) {
        this._points.push(coord);
        curCommand = coord;
      } else {
        switch (coord.length) {
          case 2:
            curPoint = this._latLngToPointFn.call(this._map, coord);
            lastCoord = coord;
            break;
          case 1:
            if (curCommand == 'H') {
              curPoint = this._latLngToPointFn.call(this._map, [lastCoord[0], coord[0]]);
              lastCoord = [lastCoord[0], coord[0]];
            } else {
              curPoint = this._latLngToPointFn.call(this._map, [coord[0], lastCoord[1]]);
              lastCoord = [coord[0], lastCoord[1]];
            }
            break;
        }
        this._points.push(curPoint);
      }
    }
  },

  _curvePointsToPath(points) {
    let point, curCommand, str = '';
    for (let i = 0; i < points.length; i++) {
      point = points[i];
      if (typeof point == 'string' || point instanceof String) {
        curCommand = point;
        str += curCommand;
      } else {
        switch (curCommand) {
          case 'H':
            str += point.x + ' ';
            break;
          case 'V':
            str += point.y + ' ';
            break;
          default:
            str += point.x + ',' + point.y + ' ';
            break;
        }
      }
    }
    return str || 'M0 0';
  },

  beforeAdd(map) {
    L.Path.prototype.beforeAdd.call(this, map);

    this._usingCanvas = this._renderer instanceof L.Canvas;

    this._latLngToPointFn = this._usingCanvas ? map.latLngToContainerPoint : map.latLngToLayerPoint;
    if (this._usingCanvas) {
      this._pathSvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    }
  },

  onAdd(map) {
    if (this._usingCanvas) {
      // determine if dash array is set by user
      this._canvasSetDashArray = !this.options.dashArray;
    }

    L.Path.prototype.onAdd.call(this, map); // calls _update()

    if (this._usingCanvas) {
      this._animationCanvasElement = this._insertCustomCanvasElement();

      this._resizeCanvas();

      map.on('resize', this._resizeCanvas, this);

      if (this.options.animate && typeof (TWEEN) === 'object') {
        this._pathLength = this._pathSvgElement.getTotalLength();

        this._normalizeCanvasAnimationOptions();

        this._tweenedObject = { offset: this._pathLength };
        this._tween = new TWEEN.Tween(this._tweenedObject)
          .to({ offset: 0 }, this.options.animate.duration)
          // difference of behavior with SVG, delay occurs on every iteration
          .delay(this.options.animate.delay)
          .repeat(this.options.animate.iterations - 1)
          .onComplete(function (scope) {
            return function () {
              scope._canvasAnimating = false;
            }
          }(this))
          .start();

        this._canvasAnimating = true;
        this._animateCanvas();
      } else {
        this._canvasAnimating = false;
      }
    } else {
      if (this.options.animate && this._path.animate) {
        const length = this._svgSetDashArray();

        this._path.animate([
          { strokeDashoffset: length },
          { strokeDashoffset: 0 }
        ], this.options.animate);
      }
    }
  },

  onRemove(map) {
    L.Path.prototype.onRemove.call(this, map);

    if (this._usingCanvas) {
      this._clearCanvas();
      L.DomUtil.remove(this._animationCanvasElement);
      map.off('resize', this._resizeCanvas, this);
    }
  },

  // SVG specific logic
  _updateCurveSvg() {
    this._renderer._setPath(this, this._curvePointsToPath(this._points));

    if (this.options.animate) {
      this._svgSetDashArray();
    }
  },

  _svgSetDashArray() {
    const path = this._path;
    const length = path.getTotalLength();

    if (!this.options.dashArray) {
      path.style.strokeDasharray = length + ' ' + length;
    }
    return length;
  },

  // Needed by the `Canvas` renderer for interactivity
  _containsPoint(layerPoint) {
    return this._bounds.contains(this._map.layerPointToLatLng(layerPoint));
  },

  // Canvas specific logic below here
  _insertCustomCanvasElement() {
    const element = L.DomUtil.create('canvas', 'leaflet-zoom-animated');
    const originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
    element.style[originProp] = '50% 50%';
    const pane = this._map.getPane(this.options.pane);
    pane.insertBefore(element, pane.firstChild);

    return element;
  },

  _normalizeCanvasAnimationOptions() {
    const opts = {
      delay: 0,
      duration: 0,
      iterations: 1
    };
    if (typeof (this.options.animate) == "number") {
      opts.duration = this.options.animate;
    } else {
      if (this.options.animate.duration) {
        opts.duration = this.options.animate.duration;
      }
      if (this.options.animate.delay) {
        opts.delay = this.options.animate.delay;
      }
      if (this.options.animate.iterations) {
        opts.iterations = this.options.animate.iterations;
      }
    }

    this.options.animate = opts;
  },

  _updateCurveCanvas() {
    this._project();

    const pathString = this._curvePointsToPath(this._points);
    this._pathSvgElement.setAttribute('d', pathString);

    if (this.options.animate && typeof (TWEEN) === 'object' && this._canvasSetDashArray) {
      this._pathLength = this._pathSvgElement.getTotalLength();
      this.options.dashArray = this._pathLength + '';
      this._renderer._updateDashArray(this);
    }

    this._path2d = new Path2D(pathString);

    if (this._animationCanvasElement) {
      this._resetCanvas();
    }
  },

  _animationCanvasElement: null,

  _resizeCanvas() {
    const size = this._map.getSize();
    this._animationCanvasElement.width = size.x;
    this._animationCanvasElement.height = size.y;

    this._resetCanvas();
  },

  _resetCanvas() {
    const topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._animationCanvasElement, topLeft);

    this._redrawCanvas();
  },

  _redrawCanvas() {
    if (!this._canvasAnimating) {
      this._clearCanvas();
      const ctx = this._animationCanvasElement.getContext('2d');
      this._curveFillStroke(this._path2d, ctx);
    }
  },

  _clearCanvas() {
    this._animationCanvasElement.getContext('2d').clearRect(0, 0, this._animationCanvasElement.width, this._animationCanvasElement.height);
  },

  _animateCanvas(time) {
    TWEEN.update(time);

    const ctx = this._animationCanvasElement.getContext('2d');
    ctx.clearRect(0, 0, this._animationCanvasElement.width, this._animationCanvasElement.height);
    ctx.lineDashOffset = this._tweenedObject.offset;

    this._curveFillStroke(this._path2d, ctx);

    if (this._canvasAnimating) {
      this._animationFrameId = L.Util.requestAnimFrame(this._animateCanvas, this);
    }
  },

  // similar to Canvas._fillStroke(ctx, layer)
  _curveFillStroke(path2d, ctx) {
    const options = this.options;

    if (options.fill) {
      ctx.globalAlpha = options.fillOpacity;
      ctx.fillStyle = options.fillColor || options.color;
      ctx.fill(path2d, options.fillRule || 'evenodd');
    }

    if (options.stroke && options.weight !== 0) {
      if (ctx.setLineDash) {
        ctx.setLineDash(this.options && this.options._dashArray || []);
      }
      ctx.globalAlpha = options.opacity;
      ctx.lineWidth = options.weight;
      ctx.strokeStyle = options.color;
      ctx.lineCap = options.lineCap;
      ctx.lineJoin = options.lineJoin;
      ctx.stroke(path2d);
    }
  },

  // path tracing logic below here
  trace(t) {
    t = t.filter(element => {
      return element >= 0 && element <= 1;
    });

    let point, curCommand, curStartPoint, curEndPoint;
    let p1, p2, p3;
    let samples = [];
    for (let i = 0; i < this._points.length; i++) {
      point = this._points[i];
      if (typeof point == 'string' || point instanceof String) {
        curCommand = point;

        if (curCommand == 'Z') {
          samples = samples.concat(this._linearTrace(t, curEndPoint, curStartPoint));
        }
      } else {
        switch (curCommand) {
          case 'M':
            curStartPoint = point;
            curEndPoint = point;
            break;
          case 'L':
          case 'H':
          case 'V':
            samples = samples.concat(this._linearTrace(t, curEndPoint, point));

            curEndPoint = point;
            break;
          case 'C':
            p1 = point;
            p2 = this._points[++i];
            p3 = this._points[++i];
            samples = samples.concat(this._cubicTrace(t, curEndPoint, p1, p2, p3));

            curEndPoint = p3;
            break;
          case 'S':
            p1 = this._reflectPoint(p2, curEndPoint);
            p2 = point;
            p3 = this._points[++i];
            samples = samples.concat(this._cubicTrace(t, curEndPoint, p1, p2, p3));

            curEndPoint = p3;
            break;
          case 'Q':
            p1 = point;
            p2 = this._points[++i];
            samples = samples.concat(this._quadraticTrace(t, curEndPoint, p1, p2));

            curEndPoint = p2;
            break;
          case 'T':
            p1 = this._reflectPoint(p1, curEndPoint);
            p2 = point;
            samples = samples.concat(this._quadraticTrace(t, curEndPoint, p1, p2));

            curEndPoint = p2;
            break;
          default:
            break;
        }
      }
    }
    return samples;
  },
  _linearTrace(t, p0, p1) {
    return t.map(interval => {
      const x = this._singleLinearTrace(interval, p0.x, p1.x);
      const y = this._singleLinearTrace(interval, p0.y, p1.y);
      return this._map.layerPointToLatLng([x, y]);
    });
  },
  _quadraticTrace(t, p0, p1, p2) {
    return t.map(interval => {
      const x = this._singleQuadraticTrace(interval, p0.x, p1.x, p2.x);
      const y = this._singleQuadraticTrace(interval, p0.y, p1.y, p2.y);
      return this._map.layerPointToLatLng([x, y]);
    });
  },
  _cubicTrace(t, p0, p1, p2, p3) {
    return t.map(interval => {
      const x = this._singleCubicTrace(interval, p0.x, p1.x, p2.x, p3.x);
      const y = this._singleCubicTrace(interval, p0.y, p1.y, p2.y, p3.y);
      return this._map.layerPointToLatLng([x, y]);
    });
  },
  _singleLinearTrace(t, p0, p1) {
    return p0 + t * (p1 - p0);
  },
  _singleQuadraticTrace(t, p0, p1, p2) {
    const oneMinusT = 1 - t;
    return Math.pow(oneMinusT, 2) * p0 +
      2 * oneMinusT * t * p1 +
      Math.pow(t, 2) * p2;
  },
  _singleCubicTrace(t, p0, p1, p2, p3) {
    const oneMinusT = 1 - t;
    return Math.pow(oneMinusT, 3) * p0 +
      3 * Math.pow(oneMinusT, 2) * t * p1 +
      3 * oneMinusT * Math.pow(t, 2) * p2 +
      Math.pow(t, 3) * p3;
  },
  _reflectPoint(point, over) {
    const x = over.x + (over.x - point.x);
    const y = over.y + (over.y - point.y);
    return L.point(x, y);
  }
});

export default Curve