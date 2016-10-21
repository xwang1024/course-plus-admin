'use strict';

(function(window, document, $, module, exports, require){
  let $loader = $(".loader");
  module.exports =  {
    show: function(container) {
      if(container) $(container).find('.loader').fadeIn();
      else          $loader.fadeIn();
      
    },
    hide: function(container) {
      if(container) $(container).find('.loader').fadeOut();
      else          $loader.fadeOut();
    }
  }
})(window, document, window['jQuery'], module, exports, require);