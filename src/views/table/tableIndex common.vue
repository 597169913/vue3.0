<template>
  <div class="vxe-table-demo">
    <vxe-grid
        ref="xGrid"
        border
        show-all-overflow
        show-header-all-overflow
        :height="height"
        :columns="tableColumn"
        :data="tableData"
        :cell-class-name="handleCellClassName"
        :header-cell-class-name="handleHeaderCellClassName"
        @header-cell-click="headerCellClickEvent">
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
    const colSize = 1000
    const rowSize = 1000
    const tableColumn = []
    const tableData = []
    for(let index = 0; index < colSize; index++){
      tableColumn.push({
        field: 'key_' + index,
        title: 'Col_' + index,
        width: 160
      })
    }
    for(let index = 0; index < rowSize; index++){
      const item = {}
      tableColumn.forEach(function(column) {
        item[column.field] = 'Value_' + index
      })
      tableData.push(item)
    }
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
    // if (this.$refs.xGrid) {
    //   this.$refs.xGrid.reloadData(this.tableData)
    // }
    // console.timeEnd()
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