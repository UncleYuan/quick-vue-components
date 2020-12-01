import Card from "element-ui/packages/card";
import Button from "element-ui/packages/button";
import ButtonGroup from "element-ui/packages/button-group";
import "./style.scss";
export default {
  props: {
    title: {
      type: [String, Function],
      default: ""
    },
    fullScreen: {
      type: Boolean,
      default: false
    },
    collapse: {
      type: Boolean,
      default: false
    },
    defaultToggleCollapse: {
      type: Boolean,
      default: false
    },
    getSearchList: {
      type: Function,
      default: res => false
    },
    headerRightChilds: {
      type: Array,
      default: () => []
    },

    ...(Card.props || {})
  },
  name: "CardPanel",
  watch: {},
  data() {
    return {
      loading: false,
      toggleFullScreen: false, // 是否全屏
      toggleCollapse: false,
      collapseHeight: undefined,
      openHeight: undefined,
      toggleShowListSearchFormShow: false
    };
  },
  created() {

  },
  mounted() {
    this.toggleShowListSearchFormShow = this.getToggleShowListSearchFormShowStatus(); // 渲染成功设置
    if (this.defaultToggleCollapse) {
      this.toggleCollapseFunc();
    }
  },
  computed: {},
  methods: {
    getToggleShowListSearchFormShowStatus() {
      // 是否显示高级查询状态
      let res = false;
      const searchList = this.getSearchList();
      if (searchList && searchList.showSearchForm) {
        res = true;
      }
      return res;
    },
    toggleShowListSearchFormFunc() {
      const searchList = this.getSearchList();
      if (!searchList) return;
      searchList.showSearchForm = !searchList.showSearchForm;
      this.toggleShowListSearchFormShow = searchList.showSearchForm;
    },
    toggleFullScreenFunc() {
      this.toggleFullScreen = !this.toggleFullScreen;
    },

    toggleCollapseFunc() {
      // 切换显示隐藏
      this.setCollapseHeight(false, () => {
        this.toggleCollapse = !this.toggleCollapse;
        if (!this.toggleCollapse) {
          setTimeout(() => {
            // 执行完动画后将高度限制取消
            this.setCollapseHeight(true);
          }, 500);
        }
      });
    },
    setCollapseHeight(reset, cb) {
      // 设置收缩切换的高度;
      const el = this.$refs.card.$el;
      this.collapseHeight = reset
        ? undefined
        : el.childNodes[0].offsetHeight + "px";
      this.openHeight = reset
        ? undefined
        : el.childNodes[0].offsetHeight + el.childNodes[1].offsetHeight + "px";

      if (cb) {
        // 设置完高度后的回调
        setTimeout(cb, 100);
      }
    }
  },
  render(h) {
    const { shadow, title, fullScreen, toggleFullScreen, collapse } = this;
    let hasHeaderSlot = false;
    const slots = Object.keys(this.$slots)
      .reduce((arr, key) => arr.concat(this.$slots[key]), [])
      .map(vnode => {
        if (vnode.data && vnode.data.slot === "header") hasHeaderSlot = true;
        // vnode.context = this._self;
        return vnode;
      });
    const setProps = {
      ...this.$props
    };
    const iconButtonClassName = `el-button el-button--default el-button--mini`;
    if (title && !hasHeaderSlot) {
      // 插入标题

      let setChild = [...this.headerRightChilds];
      const searchList = this.getSearchList();

      if (this.$slots.headerRightChilds) {
        this.$slots.headerRightChilds.map(o => {
          setChild = setChild.concat(o.children);
        });
      }

      if (this.toggleShowListSearchFormShow || searchList) {
        // 收缩显示搜索栏
        setChild.push(
          h(
            Button,
            {
              attrs: {
                title: searchList.showSearchForm
                  ? "点击隐藏搜索栏"
                  : "点击显示搜索栏",
                class: `${iconButtonClassName} header-icon-button ${
                  searchList.showSearchForm ? "showSearch" : "hideSearch"
                }`
              },
              on: {
                click: this.toggleShowListSearchFormFunc
              }
            },
            [
              h(
                "svg-icon",
                {
                  props: {
                    iconClass: "moreSearch"
                  }
                },
                title
              )
            ]
          )
        );
      }

      if (fullScreen) {
        setChild.push(
          h(
            Button,
            {
              attrs: {
                title: toggleFullScreen ? "点击收起全屏" : "点击全屏",
                class: `${iconButtonClassName} header-icon-button `
              },
              on: {
                click: this.toggleFullScreenFunc
              }
            },
            [
              h(
                "svg-icon",
                {
                  props: {
                    iconClass: toggleFullScreen ? "shrink" : "fullScreen"
                  }
                },
                title
              )
            ]
          )
        );
      }
      // if(searchList&&searchList.toggleSearchForm){
      //   setChild.push(
      //     h(
      //       Button,
      //       {
      //         attrs: {
      //           title: searchList.showSearchFormAll
      //             ? "点击隐藏部分查询条件"
      //             : "点击显示所有查询条件",
      //           class: ` ${iconButtonClassName}  header-icon-button  `
      //         },
      //         on: {
      //           click: searchList.toggleSearchFormFunc
      //         }
      //       },
      //       [
      //         searchList.showSearchFormAll? "隐藏高级查询":"显示高级查询"
      //       ]
      //     )
      //   );
      // }
      if (collapse) {
        setChild.push(
          h(
            Button,
            {
              attrs: {
                title: this.toggleCollapse ? "点击收起" : "点击展开",
                class: `${iconButtonClassName} header-icon-button ${
                  this.toggleCollapse ? " rotate" : ""
                }`
              },
              on: {
                click: this.toggleCollapseFunc
              }
            },
            [
              h(
                "svg-icon",
                {
                  props: {
                    iconClass: "arrow-up"
                  }
                },
                null
              )
            ]
          )
        );
      }
      slots.push(
        h(
          "div",
          {
            slot: "header"
          },
          [
            h("span", {}, typeof title == "function" ? title(this) : title),
            h(
              ButtonGroup,
              {
                attrs: { class: "el-button-group header-icon-wrap" }
              },
              setChild
            )
          ]
        )
      );
    }
    return h(
      Card,
      {
        ref: "card",
        on: this.$listeners,
        props: setProps,
        scopedSlots: this.$scopedSlots,
        style: {
          height: collapse
            ? this.toggleCollapse
              ? this.collapseHeight
              : this.openHeight
            : undefined
        },
        class: {
          "card-panel": true,
          "el-card": true,
          [shadow ? "is-" + shadow + "-shadow" : "is-always-shadow"]: true,
          fullScreen: toggleFullScreen,
          collapse: this.toggleCollapse && collapse
        },
        attrs: {
          ...this.$attrs
        }
      },
      slots
    );
  }
};
