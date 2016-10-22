(function(window, document, $, undefined){

  $(function(){
    var $ele = $('[data-auto-height]');
    if(!$ele || $ele.length === 0) return;
    var remain = $ele.data('autoHeight');
    remain || (remain = 0);
    $ele.css({'min-height': window.innerHeight - remain - $ele.offset().top + 'px'});
  });

})(window, document, window.jQuery);
