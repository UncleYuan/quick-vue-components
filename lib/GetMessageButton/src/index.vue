<template>
  <el-button type="primary" @click="onBtnClick">{{ defaultText }}</el-button>
</template>

<script>
import { get, post } from '../../utils/http';
const http = { get, post };
export default {
  name: "GetMessageButton",

  props: {
    defaultText: {
      type: String,
      default: "获取动态密码"
    },
    url: {
      type: String,
      default: ""
    },
    fetchData: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      time: 0
    };
  },

  methods: {
    onBtnClick() {
      if (!this.url) return;
      http.get(this.url, this.fetchData).then(d => {
        console.log(d);
      });
    },
    handleReset() {
      this.$refs.form.resetFields();
    }
  }
};
</script>
