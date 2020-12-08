<script>
import { Button, Dialog } from "element-ui";
import cx from "classnames";
import QuickForm from "../../QuickForm";
import submitToServerMix from "../../commonMix/submitToServerMix";
import "./style.scss";
import request from "../../utils/request";

export default {
  name: "PowerfulBtn",
  components: {
    Button,
    QuickForm
  },
  mixins: [submitToServerMix],
  model: {
    prop: "value", // 要存在于props
    event: "changePowerfulBtnValue" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    asDom: {

      type: [String, Object],
      default: ""
    },
    noWrap: {
      type: [Boolean, String],
      default: false
    },
    block: {
      type: Boolean,
      default: false
    },

    onClick: {
      type: Function,
      default: () => {}
    },
    type: {
      type: String,
      default: "diy"
    },
    size: {
      type: String,
      default: ""
    },
    // 内部组件设置props 部分 start
    // 设置Form的props
    toSetQuickformAttr: {
      type: Object,
      default: () => ({})
    },
    buttonProps: {
      type: Object,
      default: () => ({})
    },
    dialogDefaultAttrs: {
      type: Object,
      default: () => ({ })
    },
    dialogAttrs: {
      type: Object,
      default: () => ({})
    },
    defaultCreatedDialogForm: {
      type: Boolean,
      default: false
    },
    resetToSetValue: {
      type: Boolean,
      default: false
    },
    // 内部组件设置props 部分 end

    // 类型表单设置部分 start
    value: {
      type: Object,
      default: () => ({})
    },
    formRenderDataFilter: {
      type: Function,
      default: res => res
    },
    // 类型表单设置部分 end

    // 内置数据提交部分  start
    /* 主要部分从其他地方混个 */
    beforeGetFormDataDialogShow: {
      type: Function,
      default: cb => cb()
    },
    // 内置表单提交部分  end
    // confirmToFetch   提交部分  start
    confirmText: {
      type: String,
      default: "确认这样吗？"
    },
    confirmTitle: {
      type: String,
      default: "系统提示"
    },
    confirmType: {
      type: String,
      default: "warning"
    },

    // confirmToFetch   提交部分  end
    // 当为form类型时，自动获取表单回填数据部分 start
    getFormDataUrl: {
      type: String,
      default: ""
    },
    getFormDataFetchType: {
      type: String,
      default: "get"
    },
    getFormDataFetchData: {
      type: Object,
      default: () => ({})
    },
    getFormDataFetchDataFilter: {
      type: Function,
      default: res => res
    },
    getFormDataResDataFilter: {
      type: Function,
      default: res => res
    },
    formFetchToSetValueFilter: {
      type: Function,
      default: res => res
    },
    loadingText: {
      type: String,
      default: ""
    }

    // 当为form类型时，自动获取表单回填数据部分 end
  },
  data() {
    return {
      formValue: this.value,
      dialogVisible: false
    };
  },
  watch: {
    value: function(newVal) {
      if (this.resetToSetValue) this.formValue = newVal;
    },
    formValue: function(newVal) {
      this.$emit("changePowerfulBtnValue", newVal);
    },
    dialogVisible() {
      console.log(11111111);
    }
  },
  methods: {
    // 判断不同类型的点击事件
    onBtnClick(e) {
      e.stopPropagation();

      const { type, onClick, formValue } = this;
      if (typeof onClick == "function") {
        const res = onClick(formValue);
        if (typeof res == "boolean" && !res) {
          return;
        }
      }
      switch (type) {
        // case "link":
        //   browserHistory.push(url);
        //   break;
        case "fetch":
          this.onFetchBtnClick();
          break;
        case "form":
          this.onFormBtnClick();
          break;
        case "confirmToFetch":
          this.onConfirmToFetchBtnClick();
          break;
        // case "back":
        //   if (window.reactHistory) {
        //     window.reactHistory.goBack();
        //   } else {
        //     browserHistory.goBack();
        //   }
        //   break;
        default:
          //  onClick();
          break;
      }
    },
    onFetchBtnClick() {
      this.goFetchFunc(this.fetchData);
    },
    onConfirmToFetchBtnClick() {
      const { confirmText, confirmTitle, confirmType, fetchData } = this;

      this.$confirm(confirmText, confirmTitle, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: confirmType
      })
        .then(() => {
          this.goFetchFunc(fetchData);
        })
        .catch(() => {});
    },
    onFormBtnClick() {
      const { beforeGetFormDataDialogShow } = this;

      this.getFormValueData(setValue => {
        // 获取完数据后执行表单显示前置方法，此方法可以让使用组件的人，从外部控制何时显示 Dialog,默认直接展示
        beforeGetFormDataDialogShow(v => {
          this.formValue = v || setValue;
          this.dialogVisible = true;
        }, setValue);
      }, this.fetchData);
    },
    async getFormValueData(cb, mergeData = {}) {
      // 获取表单数据回填
      const {
        getFormDataUrl,
        getFormDataFetchType,
        getFormDataFetchData,
        getFormDataFetchDataFilter,
        isResultSuccess,
        formFetchToSetValueFilter,
        getFormDataResDataFilter,
        defaultResFilter
      } = this;
      let setVal = this.getJson(this.formValue);
      let getFormDataFetchDataParams = { ...mergeData };
      if (getFormDataUrl) {
        this.changeLoadingStatus(true);
        getFormDataFetchDataParams = getFormDataFetchDataFilter(
          Object.assign({}, getFormDataFetchData, mergeData)
        );
        // 最终请求带过去的参数
        let res = await request({
          url: getFormDataUrl,
          method: getFormDataFetchType,
          [getFormDataFetchType == "get" ? "params" : "data"]: getFormDataFetchDataParams

        });

        try {
          res = defaultResFilter(res);
          res = getFormDataResDataFilter(res);
          this.changeLoadingStatus(false);
          if (isResultSuccess(res)) {
            setVal = {
              ...setVal,
              ...res.data
            };
            cb(formFetchToSetValueFilter(setVal, getFormDataFetchDataParams));
            // 请求成功执行到下一环节
          } else {
            throw res;
          }
        } catch (res) {
          this.changeLoadingStatus(false);

          this.$notify({
            title: res.message || "系统错误",
            type: "error"
          });
        }
      } else {
        cb(formFetchToSetValueFilter(setVal, getFormDataFetchDataParams));
      }
    },
    onFormSubmit(v) {
      // 表单提交的方法

      const formData = this.getJson(v);
      const setFetchData = {
        ...this.fetchData,
        ...formData
      };
      if (!this.url) {
        // 没有地址则直接传递值
        this.toSetQuickformAttr.onSubmit &&
          this.toSetQuickformAttr.onSubmit(v, setFetchData, this);
      } else {
        this.goFetchFunc(setFetchData);
      }
    },

    onSuccessReset() {
      // 成功以后的重置方法
      const { type } = this;
      if (type == "form") {
        this.dialogVisible = false;
        this.formValue = {};
      }
    },
    /* async goFetchFunc 从混合中提取  */

    dialogRender() {
      // 弹框渲染方法
      const {
        dialogVisible,
        type,
        dialogDefaultAttrs,
        dialogAttrs,
        formValue,
        toSetQuickformAttr,
        fetchData,
        formRenderDataFilter,
        defaultCreatedDialogForm
      } = this;
      const { renderData, ...filterQuickformAttr } = toSetQuickformAttr;
      const setForm = this.$createElement("quick-form", {
        ref: "QuickForm",
        attrs: {
          ...filterQuickformAttr,
          renderData: formRenderDataFilter(renderData, formValue, fetchData),
          onSubmit: this.onFormSubmit,
          value: formValue
        },
        model: {
          value: this.formValue,
          callback: $$v => {
            this.formValue = $$v;
          }
        }
      }); // 设置quick form的内容
      return type == "form" && (defaultCreatedDialogForm || dialogVisible)
        ? this.$createElement(
          Dialog,
          {
            attrs: {
              title: "提示",
              width: "900px",
              modal: false,
              ...dialogDefaultAttrs,
              ...dialogAttrs,
              visible: dialogVisible
            },
            on: {
              "update:visible": $event => {
                this.dialogVisible = $event;
              }
            }
          },
          [setForm]
        )
        : null;
    }
  },
  render(h) {
    const {
      asDom,
      loading,
      loadingText,
      block,
      size,
      style,
      buttonProps
    } = this;

    const setButtonAttrs = {
      block,
      size: size || undefined,
      ...buttonProps,
      loading
    };

    const setWrapClass = cx({
      "powerful-btn-wrap": true,
      block: block
    });
    const buttonVnode = h(
      asDom || Button,
      {
        attrs: setButtonAttrs,
        style,
        on: {
          click: !loading ? this.onBtnClick : undefined
        }
      },
      loading ? loadingText : this.$slots.default
    );
    if (this.noWrap) {
      /**/

      const bodyLineHeight =
        parseFloat(window.getComputedStyle(document.body, null).lineHeight) /
        parseFloat(window.getComputedStyle(document.body, null).fontSize);
      return this.dialogVisible ? (
        <div
          style={{
            textAlign: "left",
            zIndex: 2000,
            lineHeight: bodyLineHeight
          }}
          class={`el-button el-button--${
            setButtonAttrs.type ? setButtonAttrs.type : "default"
          } el-button--${
            setButtonAttrs.size ? setButtonAttrs.size : "mini"
          } ${setButtonAttrs.class || ""}`}
        >
          {buttonProps.icon ? <i class={buttonProps.icon} /> : null}
          {this.dialogRender()}
          {loading ? loadingText : this.$slots.default}
        </div>
      ) : (
        buttonVnode
      );
    }
    return (
      <div class={setWrapClass}>
        {this.dialogRender()}
        {buttonVnode}
      </div>
    );
  }
};
</script>
