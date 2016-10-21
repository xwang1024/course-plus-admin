'use strict';

(function(window, document, $, module, exports, require, swal, wangEditor){
  var Loader = require('component/common/loader');

  // 初始化编辑器
  var editor = new wangEditor('content-editor');
  editor.config.menus = [
    'undo', 'redo', '|',
    'bold', 'underline', 'italic', 'strikethrough', 'eraser', 'forecolor', 'bgcolor', '|',
    'quote', 'fontfamily', 'fontsize', 'head', 'unorderlist', 'orderlist', 'alignleft', 'aligncenter', 'alignright', '|',
    'link', 'unlink', 'table', 'insertcode', '|',
    'fullscreen', '|', 'source'
  ];
  editor.create();

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['wangEditor']);