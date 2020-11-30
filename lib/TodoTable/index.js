import TodoTable from './src/index'

TodoTable.install = function (Vue) {
  console.info('TodoTable----install----')
  Vue.component(TodoTable.name, TodTodoTableoList)
}

export default TodoTable
