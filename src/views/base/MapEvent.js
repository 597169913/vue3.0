export default class MapEvent {
  constructor(map) {
    this.map = map
    this.eventsList = {}
  }
  addEventHandler(eventName, fn) {
    this.map.on(eventName, fn)
    if (!this.eventsList[eventName]) {
      this.eventsList[eventName] = []
    }
    this.eventsList[eventName].push(fn)
  }
  removEventHandler(eventName) {
    if (this.eventsList[eventName]) {
      const evts = this.eventsList[eventName]
      evts.forEach(val => {
        this.map.off(eventName, val)
      })
      this.eventsList[eventName] = []
    }
  }
  getEventHandler(eventName) {
    if (this.eventsList[eventName]) {
      return this.eventsList[eventName]
    } else {
      return null
    }
  }
  removeAllEventHandler() {
    for (const eventName in this.eventsList) {
      let evts = []
      if (this.eventsList[eventName]) {
        evts = this.eventsList[eventName]
      }
      for (let i = 0; i < evts.length; i++) {
        this.map.off(eventName, evts[i])
      }
      this.eventsList[eventName] = []
    }
  }
  deactive() {
    this.removeAllEventHandler()
    this.map._container.style.cursor = ''
    this.map.dragging.enable()
    this.map.doubleClickZoom.enable()
  }
}