import Option from "element-ui/lib/option";
import Select from "element-ui/lib/select";
import GetOptionsHoc from "../../QuickForm/src/GetOptionsHoc";

const SelectExtend = GetOptionsHoc(Select, Option);

export default SelectExtend;
