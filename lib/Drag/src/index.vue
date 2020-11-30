<script>
import lodash from "lodash";

import $ from "jquery";
var initState = {
  s: {
    x: 0,
    y: 0
  },
  m: {
    x: 0,
    y: 0
  },
  n: {
    left: 0,
    top: 0,
    width: 0,
    height: 0
  },
  keyDown: false,
  target: "drag-bar"
};
export default {
  name: "Drag",

  components: {},
  model: {
    prop: "value", // 要存在于props
    event: "changeDragValue" // 当组件的值发生改变时要emit的事件名
  },
  props: {
    unit: {
      type: String,
      default: "px"
    },
    value: {
      type: Object,
      default: () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100
      })
    },
    className: {
      type: String,
      default: ""
    },
    boxStyle: {
      type: Object,
      default: () => ({})
    },
    wrapWidth: {
      type: Number,
      default: 0
    },

    minWidth: {
      type: Number,
      default: 5
    },
    minHeight: {
      type: Number,
      default: 5
    },
    disabled: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: "DragBox" + new Date().valueOf()
    },
    disabledScale: {
      type: Boolean,
      default: false
    },
    minLeft: {
      type: Number,
      default: 0
    },
    minTop: {
      type: Number,
      default: 0
    },
    onItemChange: {
      type: Function,
      default: () => {}
    },
    onClick: {
      type: Function,
      default: () => {}
    }
  },

  data() {
    return {
      left: this.value.left,
      top: this.value.top,
      width: this.value.width,
      height: this.value.height,

      mouseState: lodash.cloneDeep(initState)
    };
  },
  computed: {},
  // 监听list变化传递变化
  watch: {

    value: function(newVal, oldVal) {
      const nowShape = this.getNowShapeState();
      if (!lodash.isEqual(newVal, nowShape)) {
        this.left = newVal.left;
        this.top = newVal.top;
        this.width = newVal.width;
        this.height = newVal.height;
      }
    }
  },
  methods: {
    getNowShapeState(obj = this) {
      const nowShape = {
        left: obj.left,
        top: obj.top,
        width: obj.width,
        height: obj.height
      };
      return nowShape;
    },
    moveLeftFn() {
      var width = this.mouseState.n.width;
      var left = this.mouseState.n.left;
      var lang = this.mouseState.s.x - this.mouseState.m.x;
      width = width + lang;
      left = left - lang;
      this.filterShape("leftRight", { left: left, width: width });
    },
    moveRightFn() {
      var width = this.mouseState.n.width;
      var left = this.mouseState.n.left;
      var lang = this.mouseState.s.x - this.mouseState.m.x;
      width = width - lang;
      this.filterShape("leftRight", { left: left, width: width });
    },
    moveTopFn() {
      var height = this.mouseState.n.height;
      var top = this.mouseState.n.top;
      var lang = this.mouseState.s.y - this.mouseState.m.y;
      height = height + lang;
      top = top - lang;
      this.filterShape("topBottom", { height: height, top: top });
    },
    moveBottomFn() {
      var height = this.mouseState.n.height;
      var top = this.mouseState.n.top;
      var lang = this.mouseState.s.y - this.mouseState.m.y;
      height = height - lang;
      this.filterShape("topBottom", { top: top, height: height });
    },
    moveTopLeftFn() {
      let height = this.mouseState.n.height;
      let width = this.mouseState.n.width;
      let left = this.mouseState.n.left;
      let top = this.mouseState.n.top;
      const langY = this.mouseState.s.y - this.mouseState.m.y;

      const bi = width / height;
      const lastWidth = width;
      height = height + langY;
      width = height * bi;
      top = top - langY;
      // left = left - langX;
      left = left + lastWidth - width;
      this.filterShape("bevel", { left, top, height, width });
    },
    moveTopRightFn() {
      let height = this.mouseState.n.height;
      let width = this.mouseState.n.width;
      const left = this.mouseState.n.left;
      let top = this.mouseState.n.top;
      const langY = this.mouseState.s.y - this.mouseState.m.y;

      const bi = width / height;
      height = height + langY;
      width = height * bi;
      top = top - langY;

      this.filterShape("bevel", { left, top, height, width });
    },
    moveBottomLeftFn() {
      let height = this.mouseState.n.height;
      let width = this.mouseState.n.width;
      let left = this.mouseState.n.left;
      const top = this.mouseState.n.top;
      const langY = this.mouseState.s.y - this.mouseState.m.y;

      const bi = width / height;
      const lastWidth = width;
      height = height - langY;

      width = height * bi;
      //  top = top - langY;
      left = left + lastWidth - width;
      this.filterShape("bevel", { left, top, height, width });
    },
    moveBottomRightFn() {
      let height = this.mouseState.n.height;
      let width = this.mouseState.n.width;
      const left = this.mouseState.n.left;
      const top = this.mouseState.n.top;
      const langY = this.mouseState.s.y - this.mouseState.m.y;

      const bi = width / height;
      height = height - langY;
      width = height * bi;
      // top = top - langY;
      //  left = left - langX;
      this.filterShape("bevel", { left, top, height, width });
    },

    moveDragBarFn() {
      var left = this.mouseState.n.left;
      var top = this.mouseState.n.top;
      var height = this.mouseState.n.height;
      var width = this.mouseState.n.width;
      var langX = this.mouseState.m.x - this.mouseState.s.x;
      var langY = this.mouseState.m.y - this.mouseState.s.y;

      this.filterShape("dragBar", {
        top: top + langY,
        left: left + langX,
        width: width,
        height: height
      });
    },
    filterShape(type, turnStyle) {
      switch (type) {
        case "leftRight":
          if (
            !this.wrapWidth ||
            (turnStyle.left + turnStyle.width < this.wrapWidth &&
              turnStyle.width >= this.minWidth &&
              turnStyle.left >= this.minLeft)
          ) {
            this.saveShapeStyle({
              width: turnStyle.width,
              left: turnStyle.left
            });
            this.onItemChange({
              name: this.name,
              data: this.getNowShapeState()
            });
            this.$emit("changeDragValue", this.getNowShapeState());
          }
          break;
        case "topBottom":
          if (
            !this.wrapWidth ||
            (turnStyle.top + turnStyle.height <
              $(this.$refs.refsBox).parent().height() &&
              turnStyle.height >= this.minHeight &&
              turnStyle.top >= this.minTop)
          ) {
            this.saveShapeStyle({
              height: turnStyle.height,
              top: turnStyle.top
            });
            this.onItemChange({
              name: this.name,
              data: this.getNowShapeState()
            });
            this.$emit("changeDragValue", this.getNowShapeState());
          }
          break;
        case "bevel":
          if (
            !this.wrapWidth ||
            (turnStyle.top + turnStyle.height <
              $(this.$refs.refsBox).parent().height() &&
              turnStyle.height >= this.minHeight &&
              turnStyle.top >= this.minTop &&
              turnStyle.left + turnStyle.width < this.wrapWidth &&
              turnStyle.width >= this.minWidth &&
              turnStyle.left >= this.minLeft)
          ) {
            this.saveShapeStyle({
              width: turnStyle.width,
              left: turnStyle.left,
              height: turnStyle.height,
              top: turnStyle.top
            });
            this.onItemChange({
              name: this.name,
              data: this.getNowShapeState()
            });
            this.$emit("changeDragValue", this.getNowShapeState());
          }
          break;
        case "dragBar":
          var newObj = {};
          if (this.wrapWidth) {
            if (turnStyle.top < this.minTop) {
              newObj.top = this.minTop;
            } else if (
              turnStyle.top + turnStyle.height >
              $(this.$refs.refsBox).parent().height()
            ) {
              newObj.top =
                $(this.$refs.refsBox).parent().height() - turnStyle.height;
            } else {
              newObj.top = turnStyle.top;
            }

            if (turnStyle.left < this.minLeft) {
              newObj.left = this.minLeft;
            } else if (turnStyle.left + turnStyle.width > this.wrapWidth) {
              newObj.left = this.wrapWidth - turnStyle.width;
            } else {
              newObj.left = turnStyle.left;
            }
          } else {
            newObj.top = turnStyle.top;
            newObj.left = turnStyle.left;
          }
          this.saveShapeStyle(newObj);
          this.onItemChange({ name: this.name, data: this.getNowShapeState() });
          this.$emit("changeDragValue", this.getNowShapeState());
          break;
      }
    },
    saveShapeStyle(newStyle) {
      for (const i in newStyle) {
        this.$refs.refsBox.style[i] =
          typeof newStyle[i] == "number" ? newStyle[i] + "px" : newStyle[i];
        this[i] = newStyle[i];
      }
    },

    bindMove(e) {
      e.stopPropagation();
      e.preventDefault();
      this.onMouseMoveFn(e);
    },
    bindUp(e) {
      e.stopPropagation();
      e.preventDefault();

      this.onMouseUpFn(e);
    },
    onMouseDownFn(e) {
      if (this.disabled) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();
      document.addEventListener("mousemove", this.bindMove, false);
      document.addEventListener("mouseup", this.bindUp, false);
      this.mouseState.s = {
        x: e.pageX,
        y: e.pageY
      };
      this.mouseState.target = e.target.className;

      this.mouseState.n = {
        width: this.width,
        height: this.height,
        left: this.left,
        top: this.top
      };

      this.mouseState.keyDown = true;
    },
    onMouseMoveFn(e) {
      e.stopPropagation();
      e.preventDefault();
      console.log(this.mouseState.keyDown);
      if (this.mouseState.keyDown) {
        this.mouseState.m = {
          x: e.pageX,
          y: e.pageY
        };
        if (this[`move${this.mouseState.target}Fn`]) { this[`move${this.mouseState.target}Fn`].bind(this)(); }
      }
    },
    onMouseUpFn(e) {
      if (this.mouseState.keyDown) {
        document.removeEventListener("mousemove", this.bindMove, false);
        document.removeEventListener("mouseup", this.bindUp, false);
        this.mouseState = lodash.cloneDeep(initState);
      }
    }
  },
  render() {
    const { boxStyle, barStyle, onClick, disabled } = this;
    // eslint-disable-next-line no-unused-vars
    const { zIndex, ...otherStyle } = boxStyle;
    const setStyle = {
      left: this.left + this.unit,
      top: this.top + this.unit,
      width: this.width + this.unit,
      height: this.height + this.unit
    };
    const disabledShow = disabled ? "none" : "block";
    return (
      <div
        ref="refsBox"
        style={{ ...boxStyle, ...setStyle }}
        onmousedown={this.onMouseDownFn}
        class={"drag-box " + this.className}
      >
        <div class="cont-in">
          {this.$slots && this.$slots.default ? this.$slots.default : null}
        </div>

        {this.disabledScale ? null : <div
          class="TopLeft"

          style={{ zIndex: zIndex + 2, display: disabledShow }}
        ></div>}
        {this.disabledScale ? null : <div
          class="TopRight"
          style={{ zIndex: zIndex + 2, display: disabledShow }}
        ></div>}
        {this.disabledScale ? null : <div
          class="BottomLeft"
          style={{ zIndex: zIndex + 2, display: disabledShow }}
        ></div>}
        {this.disabledScale ? null : <div
          class="BottomRight"
          style={{ zIndex: zIndex + 2, display: disabledShow }}
        ></div>}

        {this.disabledScale ? null : <div
          class="Top"
          style={{ zIndex: zIndex + 1, display: disabledShow }}
        ></div>}
        {this.disabledScale ? null : <div
          class="Right"
          style={{ zIndex: zIndex + 1, display: disabledShow }}
        ></div>}
        {this.disabledScale ? null : <div
          class="Bottom"
          style={{ zIndex: zIndex + 1, display: disabledShow }}
        ></div>}
        {this.disabledScale ? null : <div
          class="Left"
          style={{ zIndex: zIndex + 1, display: disabledShow }}
        ></div>}
        <div
          class="DragBar"
          onclick={onClick}
          style={{ zIndex: zIndex, display: disabledShow, ...barStyle }}
        ></div>
      </div>
    );
  }
};
</script>

<style lang="scss" scoped>
$borderColor: #79c2fd;
.drag-box {
  position: absolute !important;
  border:1px solid $borderColor;
  z-index: 5;
  &.item-point {
    background: rgba(0, 167, 255, 0.2);
    //  border:1px solid #79c2fd;
    text-align: center;
    .top {
      border-top: 1px solid $borderColor;
    }
    .left {
      border-left: 1px solid $borderColor;
    }
    .right {
      border-right: 1px solid $borderColor;
    }
    .bottom {
      border-bottom: 1px solid $borderColor;
    }
  }
  .cont-in {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    //  overflow :hidden;
  }
  .DragBar {
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 1;
    cursor: move;

    top: 0;
    left: 0;
  }
  .Top {
    width: 100%;
    height: 3px;
    top: 0;
    left: 0;
    position: absolute;
    z-index: 2;
    cursor: n-resize;
  }
  .Right {
    height: 100%;
    width: 3px;
    top: 0;
    right: 0;
    position: absolute;
    z-index: 2;
    cursor: e-resize;
  }
  .Bottom {
    width: 100%;
    height: 3px;
    bottom: 0;
    left: 0;
    position: absolute;
    z-index: 2;
    cursor: n-resize;
  }
  .Left {
    height: 100%;
    width: 3px;
    top: 0;
    left: 0;
    position: absolute;
    z-index: 2;
    cursor: e-resize;
  }

  .TopLeft {
    width: 16px;
    height: 16px;
    top: -8px;
    left: -8px;
    position: absolute;
    z-index: 2;
    cursor: nw-resize;
    background: $borderColor;
    pointer-events: auto;
    border-radius: 100%;
  }
  .TopRight {
    height: 16px;
    width: 16px;
    top: -8px;
    left: 100%;
    margin-left: -8px;
    position: absolute;
    z-index: 2;
    cursor: ne-resize;
    pointer-events: auto;
    background: $borderColor;
    border-radius: 100%;
  }
  .BottomLeft {
    width: 16px;
    height: 16px;
    bottom: -8px;
    left: -8px;
    position: absolute;
    z-index: 2;
    cursor: sw-resize;
    pointer-events: auto;
    background: $borderColor;
    border-radius: 100%;
  }
  .BottomRight {
    height: 16px;
    width: 16px;
    bottom: -8px;
    left: 100%;
    margin-left: -8px;
    position: absolute;
    z-index: 2;
    cursor: se-resize;
    pointer-events: auto;
    background: $borderColor;
    border-radius: 100%;
  }
}
</style>
