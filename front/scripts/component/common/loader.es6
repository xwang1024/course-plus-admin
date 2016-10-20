'use strict';

(function(window, document, $, module, exports, require){
  let $loader = $(".loader");
  module.exports =  {
    show: function() {
      $loader.fadeIn();
    },
    hide: function() {
      $loader.fadeOut();
    }
  }
})(window, document, window['jQuery'], module, exports, require);