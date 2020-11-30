import Editor from './src/index'

Editor.install = function (Vue) {
  console.info('Editor----install----')
  Vue.component(Editor.name, Editor)
}

export default Editor
