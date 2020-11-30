import QuickForm from './src/index'

QuickForm.install = function (Vue) {
  console.info('QuickForm----install----')
  Vue.component(QuickForm.name, QuickForm)
}

export default QuickForm
