import SelectTable from './src/index'

SelectTable.install = function (Vue) {
  console.info('SelectTable----install----')
  Vue.component(SelectTable.name, SelectTable)
}

export default SelectTable
