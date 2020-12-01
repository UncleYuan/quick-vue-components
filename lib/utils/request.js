import axios from "axios";

// create an axios instance
const service = axios.create({

  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 120000 // request timeout
});

// request interceptor
service.interceptors.request.use(
  config => {
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

  },
  error => {
    console.log(error); // for debug

    return Promise.reject(error);
  }
);

export default service;
