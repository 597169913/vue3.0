<template>
  <div class="table">
    <table></table>
  </div>
</template>
<script>
// import { fileViewBaseUrl } from 'api/fileview/file-view-service'
export default {
  data() {
    return {
      visible: false,
      filePath: 'localhost:8012/onlinePreview?url=http%3A%2F%2F10.0.7.8%3A8090%2Fupload%2FanalysisReport%2Ffa4630cf-e37b-e5fe-6ae5-cc62b9848e3a%2F%E6%96%B0%E5%BB%BA%20Microsoft%20Word%20%E6%96%87%E6%A1%A3_20211622151647.docx'
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
  }
}
</script>
<style scoped>
iframe {
  width: 100%;
  height: 100%;
}
</style>