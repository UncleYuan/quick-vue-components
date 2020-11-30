<template>
  <div v-show="menuVisible">
    <div ref="menuWrap" class="menu">
      <div class="menu-header">选择要展示的表头项</div>
      <div class="menu-check-wrap">
        <el-checkbox
          v-model="checkAll"
          :style="{
            display:'block',
            margin:'0',
            padding:'5px',

          }"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >全选</el-checkbox>
        <el-checkbox-group v-model="checkedHeaders" @change="handleCheckedHeadersChange">
          <el-checkbox
            v-for="(header ) in headers"
            :key="header.prop"
            :label="header.prop"
            :style="{
              display:'block',
              margin:'0',
              padding:'5px',

            }"
          >{{ header.label }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script>

import $ from "jquery";
export default {
  props: {
    getTableObj: {
      type: Function,
      default: () => null
    }
  },
  data() {
    return {
      menuVisible: false,
      checkAll: false,
      isIndeterminate: true,
      checkedHeaders: []
    };
  },

  computed: {
    headers() {
      const tableObj = this.getTableObj();
      if (tableObj) {
        return this.flatHeaders(tableObj.tableHeader);
      }
      return [];
    }
  },
  mounted() {},
  methods: {
    /**
     * 扁平化表头数据
     * @param  {Array} tableHeader 表头配置或者子级配置
     */
    flatHeaders(tableHeader) {
      let res = [];
      tableHeader &&
        tableHeader.map(item => {
          res.push(item);
          if (item.children) {
            res = res.concat(this.flatHeaders(item.children));
          }
        });
      return res;
    },
    /**
     * 设置选中的表头
     */
    setCheckedHeaders() {
      const tableObj = this.getTableObj();
      if (tableObj) {
        return tableObj.showHeadersState;
      }
      return [];
    },
    /**
     * 右键点击
     *  @param  {Event} MouseEvent 右键事件
     */

    rightClick(MouseEvent) {
      this.checkedHeaders = this.setCheckedHeaders();
      this.handleCheckedHeadersChange(this.checkedHeaders);
      // 鼠标右击触发事件
      this.menuVisible = false;
      this.menuVisible = true;
      const menu = this.$refs.menuWrap;
      document.addEventListener("click", this.hidenMenu);
      menu.style.display = "block";
      menu.style.left = MouseEvent.clientX - 0 + "px";
      menu.style.top = MouseEvent.clientY - 0 + "px";
    },
    /**
     * 点击事件隐藏
     *  @param  {Event} e 点击事件
     */
    hidenMenu(e) {
      if (
        !$(e.target)
          .parents()
          .filter(this.$refs.menuWrap).length
      ) {
        this.menuVisible = false;
        document.removeEventListener("click", this.hidenMenu);
      }
    },
    /**
     * 当触发全选表头
     *  @param  {Object} val 点击事件
     */
    handleCheckAllChange(val) {
      this.checkedHeaders = val ? this.headers.map(o => o.prop) : [];
      this.isIndeterminate = false;
      this.handleCheckedHeadersChange(this.checkedHeaders);
    },
    /**
     * 切换展示设置回table上的值
     *  @param  {Array} value 设置表头的值
     */
    handleCheckedHeadersChange(value) {
      console.log(value);
      const tableObj = this.getTableObj();
      tableObj.showHeadersState = value;

      const checkedCount = value.length;
      this.checkAll = checkedCount === this.headers.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.headers.length;

      this.$nextTick(() => {
        if (tableObj.$refs.table && tableObj.$refs.table.doLayout) { tableObj.$refs.table.doLayout(); }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.menu {
  padding: 0;
  position: fixed;
  border: 1px solid #eee;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  margin: 0;
  z-index: 120;
  &-header {
    padding: 7px 10px;
    border-bottom: 1px solid #eee;
  }
  &-check-wrap {
    padding: 10px;
    max-height: 250px;
    overflow: auto;
  }
  &-list {
    font-size: 14px;
    padding: 0;
    margin: 0;
    list-style: none;

    &-item:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    &-item {
      font-size: 15px;
      list-style: none;
      padding: 5px 10px;
      margin: 0;
    }
  }
}
</style>

