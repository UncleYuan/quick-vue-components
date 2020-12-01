import Vue from 'vue'
import App from './App.vue'
 
import  QuickVueComponents from 'quick-vue-components'
Vue.use(QuickVueComponents)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
