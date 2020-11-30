/**

 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null;
  }
  const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    return value.toString().padStart(2, "0");
  });
  return time_str;
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (("" + time).length === 10) {
    time = parseInt(time) * 1000;
  } else {
    time = +time;
  }
  const d = new Date(time);
  const now = Date.now();

  const diff = (now - d) / 1000;

  if (diff < 30) {
    return "刚刚";
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + "分钟前";
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + "小时前";
  } else if (diff < 3600 * 24 * 2) {
    return "1天前";
  }
  if (option) {
    return parseTime(time, option);
  } else {
    return (
      d.getMonth() +
      1 +
      "月" +
      d.getDate() +
      "日" +
      d.getHours() +
      "时" +
      d.getMinutes() +
      "分"
    );
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split("?")[1];
  if (!search) {
    return {};
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')
        .replace(/\+/g, " ") +
      '"}'
  );
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result;

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp;

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function(...args) {
    context = this;
    timestamp = +new Date();
    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

function filterKeyValue(keyMap, key, o) {
  if (typeof keyMap[key] == "function") {
    return keyMap[key](o);
  } else if (typeof keyMap[key] == "string") {
    return o[keyMap[key]];
  }
}

export function setTreeData(
  data,
  parentItem,
  keyMap = {
    label: "divisionName",
    value: o => o.value || o.id,
    children: "childrenAddress",
    setObjKeyArr: false
  }
) {
  return data.map(item => {
    item.label = filterKeyValue(keyMap, "label", item);
    item.value = filterKeyValue(keyMap, "value", item);
    const getChilds = filterKeyValue(keyMap, "children", item);
    const hasChildren = !!(getChilds && getChilds.length);

    item.parentName = parentItem ? parentItem.label : "";

    if (hasChildren) {
      item.children = getChilds || [];
      if (typeof keyMap.children == "string") delete item[keyMap.children];
      item.children = setTreeData(item.children, item, keyMap);
    }
    if (!keyMap.setObjKeyArr) {
      return item;
    } else {
      const setItem = {};
      [...keyMap.setObjKeyArr, "children", "parentName"].map(k => {
        setItem[k] = item[k];
      });
      return setItem;
    }
  });
}

/**
 *   遍历城市地址树形
 * @param {Array} data   树形数据
 * @param {Object} parentItem  父级
 * @return {Array}
 */

export const setCityTreeData = setTreeData;

/**
 *   遍历选项设置位置标记
 * @param {Array} data   选项数据
 * @param {Array} lvKeys==label  位置标记

 */

export function setTreeLvKeys(data, lvKeys = []) {
  return data.map((item, i) => {
    item.lvKeys = [...lvKeys, i];
    if (item.children && item.children.length) {
      item.children = setTreeLvKeys(item.children, [...lvKeys, i]);
    }
    return item;
  });
}

/**
 *   根据位置标记反选数据
 * @param {Array} data   选项数据
 * @param {Array} lvKeys==label  位置标记

 */

export function getTreeDataByLvKeys(data, lvKeys = []) {
  let findData = null;
  lvKeys.map((key, idx) => {
    if (idx == 0) {
      if (data[key]) {
        findData = data[key];
      }
    } else {
      if (findData && findData.children && findData.children[key]) {
        findData = findData.children[key];
      } else {
        findData = null;
      }
    }
  });
  return findData;
}

/**
 *   遍历选项回选中文名称
 * @param {Array} data   选项数据
 * @param {string} val  选项值
 * @param {string} labelKey==label  匹配中文的key
 * @param {string} key==value  比对的key
 * @return {String}
 */
export function getLabel(data, val, labelKey = "label", key = "value") {
  let res = val;
  data.map(o => {
    if (o[key] == val) {
      res = o[labelKey];
    }
  });
  return res;
}

/**
 *   遍历选项回选中文名称
 * @param {Object} setData  设置过滤的对象
 * @param {string} key   设置过滤的对象key
 * @param {Function} setFilterFunc  设置过滤方法
 * @return {Object}
 */
export function startEndDataFilter(setData, key, startKey = '${key}Start', endKey = '${key}End') {
  if (setData[key] && setData[key][0] && setData[key][1]) {
    setData[startKey.replace('${key}', key)] = setData[key][0];
    setData[endKey.replace('${key}', key)] = setData[key][1];
    delete setData[key];
  } else {
    delete setData[key];
  }
  return setData;
}

/**
 *   返回字符长度，中文算两个字符

 * @param {string} val  值

 * @return {Number}
 */
export function getByteLen(val) {
  var len = 0;
  for (var i = 0; i < val.length; i++) {
    var a = val.charAt(i);
    if (a.match(/[^\x00-\xff]/gi) != null) {
      len += 2;
    } else {
      len += 1;
    }
  }
  return len;
}
