<template>
  <div id="three-map" :style="{width: width + 'px', height: height + 'px'}"></div>
</template>
<script>
import * as THREE from 'three'
import china from './china.json'
import * as d3 from 'd3'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
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
      this.initMap()
      this.setController()
      this.setRaycaster()
      this.animate()
    },
    setCamera() {
      this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
      this.camera.position.z = 80
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
    // 设置控制器
    setController() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      // 动态阻尼系数 就是鼠标拖拽旋转灵敏度，阻尼越小越灵敏
      this.controls.dampingFactor = 0.5;
      // 是否可以缩放
      this.controls.enableZoom = true;
      //是否自动旋转
      this.controls.autoRotate = false;
      // //设置相机距离原点的最近距离
      // this.controls.minDistance = 20;
      // //设置相机距离原点的最远距离
      // this.controls.maxDistance = 1000;
      //是否开启右键拖拽
      this.controls.enablePan = true;
      // //上下翻转的最大角度
      // this.controls.maxPolarAngle = 1.5;
      // //上下翻转的最小角度
      // this.controls.minPolarAngle = 0.0;
      // 是否可以旋转
      this.controls.enableRotate = true
      // this.controls.addEventListener('change', this.render())
    },
    setRaycaster() {
      this.raycaster = new THREE.Raycaster()
      this.mouse = new THREE.Vector2()
      const onMouseMove = evt => {
        // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
        this.mouse.x = (evt.clientX / this.width) / 2 - 1
        this.mouse.x = (evt.clientY / this.height) / 2 + 1
      }
      window.addEventListener('mousemove', onMouseMove, false)
    },
    animate() {
      window.requestAnimationFrame(this.animate.bind(this))
      // 通过摄像机和鼠标位置更新射线
      this.raycaster.setFromCamera(this.mouse, this.camera)
      if (this.map) {
        // 计算物体和射线的焦点
        const interserct = this.raycaster.intersectObjects(this.map.children, true)
        interserct.forEach(val => {
          if (val.object.material && val.object.material.length > 0) {
            val.object.material[0].color.set(0xff0000)
            val.object.material[1].color.set(0xff0000)
          }
        })
      }
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    },
    initMap() {
      this.map = new THREE.Object3D()
      const projection = d3.geoMercator().center([104.0, 37.5]).scale(80).translate([0, 0])
      china.features.forEach(val => {
        const province = new THREE.Object3D()
        const coordinates = val.geometry.coordinates
        coordinates.forEach(multiPolygon => {
          const func = polygon => {
            const shape = new THREE.Shape()
            const lineMaterial = new THREE.LineBasicMaterial({ color: 'white' })
            const lineGeometry = new THREE.BufferGeometry()
            const pointArray = []
            polygon.forEach((coord, index) => {
              const [x, y] = projection(coord)
              if (index === 0) {
                shape.moveTo(x, -y)
              }
              shape.lineTo(x, -y)
              pointArray.push(new THREE.Vector3(x, -y, 4.01))
            })
            lineGeometry.setFromPoints(pointArray)
            const extrudeSettings = {
              depth: 4,
              bevelEnabled: false
            }
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
            const material = new THREE.MeshBasicMaterial({ color: '#2defff', transparent: true, opacity: 0.6 })
            const material1 = new THREE.MeshBasicMaterial({
              color: '#3480C4',
              transparent: true,
              opacity: 0.5,
            })
            const mesh = new THREE.Mesh(geometry, [material, material1])
            const line = new THREE.Line(lineGeometry, lineMaterial)
            province.add(mesh)
            province.add(line)
          }
          if (multiPolygon.length > 1) {
            func(multiPolygon)
          } else {
            multiPolygon.forEach(polygon => {
              func(polygon)
            })
          }

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