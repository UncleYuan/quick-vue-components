import http from "../utils/http";
import Qs from "qs";
import lodash from "lodash";
export default {
  props: {
    /**
     * 配置提交的url
     */
    url: {
      type: [String, Function],
      default: ""
    },
    /**
     * 配置提交的类型
     */
    fetchType: {
      type: String,
      default: "post"
    },
    /**
     * 配置提交的自带数据
     */
    fetchData: {
      type: Object,
      default: () => ({})
    },
    /**
     * 配置提交的成功的默认提示
     */
    successText: {
      type: String,
      default: "提交成功"
    },
    /**
     * 配置提交前的判断方法，可根据提交数据判断是否进行提交
     */
    beforeFetch: {
      type: Function
    },
    /**
     * 配置提交的数据类型方式 json 或是 form
     */
    fetchDataType: {
      type: String,
      default: "json"
    },
    /**
     * 提交成功后的回调
     */
    afterSubmitSuccess: {
      type: Function,
      default: res => res
    },
    /**
     * 提交失败后的回调
     */
    afterSubmitError: {
      type: Function,
      default: res => res
    },
    /**
     * 提交数据的过滤方法
     */
    fetchDataFilter: {
      type: Function,
      default: res => res
    },
    /**
     * 默认提交的fetch的配置
     */
    fetchConfig: {
      type: Object,
      default: () => ({})
    },
    /**
     * 默认返回数据的过滤参数
     */
    defaultResFilter: {
      type: Function,
      default: res => res
    },
    /**
     * 判断返回的数据是否时成功的方法
     */
    isResultSuccess: {
      type: Function,
      default: res => res
    },
    /**
     * 以新打开界面形式提交
     */
    getFile: {
      type: Boolean,
      default: false
    },
    /**
     *  成功是否提示信息
     */
    showSuccessTip: {
      type: Boolean,
      default: true
    },
    /**
     *  失败是否提示信息
     */
    showErrorTip: {
      type: Boolean,
      default: true
    }
  },

  data(e) {
    return {
      loading: false
    };
  },

  methods: {
    /**
     * 拷贝一个全新数据的方法
     * @param  {Object} obj 要拷贝的数据
     */
    getJson(obj) {
      return lodash.cloneDeep(obj);
    },
    /**
     * 打开文件的方法
     * @param  {Object} fetchData 要提交的数据
     */
    getFileFunc() {},
    /**
     * 成功后的重置方法
     * @param  {Object} resData 返回的数据
     */
    onSuccessReset() {},
    /**
     * 设置是否加载中
     * @param  {Boolean} type 是否加载中
     */
    changeLoadingStatus(type) {
      this.loading = type;
      this.$emit("submitLoadingStatusChange", type);
    },
    /**
     * 请求数据的方法
     * @param  {Object} fetchData 请求的数据
     *  @param  {Function} disabledFilter 经过前置提交数据过滤方法
     */
    async goFetchFunc(fetchData = this.fetchData, disabledFilter) {
      const {
        url,
        fetchType,
        successText,

        beforeFetch,
        afterSubmitSuccess,
        fetchDataFilter,
        getFile,
        defaultResFilter,
        isResultSuccess,
        showSuccessTip
      } = this;
      let goFetch = true; // 是否提交的方法
      const setUrl = lodash.isFunction(url) ? url(fetchData) : url;
      if (!setUrl) return;
      if (fetchData) delete fetchData.isTrusted;
      if (lodash.isFunction(fetchDataFilter) && !disabledFilter) {
        fetchData = fetchDataFilter(fetchData); // 经过前置提交数据过滤方法
      }
      if (beforeFetch) {
        goFetch = beforeFetch(fetchData); // 经过前置提交方法判断
      }

      let setFetchConfig = { ...this.fetchConfig };
      if (this.fetchDataType == "form") {
        setFetchConfig = {
          ...setFetchConfig,
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
      if (fetchData) delete fetchData.isTrusted;
      if (goFetch) {
        this.changeLoadingStatus(true);
        if (getFile) {
          // 如果为跳转提交则进入跳转提交
          this.getFileFunc(fetchData);
          return;
        }
        try {
          let res = await http[fetchType](setUrl, fetchData, setFetchConfig);
          res = defaultResFilter(res);
          this.changeLoadingStatus(false);
          if (isResultSuccess(res)) {
            if (typeof afterSubmitSuccess == "function") {
              afterSubmitSuccess(res, fetchData);
            }
            this.$emit("submitSuccess", res, fetchData, this);
            if (showSuccessTip) {
              this.$notify({
                title: res.message || res.msg || successText,
                type: "success"
              });
            }
            this.onSuccessReset();
          } else {
            throw res || {};
          }
        } catch (err) {
          console.log(err);
          this.changeLoadingStatus(false);
          const resText = err.message ? err.message : err.msg || "系统错误";
          if (typeof this.afterSubmitError == "function") {
            this.afterSubmitError(err, fetchData);
          }
          this.$emit("submitError", err, fetchData, this);
          if (this.showErrorTip) {
            this.$notify({
              title: resText,
              type: "error"
            });
          }
        }
      }
    }
  }
};
