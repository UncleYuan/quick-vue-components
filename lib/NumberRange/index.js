import NumberRange from './src/index'

NumberRange.install = function (Vue) {
  console.info('NumberRange----install----')
  Vue.component(NumberRange.name, NumberRange)
}

export default NumberRange
