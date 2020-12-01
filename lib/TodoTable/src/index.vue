<script>
 

import http from "../../utils/http";
import lodash from "lodash";

import TodoList from "./index";
import DataTable from "../../DataTable";
import "./style.scss";
export default {
  name: "TodoTable",

  mixins: [TodoList],
  props: {
    tableAttrs: {
      type: Object,
      default: () => ({})
    }
  },
  render(h) {
    let { groupValue, className, rowRender } = this;
    return (
      <div class={"comp-todolist-wrap " + className}>
        {this.EditItemRender()}
        <div class="comp-todolist-btnGroup">
          {this.disabled || this.disabledAdd ? null : (
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
          <DataTable
            {...{
              attrs: { selectRow: false, ...this.tableAttrs, ctrlData:true, data: groupValue }
            }}
          />
        </div>
      </div>
    );
  }
};
</script>