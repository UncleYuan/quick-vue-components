import PowerfulBtn from './src/index';

PowerfulBtn.install = function(Vue) {
  console.info('PowerfulBtn----install----');
  Vue.component(PowerfulBtn.name, PowerfulBtn);
};

export default PowerfulBtn;
