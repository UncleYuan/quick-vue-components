import DataTable from './src/index'

DataTable.install = function (Vue) {
  console.info('DataTable----install----')
  Vue.component(DataTable.name, DataTable)
}

export default DataTable
