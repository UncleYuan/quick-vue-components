import DateTimeRanges from './src/index';

DateTimeRanges.install = function(Vue) {
  console.info('BaseList----install----');
  Vue.component(DateTimeRanges.name, DateTimeRanges);
};

export default DateTimeRanges;
