
<script>
/**
 * 封装Tree为高阶组件支持v-model,更加适应表单场景
 */
import lodash from "lodash";
import Tree from "element-ui/lib/tree";
import Button from "element-ui/lib/button";
import Pagination from "element-ui/lib/pagination";
import Input from "element-ui/lib/input";
import "./style.scss";
import { setTreeLvKeys, getTreeDataByLvKeys } from "../../utils";

export default {
  name: "TreeExtend",
  model: {
    prop: "value", // 要存在于props
    event: "changeTreeValue" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    ...(Tree.props || {}),
    pageSize: {
      type: [Boolean, Number],
      default: false
    },
    value: {
      type: [Array],
      default: () => []
    },
    setHandlers: {
      type: [Object],
      default: () => ({})
    },
    getLabel: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      treeValue: this.value,
      searchKeyInput: "",
      searchKey: "",
      paginationMap: {}
    };
  },
  computed: {
    showData() {
      return this.filterShowData();
    }
  },
  watch: {
    treeValue: function(newVal, oldVal) {
      this.$emit("changeTreeValue", newVal);
    },
    value: function(newVal, oldVal) {
      if (!lodash.isEqual(newVal, oldVal)) {
        this.setTreeValue(newVal);
      }
    }
  },
  mounted() {
    if (this.getLabel) this.setTreeValue(this.treeValue);
  },
  methods: {
    filterShowData() {
      if (this.pageSize) {
        return this.filterData(
          lodash.cloneDeep(setTreeLvKeys(this.$props.data))
        );
      } else {
        return this.$props.data;
      }
    },
    filterData(data, lvKey = []) {
      return data.filter((o, i) => {
        // const nowLvKeyStr = [...lvKey, i].join("-");

        if (
          !this.searchKey &&
          (lvKey.length == 0 || this.isInPageRow(i, lvKey.join("-")))
        ) {
          if (o.children && o.children.length) {
            o.children = this.filterData(o.children, [...lvKey, i]);
          }
          return true;
        } else if (
          this.searchKey &&
          (o.label.indexOf(this.searchKey.replace(/(^\s*)|(\s*$)/g, "")) >= 0 ||
            (o.children && o.children.length))
        ) {
          if (o.children && o.children.length) {
            o.children = this.filterData(o.children, [...lvKey, i]);
            if (!o.children.length) {
              return false;
            }
          }
          return true;
        } else {
          return false;
        }
      });
    },
    isInPageRow(i, nowLvKeyStr) {
      if (!this.paginationMap[nowLvKeyStr]) {
        this.paginationMap[nowLvKeyStr] = {
          pageIndex: 1
        };
      }
      const pageIndex = this.paginationMap[nowLvKeyStr].pageIndex;
      const max = pageIndex * this.pageSize;
      const min = (pageIndex - 1 < 0 ? 0 : pageIndex - 1) * this.pageSize;
      return i >= min && i < max;
    },
    /**
     * @description 当选中时候的回调，设置组件值
     */
    onCheckChange() {
      this.treeValue = this.getTreeValue();

      this.$emit("check-change", ...arguments);
    },
    /**
     * @description 获取当前选中节点
     * @returns {Array}  选中的节点，可设置getLabel设置成员项带不带label
     */
    getTreeValue() {
      return this.$refs.tree[
        this.getLabel ? "getCheckedNodes" : "getCheckedKeys"
      ]();
    },
    /**
     * @description  设置当前选中节点
     * @param {any} v 设置要选中的节点，可设置getLabel设置成员项带不带label
     */
    setTreeValue(v) {
      this.$refs.tree["setCheckedKeys"](
        this.getLabel ? v.map((o) => o[this.nodeKey]) : v
      );
    },
    onPageIndexChange(i, data) {
      if (event) event.stopPropagation();

      this.paginationMap[data.lvKeys.join("-")].pageIndex = i;
      this.paginationMap = lodash.cloneDeep(this.paginationMap);
    },
    pageRander(ref) {
      const orgNodeData = getTreeDataByLvKeys(this.$props.data, ref.data.lvKeys);
      return !this.searchKey &&
        orgNodeData.children &&
        orgNodeData.children.length ? (
          <Pagination
            layout="prev, pager, next"
            page-size={this.pageSize}
            pager-count={3}
            size="mini"
            oncurrent-change={(i) => this.onPageIndexChange(i, ref.data)}
            total={orgNodeData.children.length}
          ></Pagination>
        ) : (
          <span></span>
        );
    }
  },
  /**
   * @description  通过封装为高阶组件支持v-model
   */

  render(h) {
    // let {} = this;
    // const slots = Object.keys(this.$slots)
    //   .reduce((arr, key) => arr.concat(this.$slots[key]), [])
    //   .map((vnode) => {
    //     vnode.context = this._self;
    //     return vnode;
    //   });
    const setProps = {
      ...this.$props,
      data: this.showData
    };
    const setScopedSlots = {
      ...this.$scopedSlots,
      default: this.pageSize
        ? (ref) => {
          // const { node, data } = ref;
          return h("div", { staticClass: ["pagination-node"] }, [
            this.$scopedSlots.default(ref),
            this.pageRander(ref)
          ]);
        }
        : this.$scopedSlots.default
    };
    const TreeNode = h(Tree, {
      ref: "tree",
      on: {
        ...this.$listeners,
        "check-change": this.onCheckChange,
        ...this.setHandlers
      },
      props: setProps,
      scopedSlots: setScopedSlots,
      attrs: { ...this.$attrs }
    });
    if (this.pageSize) {
      return h(
        "div",
        {
          staticClass: "pagination-wrap"
        },
        [
          h(
            Input,
            {
              staticClass: "pagination-search",
              model: {
                value: this.searchKeyInput,
                callback: ($$v) => {
                  this.searchKeyInput = $$v;
                }
              },
              props: {
                clearable: true
              },
              attrs: {
                placeholder: "请输入过滤选项"
              }
            },
            [
              h(Button, {
                attrs: { slot: "append", icon: "el-icon-search" },
                on: {
                  click: () => {
                    this.searchKey = this.searchKeyInput;
                  }
                },
                slot: "append"
              })
            ]
          ),
          TreeNode
        ]
      );
    }
    return TreeNode;
  }
};
</script>
<style lang="scss"  scoped>
.pagination-node {
  flex: 1;
  position: relative;
  .el-pagination {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
