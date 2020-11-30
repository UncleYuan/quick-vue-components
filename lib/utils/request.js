import axios from "axios";
import { MessageBox } from "element-ui";
import store from "@/store";
import { getToken, setToken } from "@/utils/auth";
import setUrl from "@/utils/setUrl";
import Bus from "@/Bus";

// create an axios instance
const service = axios.create({
  baseURL: setUrl(),
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 120000 // request timeout
});

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    config.baseURL = setUrl(config);
    
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // config.headers["authorization"] = getToken();
      config.headers["authorization"] = getToken();
    }
    return config;
  },
  error => {
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = {
      ...response.data,
      token: response.headers.authorization,
      isRoot: response.headers.is_root
    };
    if (response.headers.authorization) {
      setToken(response.headers.authorization);

      store.commit("user/SET_TOKEN", response.headers.authorization);
    }
    const isDownloadFileSuccess =
      response.request.responseType == "arraybuffer" && response.status == 200; // 增加下载文件判断
    // if the custom code is not 20000, it is judged as an error.
    if (
      res.code !== 20000 &&
      res.status != "ADMIN_AUTH_S_001" &&
      res.status != "AUTH_S_001" &&
      res.success != true &&
      !isDownloadFileSuccess
    ) {
      // Message({
      //   message: res.message || "Error",
      //   type: "error",
      //   duration: 5 * 1000
      // });

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm(
          "You have been logged out, you can cancel to stay on this page, or log in again",
          "Confirm logout",
          {
            confirmButtonText: "Re-Login",
            cancelButtonText: "Cancel",
            type: "warning"
          }
        ).then(() => {
          store.dispatch("user/resetToken").then(() => {
            location.reload();
          });
        });
      }
      return Promise.reject({
        ...(res || {}),
        message: res.message || res.msg || "Error"
      });
    } else {
      return isDownloadFileSuccess ? response : res;
    }
  },
  error => {
    console.log(error); // for debug

    try {
      error.message = error.response.data.message; // 判断后台是否有错误信息返回;
    } catch (e) {
      console.log("无法从response.data中拿到错误信息");
    }
    if (error.response && error.response.status == 401) {
      // 假如401 退出账号
      error.message = "用户信息超时,请重新登录";
      store.dispatch("user/resetToken").then(() => {
        Bus.$emit("goToLogin");
      });
    }

    return Promise.reject(error);
  }
);

export default service;
