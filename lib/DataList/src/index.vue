<script>
import { Pagination } from "element-ui";

import loadDataMix from "../../commonMix/loadDataMix";
export default {
  name: "DataList",
  components: {

    Pagination
  },
  mixins: [loadDataMix],
  props: {
    listStyle: {
      type: Object,
      default: () => ({})
    }
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
      pageSize:pagination?pageSize:1000000000,
    };

    return (
      <div class="comp-datalist" style={style}>
        <div class="comp-datalist-box" style={listStyle}>
          {listData.map((item, idx) =>( idx >= pageSize && pagination) ? null : this.$scopedSlots.default({ ...item, idx }))}
        </div>
        {!!total && pagination
          ? h(Pagination, { on: pageOn, props: setPageProps })
          : null}
      </div>
    );
  }
};
</script>
