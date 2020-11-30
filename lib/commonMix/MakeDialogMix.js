/**
 * 高阶mixins 通过方法创建一个新的 Dialog mixins
 * @param  {String} name dialog 标识
 * @param  {Object} config dialog 配置
 */
export default function(
  name = "diy",
  config = { title: "系统提示", width: "1000px" }
) {
  return {
    data() {
      return {
        [`${name}DialogVisible`]: false
      };
    },
    methods: {
      [`${name}DialogRender`]: function(children = []) {
        config = typeof config == "function" ? config(this) : config;
        return this.$createElement(
          "el-dialog",
          {
            attrs: {
              title: config.title,
              width: config.width,
              visible: this[`${name}DialogVisible`]
            },
            on: {
              "update:visible": $event => {
                this[`${name}DialogVisible`] = $event;
              }
            }
          },
          children
        );
      }
    }
  };
}
