import { Select, Option } from "element-ui";
import GetOptionsHoc from "../../QuickForm/GetOptionsHoc";

const SelectExtend = GetOptionsHoc(Select, Option);

export default SelectExtend;
