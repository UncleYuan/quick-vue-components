<script>
import isString from "lodash/isString";
import isArray from "lodash/isArray";
import Upload from "element-ui/lib/upload";

export default {
  name: "FileUpComp",
  components: {
    Upload
  },
  model: {
    prop: "value", // 要存在于props
    event: "changeFileValue" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    ...Upload.props,
    value: {
      type: [Array, String],
      default: () => []
    }
  },
  data() {
    return {
      fileDataList: this.filterValue(this.value || []),
      loading: false
    };
  },

  watch: {
    fileDataList: function(newVal, oldVal) {
      this.$emit("changeFileValue", newVal);
    },
    value: function(newVal) {
      this.fileDataList = newVal;
    }
  },
  methods: {
    filterValue(val) {
      let res = [];
      if (val && isString(val)) {
        try {
          res = JSON.parse(val);
        } catch (e) {
          console.log("转换字符串fileDataList数组失败");
        }
      } else if (isArray(val)) {
        res = val;
      }
      return res;
    },
    onFileChange(file, fileList) {
      let loading = false;
      fileList &&
        fileList.length &&
        fileList.map(o => {
          if (o.status == "ready" || o.status == "uploading") {
            loading = true;
          }
        });
      this.fileDataList = fileList;
      this.loading = loading;
    }
  },
  render(h) {
    const slots = Object.keys(this.$slots)
      .reduce((arr, key) => arr.concat(this.$slots[key]), [])
      .map(vnode => {
        vnode.context = this._self;
        return vnode;
      });
    const setProps = {
      ...this.$props,
      fileList: this.fileDataList,
      onChange: this.onFileChange,
      onRemove: this.onFileChange
    };

    return h(
      Upload,
      {
        directives: [
          {
            name: "loading",
            rawName: "v-loading",
            value: this.loading,
            expression: "false"
          }
        ],
        on: this.$listeners,
        props: setProps,
        scopedSlots: this.$scopedSlots,
        attrs: {
          class: this.disabled ? "file-disabled" : undefined,
          ...this.$attrs,
          "element-loading-text": this.loading ? "文件上传中" : ""
        }
      },
      slots
    );
  }
};
</script>
<style lang="scss"  >
.file-disabled {
  .el-upload.el-upload--text {
    display: none;
  }
  .el-upload-list__item:first-child{
    margin-top:3px;
  }
}
</style>
