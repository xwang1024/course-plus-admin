'use strict';

(function(window, document, $, module, exports, require, loader, swal){

  module.exports = (function() {
    var info = {
      0  : {en: "Connect Timeout",       ch: "服务器连接失败或超时"},
      400: {en: "Bad Request",           ch: "请求有误，服务器无法处理"},
      401: {en: "Unauthorized",          ch: "您没有权限进行此操作"},
      403: {en: "Forbidden",             ch: "操作被拒绝"},
      404: {en: "Not Found",             ch: "请求的资源未找到"},
      405: {en: "Method Not Allowed",    ch: "方法不能应用于请求的资源"},
      408: {en: "Request Timeout",       ch: "请求超时"},

      500: {en: "Internal Server Error", ch: "服务器出现处理错误"},
      501: {en: "Not Implemented",       ch: "功能尚未实现"},
      503: {en: "Service Unavailable",   ch: "该服务暂时不可用"}
    }
    $(document).ajaxError(function( event, jqXHR, settings, thrownError ) {
      if(loader) loader.hide();
      if(swal) swal("出现异常", settings.url+'\n\n'+info[jqXHR.status].ch, "error")
      console.log(settings.url);
      console.log(info[jqXHR.status].ch);
    });
  })();

})(window, document, window['jQuery'], window['module'], window['exports'], window['require'], window['loader'], window['swal']);