import Drag from './src/index'

Drag.install = function (Vue) {
  console.info('Drag----install----')
  Vue.component(Drag.name, Drag)
}

export default Drag
