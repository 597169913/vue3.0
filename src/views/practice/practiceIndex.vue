<template>
  <div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      input: ''
    }
  },
  methods: {
    decodeStr(str) {
      if (typeof str !== "string") {
        throw '请输入字符串'
      }
      let index = 0
      const decodeQueue = []
      while (index < str.length) {
        var eleStr = str[index]
        if (eleStr === '[') {
          decodeQueue.push(index)
        }
        if (decodeQueue.length > 0 && eleStr === ']') {
          var leftIndex = decodeQueue.pop()
          var rightIndex = index
          str = this.strFormat(str, leftIndex, rightIndex)
          index = 0
          continue
        }
        index++
      }
      return str
    },
    strFormat(str, startIndex, rightIndex) {
      // 辅助函数: 将形如str[]对应左右index展开;
      var temp = str.substring(startIndex + 1, rightIndex);
      var copiedStr = ''
      var copyNum = ''
      while (str[--startIndex] >= 0) {
        copyNum = str[startIndex] + copyNum;
      }
      for (var i = 0; i < copyNum; i++) {
        copiedStr += temp
      }
      str = str.substring(0, startIndex + 1) + copiedStr + str.substring(rightIndex + 1)
      return str
    }
  },
  mounted() {
    const testStr = '3[abc]2[cd]ff'
    this.decodeStr(testStr)
    //str = "2[a]1[bc]", 返回 "aabc".
    // str = "2[e2[d]]", 返回 "eddedd".
    // str = "3[abc]2[cd]ff", 返回 "abcabcabccdcdff".
    // 可以看出: N[string]，表示string 正好重复 N 次。假设字符串一定是有效正确的字符串；但是你需要考虑其他可能出现的入参错误场景。
  }
}
</script>