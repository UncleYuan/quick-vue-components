import TreeExtend from './src/index';

TreeExtend.install = function(Vue) {
  console.info('TreeExtend----install----');
  Vue.component(TreeExtend.name, TreeExtend);
};

export default TreeExtend;
