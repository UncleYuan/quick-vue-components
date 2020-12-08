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

import RadioGroup from "element-ui/lib/radio-group";
import Radio from "element-ui/lib/radio";
import RadioButton from "element-ui/lib/radio-button";
import Cascader from "element-ui/lib/cascader";

import Input from "element-ui/lib/input";
import Autocomplete from "element-ui/lib/autocomplete";

import InputNumber from "element-ui/lib/input-number";
import TimePicker from "element-ui/lib/time-picker";
import DatePicker from "element-ui/lib/date-picker";
import Dialog from "element-ui/lib/dialog";
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

 
Dialog.props.modal = {
  type: Boolean,
  default: false
};
Dialog.props.closeOnClickModal = {
  type: Boolean,
  default: false
};
DatePicker.props.unlinkPanels = {
  type: Boolean,
  default: true
};

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
    Component: Input
  },
  {
    type: ["autocomplete"],
    Component: Autocomplete
  },
  {
    type: ["number"],
    Component: InputNumber
  },
  {
    type: ["numberrange"],
    Component: NumberRange
  },
  {
    type: ["timepicker"],
    Component: TimePicker
  },
  {
    type: ["datepicker"],
    Component: DatePicker
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
    Component: FileUpComp

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
