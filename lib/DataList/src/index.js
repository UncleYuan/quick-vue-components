import { Pagination } from "element-ui";
import loadDataMix from "../commonMix/loadDataMix";
export default {
  name: "DataList",
  mixins: [loadDataMix],
  props: {
    listStyle: {
      type: Object,
      default: () => ({})
    }
  },
  components: {

    Pagination
  },

  render(h) {
    const {

      listData,
      total,
      style,
      listStyle,
      currentPage,
      pageSize,
      pageProps,
      handleCurrentChange,
      handleSizeChange,
      pagination
    } = this;

    const pageOn = {
      "current-change": handleCurrentChange,
      "size-change": handleSizeChange
    };

    const setPageProps = {
      total,
      layout: "total,sizes,prev,pager,next,jumper",
      pageSizes: [10, 30, 50],
      ...pageProps,
      "current-page": currentPage,
      pageSize
    };

    return (
      <div class="comp-datalist" style={style}>
        <div class="comp-datalist-box" style={listStyle}>
          {listData.map((item, idx) => idx >= pageSize ? null : this.$scopedSlots.default({ ...item, idx }))}
        </div>
        {!!total && pagination
          ? h("el-pagination", { on: pageOn, props: setPageProps })
          : null}
      </div>
    );
  }
};