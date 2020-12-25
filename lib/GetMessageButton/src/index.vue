<template>
  <Button type="primary" :disabled="time>0" @click="onBtnClick">{{ time?`${time}秒后可重新发送`: defaultText }}</Button>
</template>

<script>
import request from '../../utils/request';

import { Button } from "element-ui";
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
    fetchType: {
      type: String,
      default: "post"
    },
    fetchData: {
      type: Object,
      default: () => ({})
    },
    resDataFilter: {
      type: Function,
      default: (d) => d
    }
  },

  data() {
    return {
      time: 0
    };
  },

  methods: {
    onBtnClick() {
      if (!this.url || this.time) return;
      request({
        url: this.url,
        method: this.fetchType,
        [this.fetchType == 'get' ? 'params' : 'data']: this.fetchData

      }).then(d => {
        const res = this.resDataFilter(d);
        if (res.success) {
          this.time = 60;
          this.timer = setInterval(() => {
            this.time = this.time - 1;
            if (this.time == 0) {
              clearInterval(this.timer);
            }
          }, 1000);
        }
      });
    },
    handleReset() {
      this.$refs.form.resetFields();
    }
  }
};
</script>
