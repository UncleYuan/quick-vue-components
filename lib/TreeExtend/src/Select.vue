<template>

  <TreeExtend
    v-model="treeValue"
    node-key="value"
    :data="setProps.data"
    :get-label="true"
    :show-checkbox="false"
  ></TreeExtend>

</template>

<script>
import isEqual from "lodash/isEqual";
import TreeExtend from "./TreeExtend";
export default {
  name: "TreeExtendSelect",
  components: { TreeExtend },
  model: {
    prop: "value", // 要存在于props
    event: "changeTreeExtendSelectValue" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    setProps: {
      type: Object,
      default: () => ({})
    }

  },
  data() {
    return {
      treeValue: this.value || []

    };
  },
  computed: {

  },
  watch: {
    treeValue: function(newVal, oldVal) {
      this.$emit("changeTreeExtendSelectValue", newVal);
    },
    value: function(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.treeValue = newVal;
      }
    }
  },
  mounted() {},
  destroyed() {},
  methods: {

  }
};
</script>

<style lang="scss" scoped></style>
