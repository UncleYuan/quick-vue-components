import TodoTable from './src/index';

TodoTable.install = function(Vue) {
  console.info('TodoTable----install----');
  Vue.component(TodoTable.name, TodoTable);
};

export default TodoTable;
