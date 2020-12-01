let request = require("./request");
export function setRequest(requestFn) {
  request = requestFn;
}
export const get = request.get;
export const post = request.post;
export default request;

