<template>
  <div v-loading="showLoadingIcon&&loading" class="data-load-wrap">
    <slot />
  </div>
</template>
<script>
import "./style.scss";
import findInfoDataMix from "../../commonMix/findInfoDataMix";
export default {
  name: "DataLoad",
  components: {},
  mixins: [findInfoDataMix],
  model: {
    prop: "propData", // 要存在于props
    event: "changeInfoData" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    showLoadingIcon: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {

    };
  },
  watch: {
    propData: function(newVal) {
      this.infoData = newVal;
    },
    infoData: function(newVal) {
      this.$emit("changeInfoData", newVal);
    }
  },
  created() {},
  mounted() {},
  methods: {}
};
</script>
