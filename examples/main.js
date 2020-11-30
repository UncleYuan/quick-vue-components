import Vue from 'vue'
import App from './App.vue'

// // 统一加载
// import BesUI from 'quick-vue-components'
// Vue.use(BesUI)

// 只加载component2
import { component2 } from 'quick-vue-components'
Vue.use(component2)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
