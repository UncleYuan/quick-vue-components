<template>
  <div>
    <div style="height: 0; overflow: hidden">
      <DatePicker
        ref="timerange"
        v-model="timerangeValue"
        type="datetimerange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :unlink-panels="true"
        :value-format="`yyyy-MM-dd HH:mm:ss`"
        :default-time="['00:00:00', '23:59:59']"
        :picker-options="{disabledDate:disabledDate}"
        @blur="sureChangeTimer"
      >
      </DatePicker>
    </div>

    <Tag
      v-for="(timerange, i) in list"
      :key="timerange.startTime + '~' + timerange.endTime"
      :disable-transitions="false"
    >
      <span>{{ timerange.startTime + "~" + timerange.endTime }}</span>
      <i
        v-if="!disabled"
        class="el-icon-edit pointer"
        @click="showDatePicker(i)"
      ></i>
      <i
        v-if="!disabled"
        class="el-icon-close pointer"
        @click="handleClose(i)"
      ></i>
    </Tag>
    <Button
      v-if="!disabled"
      class="button-new-tag"
      size="small"
      @click="showDatePicker"
    >
      添加时间
    </Button>
  </div>
</template>

<script>
import isArray from "lodash/isArray";
import cloneDeep from "lodash/cloneDeep";

import { setTimer } from "../../utils/timer";
import moment from "moment";
import DatePicker from "element-ui/lib/date-picker";
import Tag from "element-ui/lib/tag";
import Button from "element-ui/lib/button";

export default {
  name: "DateTimeRanges",

  components: { DatePicker, Tag, Button },
  model: {
    prop: "value", // 要存在于props
    event: "changeDateTimeRangesValue" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      timerangeValue: isArray(this.value) ? cloneDeep(this.value) : [],
      editIdx: -1,
      list: cloneDeep(this.value)
    };
  },
  computed: {},
  // 监听list变化传递变化
  watch: {
    list: function(newVal, oldVal) {
      this.$emit("changeDateTimeRangesValue", newVal);
    },
    value: function(newVal, oldVal) {
      if (isArray(newVal)) {
        this.list = newVal;
      }
    }
  },
  methods: {
    handleClose(i) {
      this.list.splice(i, 1);
    },
    showDatePicker(editIdx = -1) {
      this.timerangeValue =
        editIdx >= 0
          ? [this.list[editIdx].startTime, this.list[editIdx].endTime]
          : [];
      this.editIdx = editIdx;
      window.$(this.$refs.timerange.$el).trigger("click");
    },
    disabledDate(time) {
      let res = false;
      this.list.map(o => {
        if (!(moment(time).isBefore(o.startTime) || moment(time).isAfter(o.endTime))) {
          res = true;
        }
      });
      return res;
    },
    sureChangeTimer() {
      // console.log(arguments);

      setTimer("dateTimeRanges", () => {
        if (this.timerangeValue[0] && this.timerangeValue[1]) {
          if (this.editIdx >= 0) {
            this.list.splice(this.editIdx, 1, {
              startTime: this.timerangeValue[0],
              endTime: this.timerangeValue[1]
            });
          } else {
            this.list.push({
              startTime: this.timerangeValue[0],
              endTime: this.timerangeValue[1]
            });
          }
        }
      }, 1);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
