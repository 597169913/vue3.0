<template>
  <div id="three-map" :style="{width: width + 'px', height: height + 'px'}"></div>
</template>
<script>
import * as THREE from 'three'
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
      const geometry = new THREE.BoxGeometry()
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      this.cube = new THREE.Mesh(geometry, material)
      this.scene.add(this.cube)
      // this.render()
      this.animate()
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
    render() {
      this.renderer.render(this.scene, this.camera)
    },
    animate() {
      requestAnimationFrame(this.animate.bind(this))
      this.cube.rotation.x += 0.01
      this.cube.rotation.y += 0.01
      this.render()
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
}
</style>