import BaseList from "./BaseList";

import CheckBoxWrap from "./CheckBoxWrap";
import DataList from "./DataList";
import DataLoad from "./DataLoad";
import DataTable from "./DataTable";
import DateTimeRanges from "./DateTimeRanges";
import Drag from "./Drag";
import Editor from "./Editor";
import FileUpComp from "./FileUpComp";
import GetMessageButton from "./GetMessageButton";

import NumberRange from "./NumberRange";
import PowerfulBtn from "./PowerfulBtn";
import SelectTable from "./SelectTable";
import QuickForm from "./QuickForm";

import SelectExtend from "./SelectExtend";
import SelectTree from "./SelectTree";
import SlotRender from "./SlotRender";
import TodoList from "./TodoList";
import TodoTable from "./TodoTable";
import TreeExtend from "./TreeExtend";
import { requestHooks } from "./utils/request";
const componentsMap = {
  BaseList,
  DataList,
  DataLoad,
  DataTable,
  DateTimeRanges,
  Drag,
  Editor,
  FileUpComp,
  GetMessageButton,
  CheckBoxWrap,
  NumberRange,
  PowerfulBtn,
  SelectTable,
  QuickForm,
  SelectExtend,
  SelectTree,
  SlotRender,
  TodoList,
  TodoTable,
  TreeExtend
};
export function install(Vue) {
  Object.keys(componentsMap).map((componentName) => {
    console.info("install----all----");
    Vue.component(componentsMap[componentName].name, componentsMap[componentName]);
  });
}

export {
  requestHooks,
  BaseList,
  DataList,
  DataLoad,
  DataTable,
  DateTimeRanges,
  Drag,
  Editor,
  FileUpComp,
  GetMessageButton,
  CheckBoxWrap,
  NumberRange,
  PowerfulBtn,
  SelectTable,
  QuickForm,
  SelectExtend,
  SelectTree,
  SlotRender,
  TodoList,
  TodoTable,
  TreeExtend
};
export default {
  requestHooks,
  BaseList,
  DataList,
  DataLoad,
  DataTable,
  DateTimeRanges,
  Drag,
  Editor,
  FileUpComp,
  GetMessageButton,
  CheckBoxWrap,
  NumberRange,
  PowerfulBtn,
  SelectTable,
  QuickForm,
  SelectExtend,
  SelectTree,
  SlotRender,
  TodoList,
  TodoTable,
  TreeExtend
};
