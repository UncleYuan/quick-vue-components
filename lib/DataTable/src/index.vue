<script>
import isArray from "lodash/isArray";
import isEqual from "lodash/isEqual";
import findIndex from "lodash/findIndex";
import $ from "jquery";
import ElTable from "element-ui/lib/table";
import ElTableColumn from "element-ui/lib/table-column";
import Pagination from "element-ui/lib/pagination";
import Popover from "element-ui/lib/popover";
import "./style.scss";
import loadDataMix from "../../commonMix/loadDataMix";
import HeaderMenu from "./HeaderMenu";

export default {
  name: "DataTable",
  components: {
    // ElTable,
    // ElTableColumn,
    Pagination,
    Popover,
    HeaderMenu
  },
  mixins: [loadDataMix],
  model: {
    prop: "selections", // 要存在于props
    event: "changeSelection" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    /**
     * 设置内部table的属性
     */
    tableAttrs: {
      type: Object,
      default: () => ({})
    },
    /**
     * table的头部渲染，跟element table参数对应
     */

    tableHeader: {
      type: Array,
      default: () => []
    },
    /**
     * 是否展示列表下标
     */
    showIdxCol: {
      type: [Boolean, Function],
      default: false
    },

    ctrlData: {
      type: [Boolean],
      default: false
    },
    /**
     * 是否列表有选择框
     */
    selectRow: {
      type: [Boolean, Function],
      default: true
    },
    /**
     * 是否列表选择框只能单选
     */
    singleChoice: {
      type: [Boolean, Function],
      default: false
    },
    /**
     * 列表选中行
     */
    selections: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      mutipleSelection: this.selections || [],
      showHeadersState: this.initShowHeadersState()
    };
  },
  computed: {
    showHeaders() {
      return this.filterHeaders(this.tableHeader, o => {
        return {
          ...o,
          hidden:
             findIndex(this.showHeadersState, obj => obj == o.prop) < 0
        };
      });
    }
  },
  watch: {
    mutipleSelection: function(newVal, oldVal) {
      this.$emit("changeSelection", newVal);
    },
    selections: function(newVal) {
      this.changeSelectRow(newVal);
    },
    propData: function(newVal, oldVal) {
      if (this.ctrlData || (isArray(newVal) && !isEqual(newVal, oldVal))) {
        this.listData = newVal;
      }
    },
    tableHeader(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.showHeadersState = this.initShowHeadersState();
        this.$nextTick(() => {
          this.$refs.table.doLayout();
        });
      }
    }
  },
  created() {},
  mounted() {
    if (this.mutipleSelection.length) { this.changeSelectRow(this.mutipleSelection, true); }
  },
  methods: {
    /**
     * 列表调用成功后的回调
     * @param {Object} 返回的值 //
     */
    afterSuccessFunc(res) {
      $(this.$el)
        .find(".el-table__body-wrapper")
        .scrollTop(0);
      this.changeSelectRow(this.mutipleSelection, true);
    },
    /**
     * 列表调用失败后的回调
     * @param {Error} 返回的错误信息 //
     */
    afterErrorFunc(err) {
      this.$notify({
        title: err.message || err,
        type: "error"
      });
    },
    /**
     * 选中行后的回调
     * @param {Object} 选中行的数据
     */
    onSelectChange(val) {
      if (this.singleChoice) {
        this.mutipleSelection = val[val.length - 1]
          ? [val[val.length - 1]]
          : [];
        return;
      }
      this.mutipleSelection = val;
    },
    /**
     * 修改选中行的方法
     * @param  {Object} newVal 新的选中行数据
     * @param  {Boolean} init  是否是在组件初始化
     */
    changeSelectRow(newVal, init) {
      if (this.$refs.table) {
        this.$refs.table.clearSelection();
        newVal.map(row => {
          if (init) {
            const rowIdx = findIndex(this.$refs.table.data, row);
            if (rowIdx >= 0) {
              row = this.$refs.table.data[rowIdx];
            }
          }
          this.$refs.table.toggleRowSelection(row, true);
        });
      }
      this.mutipleSelection = newVal;
    },
    /**
     * table 项的 ScopedSlot 渲染函数
     * @param  {Object} item 列表头的配置
     */
    headerColScopedSlotsRender(item) {
      const res = item.scopedSlots;
      return res;
    },
    /**
     * table的头部渲染函数，将数据渲染成table-header-column
     * @param  {Array} tableHeader tableHeader 的配置
     */
    headerRender(tableHeader) {
      return tableHeader && tableHeader.length && !this.$slots.default
        ? tableHeader.map(item => (
          <el-table-column
            {...{ props: item }}
            prop={item.prop}
            label={item.label}
            scopedSlots={this.headerColScopedSlotsRender(item)}
          >
            {item.children ? this.headerRender(item.children) : null}
          </el-table-column>
        ))
        : (this.$slots.default || null);
    },
    /**
     * table的头部配置的过滤函数，用来过滤当选择表头时隐藏的表头
     * @param  {Array} tableHeader tableHeader 的配置
     * @param  {Function}  setFunc 设置每个表头项的方法
     */
    filterHeaders(tableHeader, setFunc = o => o) {
      const res = [];
      tableHeader &&
        tableHeader.map(item => {
          if (item.children) {
            item.children = this.filterHeaders(item.children, setFunc);
          }
          const setItem = setFunc(item);
          if (!setItem.hidden) {
            res.push(setItem);
          }
        });
      return res;
    },
    /**
     * 初始化展示表头的状态
     */
    initShowHeadersState() {
      const setShowHeadersState = [];
      this.filterHeaders(this.tableHeader, o => {
        setShowHeadersState.push(o.prop);
        return o;
      });
      return setShowHeadersState;
    },
    /**
     * 当鼠标右键事件，用来处理自定义表头等等
     * @param  {Event} e 右键事件
     */
    onContextmenu(e) {
      if ($(e.target).parents("thead").length) {
        e.stopPropagation();
        e.preventDefault();
        this.$refs.headerMenu.rightClick(e);
      }
    }
  },
  render(h) {
    const {

      listData,
      total,
      tableAttrs,
      currentPage,
      pageSize,
      pageProps,
      handleCurrentChange,
      handleSizeChange,
      pagination,
      showIdxCol,
      selectRow
    } = this;

    const pageOn = {
      "current-change": handleCurrentChange,
      "size-change": handleSizeChange
    };

    const setPageProps = {
      total,
      layout: "total,sizes,prev,pager,next,jumper",
      pageSizes: [10, 30, 50],
      background: true,
      ...pageProps,
      "current-page": currentPage,
      pageSize
    };

    // 设置显示序号
    const idxScopedSlots = {
      default: scope => {
        return (
          <span>{scope.$index + (this.pageSize * (currentPage - 1) + 1)}</span>
        );
      }
    };

    return (
      <div
        class="comp-datatable"
        {...{
          on: {
            contextmenu: this.onContextmenu
          }
        }}
      >
        <HeaderMenu
          ref="headerMenu"
          {...{
            props: { getTableObj: () => this }
          }}
        />
        <el-table
          ref="table"
          {...{
            directives: [
              {
                name: "loading",
                rawName: "v-loading",
                value: this.loading,
                expression: "loading"
              }
            ],
            on: { "selection-change": this.onSelectChange },
            attrs: { border: true, ...tableAttrs }
          }}
          data={ isArray(listData) ? listData : []}
        >
          {selectRow ? (
            <el-table-column width={35} label="" type="selection" />
          ) : null}
          {showIdxCol ? (
            <el-table-column
              width={60}
              render={this.renderIdx}
              label="序号"
              scopedSlots={idxScopedSlots}
            />
          ) : null}
          {this.headerRender(this.showHeaders)}
        </el-table>
        <div class="el-pagination-wrap">
          {!!total && pagination
            ? h(Pagination, { on: pageOn, props: setPageProps })
            : null}
        </div>
      </div>
    );
  }
};
</script>
