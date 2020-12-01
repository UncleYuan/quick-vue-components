<script>

import BaseList from "../../BaseList";
import MakeDialogMix from "../../commonMix/MakeDialogMix";
import Tag from "element-ui/lib/tag";
import Button from "element-ui/lib/button";
import "./style.scss";
export default {
  name: "SelectTable",
  mixins: [
    MakeDialogMix("selectModal", function(_this) {
      return { title: _this.modalConf.title, width: _this.modalConf.width };
    })
  ],
  tabName: "选择表格",
  model: {
    prop: "value", // 要存在于props
    event: "changeSelectTableSelection" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    baseListAttrs: {
      type: Object,
      default: () => ({})
    },
    modalConf: {
      type: Object,
      default: () => ({
        title: "请选择",
        width: "1200px"
      })
    },
    value: {
      type: Object,
      default: () => []
    },
    showKey: {
      type: String,
      default: "title"
    }
    // renderContent:{
    //   type:Function,
    //   default:
    // }
  },
  components: {
    BaseList,
    Button,
    Tag

  },
  data() {
    return {
      selectModalDialogVisible: false,
      mutipleSelection: this.value || []
    };
  },
  watch: {

    mutipleSelection: function(newVal, oldVal) {
      this.$emit("changeSelectTableSelection", newVal);
    },
    value: function(newVal) {
      this.changeSelectRow(newVal);
    }

  },
  methods: {
    changeSelectRow(newVal) {
      this.mutipleSelection = newVal;
    },
    getTableRender() {
      const _this = this;
      return [
        <base-list
          {...{
            model: {
              value: this.mutipleSelection,
              callback: function($$v) {
                _this.mutipleSelection = $$v;
              },
              expression: `mutipleSelection`
            },
            attrs: { ...this.baseListAttrs }
          }}
        />
      ];
    },
    removeItem(idx) {
      this.mutipleSelection.splice(idx, 1);
    },
    toggleModal() {
      this.selectModalDialogVisible = !this.selectModalDialogVisible;
    },
    renderContent(_this) {
      // const h = this.$createElement;
      return [
        <div class="select-table-content-wrap">
          {this.mutipleSelection.map((item, idx) => {
            // eslint-disable-next-line
            return h(
              Tag,
              {
                attrs: { closable: true },
                on: {
                  close: () => this.removeItem(idx)

                }
              },
              item[this.showKey]
            );
          })}
          {
            // eslint-disable-next-line
            h(
              Button,
              {
                attrs: { size: "small" },
                on: {
                  click: $event => this.toggleModal()
                }
              },
              "选择"
            )}
        </div>
      ];
    }
  },
  render(h) {
    return (
      <div class="select-table">
        {this.selectModalDialogRender(this.getTableRender())}
        {this.renderContent(this)}
      </div>
    );
  }
};
</script>
