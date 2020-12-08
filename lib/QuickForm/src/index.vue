<script>
import indexOf from "lodash/indexOf";
import isUndefined from "lodash/isUndefined";
import findIndex from "lodash/findIndex";
import cloneDeep from "lodash/cloneDeep";
import isFunction from "lodash/isFunction";
import isEqual from "lodash/isEqual";
import isArray from "lodash/isArray";

import Button from "element-ui/lib/button";
import Row from "element-ui/lib/row";
import Col from "element-ui/lib/col";
import Form from "element-ui/lib/form";
import FormItem from "element-ui/lib/form-item";
import { memberComponents } from "./config";

import submitToServerMix from "../../commonMix/submitToServerMix";
import "./style.scss";

export default {
  memberComponents,
  name: "QuickForm",
  components: {
    Row,
    Col,
    FormItem,
    Form
  },
  mixins: [submitToServerMix],

  /**
   * 设置formvalue
   */
  model: {
    prop: "value", // 要存在于props
    event: "changeValue" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    resetBtnToClear: {
      type: Boolean,
      default: true
    }, // true 重置按钮直接清除数据，false则为恢复初始数据
    formRefObj: {
      // 获取内部el-form的实例
      type: [Boolean, Object, Function],
      default: false
    },
    mountedHandler: {
      // 渲染完成时的回调
      type: [Function, Boolean],
      default: false
    },
    isSlotRender: {
      // 是否支持从slot渲染表单，使用 scopedSlots 获取 submitForm FormValue
      type: Boolean,
      default: false
    },
    renderData: {
      // 表单项的渲染配置
      type: Array,
      default: () => []
    },
    renderDataFilter: {
      // 表单项的渲染配置过滤·方法
      type: Function,
      default: (res) => res
    },
    // 设置Form的props
    formProps: {
      type: Object,
      default: () => {}
    },
    formSize: {
      type: [String],
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    }, // 设置表单项的disabled
    // 设置Form的value
    value: {
      type: Object,
      default: () => ({})
    },

    // 设置Form的group基础数据
    baseGroupConf: {
      type: Object,
      default: () => ({
        type: "group",
        childForm: []
      })
    },
    onSubmit: {
      // 当表单提交时的回调 ，也可以直接监听 submit
      type: Function,
      default: () => {}
    },
    afterValueChange: {
      // 当表单值改变时候的回调 ，也可以直接监听value-change
      type: Function,
      default: () => {}
    },
    // 设置btnGroup的col属性设置
    buttonGroupColConfig: {
      // 表单项按钮组 el—col 的配置
      type: [Object, Boolean],
      default: () => ({
        span: 24,
        style: {
          "text-align": "center"
        }
      })
    },
    buttonGroupRender: {
      // 表单项按钮组的渲染函数
      type: Function,
      default: (value, submitFunc, resetFunc, createElement, validate, vm) => {
        // eslint-disable-next-line
        const h = createElement;
        return [
          <Button type="primary" size={vm.formSize} on-click={submitFunc}>
            提交
          </Button>,
          <Button size={vm.formSize} on-click={resetFunc}>重置</Button>
        ];
      }
    },
    formItemContentRender: {
      // 表单项formItem的渲染函数
      type: Function,
      default: (result, setConf, value) => {
        return result;
      }
    },
    fieldStyle: {
      // 表单项formItem的style ,也可以单独给每一项设置fieldStyle
      type: [Object, String],
      default: () => ({})
    },
    propsData: {
      // 用来存储数据，无其他用处
      type: [Object],
      default: () => ({})
    }
  },
  data() {
    return {
      formValue: this.value,
      valueFormulaMap: {},
      urlOptionsMap: {}
    };
  },
  // 监听formValue变化传递变化
  watch: {
    formValue: function(newVal, oldVal) {
      this.$emit("changeValue", newVal);
    },
    value: function(newVal, oldVal) {
      this.formValue = newVal;
    }
  },
  created() {},
  mounted() {
    this.$emit("mountedHandler", this);
    if (this.mountedHandler) this.mountedHandler(this);
  },
  methods: {
    checkValueFormulaMap(val) {
      Object.keys(this.valueFormulaMap).map(key => {
        let setText = this.valueFormulaMap[key];
        const matchListKey = setText.match(/{\w*}/g);
        if (!matchListKey) return;
        matchListKey.map(setKey => {
          const getValKey = setKey.replace(/{(\w*)}/g, "$1");
          setText = setText.replace(
            new RegExp(setKey, "g"),
            val[getValKey] ? val[getValKey] : "0"
          );
        });
        try {
          setText = setText.replace(/{(\w*)}/g, "0");
          // eslint-disable-next-line
          eval(`window.ValueFormulaResult=${setText}`);
        } catch (e) {
          console.log(e);
          console.log("解析错误");
        }

        if (typeof window.ValueFormulaResult != "undefined") {
          this.$set(this.formValue, key, window.ValueFormulaResult);
        }

        delete window.ValueFormulaResult;
      });
      // this.formValue=val;
    },
    /**
     * 循环渲染表单项
     */
    formRender() {
      const { renderData, renderDataFilter } = this;
      let renderNodeArr = [];
      if (Array.isArray(renderData)) {
        renderNodeArr = renderDataFilter(renderData, this.formValue, this).map((item, idx) => {
          return this.filterFormItem(item, idx, renderData);
        });
      }

      return renderNodeArr;
    },
    /**
     * 判断是否是成员项组件
     *
     * @memberof MagicForm
     */
    isMemberComponents(type) {
      let isMemberComponents = false;
      let memberListIndex = -1;
      let memberType = "";
      memberComponents.map((conf, idx) => {
        if (!type) return;
        const findTypeIdx = indexOf(conf.type, type);
        if (findTypeIdx >= 0) {
          isMemberComponents = true;
          memberListIndex = idx;
          memberType = conf.type[findTypeIdx];
        }
      });
      return { isMemberComponents, memberListIndex, memberType };
    },
    /**
     * 表单项的固定前置方法。一些公用事件和属性的绑定
     *
     * @memberof MagicForm
     */

    prevResultItem(item, { isMemberComponents, memberListIndex, memberType }) {
      let { value } = this;
      // eslint-disable-next-line
      const { name, rules, onChange, ...baseProps } = item;

      if (isUndefined(value)) value = {};

      return { baseProps, name };
    },
    /**
     *成员项渲染方法
     *
     * @memberof MagicForm
     */
    memberComponentsRender(memberType, NodeConf, idx, memberListIndex) {
      const _this = this;
      const { value, formValue, afterValueChange } = this;
      const renderMemberComponent = memberComponents[memberListIndex].Component;
      // eslint-disable-next-line
      let { baseProps, name } = NodeConf;

      //   if(!baseProps.options&&baseProps.url&&this.urlOptionsMap[name]){  //判断是否有url获取的options并且设置
      //     baseProps.options=this.urlOptionsMap[name];
      //  }
      const setDisabled = isUndefined(baseProps.disabled)
        ? this.disabled
        : baseProps.disabled; // 判断disabled
      baseProps = memberComponents[memberListIndex].propsFilter
        ? memberComponents[memberListIndex].propsFilter(
          baseProps,
          name,
          value,
          this.$createElement,
          setDisabled
        )
        : baseProps;
      // eslint-disable-next-line
      const {
        type,
        compType,
        style,
        childRender,
        rules,
        // eslint-disable-next-line no-unused-vars
        disabled,
        valueFormula,
        afterItemValueChange,
        fieldAttrs,
        ...filterBaseProps
      } = baseProps;

      let required = false;
      // 自动加上必填

      if (rules && rules.length && findIndex(rules, o => o.required) >= 0) {
        required = true;
      }
      const setProps = {
        key: idx,
        type: compType,
        required,
        ...filterBaseProps,
        disabled: setDisabled,
        // label: false,
        name
      };

      if (
        memberComponents[memberListIndex].Component.props &&
        memberComponents[memberListIndex].Component.props.mergeGetParams
      ) {
        setProps.mergeGetParams = this.formValue;
      }

      return this.$createElement(
        renderMemberComponent || "span",
        {
          ref: `formItem_${name}`,
          on: {
            ...setProps.onProps
          },
          style,
          attrs: {

            ...(fieldAttrs || {})
          },
          props: { ...setProps },
          model: {
            value: formValue[name],
            callback: function($$v) {
              // formValue[name] != $$v
              if (!valueFormula && formValue[name] != $$v) {
                // 当设置值的关联规则的时候，不能填写
                const changVal = cloneDeep(_this.formValue);
                changVal[name] = $$v;
                _this.formValue = changVal;

                _this.checkValueFormulaMap(_this.formValue);
                if (isFunction(afterItemValueChange)) {
                  afterItemValueChange(name, $$v, _this);
                }
                if (isFunction(afterValueChange)) {
                  afterValueChange(_this.formValue, _this);
                }
                if (isFunction(baseProps.afterChange)) {
                  baseProps.afterChange($$v, name, _this);
                }
                _this.$emit("value-change", name, $$v, _this); // 可以监听表单值改变事件
              }
            },
            expression: `formValue.${name}`
          }
        },

        renderMemberComponent || type == "onlyLabel"
          ? childRender || null
          : "没有匹配的组件，请检查您的参数是否正确"
      );
    },
    /**
     * 插槽渲染
     */
    slotRender(NodeConf) {
      let render;
      if (isFunction(NodeConf.render)) {
        render = NodeConf.render(this.formValue);
      } else if (
        NodeConf.render &&
        NodeConf.render.html &&
        NodeConf.render.attrs
      ) {
        render = (
          <div
            {...{ attrs: NodeConf.render.attrs, style: NodeConf.render.style }}
            domPropsInnerHTML={NodeConf.render.html}
          />
        );
      } else {
        render = NodeConf.render || null;
      }
      return render;
    },
    /**
     * 过滤表单项类型
     */
    filterFormItem(item, idx, parentList) {
      const { baseGroupConf } = this;
      let result = [];
      const isSolt = indexOf(["slot"], item.type) >= 0;
      let isGroup = false;

      if (item.valueFormula) { this.valueFormulaMap[item.name] = item.valueFormula; } // valueFormula用于后期关联表单值
      if (isEqual(item, {}) || isEqual(item, { inline: undefined })) {
        return this.renderEmpty();
      }
      if (isArray(item)) {
        // 假如表单项是数组，则自动将其配置成group
        const makeGroup = cloneDeep(baseGroupConf);

        makeGroup.childForm = item;

        item = makeGroup;
      }
      isGroup = indexOf(["group"], item.type) >= 0;

      const { ...filterItem } = item;
      const {
        isMemberComponents,
        memberListIndex,
        memberType
      } = this.isMemberComponents(item.type);
      const NodeConf =
        isSolt || isGroup
          ? filterItem
          : this.prevResultItem(filterItem, {
            isMemberComponents,
            memberListIndex,
            memberType
          });

      // .

      switch (true) {
        case isMemberComponents:
          // 表单成员项渲染
          result = this.memberComponentsRender(
            memberType,
            NodeConf,
            idx,
            memberListIndex
          );
          break;

        case indexOf(["textNode"], item.type) >= 0:
          // 占位文本
          result = item.name
            ? this.flatValue(this.formValue)[item.name]
            : item.text;
          break;

        case isSolt:
          // 外部插槽
          result = this.slotRender(NodeConf, idx);
          break;
        case isGroup:
          // group渲染

          result = this.FormGroupRender(NodeConf, item);

          break;
        default:
          // 默认类型
          result = this.defaultRender(NodeConf, idx);
          break;
      }
      if (isSolt && !NodeConf.haveWrap) {
        return result;
      }

      return isGroup
        ? result
        : this.renderFieldWrap({
          ...filterItem,
          ...{ result },
          idx,
          parentList
        });
    },
    /*
  组渲染方法
 */
    FormGroupRender(NodeConf, item) {
      let result = null;

      const FormGroupBox = NodeConf.GroupBox ? NodeConf.GroupBox : Row;
      result = this.$createElement(
        FormGroupBox,
        {
          props: {
            ...NodeConf,
            className: item.className ? item.className : ""
          }
        },
        [
          item.childForm.map((groupItem, groupIdx) => {
            return this.filterFormItem(groupItem, groupIdx, item.childForm);
          })
        ]
      );

      if (NodeConf.wrapRender) {
        result = NodeConf.wrapRender(result, this.formValue);
      }
      return result;
    },
    renderFieldWrap(itemConf) {
      /* eslint-disable */
      let {
        itemWidth,
        layoutCol,
        result,
        labelAlign,
        contWidth,
        rules,
        label,
        prop,
        name,
        labelHide,
        nowrap,
        fieldStyle,
        formItemContentRender,
        formItemProps,
        idx,
        parentList,
        labelLeft, // 表单左边的插槽
        labelRight, // 表单右边的插槽
        ...otherProps
      } = itemConf;
     /* eslint-enable */
      const setFormFieldStyle = {
        ...this.fieldStyle,
        ...(fieldStyle || {})
      };
      layoutCol = layoutCol || 24;
      const setLayoutCol =
        typeof layoutCol == "number"
          ? {
            span: layoutCol
          }
          : layoutCol;
      const willSetFieldProps = {
        label: label && !labelHide ? label : undefined,

        prop: prop || name,
        required:
          !!(rules && findIndex(rules, { required: true }) >= 0),
        rules,
        ...formItemProps
      };

      formItemContentRender = isFunction(formItemContentRender)
        ? formItemContentRender
        : this.formItemContentRender;

      if (nowrap) {
        // 假如是nowrap类型的时候不用包裹el-form-item
        return this.$createElement(
          "div",
          { props: { className: "nowrap-form-item" }},
          [
            labelLeft || null,
            formItemContentRender(
              result,
              itemConf,
              this.formValue,
              idx,
              parentList
            ),
            labelRight || null
          ]
        );
      }
      return this.$createElement(
        Col,
        {
          props: { ...setLayoutCol }
        },
        [
          this.$createElement(
            FormItem,
            { style: setFormFieldStyle, props: willSetFieldProps },
            [
              labelLeft || null,
              formItemContentRender(
                result,
                itemConf,
                this.formValue,
                idx,
                parentList
              ),
              labelRight || null
            ]
          )
        ]
      );
    },
    submitForm(mergeData = {}, isValid = true) {
      if (!isValid) {
        this.validSuccessAfterFunc(mergeData);
        return;
      }
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.validSuccessAfterFunc(mergeData);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    getFormRefObj(formRefObj) {
      if (!formRefObj) {
        return false;
      } else if (typeof formRefObj == "function") {
        return formRefObj();
      } else {
        return formRefObj;
      }
    },
    submitSlotForm(mergeData = {}, formRefObj) {
      // 从template里的el-form提交参数
      const formObj =
        formRefObj ||
        this.getFormRefObj(this.formRefObj) ||
        this.findChildrenForm();
      if (!formObj) {
        this.validSuccessAfterFunc(mergeData);
        return;
      }
      formObj.validate(valid => {
        if (valid) {
          this.validSuccessAfterFunc(mergeData);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    findChildrenForm() {
      let res = false;
      this.$children.map(o => {
        if (
          o.$attrs.slotType == "form" ||
          o.$el.getAttribute("slot-type") == "form"
        ) {
          res = o;
        }
      });
      return res;
    },
    validSuccessAfterFunc(mergeData) {
      console.log(this.formValue.__ob__.value);
      let setVal = cloneDeep(this.formValue.__ob__.value);
      setVal = Object.assign(setVal, mergeData);
      this.onSubmit(setVal);
      this.$emit("submit", setVal);
      if (this.url) {
        // 加入有url，然后提交url数据
        const newFetchData = this.getJson(this.fetchData);
        this.goFetchFunc({ ...setVal, ...newFetchData });
      }
    },
    goSubmitDataToServer(val) {},
    resetForm() {
      if (this.resetBtnToClear) {
        this.formValue = {};
      } else {
        this.$refs["form"].resetFields();
      }
    }
  },
  render(h) {
    const {
      formValue,

      buttonGroupColConfig,
      formProps,
      formSize,
      buttonGroupRender,
      isSlotRender
    } = this;

    const formAttrs = {
      ...formProps,
      size: formSize || undefined,
      model: formValue
    };
    const { style, ...otherBtnColAttrs } = buttonGroupColConfig || {};
    const validate = this.$refs["form"] ? this.$refs["form"].validate : undefined;
    return (
      <div class="comp-quickform">
        {!isSlotRender
          ? null
          : this.$scopedSlots.default({
            formValue,
            submitForm: this.submitSlotForm
          })}
        {isSlotRender ? null : (
          <Form {...{ attrs: formAttrs }} ref="form">
            <Row gutter={20}>
              {this.formRender()}
              {buttonGroupColConfig ? (
                <Col
                  class="button-col-wrap"
                  {...{ attrs: otherBtnColAttrs }}
                  style={style}
                >
                  {buttonGroupRender
                    ? buttonGroupRender(
                      formValue,
                      this.submitForm,
                      this.resetForm,
                      h,
                      validate,
                      this
                    )
                    : []}
                </Col>
              ) : null}
            </Row>
          </Form>
        )}
      </div>
    );
  }
};
</script>
