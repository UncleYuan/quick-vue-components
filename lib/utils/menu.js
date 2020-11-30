import makePy from "./makePy";

const setLen2Key = function(arr) {
  let strArr = [...arr];
  if (strArr.length < 2) {
    return strArr;
  } else {
    strArr.splice(0, 1);
    return strArr;
  }
};

export function findRouteDataByCode(routes, obj, parents = []) {
  let res = {};
  routes.map((route, idx) => {
    if (route.meta && route.meta.code && route.meta.code == obj.code) {
      let strArr = [];
      if (obj.parentLabel) strArr.push(obj.parentLabel);
      if (obj.name || obj.label) strArr.push(obj.name || obj.label);

      route.meta.pageTitle = strArr.join("-");
      route.meta.title = setLen2Key(strArr).join("-");
      res = {
        ...route.meta,
        path: parents
          .concat(route)
          .map(o => o.path)
          .join("/")
      };
    }
    if (
      route.meta &&
      route.meta.parentCode &&
      route.meta.parentCode == obj.code
    ) {
      let strArr = [];
      if (obj.parentLabel) strArr.push(obj.parentLabel);
      if (obj.name || obj.label) strArr.push(obj.name || obj.label);
      if (route.meta.infoTitle) strArr.push(route.meta.infoTitle);

      route.meta.pageTitle = strArr.join("-");
      route.meta.title = setLen2Key(strArr).join("-");
    }
    if (route.children && route.children.length) {
      let resData = findRouteDataByCode(
        route.children,
        obj,
        parents.concat(route)
      );
      if (resData.path) {
        res = resData;
      }
    }
  });
  return res;
}

/**
 * 将平级遍历为树形
 * @param {(Array)} data
 * @returns {Array}
 */
export function toTree(data) {
  let result = [];
  if (!Array.isArray(data)) {
    return result;
  }
  data.forEach(item => {
    delete item.children;
  });
  let map = {};
  data.forEach(item => {
    item.label = item.name;
    map[item.id] = item;
  });
  data.forEach(item => {
    let parent = map[item.parentId];
    if (parent) {
      item.parentLabel = parent.label;
      (parent.children || (parent.children = [])).push(item);
    } else {
      result.push(item);
    }
  });
  return result;
}

/**
 * 遍历给树形增加标识符
 * @param {(Array)} tree
 * @returns {Array}
 */
export function setTreeItemKey(tree) {
  return tree.map((item, i) => {
    if (item.label) {
      item.filterKey = makePy(item.label);
    }
    if (item.children) {
      item.children = setTreeItemKey(item.children);
    }
    return item;
  });
}
function matchKey(filterKeys, key, allSame) {
  let res = false;

  filterKeys.map(k => {
    if (k.indexOf(key) >= 0) {
      res = true;
    }
  });
  return res;
}
/**
 * 通过标识找到树形节点
 * @param {(Array)} tree
 * @param {(string)} key
  
 * @param {(string)} itemKey
  * @param {(boolean)} allSame
 * @returns {Array}
 */
export function findTreeItemByKey(tree, key, itemKey = "filterKey", allSame) {
  let resTree = [];
  let findKey = key.toLocaleUpperCase();
  tree.map((item, i) => {
    if(item.label=="对账包裹文件"){
      console.log(item)
    }
    if (
      (item[itemKey] &&
        item[itemKey].length &&
        (allSame
          ? item[itemKey]&&(item[itemKey].toLocaleUpperCase() == findKey)
          : matchKey(item[itemKey], findKey))) ||
      (item.children &&
        findTreeItemByKey(item.children, findKey, itemKey, allSame).length)
    ) {
      resTree.push(item);
    }
  });
  return resTree;
}
