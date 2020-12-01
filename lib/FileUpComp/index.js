import FileUpComp from './src/index';

FileUpComp.install = function(Vue) {
  console.info('FileUpComp----install----');
  Vue.component(FileUpComp.name, FileUpComp);
};

export default FileUpComp;
