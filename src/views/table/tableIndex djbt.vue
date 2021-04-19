<template>
  <div class="vxe-table-demo">
    <vxe-grid ref="xGrid" border align="center"   :scroll-y="{gt: 100}" show-all-overflow show-header-all-overflow :height="height" :columns="tableColumn"  @header-cell-click="headerCellClickEvent">
    </vxe-grid>
  </div>
</template>
<script>
import XEUtils from 'xe-utils'
export default {
  data() {
    return {
      selectCols: [],
      tableColumn: [],
      tableData: [],
      height: document.documentElement.clientHeight * 0.8
    }
  },
  created() {
    // const colSize = 1000
    console.time()
    const rowSize = 30
    const tableColumn = []
    const tableData = []
    // const avg = 10
    for (let i = 0; i < 10; i++) {
      const children = []
      for (let index = 0; index < 100; index++) {
        children.push(
          {
            field: 'key_' + (i * 100 + index),
            title: 'Col_' + (i * 100 + index),
            width: 160
          }
        )
      }
      tableColumn.push({
        title: 'FirstCol_' + i,
        children
      })
    }
    for (let index = 0; index < rowSize; index++) {
      const item = {}
      tableColumn.forEach((val, tindex) => {
        val.children.forEach((column, i) => {
          item[column.field] = 'Value_' + (tindex * 100 + i)
        })
      })
      tableData.push(item)
    }
    console.log(tableColumn)
    this.tableColumn = tableColumn
    this.tableData = tableData
  },
  methods: {
    handleHeaderCellClassName(params) {
      console.log(`columnIndex=${params.columnIndex}`)
      // 非常损耗性能的用法，将结果缓存到row最优
      if (this.selectCols.indexOf(params.columnIndex) > -1) {
        return 'color-blue'
      }
    },
    handleCellClassName(params) {
      return params.columnIndex === 400 ? 'color-red' : ''
    },
    headerCellClickEvent(params) {
      console.info(params.columnIndex)
      if (this.selectCols.indexOf(params.columnIndex) === -1) {
        this.selectCols.push(params.columnIndex)
      } else {
        XEUtils.remove(this.selectCols, function (item) {
          return params.columnIndex === item
        })
      }
    }
  },
  mounted() {
    if (this.$refs.xGrid) {
      this.$refs.xGrid.reloadData(this.tableData)
    }
    console.timeEnd()
  }
}
</script>
<style scoped>
.vxe-table-demo {
  width: 80%;
  height: 80%;
  margin: 20px auto;
}
</style>