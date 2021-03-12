<template>
  <div class="doc-content">
    <div class="left" :style="{height: height+ 'px'}">
      <ul>
        <li v-for="item in treeData" :key="item.name" @click="showBrowseDialog(item)">{{item.name}}</li>
      </ul>
    </div>
    <div class="right" :style="{height: height+ 'px'}">
      <browse-file :url="fileUrl" :key="menuKey" v-if="showBrowseFile"></browse-file>
    </div>
  </div>
</template>
<script>
import BrowseFile from './BrowseFile'
export default {
  components: {
    BrowseFile
  },
  data() {
    return {
      fileUrl: '',
      menuKey: 'fsfsfsfdfd-gdfd',
      showBrowseFile: false,
      treeData: [
        { name: '文件1', fileUrl: 'http://10.0.4.11/upload/config/test.pdf' }
      ],
      height: document.documentElement.clientHeight - 60
    }
  },
  methods: {
    showBrowseDialog(item) {
      this.showBrowseFile = true
      this.fileUrl = item.fileUrl
    }
  },
  mounted() {
    console.log()
  }
}
</script>
<style scoped>
.doc-content {
  width: 100%;
  height: calc(100%);
}
.left {
  width: 20%;
  display: inline-block;
  border-right: #ccc;
  height: 100%;
  background: #ddd;
  float: left;
}
.right {
  width: 80%;
  display: inline-block;
  height: 100%;
}
</style>