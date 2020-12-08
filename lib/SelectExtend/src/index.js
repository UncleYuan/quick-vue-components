import { Option, Select } from "element-ui";
import GetOptionsHoc from "../../QuickForm/src/GetOptionsHoc";

const SelectExtend = GetOptionsHoc(Select, Option);

export default SelectExtend;
