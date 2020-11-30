<template>
  <div>
    <el-radio v-if="isToggleOptions" v-model="isShowOptions" label="1">有</el-radio>
    <el-radio v-if="isToggleOptions" v-model="isShowOptions" label="0">无</el-radio>
    <div v-if="!isToggleOptions||(isToggleOptions&&isShowOptions=='1')" style="display:inline-block">
      <component :is="comNameWrap" v-model="changeValue">
        <component
          :is="comName"
          v-for="obj in options"
          :key="obj.value"
          :label="obj.value"
        >{{ obj.label }}</component>
      </component>
    </div>

    <div style="display:inline-block;margin-left:15px;vertical-align: middle;">
      <el-input v-if="isTextValue&&isAddInput" v-model="addTextValue" placeholder="其他" />
    </div>
    <i
      v-if="isTextValue"
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
import lodash from "lodash";

import "./style.scss";
export default {
  name: "CheckBoxWrap",
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
      comNameWrap: this.multiple ? "el-checkbox-group" : "el-radio-group",
      comName: this.multiple ? "el-checkbox" : "el-radio",
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
      if (!lodash.isEqual(newVal, oldVal)) {
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
      // return lodash.isArray(checkedValue)
      //   ? checkedValue.join(",")
      //   : lodash.isString(checkedValue) || !this.multiple
      //   ? checkedValue
      //   : ``;

      return lodash.isArray(checkedValue)
        ? checkedValue
        : lodash.isString(checkedValue) || !this.multiple
          ? checkedValue
          : [];
    },
    propCheckedToSetDataChecked(checkedValue) {
      return lodash.isArray(checkedValue) || !this.multiple
        ? checkedValue
        : lodash.isString(checkedValue) && this.multiple
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
