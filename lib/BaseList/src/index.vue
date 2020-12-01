<script>
 

import DataTable from "../../DataTable/src";
import QuickForm from "../../QuickForm/src";
import PowerfulBtn from "../../PowerfulBtn/src";
import "./style.scss";
import cloneDeep from 'lodash/cloneDeep';
import Button from "element-ui/lib/button";
import Carousel from "element-ui/lib/carousel";
import CarouselItem from "element-ui/lib/carousel-item";

export const makePageUrl = url => {
  return d => `${url}?page_num=${d.pageNum}&page_size=${d.pageSize}`;
};

export const makeFetchDataFilter = params => {
  return d => {
    const res = {};
    delete d.pageNum;
    delete d.pageSize;
    params.map(key => {
      res[key] = !d[key] ? "" : d[key];
    });
    return res;
  };
};
export default {
  name: "BaseList",
  tabName: "基础列表",
  props: {
    afterMounted: {
      // 当组件渲染完成时的回调
      type: Function,
      default: () => {}
    },
    afterDestroyed: {
      // 当组件注销时的回调
      type: Function,
      default: () => {}
    },
    listPage: {
      // 是否是单独列表页
      type: Boolean,
      default: false
    },

    haveSearchForm: {
      // 是否含有搜索表单
      type: Boolean,
      default: true
    },
    searchBarWrapper: {
      /*
        是否为baselist 的高级查询框样式，
        true为内置的样式
        false则还原默认样式,
        function则传入表单节点，和baselist实例最终renturn 为渲染的节点，
        或者使用scopedSlots searchBarWrapper 去自定义渲染
      */
      type: [Boolean, Function],
      default: true
    },
    urlMap: {
      // url 地址索引
      type: Object,
      default: () => ({
        list: "",
        delete: "",
        import: "",
        report: ""
      })
    },
    defaultFetchData: {
      // 列表默认请求带的参数
      type: Object,
      default: function() {
        return {};
      }
    },
    tableAttrs: {
      // 直接设置到 组件内的 DataTable 组件的属性
      type: Object,
      default: () => ({})
    },
    selections: DataTable.props.selections,
    searchFormAttr: {
      // 直接设置到 组件内的 搜索框  QuickForm 组件的属性
      type: Object,
      default: () => ({})
    },
    methodMap: {
      // url 请求方式索引
      type: Object,
      default: () => ({
        list: "post",
        delete: "post",
        import: "post"
      })
    },
    mergeFetchData: {
      // 会合并到 获取列表请求的参数
      type: Object,
      default: () => ({})
    },
    searchFormRenderData: {
      // 高级查询的搜索表单渲染配置
      type: Array,
      default: () => []
    },
    tableHeader: {
      // table的头部渲染，跟element table参数对应
      type: Array,
      default: function() {
        return [];
      }
    },
    topBtnRender: {
      // table 的头部按钮组渲染
      type: [Boolean, Function],
      default: false
    },
    toggleSearchForm: {
      // table 的搜索表单是否为切换展示
      type: Boolean,
      default: false
    }
  },
  components: {
    DataTable,
    QuickForm,
    PowerfulBtn,
    Button,
    Carousel,
    CarouselItem
  },
  model: DataTable.model,
  data() {
    return {
      val: {},
      data: [],
      showSearchForm: this.haveSearchForm,
      searchForm: this.searchFormAttr.value || {},
      formValue: {},
      mutipleSelection: this.selections || [],
      listPageTableHeight: false,
      showSearchFormAll: false // 当前是否展示所有表单
    };
  },
  computed: {},
  watch: {
    mutipleSelection: DataTable.watch.mutipleSelection,
    selections: DataTable.watch.selections,
    haveSearchForm(newVal) {
      // 监听prop变化重新设置高级查询是否显示
      this.showSearchForm = newVal;
    },
    showSearchForm() {
      this.toggleSearchTime = new Date().valueOf();
    }
  },

  methods: {
    /**
     * 修改选中的列
     * @param {Array} 选中列表的数据 //
     */
    changeSelectRow(newVal) {
      this.mutipleSelection = newVal;
    },
    /**
     * 当高级查询表单提交调用的函数
     * @param {Object}  // 表单提交的值
     */
    onSearchSubmit(v) {
      this.searchForm = cloneDeep(v);
      this.$refs.baseTable.lazyLoad(true); // 预防相同数据不重新请求
    },
    /**
     *
     * 重新刷新列表方法
     * @param {boolean} [reset=true] // 是否返回第一页
     */
    reloadList(reset = true) {
      this.$refs.baseTable && this.$refs.baseTable.loadData(reset);
    },
    /**
     * 清空高级查询刷新方法
     */
    resetSearch() {
      this.$refs.searchForm.resetForm();
      this.onSearchSubmit({});
      this.$emit("searchFormClear");
    },
    toggleSearchFormFunc() {
      this.showSearchFormAll = !this.showSearchFormAll;
    },
    toggleSearchFormFilter(searchFormRenderData) {
      if (this.showSearchFormAll) {
        return searchFormRenderData;
      } else {
        const resFormItems = [];
        searchFormRenderData.map(o => {
          if (o.fixedShow || o.toggleButton || this.showSearchFormAll) {
            if (o.toggleButton) {
              o.render = (v) => {
                return o.toggleRender(v, this.toggleSearchFormFunc, this.showSearchFormAll);
              };
            }
            resFormItems.push(o);
          }
        });
        return resFormItems;
      }
    },
    /**
     * 高级查询表单渲染方法
     */
    searchBarWrapperRender() {
      const { searchFormRenderData, toggleSearchForm } = this;

      const formProps = {
        labelPosition: "right",
        labelWidth: "100px"
      };

      const buttonGroupColConfig = {
        span: 24,
        style: {
          "text-align": "center",
          "margin-bottom": "15px"
        }
      };

      const setSerrchFormAttrs = {
        onSubmit: this.onSearchSubmit,
        formProps,
        renderData: toggleSearchForm
          ? this.toggleSearchFormFilter(searchFormRenderData)
          : searchFormRenderData,
        buttonGroupRender: (
          value,
          submitFunc,
          resetFunc,
          createElement,
          validate
        ) => {
          return [
            <Button on-click={submitFunc}>查询</Button>,
            <Button on-click={this.resetSearch}>清空</Button>
          ];
        },
        buttonGroupColConfig,
        ...this.searchFormAttr
      };

      const SearchFormVnode = (
        <quick-form
          ref="searchForm"
          {...{
            attrs: setSerrchFormAttrs
          }}
        />
      );
      if (typeof this.searchBarWrapper == "function") {
        return this.searchBarWrapper(setSerrchFormAttrs, SearchFormVnode);
      } else if (
        typeof this.searchBarWrapper == "boolean" &&
        this.searchBarWrapper
      ) {
        return this.defaultSearchBarWrapper(setSerrchFormAttrs);
      } else {
        return SearchFormVnode;
      }
    },
    /**
     * 默认的高级查询表单外部框渲染方法
     * @param {Object}  // 设置表单的属性配置
     */
    defaultSearchBarWrapper(setSerrchFormAttrs) {
      setSerrchFormAttrs.buttonGroupColConfig = false;
      const SearchFormVnode = (
        <quick-form
          ref="searchForm"
          {...{
            attrs: setSerrchFormAttrs
          }}
        />
      );
      return (
        <div class="base-list-searchbar-wrapper">
          <div class="base-list-searchbar-wrapper-btns">
            <Button
              onClick={() => {
                this.$refs.searchForm.submitForm();
              }}
              plain={true}
              type="primary"
              class="base-list-searchbar-wrapper-btn"
            >
              查询
            </Button>
            <Button
              onClick={() => {
                this.resetSearch();
              }}
              class="base-list-searchbar-wrapper-btn"
            >
              清空
            </Button>
          </div>
          {SearchFormVnode}
        </div>
      );
    }
  },

  created() {},
  mounted() {
    this.afterMounted(this);
  },
  destroyed() {
    this.afterDestroyed(this);
  },

  render(h) {
    const {
      tableHeader,
      urlMap,
      methodMap,
      mergeFetchData,
      defaultFetchData
    } = this;

    const _this = this;

    return (
      <div class="base-list">
        {this.haveSearchForm ? (
          <Carousel
            class="base-list-searchbar"
            value={this.showSearchForm ? "search-bar" : ""}
          >
            <CarouselItem name="search-bar">
              <div>
                <div ref="searchbarInbox" class="base-list-searchbar-inbox">
                  {this.searchBarWrapperRender()}
                </div>
              </div>
            </CarouselItem>
          </Carousel>
        ) : null}
        <div ref="btnbar" class="base-list-btnbar">
          {!this.topBtnRender && this.$scopedSlots.topBtnRender
            ? this.$scopedSlots.topBtnRender({
              selectRows: this.mutipleSelection,
              tableObj: this
            })
            : null}
          {this.topBtnRender
            ? this.topBtnRender(this.mutipleSelection, this)
            : null}
        </div>
        <div class="base-list-cont">
          <data-table
            ref="baseTable"
            {...{
              model: {
                value: this.mutipleSelection,
                callback: function($$v) {
                  _this.mutipleSelection = $$v;
                },
                expression: `mutipleSelection`
              },
              attrs: {
                url: urlMap.list,
                fetchType: methodMap.list,

                fetchData: {
                  ...defaultFetchData,
                  ...this.searchForm,
                  ...mergeFetchData
                },
                tableHeader,
                ...this.tableAttrs,
                tableAttrs: {
                  border: true,
                  height: this.listPageTableHeight || undefined,
                  ...(this.tableAttrs.tableAttrs || {})
                }
              }
            }}
          >
            {this.$slots && this.$slots.default ? this.$slots.default : null}
          </data-table>
        </div>
      </div>
    );
  }
};
</script>