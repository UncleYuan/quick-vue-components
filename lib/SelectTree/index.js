import SelectTree from './src/index'

SelectTree.install = function (Vue) {
  console.info('SelectTree----install----')
  Vue.component(SelectTree.name, SelectTree)
}

export default SelectTree
