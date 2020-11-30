import CheckBoxWrap from './src/index'

CheckBoxWrap.install = function (Vue) {
  console.info('CheckBoxWrap----install----')
  Vue.component(CheckBoxWrap.name, CheckBoxWrap)
}

export default CheckBoxWrap
