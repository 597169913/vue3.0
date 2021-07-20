<template>
  <div id="three-map" :style="{width: width + 'px', height: height + 'px'}"></div>
</template>
<script>
import * as THREE from 'three'
import china from './china.json'
import * as d3 from 'd3'
export default {
  data() {
    return {
      width: 1000,
      height: 800
    }
  },
  methods: {
    init() {
      this.scene = new THREE.Scene()
      this.setCamera()
      this.setRenderer()
      this.setLight()
      // const geometry = new THREE.BoxGeometry()
      // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      // this.cube = new THREE.Mesh(geometry, material)
      // this.scene.add(this.cube)
      // this.render()
      // this.animate()
      this.initMap()
      this.render()
      this.addHelper()
    },
    setCamera() {
      this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
      this.camera.position.z = 5
    },
    // 设置渲染器
    setRenderer() {
      this.renderer = new THREE.WebGLRenderer()
      // 设置画布的大小
      this.renderer.setSize(this.width, this.height)
      //这里 其实就是canvas 画布  renderer.domElement
      document.getElementById('three-map').appendChild(this.renderer.domElement)
    },
    // 设置环境光
    setLight() {
      const ambientLight = new THREE.AmbientLight(0xffffff) // 环境光
      this.scene.add(ambientLight)
    },
    addHelper() {
      const helper = new THREE.CameraHelper(this.camera)
      this.scene.add(helper)
    },
    render() {
      this.renderer.render(this.scene, this.camera)
    },
    animate() {
      requestAnimationFrame(this.animate.bind(this))
      this.cube.rotation.x += 0.01
      this.cube.rotation.y += 0.01
      this.render()
    },
    initMap() {
      this.map = new THREE.Object3D()
      console.log(THREE)
      const projection = d3.geoMercator().center([104.0, 37.5]).scale(80).translate([0, 0])
      china.features.forEach(val => {
        const province = new THREE.Object3D()
        const coordinates = val.geometry.coordinates
        coordinates.forEach(multiPolygon => {
          multiPolygon.forEach(polygon => {
            const shape = new THREE.Shape()
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 })
            const lineGeometry = new THREE.Geometry()
            polygon.forEach((coord, index) => {
              const [x, y] = projection(coord)
              if (index === 0) {
                shape.moveTo(x, -y)
              }
              shape.lineTo(x, -y)
              lineGeometry.vertices.push(new THREE.Vector3(x, -y, 4.01))
            })
            const extrudeSettings = {
              depth: 4,
              bevelEnabled: false
            }
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
            const material = new THREE.MeshBasicMaterial({ color: '#d13a34', transparent: true, opacity: 0.6 })
            const mesh = new THREE.Mesh(geometry, material)
            const line = new THREE.Line(lineGeometry, lineMaterial)
            province.add(mesh)
            province.add(line)
          })
        })
        province.properties = val.properties
        if (val.properties.centroid) {
          const [x, y] = projection(val.properties.centroid)
          province.properties._centroid = [x, y]
        }
        this.map.add(province)
      })
      this.scene.add(this.map)
    }
  },
  mounted() {
    this.init()
  }
}
</script>
<style scoped>
#three-map {
  margin: 0 auto;
  margin-top: 50px;
}
</style>