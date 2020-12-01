import Qs from "qs";
import request from "../utils/request";
import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import merge from "lodash/merge";
import isFunction from "lodash/isFunction";
/*
  findInfoDataMix * 常用的查询详情的接口封装；
*/

export default {
  props: {
    /**
     * 是否禁用请求
     */
    disabledFetch: {
      type: Boolean,
      default: false
    },
    /**
     * 配置查询的url
     */
    url: {
      type: String
    },
    /**
     * 配置查询的方式
     */
    fetchType: {
      type: String,
      default: "get"
    },
    /**
     * 配置查询带的数据
     */
    fetchData: {
      type: [Object, Array, String],
      default: () => ({})
    },
    /**
     * 配置查询的前置数据过滤方法
     */
    beforeFetchDataFilter: {
      type: Function,

      default: res => {
        return res;
      }
    },
    /**
     * 配置查询的数据过滤方法
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
     * 配置请求成功后的数据回调
     */
    onLoadDataSuccess: {
      type: Function,
      default: res => res
    },
    /**
     * 配置请求成功后返回的数据是否是成功数据
     */
    isSuccess: {
      type: Function,
      default: res => res
    },
    /**
     * 配置返回的数据过滤方法
     */
    resDataFilter: {
      type: Function,
      default: res => res
    },
    /**
     * 返回的数据的初始值
     */
    propData: {
      type: [Object, Array, String],
      default: () => ({})
    },
    /**
     * 配置列表，可一次查询多个接口数据
     */
    configList: {
      type: [Boolean, Array],
      default: false
    },
    /**
     * 配置 一次查询多个接口数据的回调类型，是各自回调或是同一执行一个回调
     */
    fetchListType: {
      type: String,
      default: "all" // all 或是 every
    }
  },

  data(e) {
    return {
      loading: false,
      infoData: this.propData,
      stateFetchData: {}
    };
  },
  created() {
    if (!this.disabledFetch) this.loadData();
  },
  watch: {
    fetchData: function(newVal, oldVal) {
      if (!isEqual(newVal, oldVal) && !this.disabledFetch) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.loadData(true);
        }, 500);
      }
    }

  },
  methods: {
    /**
     * 拷贝一个全新数据的方法
     * @param  {Object} d 要拷贝的数据
     */
    getJson(d) {
      return cloneDeep(d);
    },
    /**
     * 重新数据的方法
     * @param  {Array} data 设置的 数据

     */
    resetData(data = {}) {
      this.loading = false;
      if (
        !this.url &&
        this.configList &&
        this.configList.length &&
        this.fetchListType == "every"
      ) {
        // 当数据是各自请求时合并
        this.infoData = { ...merge(this.infoData, data) };
      } else {
        this.infoData = data;
      }
    },
    /**
     * 获取单个请求配置
     * @param  {Object} conf 配置的对象
     * @param  {String} key 单个配置的name
     */
    getConf(conf, key) {
      return conf && conf[key] ? conf[key] : this[key];
    },
    /**
     * 生成请求的方法
     * @param  {Object} conf 配置的对象
     * @param  {Number}} index 单个配置的 idx
     */
    makeConf(conf, index) {
      const stateFetchData = this.getConf(conf, "stateFetchData"); // 初始化带有的数据
      const fetchData = this.getConf(conf, "fetchData"); // 配置请求带有的数据
      const beforeFetchDataFilter = this.getConf(conf, "beforeFetchDataFilter"); // 当请求时候的预处理配置数据过滤方法，一般用来全局配置
      const fetchDataFilter = this.getConf(conf, "fetchDataFilter"); // 请求时候的数据过滤方法，一般用来动态配置请求方法
      const fetchType = this.getConf(conf, "fetchType"); // 请求类型
      const fetchDataType = this.getConf(conf, "fetchDataType"); // 请求的数据类型，现在只支持form和json形式
      let fetchDataAll = {
        ...this.getJson(fetchData),
        ...this.getJson(stateFetchData)
      };
      delete fetchDataAll.isTrusted;
      fetchDataAll = beforeFetchDataFilter(fetchDataAll);
      const setUrl = isFunction(conf.url)
        ? conf.url(fetchDataAll)
        : conf.url;
      fetchDataAll = fetchDataFilter(fetchDataAll);

      if (fetchType == "get") {
        fetchDataAll = {
          params: fetchDataAll
        };
      }
      let setConf = {};
      if (fetchDataType == "form") {
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

      return request({
        url: setUrl,
        method: fetchType,
        [fetchType == "get" ? "params" : "data"]: fetchDataAll,
        ...setConf
      }).then(res =>
        typeof index == "number"
          ? { ...res, confName: conf.name, confIdx: index }
          : res
      );
    },
    /**
     * 请求数据的方法
     */
    loadData() {
      console.log("loading.....");

      if (this.url) {
        // 单个请求配置
        this.loading = true;
        this.makeConf(this)
          .then(this.onFetchSuccess)
          .catch(this.onFetchError);
      } else if (this.configList && this.configList.length) {
        // 多个请求配置
        this.loading = true;
        const PromiseList = [];

        this.configList.map((conf, i) => {
          PromiseList.push(this.makeConf(conf, i));
        });
        if (this.fetchListType == "all") {
          // 同时返回完请求
          Promise[this.fetchListType](PromiseList)
            .then(this.mergeDataFilter)
            .then(this.onFetchSuccess)
            .catch(this.onFetchError);
        } else if (this.fetchListType == "every") {
          // 各自返回完请求
          PromiseList.map(PromiseItem => {
            PromiseItem.then(this.everyFetchDataFilter)
              .then(this.onFetchSuccess)
              .catch(this.onFetchError);
          });
        }
      }
    },
    /**
     * 合并全部请求的数据 方法
     * @param  {Object} res 返回的数据
     */
    mergeDataFilter(res) {
      //  全部请求的判断方法
      const resData = {
        success: true,
        data: {}
      };
      res.map(o => {
        resData.data[o.confName || `data${o.confIdx}`] = o.data;
      });

      return resData;
    },
    /**
     * 合并各自请求的数据 方法
     * @param  {Object} res 返回的数据
     */
    everyFetchDataFilter(res) {
      const resData = {
        success: true,
        data: {}
      };

      resData.data[res.confName || `data${res.confIdx}`] = res.data;

      return resData;
    },
    /**
     * 成功后的回调
     * @param  {Object} res 返回的数据
     */
    onFetchSuccess(res) {
      res = this.resDataFilter(res);
      this.loading = false;

      if (this.isSuccess(res)) {
        this.resetData(res.data);
      }
      if (this.afterSuccessFunc) {
        this.afterSuccessFunc(res);
      }
    },
    /**
     * 失败后的回调
     * @param  {Object} err 失败返回的数据
     */
    onFetchError(err) {
      this.resetData();
      throw err;
    }
  }
};
