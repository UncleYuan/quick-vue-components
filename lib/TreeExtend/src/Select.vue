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
import lodash from "lodash";
export default {
  name: "TreeExtendSelect",
  components: {},
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
      if (!lodash.isEqual(newVal, oldVal)) {
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
