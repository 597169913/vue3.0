<template>
  <div id="container"></div>
</template>
<script>
// import { fileViewBaseUrl } from 'api/fileview/file-view-service'
import LogicFlow from '@logicflow/core';
export default {
  data() {
    return {
      flowData: {
        nodes: [
          {
            id: 50,
            type: 'rect',
            x: 100,
            y: 150,
            text: '你好',
          },
          {
            id: 21,
            type: 'circle',
            x: 300,
            y: 50,
            text: '圆1'
          },
          {
            id: 11,
            type: 'circle',
            x: 300,
            y: 250,
            text: '圆2'
          },
        ],
        // 边
        edges: [
          {
            type: 'polyline',
            sourceNodeId: 50,
            targetNodeId: 21
            // startPoint: {
            //   id: '50-150',
            //   x: 150,
            //   y: 160
            // },
            // endPoint: {
            //   id: '150-50',
            //   x: 300,
            //   y: 110
            // }
          },
          {
            type: 'polyline',
            sourceNodeId: 50,
            targetNodeId: 11
            // startPoint: {
            //   id: '50-150',
            //   x: 150,
            //   y: 160
            // },
            // endPoint: {
            //   id: '150-50',
            //   x: 300,
            //   y: 210
            // }
          }
        ]
      }
    }
  },
  methods: {
    close() {
      this.visible = false
    },
    show(fileUrl) {
      this.visible = true
      // const fullPath = `${fileViewBaseUrl}/onlinePreview?url=${encodeURIComponent(fileUrl)}`
      const filePath = `localhost:8012/onlinePreview?url=${encodeURIComponent(fileUrl)}`
      console.log(filePath)
      this.filePath = filePath
    }
  },
  mounted() {
    const lf = new LogicFlow({
      container: document.querySelector('#container'),
      stopScrollGraph: true,
      stopZoomGraph: true,
      grid: {
        type: 'dot',
        size: 20,
      },
      snapline: {
        stroke: '#1E90FF', // 对齐线颜色
        strokeWidth: 1, // 对齐线宽度
      }
    })
    lf.render(this.flowData)
  }
}
</script>
<style scoped>
#container {
  width: 100%;
  height: 100%;
}
</style>