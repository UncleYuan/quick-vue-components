import SlotRender from './src/index'

SlotRender.install = function (Vue) {
  console.info('SlotRender----install----')
  Vue.component(SlotRender.name, SlotRender)
}

export default SlotRender
