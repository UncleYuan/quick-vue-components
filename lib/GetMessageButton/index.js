import GetMessageButton from './src/index';

GetMessageButton.install = function(Vue) {
  console.info('GetMessageButton----install----');
  Vue.component(GetMessageButton.name, GetMessageButton);
};

export default GetMessageButton;
