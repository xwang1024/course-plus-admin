'use strict';

(function(window, document, $, module, exports, require){
  var monthTrans = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  var dayTrans = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  var prefixInteger = function(num, length) {
    return ( "0000000000000000" + num ).substr( -length );
  }
  setInterval(function() {
    var date = new Date();
    $('[name=month]').text(monthTrans[date.getMonth()]);
    $('[name=date]').text(prefixInteger(date.getDate(), 2));
    $('[name=day]').text(dayTrans[date.getDay()]);
    $('[name=time]').text(prefixInteger(date.getHours(), 2)+':'+prefixInteger(date.getMinutes(), 2)+':'+prefixInteger(date.getSeconds(), 2));
  },1000);
})(window, document, window['jQuery'], module, exports, require);