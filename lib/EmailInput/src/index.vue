<template>
  <div class="email-input">
    <div class="email-input-tag-list">
      <el-tag v-for="tag in tags" :key="tag" size="small" closable @close="closeTag(tag)">{{ tag }}</el-tag>
      <el-button v-if="!inputShow" size="mini" @click="toggleInput()">新增</el-button>
    </div>
    <div v-if="inputShow" class="email-input-text">
      <el-input v-model="inputText" placeholder="用,号分隔开，可以同时创建多个邮箱" @blur="inputBlurHandler()"></el-input>
    </div>
  </div>
</template>
<script>
// import lodash from "lodash";
import "./style.scss";
export default {
  name: "EmailInput",
  components: {},
  model: {
    prop: "value", // 要存在于props
    event: "changeEmailInputValue" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    afterValueChange: {
      type: Function,
      default: () => {}
    },
    value: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      inputValue: this.value,
      inputText: "",
      inputShow: false
    };
  },
  computed: {
    tags() {
      return this.inputValue ? this.inputValue.split(",") : [];
    }
  },
  watch: {
    inputValue: function(newVal, oldVal) {
      this.$emit("changeEmailInputValue", newVal);
    },
    value: function(newVal, oldVal) {
      this.inputValue = newVal;
    }
  },
  methods: {
    closeTag(tag) {
      this.inputValue = this.inputValue.replace(
        new RegExp(`.?${tag}`, "g"),
        ""
      );
    },
    inputBlurHandler() {
      const emailList = this.inputText.split(",");
      let isChange = true;
      let addfix = ",";
      emailList.map(t => {
        if (!t.match(/\w+@\w+\..*/g) || this.tags.indexOf(t) >= 0) {
          isChange = false;
        }
      });
      if (isChange) {
        if (!this.inputValue) {
          addfix = "";
        }
        this.inputValue = `${this.inputValue}${addfix}${emailList.join(",")}`;
        this.inputText = "";
      }
      if (!this.inputText) {
        this.toggleInput();
      }
    },
    toggleInput() {
      this.inputShow = !this.inputShow;
    }
  }
};
</script>
