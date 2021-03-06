'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var select2 = require('component/common/select2');
  var Loader = require('component/common/loader');

  $('[name=modifyBtn]').click(function(e) {
    var id = $(this).parents('tr').data('id');
    console.log('[Modify]', id);

    $('body').append($('#modify-tpl').html());

    // 获取数据
    Loader.show('#modify');
    $.ajax({
      url: `/api/speciality/${id}`,
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
          if(data.result[name]) $(this).val(data.result[name]);
        });
        if(data.result['schoolId']) {
          $.ajax({
            url: `/api/school/${data.result['schoolId']}`,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
              if(data.error) return;
              select2.init('school', data.result.id, data.result.name, '#modify');
            }
          });
        } else {
          select2.init('school');
        }
      }
    });

    // 绑定修改操作
    $('#speciality-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var data = $(this).serializeArray().reduce(function(obj, item) {
          obj[item.name] = item.value;
          return obj;
        }, {});
        if(data.schoolId) data.schoolId = parseInt(data.schoolId);
        
        Loader.show('#modify');
        $.ajax({
          url: `/api/speciality/${id}`,
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
                  text : "专业修改成功",
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