import { MessageBox } from "element-ui";
/**
 * 判断文件加载失败提示更新刷新
 * @param {(Object)} err
 */
export function loadPageFaithCatch(err) {
  MessageBox({
    type: "error",
    title: "系统提示",
    message:
      typeof window.navigator.onLine == "boolean" && !window.navigator.onLine
        ? "检测到您网络已断线,请恢复网络连接再尝试"
        : "当前系统已更新，请您按确定重新刷新页面，按取消则停留在当前页面",
    showCancelButton: true
  })
    .then(() => {
      window.location.reload();
    })
    .catch(() => {
      console.log("----");
    });
}
