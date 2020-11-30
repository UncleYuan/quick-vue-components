/**

 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor'];
  return valid_map.indexOf(str.trim()) >= 0;
}

export const number = /^\d+(\.\d+)?$/; // 纯数字正则
export const email = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/g; // 邮箱正则
export const phone = /^1(3|4|5|6|7|8|9)\d{9}$/g; // 手机号正则

export const username = /^[a-zA-Z0-9_-]{4,16}$/g; // 用户名正则，4到16位（字母，数字，下划线，减号）

export const ipcard = /(^\d{15}$)|(^\d{17}(\d|X|x)$)/;
