'use strict';

(function(window, document, $, module, exports, require){
  module.exports = (function() {
    $('[data-js-comp]').each(function() {
      var componentName = $(this).data('jsComp');
      console.log(`[invoke] ${componentName}`);
      require(componentName);
    });
  })();
})(window, document, window['jQuery'], module, exports, require);