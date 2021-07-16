<template>
  <el-dialog :title="data.fileName" :visible.sync="visible" @close="close" append-to-body class="new-mine-dialog file-management-dialog"  height="550px" width="1030px" top="70px">
    <video-player
      class="video-player vjs-custom-skin"
      ref="videoPlayer"
      :playsinline="true"
      :options="playerOptions">
    </video-player>
  </el-dialog>
</template>
<script>
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'
import { videoPlayer } from 'vue-video-player'
export default {
  components: {
    videoPlayer
  },
  data() {
    return {
      visible: false,
      data: {},
      playerOptions: {
        playbackRates: [0.7, 1.0, 1.5, 2.0], // 播放速度
        autoplay: false, // 如果true,浏览器准备好时开始回放。
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 导致视频一结束就重新开始。
        // preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: 'zh-CN',
        aspectRatio: '4:3', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: {
          type: 'video/mp4', // 这里的种类支持很多种：基本视频格式、直播、流媒体等，具体可以参看git网址项目
          src: 'https://www.17sucai.com/preview/501914/2017-08-04/%E9%A1%B5%E9%9D%A2/media/mov_bbb.mp4' // url地址
        },
        poster: '', // 你的封面地址
        notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: true,
          durationDisplay: true,
          remainingTimeDisplay: false,
          fullscreenToggle: true  // 全屏按钮
        }
      },
    }
  },
  methods: {
    show(data) {
      this.visible = true
      this.data = data
      this.$nextTick(() => {
        const myPlayer = this.$refs.videoPlayer.player
        myPlayer.src(data.fileUrl)
      })
    },
    close() {
      this.visible = false
    }
  }
}
</script>
<style scoped>
.file-div {
  display: flex;
  height: calc(100vh - 410px);
  border: 1px solid #DFDFDF;
}
.tree-div {
  width: 300px;
  border-right: 1px solid #ddd;
  height: 100%;
  flex-shrink: 0;
  overflow-y: auto;
}
.list-div {
  flex: 1;
  overflow-y: auto;
  height: 100%;
}
.list-div li {
  line-height: 36px;
  color: #333;
  cursor: pointer;
  padding: 0 20px;
}
.list-div li:hover {
  background-color: #f5f5f5;
}
.btn-div {
  text-align: right;
}
img {
  width: auto;
  height: auto;
  max-width: 100%;
  cursor: pointer;
}
</style>