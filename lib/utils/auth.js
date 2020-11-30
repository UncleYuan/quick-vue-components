/* import store from "@/store";
import Bus from "@/Bus"; */
import settings from "@/settings";
const TokenKey = settings.tokenKey;

export function getToken() {
  return localStorage.getItem(TokenKey);
}

export function setToken(token) {
  return localStorage.setItem(TokenKey, token);
}

export function removeToken() {
  return localStorage.removeItem(TokenKey);
}
/*
function getInfoCheck() {
  setTimeout(function() {
    store.dispatch("user/getInfo").then(res => {
      if (location.hash.indexOf("#/login") >= 0) {
        Bus.$emit("goToByUrl", "/");
      }
    });
  }, 1000);
}
 */
export function bindTekenChange() {
  window.addEventListener("storage", () => {
    // let nowToken = localStorage.getItem(TokenKey);
    // if (event.key === TokenKey) {
    //   if (event.newValue === event.oldValue) {
    //   } else {
    //     console.log("当前token已经发生变化");
    //     if (event.newValue) {
    //       localStorage.setItem(TokenKey, event.newValue);
    //       store.commit("user/SET_TOKEN", event.newValue);

    //       getInfoCheck();
    //     } else {
    //       getInfoCheck();
    //     }
    //   }
    // }
  });
}
