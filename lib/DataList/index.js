import DataList from './src/index';

DataList.install = function(Vue) {
  console.info('DataList----install----');
  Vue.component(DataList.name, DataList);
};

export default DataList;
