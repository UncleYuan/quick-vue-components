
<script>
/**
 * 封装Tree为高阶组件支持v-model,更加适应表单场景
 */
import lodash from "lodash";
import TreeExtend from "../../TreeExtend";
import "./style.scss";
export default {
  name: "SelectTree",
  model: {
    prop: "value", // 要存在于props
    event: "changeSelectTreeValue" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    value: {
      type: [Array],
      default: () => []
    },
    treeProps: {
      type: [Object],
      default: () => ({})
    }
  },
  data() {
    return {
      treeValue: this.value
    };
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
  mounted() {},
  methods: {},

  render(h) {
    const slots = Object.keys(this.$slots)
      .reduce((arr, key) => arr.concat(this.$slots[key]), [])
      .map(vnode => {
        vnode.context = this._self;
        return vnode;
      });
    return h(
      TreeExtend,
      {
        ref: "tree",
        on: {
          "node-click": o => {
            this.treeValue;
          }
        },
        props: {},
        scopedSlots: this.$scopedSlots,
        attrs: { ...this.$attrs }
      },
      slots
    );
  }
};
</script>
