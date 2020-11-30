import TodoList from './src/index'

TodoList.install = function (Vue) {
  console.info('TodoList----install----')
  Vue.component(TodoList.name, TodoList)
}

export default TodoList
