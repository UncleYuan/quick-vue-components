import BaseList from './src/index'

BaseList.install = function (Vue) {
  console.info('BaseList----install----')
  Vue.component(BaseList.name, BaseList)
}

export default BaseList
