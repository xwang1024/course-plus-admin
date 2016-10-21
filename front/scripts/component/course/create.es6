'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');

  $('[name=createBtn]').click(function(e) {
    $('body').append($('#create-tpl').html());
    // 绑定创建操作
    $('#course-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var data = $(this).serializeArray().reduce(function(obj, item) {
          obj[item.name] = item.value;
          return obj;
        }, {});
        data.specialityId = parseInt(data.specialityId);
        
        Loader.show();
        $.ajax({
          url: '/api/course',
          type: 'POST',
          data: JSON.stringify(data),
          dataType: 'json',
          contentType: 'application/json',
          success: function (data) {
            Loader.hide();
            if(data.error) {
              if(typeof data.error.message === 'object') {
                data.error.message = data.error.message.join('\n');
              }
              return swal('错误', data.error.message, 'error');
            } else {
              swal({
                  title : "成功",
                  text : "课程创建成功",
                  type : "success"
                },
                function () {
                  location.reload();
                });
            }
          }
        });
      }
    });
    $('#create').on('hidden.bs.modal', function() {
      $('#create').remove();
    })
    $('#create').modal({backdrop: 'static', keyboard: false});
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);