import CardPanel from './src/index'

CardPanel.install = function (Vue) {
  console.info('CardPanel----install----')
  Vue.component(CardPanel.name, CardPanel)
}

export default CardPanel
