'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');
  $('[name=modifyBtn]').click(function(e) {
    var id = $(this).parents('tr').data('id');
    console.log('[Modify]', id);

    $('body').append($('#modify-tpl').html());

    // 获取数据
    Loader.show('#modify');
    $.ajax({
      url: `/api/admin/${id}`,
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        Loader.hide('#modify');
        if(data.error) {
          if(typeof data.error.message === 'object') {
            data.error.message = data.error.message.join('\n');
          }
          return swal('错误', data.error.message, 'error');
        }
        // input赋值
        $('#modify').find('input,select,textarea').each(function() {
          var name = $(this).attr('name');
          if(data.result[name]) {
            if(data.result[name] === true) {
              $(this).val(1);
            } else if(data.result[name] === false) {
              $(this).val(0);
            } else {
              $(this).val(data.result[name]);
            }
          }
        });
      }
    });

    // 绑定修改操作
    $('#admin-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var data = $(this).serializeArray().reduce(function(obj, item) {
          obj[item.name] = item.value;
          return obj;
        }, {});
        if(data.enable) data.enable = true;
        else            data.enable = false;
        if(!data.password) delete data.password;
        
        Loader.show('#modify');
        $.ajax({
          url: `/api/admin/${id}`,
          type: 'PUT',
          data: JSON.stringify(data),
          dataType: 'json',
          contentType: 'application/json',
          success: function (data) {
            Loader.hide('#modify');
            if(data.error) {
              if(typeof data.error.message === 'object') {
                data.error.message = data.error.message.join('\n');
              }
              return swal('错误', data.error.message, 'error');
            } else {
              swal({
                  title : "成功",
                  text : "人员修改成功",
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
    $('#modify').on('hidden.bs.modal', function() {
      $('#modify').remove();
    })
    $('#modify').modal({backdrop: 'static', keyboard: false});
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);