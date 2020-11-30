import EmailInput from './src/index'

EmailInput.install = function (Vue) {
  console.info('EmailInput----install----')
  Vue.component(EmailInput.name, EmailInput)
}

export default EmailInput
