<template>
  <div
    class="drag-dialog"
    @mousemove="mousemove"
    @mousedown="mousedown"
    :style="{width: width + 'px', height: height + 'px', top: top + 'px', left: left + 'px'}"
  >
    <span>测试拉伸拖拽</span>
  </div>
</template>
<script>
import $ from 'jquery'
export default {
  data () {
    return {
      width: 300,
      height: 180,
      initTop: 20,
      initLeft: 20,
      top: document.documentElement.clientHeight - 350,
      left: 100
    }
  },
  props: {
    minH: {
      type: Number,
      default: 300
    },
    minW: {
      type: Number,
      default: 300
    }
  },
  beforeMount () {
    this.width = this.minW
    this.height = this.minH
  },
  methods: {
    getCursorType (type) {
      const CURSORTYPE = {
        top: 'n-resize',
        bottom: 's-resize',
        left: 'w-resize',
        right: 'e-resize',
        right_top: 'ne-resize', // right_top写法是便于后面代码数据处理
        left_top: 'nw-resize',
        left_bottom: 'sw-resize',
        right_bottom: 'se-resize',
        default: 'default',
        move: 'move'
      }
      return CURSORTYPE[type]
    },
    mousemove (e) {
      const $dragDom = $(this.$el)
      const x = e.clientX
      const y = e.clientY
      const left = $dragDom[0].offsetLeft
      const top = $dragDom[0].offsetTop
      const width = $dragDom.outerWidth(true)
      const height = $dragDom.outerHeight(true)
      if (!this.isMoving) {
        this.type = this.checkType($dragDom[0], x, y, left, top, width, height)
        if (this.type === 'move') {
          $dragDom.css({
            cursor: 'default'
          })
        } else {
          $dragDom.css({
            cursor: this.getCursorType(this.type) || 'default'
          })
        }
      }
    },
    // 判断鼠标悬浮指针类型
    checkType (el, x, y, left, top, width, height) {
      let type
      const margin = 10
      if (x > left + width - margin && el.scrollTop + y <= top + height - margin && top + margin <= y) {
        type = 'right'
      } else if (left + margin > x && el.scrollTop + y <= top + height - margin && top + margin <= y) {
        type = 'left'
      } else if (el.scrollTop + y > top + height - margin && x <= left + width - margin && left + margin <= x) {
        type = 'bottom'
      } else if (top + margin > y && x <= left + width - margin && left + margin <= x) {
        type = 'top'
      } else if (x > left + width - margin && el.scrollTop + y > top + height - margin) {
        type = 'right_bottom'
      } else if (left + margin > x && el.scrollTop + y > top + height - margin) {
        type = 'left_bottom'
      } else if (top + margin > y && x > left + width - margin) {
        type = 'right_top'
      } else if (top + margin > y && left + margin > x) {
        type = 'left_top'
      } else if (left + margin < x && x < left + width - margin && y > top + margin && y < top + height - margin) {
        type = 'move'
      }
      return type || 'default'
    },
    mousedown (evt) {
      const $dragDom = $(this.$el)
      const x = evt.clientX
      const y = evt.clientY
      const width = $dragDom.outerWidth(true)
      const height = $dragDom.outerHeight(true)
     const left = $dragDom[0].offsetLeft
      const top = $dragDom[0].offsetTop
      this.type = this.checkType($dragDom[0], x, y, left, top, width, height)
      $dragDom[0].style.cursor = this.getCursorType(this.type) || 'default'
      this.isMoving = true
      document.onmousemove = e => {
        // 移动时禁用默认事件
        e.preventDefault()
        let endX = e.clientX
        let endY = e.clientY
        let diffX = endX - x
        let diffY = endY - y
        let arr
        const dragDiffX = x - left
        const dragDiffY = y - top
        // 将type转换为数组格式，简化代码判断调用即可
        if (this.type) {
          if (this.type.indexOf('_') == -1) {
            arr = [this.type, '']
          } else {
            arr = this.type.split('_')
          }
          this.boundaryLimit({ left, top, width, height, diffX, diffY, dragDiffX, dragDiffY, endX, endY, arr })
        }
      }
      // 拉伸结束
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
        this.type = ''
        this.isMoving = false
        $dragDom.css({
          cursor: 'default'
        })
      }
    },
    // 判断边界条件
    boundaryLimit (obj) {
      const screenWidth = document.documentElement.clientWidth || document.body.clientWidth
      const screenHeight = document.documentElement.clientHeight || document.body.clientHeight
      const { left, top, width, height, diffX, diffY, dragDiffX, dragDiffY, endX, endY, arr } = obj
      let newWidth = width
      let newHeight = height
      let newTop = top
      let newLeft = left
      if (arr[0] === 'right' || arr[1] === 'right') {
        if (width + diffX > screenWidth - left) {
          newWidth = screenWidth - left
        } else {
          newWidth = width + diffX
        }
      }
      if (arr[0] === 'left' || arr[1] === 'left') {
        if (width - diffX > width + left) {
          newWidth = width + left
          newLeft = 0
        } else {
          newWidth = width - diffX
          newLeft = left + diffX
        }
      }
      if (arr[0] === 'top' || arr[1] === 'top') {
        if (height - diffY > height + top) {
          newHeight = height + top
          newTop = 0
        } else {
          newHeight = height - diffY
          newTop = top + diffY
        }
      }
      if (arr[0] === 'bottom' || arr[1] === 'bottom') {
        if (height + diffY > screenHeight - top) {
          newHeight = screenHeight - top
        } else {
          newHeight = height + diffY
        }
      }
      // 判断长度和宽度是否小于预设的最小长度/宽度
      // newWidth = newWidth > this.minW ? newWidth : this.minW
      // newHeight = newHeight > this.minH ? newHeight : this.minH
      // newTop = newHeight > this.minH ? newTop : top
      // newLeft = newWidth > this.minW ? newLeft : left
      if (arr[0] === 'move') {
        newLeft = endX - dragDiffX
        newTop = endY - dragDiffY
        // 拖拽边界判断
        if (newLeft < 0) {
          newLeft = 0
        } else if (newLeft > screenWidth - width) {
          newLeft = screenWidth - width
        }
        if (newTop < 0) {
          newTop = 0
        } else if (newTop > screenHeight - height) {
          newTop = screenHeight - height
        }
      }
      this.width = newWidth
      this.height = newHeight
      this.top = newTop
      this.left = newLeft
      this.$emit('resize', { width: this.width, height: this.height, top: this.top, left: this.left })
    }
  }
}
</script>
<style scoped>
.drag-dialog {
  position: absolute;
  z-index: 99999;
  border: 1px solid #ccc;
  background-color: wheat;
  display: inline-block;
}
</style>