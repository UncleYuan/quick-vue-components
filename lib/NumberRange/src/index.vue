<template>
  <div class="number-range-wrap">
    <InputNumber v-model="rangeValue[0]" :max="rangeValue[1]?rangeValue[1]:undefined" @blur="inputNumberBlur(0,rangeValue[0])"/>
    <span v-if="joinText" class="join-text">{{ joinText }}</span>
    <InputNumber v-model="rangeValue[1]" :min="rangeValue[0]?rangeValue[0]:0" @blur="inputNumberBlur(1,rangeValue[1])"/>
    <span v-if="unitText" class="unit-text">{{ unitText }}</span>
  </div>
</template>

<script>
import isArray from "lodash/isArray";
import { InputNumber } from "element-ui";
/*
  数字范围组件
*/
export default {
  name: 'NumberRange',
  components: {
    InputNumber
  },
  model: {
    prop: "value",
    event: "changeNumberRangeValue"
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    joinText: {
      type: String,
      default: "-"
    },
    unitText: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      rangeValue: this.value && isArray(this.value)?this.value:[]
    };
  },
  watch: {
    rangeValue: {
      deep: true,
      handler(newVal) {
        this.$emit('changeNumberRangeValue', newVal);
      }
    },
    value(newVal) {
      if (newVal && isArray(newVal)) {
        this.rangeValue = newVal;
      }
    }
  },
  methods: {
    inputNumberBlur(index){
      (this.rangeValue[index] > Number(999999999)) ? this.rangeValue.splice(index,1,Number(999999999)) : false;
      this.$emit('inputNumberBlur',index)
    }
  }
};
</script>

<style lang="scss" scoped>
.number-range-wrap {
  display: flex;
  >>> .el-el-input-number{
    flex:1;
  }
  .join-text{
    padding:0 5px;
  }
  .unit-text{
    padding:0 5px;
  }
}

</style>
