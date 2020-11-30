<template>
  <div class="number-range-wrap">
    <el-input-number v-model="rangeValue[0]" :max="rangeValue[1]?rangeValue[1]:undefined" />
    <span v-if="joinText" class="join-text">{{ joinText }}</span>
    <el-input-number v-model="rangeValue[1]" :min="rangeValue[0]?rangeValue[0]:0" />
    <span v-if="unitText" class="unit-text">{{ unitText }}</span>
  </div>
</template>

<script>
import lodash from "lodash";
/*
  数字范围组件
*/
export default {
  name: 'NumberRange',
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
      rangeValue: []
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
      if (newVal && lodash.isArray(newVal)) {
        this.rangeValue = newVal;
      }
    }
  },
  methods: {

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
