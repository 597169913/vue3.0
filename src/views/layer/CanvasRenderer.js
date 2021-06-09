import L from 'leaflet'

export const CanvasRenderer = L.canvas.extend({
    initialize(options) {
        L.setOptions(this, options)
    }
})