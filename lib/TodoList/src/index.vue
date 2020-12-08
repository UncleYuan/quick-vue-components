<script>

import request from "../../utils/request";
import cloneDeep from "lodash/cloneDeep";
import Dialog from "element-ui/lib/dialog";
import QuickForm from "../../QuickForm/src";
import "./style.scss";
export default {
  name: "TodoList",
  components: {},
  /**
   * 设置formvalue
   */
  model: {
    prop: "value", // 要存在于props
    event: "changeTodoListValue" // 当组件的值发生改变时要emit的事件名
  },

  props: {
    typeTitle: {
      type: String,
      default: "表单项"
    },
    className: {
      type: String,
      default: ""
    },
    showLabelRender: {
      type: Function,
      default: row => row.label
    },

    editRowDataFilter: {
      type: Function,
      default: row => row
    },
    options: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    disabledMove: {
      type: Boolean,
      default: false
    },
    disabledAdd: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    },
    editItemDataFilter: {
      type: Function,
      default: v => v
    },

    resetItemFormDataFilter: {
      type: Function,
      default: v => v
    },
    addButtonRender: {
      type: [Boolean, Function],
      default: false
    },

    urlMap: {
      type: Object,
      default: () => ({
        get: "",
        add: "",
        edit: "",
        delete: ""
      })
    },

    methodMap: {
      type: Object,
      default: () => ({
        get: "post",
        add: "post",
        edit: "post",
        delete: "post"
      })
    },

    fetchDataFilter: {
      type: Function,
      default: (data, type) => data
    },
    resDataFilter: {
      type: Function,
      default: (data, type) => data
    },
    afterLoadDataSuccess: {
      type: Function,
      default: res => res
    },
    beforeChangeListFilter: {
      type: Function,
      default: res => res
    },
    isSuccess: {
      type: Function,
      default: res => res
    },
    editFormRenderData: {
      type: Array,
      default: () => [
        {
          type: "text",
          name: "label",
          layoutCol: 12,
          label: "标题",
          rules: [{ required: true }]
        },
        {
          type: "text",
          name: "value",
          layoutCol: 12,
          label: "值",
          rules: [{ required: true }]
        }
      ]
    },
    dialogAttrs: {
      type: Object,
      default: res => ({})
    },
    formProps: {
      type: Object,
      default: res => ({})
    },
    editFormProps: {
      type: Object,
      default: res => ({})
    },
    rowRender: {
      type: Function,
      default: (
        row,
        idx,
        value,
        createFunc,
        editFunc,
        deleteFunc,
        moveIdx,
        createElement,
        disabled,
        vm
      ) => {
        // eslint-disable-next-line no-unused-vars
        const h = createElement;

        return [
          <el-tag
            style={{ margin: "0 10px 10px 0" }}
            key={row.id || idx}
            class="row-item"
          >
            <span style={{ marginRight: "25px" }}>
              {vm.showLabelRender(row, idx)}
            </span>
            {disabled || vm.disabledMove ? null : (
              <el-link
                size="small"
                type="primary"
                circle={true}
                style={{ marginRight: "10px" }}
                onClick={() => moveIdx(-1, idx, row)}
                icon="el-icon-top"
              />
            )}
            {disabled || vm.disabledMove ? null : (
              <el-link
                size="small"
                type="primary"
                circle={true}
                style={{ marginRight: "10px" }}
                onClick={() => moveIdx(1, idx, row)}
                icon="el-icon-bottom"
              />
            )}
            {disabled ? null : (
              <el-link
                size="small"
                type="primary"
                circle={true}
                style={{ marginRight: "10px" }}
                onClick={() => editFunc(idx, row)}
                icon="el-icon-edit"
              />
            )}
            {disabled ? null : (
              <el-link
                type="primary"
                circle={true}
                size="small"
                onClick={() => deleteFunc(idx, row)}
                icon="el-icon-delete"
              />
            )}
          </el-tag>
        ];
      }
    }
  },
  data() {
    return {
      groupValue: this.value || this.options || [],
      editDialogVisible: false,
      editFormValue: {},
      editType: "add"
    };
  },
  // 监听formValue变化传递变化
  watch: {
    groupValue: function(newVal, oldVal) {
      this.$emit("changeTodoListValue", newVal);
    },
    options: function(newVal) {
      this.groupValue = newVal;
    },
    value: function(newVal) {
      this.groupValue = newVal;
    }
  },
  created() {
    if (this.urlMap.get) {
      this.loadData("get", this.urlMap.get, this.methodMap.get, {}, res => {
        this.groupValue = res.data || [];
      });
    }
  },
  methods: {
    loadData(type, url, fetchType, fetchData, cb) {
      console.log("loading.....");
      request({
        url: url,
        method: fetchType,
        [fetchType == "get" ? "params" : "data"]: this.fetchDataFilter(fetchData, type)
      }).then(res => {
        res = this.resDataFilter(res, type);
        if (this.isSuccess(res, type)) {
          this.afterLoadDataSuccess(res, type);
          cb(res, type);
        }
      })
        .catch(err => {
          console.log(err);
          const errMsg = err.message || err.msg;
          if (errMsg) {
            this.$notify.error({ title: errMsg });
          }
        });
    },
    createItem() {
      this.editDialogVisible = true;
      this.editFormValue = this.resetItemFormDataFilter({});
      this.editType = "add";
    },
    editItem(idx, row) {
      this.editDialogVisible = true;
      this.editFormValue = this.resetItemFormDataFilter(this.getJson(row));
      this.editType = idx;
    },
    deleteItem(idx, row) {
     
       
      if (this.urlMap.delete) {
        this.loadData(
          "delete",
          this.urlMap.delete,
          this.methodMap.delete,
          row,
          () => {
            this.deleteSuccess(idx);
          }
        );
      } else {
         
          this.deleteSuccess(idx);
       
        
      }
    },
    moveIdx(move = 1, idx, item) {
      if (
        (move == 1 && idx >= this.groupValue.length - 1) ||
        (move == -1 && idx <= 0)
      ) {
        return;
      }
      const moveItem = this.groupValue[idx];
      this.groupValue.splice(idx, 1);
      this.groupValue.splice(idx + move, 0, moveItem);
    },
    getJson(obj) {
      const setVal = cloneDeep(obj);
      delete setVal.isTrusted;
      return setVal;
    },
    // 增删改成功回调 start
    resetEditStatus() {
      this.editDialogVisible = false;
      this.editFormValue = {};
    },
    addSuccess(v) {
      v = this.editRowDataFilter(v);
      this.groupValue.push(v);
      this.resetEditStatus();
    },
    editSuccess(v) {
      v = this.editRowDataFilter(v);
      this.groupValue[parseFloat(this.editType)] = v;
      this.groupValue = this.getJson(this.groupValue);
      this.resetEditStatus();
    },
    deleteSuccess(idx) {
      this.groupValue.splice(idx, 1);
    },
    // 增删改成功回调 end
    afterEditItemSuccess(v) {
      v = this.editItemDataFilter(this.getJson(v));

      if (this.editType == "add") {
        if (this.urlMap.add) {
          this.loadData("add", this.urlMap.add, this.methodMap.add, v, res => {
            this.addSuccess(this.beforeChangeListFilter(v, res, "add"));
          });
        } else {
          this.addSuccess(v);
        }
      } else {
        if (this.urlMap.edit) {
          this.loadData(
            "edit",
            this.urlMap.edit,
            this.methodMap.edit,
            v,
            res => {
              this.editSuccess(this.beforeChangeListFilter(v, res, "edit"));
            }
          );
        } else {
          this.editSuccess(v);
        }
      }
    },
    EditItemRender() {
      const formProps = {
        labelPosition: "right",
        labelWidth: "150px",
        ...this.formProps
      };
      return this.$createElement(
        Dialog,
        {
          attrs: {
            modal: false,
            title: (this.editType == "add" ? "添加" : "编辑") + this.typeTitle,
            width: "1000px",
            visible: this.editDialogVisible,
            ...this.dialogAttrs
          },
          on: {
            "update:visible": $event => {
              this.editDialogVisible = $event;
            }
          }
        },
        [
          <QuickForm
            {...{
              attrs: {
                formProps,
                propsData: {
                  todoEditIdx: this.editType
                },
                onSubmit: this.afterEditItemSuccess,
                value: this.editFormValue,
                disabled: this.disabled,
                renderData: this.editFormRenderData,
                buttonGroupColConfig: {
                  span: 24,

                  style: {
                    "text-align": "center",
                    margin: "20px 0 0"
                  }
                },
                buttonGroupRender: (
                  value,
                  submitFunc,
                  resetFunc,
                  createElement,
                  validate
                ) => {
                //  const h = createElement;
                  return [
                    this.disabled ? null : (
                      <el-button type="primary" on-click={submitFunc}>
                        提交
                      </el-button>
                    ),
                    <el-button
                      on-click={() => (this.editDialogVisible = false)}
                    >
                      关闭
                    </el-button>
                  ];
                },
                ...this.editFormProps
              }
            }}
          />
        ]
      );
    }
  },
  render(h) {
    const { groupValue, className, rowRender } = this;

    return (
      <div class={"comp-todolist-wrap " + className}>
        {this.EditItemRender()}
        <div class="comp-todolist-btnGroup">
          {this.disabled || this.disabledAdd ? null : this.addButtonRender ? (
            this.addButtonRender(this)
          ) : (
            <el-button
              type="primary"
              size="small"
              circle={true}
              onClick={() => this.createItem()}
              icon="el-icon-plus"
            />
          )}
        </div>
        <div class="comp-todolist-listGroup">
          {groupValue.map((item, idx) =>
            rowRender(
              item,
              idx,
              groupValue,
              this.createItem,
              this.editItem,
              this.deleteItem,
              this.moveIdx,
              this.$createElement,
              this.disabled,
              this
            )
          )}
        </div>
      </div>
    );
  }
};
</script>
