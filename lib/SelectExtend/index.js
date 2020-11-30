import SelectExtend from './src/index'

SelectExtend.install = function (Vue) {
  console.info('SelectExtend----install----')
  Vue.component(SelectExtend.name, SelectExtend)
}

export default SelectExtend
