<template>
  <div>
    <Radio v-if="isToggleOptions" :disabled="disabled" v-model="isShowOptions" label="1">有</Radio>
    <Radio v-if="isToggleOptions" :disabled="disabled" v-model="isShowOptions" label="0">无</Radio>
    <div v-if="!isToggleOptions||(isToggleOptions&&isShowOptions=='1')" style="display:inline-block">
      <component  :disabled="disabled" :is="comNameWrap" v-model="changeValue">
        <component
          :is="comName"
          v-for="obj in options"
          :key="obj.value"
          :label="obj.value"
        >{{ obj.label }}</component>
      </component>
    </div>

    <div style="display:inline-block;margin-left:15px;vertical-align: middle;">
      <Input v-if="isTextValue&&isAddInput"  :disabled="disabled" v-model="addTextValue" placeholder="其他" />
    </div>
    <i
      v-if="!disabled&&isTextValue"
      class="el-icon-close"
      style="margin-left:15px;cursor: pointer;"
      @click="clearValue"
    ></i>
  </div>
</template>
<script>
/**
 * 封装checkbox为高阶组件支持v-model,更加适应表单场景
 */
import isEqual from "lodash/isEqual";
import isArray from "lodash/isArray";
import isString from "lodash/isString";

import { Radio, Input, CheckboxGroup, RadioGroup, Checkbox } from "element-ui";

import "./style.scss";
export default {
  name: "CheckBoxWrap",
  components: {
    Radio,
    Input,
    CheckboxGroup,
    RadioGroup,
    Checkbox
  },
  model: {
    prop: "value", // 要存在于props
    event: "changeCheckBoxWrapValue" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: () => []
    },
    options: {
      type: [Array],
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isTextValue: {
      type: Boolean,
      default: false
    },
    isToggleOptions: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isShowOptions: this.value && this.value.length ? "1" : "0",
      changeValue:
        this.isTextValue && this.value.checkedValue
          ? this.propCheckedToSetDataChecked(this.value.checkedValue)
          : this.propCheckedToSetDataChecked(this.value),
      comNameWrap: this.multiple ? CheckboxGroup : RadioGroup,
      comName: this.multiple ? Checkbox : Radio,
      addTextValue:
        this.isTextValue && this.value.textValue ? this.value.textValue : ""
    };
  },
  computed: {
    isAddInput() {
      return this.isAddInputFilter();
    }
  },
  watch: {
    changeValue: function(newVal, oldVal) {
      let resValue = this.dataCheckedToSetPropChecked(newVal);
      if (this.isTextValue) {
        resValue = {
          checkedValue: this.dataCheckedToSetPropChecked(newVal),
          textValue: this.addTextValue
        };
      }
      if (this.isToggleOptions && newVal && newVal.length) {
        this.isToggleOptions = "1";
      }
      this.$emit("changeCheckBoxWrapValue", resValue);
    },
    addTextValue: function(newVal, oldVal) {
      let resValue = this.dataCheckedToSetPropChecked(newVal);
      if (this.isTextValue) {
        resValue = {
          checkedValue: this.dataCheckedToSetPropChecked(this.changeValue),
          textValue: newVal
        };
      }
      this.$emit("changeCheckBoxWrapValue", resValue);
    },
    value: function(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        if (this.isTextValue) {
          if (newVal.checkedValue) {
            this.changeValue = this.propCheckedToSetDataChecked(
              newVal.checkedValue
            );
          }

          if (newVal.textValue) this.addTextValue = newVal.textValue;
        } else {
          this.changeValue = this.propCheckedToSetDataChecked(newVal);
        }
        if (this.isToggleOptions && this.changeValue && this.changeValue.length) {
          this.isToggleOptions = "1";
        }
      }
    },
    isShowOptions(newVal) {
      if (newVal == "0") {
        this.changeValue = [];
      }
    }
  },
  mounted() {},
  methods: {
    dataCheckedToSetPropChecked(checkedValue) {
      return isArray(checkedValue)
        ? checkedValue
        : isString(checkedValue) || !this.multiple
          ? checkedValue
          : [];
    },
    propCheckedToSetDataChecked(checkedValue) {
      return isArray(checkedValue) || !this.multiple
        ? checkedValue
        : isString(checkedValue) && this.multiple
          ? checkedValue.split(",")
          : [];
    },
    isAddInputFilter(changeValue = this.changeValue, options = this.options) {
      let res = false;
      options.map((o) => {
        if (
          (o.label == "其他" || o.value == "other") &&
          changeValue.indexOf(o.value) >= 0
        ) {
          res = true;
        }
      });
      return res;
    },
    clearValue() {
      this.changeValue = this.multiple ? [] : "";
      this.addTextValue = "";
    }
  }
};
</script>
