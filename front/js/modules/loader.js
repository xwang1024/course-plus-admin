(function(window, document, $, undefined){
  $loader = $(".loader");
  $loader.fadeOut();
  window.loader = {
    show: function() {
      $loader.fadeIn();
    },
    hide: function() {
      $loader.fadeOut();
    }
  }

})(window, document, window.jQuery);
