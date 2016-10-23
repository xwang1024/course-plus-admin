(function(window, document, $, undefined){

  $(function(){

    window.padLeft = function(str, num) {
      str = str+'';
      var pad = '00000000000000000';
      return pad.substring(0, num - str.length) + str;
    }
  });

})(window, document, window.jQuery);
