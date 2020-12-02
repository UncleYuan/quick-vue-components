<template>
  <Button type="primary" @click="onBtnClick">{{ defaultText }}</Button>
</template>

<script>
import request from '../../utils/request';
import Button from "element-ui/lib/button";

export default {
  name: "GetMessageButton",
  components: { Button },
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
      request({
        url: this.url,
        method: "get",
        params: this.fetchData

      }).then(d => {
        console.log(d);
      });
    },
    handleReset() {
      this.$refs.form.resetFields();
    }
  }
};
</script>
