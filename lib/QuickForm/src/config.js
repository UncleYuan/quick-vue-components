// import CheckBoxWrap  from "../CheckBoxWrap";

import TodoList from "../../TodoList";
import GetOptionsHoc from "./GetOptionsHoc";
import SelectExtend from "../../SelectExtend";
import FileUpComp from "../../FileUpComp";
import TreeExtend from "../../TreeExtend";
import CheckBoxWrap from "../../CheckBoxWrap";
import DateTimeRanges from "../../DateTimeRanges";
import NumberRange from "../../NumberRange";
import VueQuillEditor from 'vue-quill-editor';
import {
  uploadSysFile

} from "@/api/common";
import {

  RadioGroup,
  Radio,
  RadioButton,
  Cascader,
  Notification
} from "element-ui";

import lodash from "lodash";

const SetRadioGroup = RadioGroup;

const SetRadio = Radio;

const RadioExtend = GetOptionsHoc(SetRadioGroup, SetRadio, {
  setAttrFunc: res => {
    return {
      ...res,
      name: res.label,
      label: res.value,
      value: res.value
    };
  }
});

const RadioButtonExtend = GetOptionsHoc(SetRadioGroup, RadioButton, {
  setAttrFunc: res => {
    return {
      ...res,
      name: res.label,
      label: res.value,
      value: res.value
    };
  }
});
const CheckBoxWrapExtend = GetOptionsHoc(CheckBoxWrap);
const TodoListExtend = GetOptionsHoc(TodoList);
const CascaderExtend = GetOptionsHoc(Cascader);

SelectExtend.props.clearable = {
  type: Boolean,
  default: true
};
SelectExtend.props.filterable = {
  type: Boolean,
  default: true
};
export const memberComponents = [
  {
    type: ["bankCard", "phone", "password", "money", "text"],
    Component: "el-input"
  },
  {
    type: ["autocomplete"],
    Component: "el-autocomplete"
  },
  {
    type: ["number"],
    Component: "el-input-number"
  },
  {
    type: ["numberrange"],
    Component: NumberRange
  },
  {
    type: ["timepicker"],
    Component: "el-time-picker"
  },
  {
    type: ["datepicker"],
    Component: "el-date-picker"
  },

  {
    type: ["cascader"],
    Component: CascaderExtend
  },
  {
    type: ["tobolist"],
    Component: TodoListExtend
  },
  {
    type: ["editor"],
    Component: VueQuillEditor.quillEditor
  },
  {
    type: ["treeextend"],
    Component: TreeExtend
  },

  {
    type: ["file"],
    Component: FileUpComp,
    propsFilter: (props, name, value, createElement, setDisabled) => {
      // eslint-disable-next-line no-unused-vars
      const h = createElement;
      if (!props.action) {
        props.httpRequest = function(opt) {
          // console.log(arguments)
          const formData = new FormData();
          formData.append("file", opt.file);
          if (props.fileParams) {
            let fileParams = {};
            if (typeof props.fileParams == "function") {
              fileParams = props.fileParams();
            } else {
              fileParams = props.fileParams;
            }
            Object.keys(fileParams).map(k => {
              formData.append(k, fileParams[k]);
            });
          }
          return uploadSysFile(formData, props.actionConf);
        };
      }

      if (!props.onError) {
        props.onError = function(err) {
          console.log(err);
          Notification({ title: err.message || "上传失败", type: "error" });
        };
      }
      if (
        !props.childRender ||
        (lodash.isArray(props.childRender) && !props.childRender.length)
      ) {
        props.childRender = [
          !setDisabled ? (
            props.listType != "picture-card" ? (
              <el-button size="small" type="primary">
                点击上传
              </el-button>
            ) : (
              <i class="el-icon-plus avatar-uploader-icon"></i>
            )
          ) : (
            <div>文件列表</div>
          )
        ];
      }
      return props;
    }
  },
  {
    type: ["select"],
    Component: SelectExtend
  },
  {
    type: ["radio"],
    Component: RadioExtend
  },
  {
    type: ["radiobutton"],
    Component: RadioButtonExtend
  },
  {
    type: ["checkbox"],
    Component: CheckBoxWrapExtend

  },
  {
    type: ["datetimeranges"],
    Component: DateTimeRanges

  }

];

// text文本类型 textarea长文本类型 number数字类型 select下拉类型 file文件类型  imgFile图片文件类型 date时间类型 editor富文本类型 checkbox多选类型 radio单选类型 selecttree 树形选择类型
