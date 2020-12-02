import Qs from "qs";
import request from "../utils/request";

import isEqual from "lodash/isEqual";
import isArray from "lodash/isArray";
import cloneDeep from "lodash/cloneDeep";
import isFunction from "lodash/isFunction";

export default {
  props: {
    /**
     * 配置请求的url
     */
    url: {
      type: String
    },
    /**
     * 配置请求的类型
     */
    fetchType: {
      type: String,
      default: "get"
    },
    /**
     * 配置请求带的数据
     */
    fetchData: {
      type: [Object, Array, String],
      default: () => ({})
    },
    /**
     * 配置请求的前置数据过滤方法
     */
    beforeFetchDataFilter: {
      type: Function,

      default: res => {
        const { currentPage, pageSize, ...otherData } = res;
        return {
          ...otherData,
          pageNum: currentPage,
          pageSize: pageSize
        };
      }
    },
    /**
     * 通过请求的数据过滤是否发起请求方法
     */
    disabledFetchFilter: {
      type: Function,

      default: res => {
        return false;
      }
    },
    /**
     * 配置请求的数据过滤方法
     */
    fetchDataFilter: {
      type: Function,
      default: res => res
    },
    /**
     * 配置请求的数据的提交方式，可以为json或者form
     */
    fetchDataType: {
      type: String,
      default: "json"
    },
    /**
     * 配置请求的成功后的回调
     */
    onLoadDataSuccess: {
      type: Function,
      default: res => res
    },
    /**
     * 配置请求如何判断返回的数据为成功
     */
    isSuccess: {
      type: Function,
      default: res => res
    },
    /**
     * 配置请求返回数据的过滤方法
     */
    resDataFilter: {
      type: Function,
      default: res => res
    },
    /**
     * 配置默认返回数据
     */
    data: {
      type: Array,
      default: () => []
    },
    /**
     * 是否展示列表翻页
     */
    pagination: {
      type: Boolean,
      default: true
    },
    /**
     *  列表翻页的配置
     */
    pageProps: {
      type: Object,
      default: () => ({})
    }
  },

  data(e) {
    return {
      loading: false,
      lastFetchData: {}, // 上一次请求参数
      listData: this.data,
      total: e.data.length,
      currentPage: 1,
      stateFetchData: {},
      pageSize: this.pageProps.pageSize || 10
    };
  },
  created() {
    this.loadData();
  },
  watch: {
    fetchData: function(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.lazyLoad(true);
      }
    },
    data: function(newData, oldData) {
      if (isArray(newData) && !isEqual(newData, oldData)) {
        this.listData = newData;
      }
    }
  },
  methods: {
    /**
     * 延时加载判断，预防请求过于频繁
     * @param  {Boolean} reload 是否重新加载
     */
    lazyLoad(reload) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.loadData(reload);
      }, 500);
    },
    /**
     * 拷贝一个全新数据的方法
     * @param  {Object} d 要拷贝的数据
     */
    getJson(d) {
      return cloneDeep(d);
    },
    /**
     * 重新设置列表状态的方法
     * @param  {Array} data 设置的列表数据
     * @param  {Number} total 共计多少条数据
     */
    resetData(data = [], total = 0) {
      this.loading = false;
      this.listData = data;
      this.total = total;
    },
    /**
     * 请求数据的方法
     * @param  {Boolean} resetFirstPage 重新请求数据
     */
    loadData(resetFirstPage = false) {
      console.log("loading.....");
      if (!this.url) return;
      if (resetFirstPage) {
        this.currentPage = 1;
      }
      const { currentPage, pageSize, stateFetchData } = this;

      let fetchDataAll = {
        ...this.getJson(this.fetchData),
        currentPage,

        pageSize,
        ...this.getJson(stateFetchData)
      };
      delete fetchDataAll.isTrusted;
      fetchDataAll = this.beforeFetchDataFilter(fetchDataAll);
      const setUrl = isFunction(this.url)
        ? this.url(fetchDataAll)
        : this.url;
      fetchDataAll = this.fetchDataFilter(fetchDataAll);

      if (this.fetchType == "get") {
        fetchDataAll = {
          params: fetchDataAll
        };
      }
      const disabledFetch = this.disabledFetchFilter(fetchDataAll);
      if (disabledFetch) {
        return;
      }
      let setConf = {};
      if (this.fetchDataType == "form") {
        setConf = {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
          },
          transformRequest: [
            function(data) {
              data = Qs.stringify(data);
              return data;
            }
          ]
        };
      }
      this.loading = true;
      this.lastFetchData = fetchDataAll;
      request({
        url: setUrl,
        method: this.fetchType,
        [this.fetchType == "get" ? "params" : "data"]: fetchDataAll,
        ...setConf
      }).then(res => {
        res = this.resDataFilter(res);
        this.loading = false;
        if (this.isSuccess(res)) {
          this.resetData(res.list, res.total);
          if (this.onLoadDataSuccess) this.onLoadDataSuccess(res);
        }
        if (this.afterSuccessFunc) {
          this.afterSuccessFunc(res);
        }
      })
        .catch(err => {
          if (this.afterErrorFunc) {
            this.afterErrorFunc(err);
          }
          this.resetData();
        });
    },
    /**
     * 选中分页的改变并重新请求
     * @param  {Number} currentPage 切换的分页
     */
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.loadData();
    },
    /**
     * 选中分页的大小并重新请求
     * @param  {Number} size 分页的大小
     */
    handleSizeChange(size) {
      this.currentPage = 1;
      this.pageSize = size;
      this.loadData();
    }
  }
};
