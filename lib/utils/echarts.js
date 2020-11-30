// 引入 ECharts 主模块
import echarts from "echarts/lib/echarts";
// 引入折线图/柱状图等组件
import "echarts/lib/chart/line";
import "echarts/lib/chart/bar";
import "echarts/lib/chart/radar";
// 引入提示框和title组件，图例
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import "echarts/lib/component/legend";
import "echarts/lib/component/legendScroll"; //图例滚动
//vue全局注入echarts
export default echarts;
