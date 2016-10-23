'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');

  $('#sign-in-form').on('submit', function (e) {
    if (e.isDefaultPrevented()) {
    } else {
      e.preventDefault();
      var data = $(this).serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
      }, {});
      console.log(data);
      Loader.show();
      $.ajax({
        url:'/api/auth/signIn',
        method:'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function(data) {
          Loader.hide();
          if(data.error) {
            if(typeof data.error.message === 'object') {
              $('.alert-container').empty();
              $('.alert-container').append('<div class="alert alert-danger" role="alert">'+data.error.message.join('<br/>')+'</div>');
            }
          } else {
            location.reload();
          }
        },
        error: function(data) {
          console.log('error', data);
        }
      });
    }
  });
})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);
