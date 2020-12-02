import request from "../utils/request";
/**
 * 高阶mixins 通过方法创建一个新的 请求数据并保存到data里的 mixins
 * @param  {String} name load 标识
 * @param  {Object} config load 配置
 */
export default function(name = "default", config = {}) {
  config = {
    ...{ fetchType: "get", url: "/", fetchData: {}, setConf: {}},
    ...config
  };
  return {
    data() {
      return {
        [`${name}Data`]: null,
        [`${name}Loading`]: false
      };
    },
    methods: {
      [`${name}DataLoad`]: function(setFetchData = {}, cb) {
        setFetchData =
          typeof setFetchData == "function"
            ? setFetchData(config.fetchData, this)
            : setFetchData;
        let setData = { ...config.fetchData, ...setFetchData };
        const setUrl =
          typeof config.url == "function"
            ? config.url(setData, this)
            : config.url;
        if (config.fetchType == "get") {
          setData = {
            params: setData
          };
        }
        this[`${name}Loading`] = true;
        return request({
          url: setUrl,
          method: config.fetchType,
          [config.fetchType == "get" ? "params" : "data"]: setData,
          ...config.setConf
        }).then(res => {
          if (res) {
            this[`${name}Data`] = res;
            this[`${name}Loading`] = false;
            if (typeof cb == "function") {
              cb(res);
            }
          }
        })
          .catch(err => {
            this[`${name}Loading`] = false;
            console.log(err);
          });
      }
    }
  };
}
