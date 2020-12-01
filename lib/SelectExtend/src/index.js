import Option from "element-ui/packages/option";
import Select from "element-ui/packages/select";
import GetOptionsHoc from "../../QuickForm/src/GetOptionsHoc";

const SelectExtend = GetOptionsHoc(Select, Option);

export default SelectExtend;
