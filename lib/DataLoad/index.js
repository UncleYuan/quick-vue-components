import DataLoad from './src/index';

DataLoad.install = function(Vue) {
  console.info('DataLoad----install----');
  Vue.component(DataLoad.name, DataLoad);
};

export default DataLoad;
