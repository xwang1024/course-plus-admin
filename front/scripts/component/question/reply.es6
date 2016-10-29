'use strict';

(function(window, document, $, module, exports, require, swal, wangEditor){
  var Loader = require('component/common/loader');
  var editor = require('component/common/editor');
  var id = $('[name=id]').val();

  $('[name=stashBtn]').click(function() {
    var body = {};
    body['replyContent'] = editor.$txt.html();

    $.ajax({
      url: `/api/question/${id}`,
      type: 'PUT',
      data: JSON.stringify(body),
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        if(data.error) {
          if(typeof data.error.message === 'object') {
            data.error.message = data.error.message.join('\n');
          }
          return swal('错误', data.error.message, 'error');
        } else {
          swal({
              title : "成功",
              text : "问题回复已暂存",
              type : "success"
            },
            function () {
              window.location.href = '/question';
            });
        }
      }
    });
  });

  $('[name=submitBtn]').click(function() {
    swal({
      title : '确定发送邮件？',
      text : '该操作无法撤销，请谨慎操作',
      type : "warning",
      showCancelButton : true,
      confirmButtonText : "确定发送",
      cancelButtonText : "取消",
      closeOnConfirm : false
    }, function (isConfirm) {
      if (isConfirm) {
        Loader.show();
          var body = {};
          body['replyContent'] = editor.$txt.html();
          $.ajax({
            url: `/api/question/${id}?send=true`,
            type: 'PUT',
            data: JSON.stringify(body),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
              if(data.error) {
                if(typeof data.error.message === 'object') {
                  data.error.message = data.error.message.join('\n');
                }
                return swal('错误', data.error.message, 'error');
              } else {
                swal({
                    title : "成功",
                    text : "邮件已发送",
                    type : "success"
                  },
                  function () {
                    window.location.href = '/question';
                  });
              }
            }
          });
      }
    });
  });
})(window, document, window['jQuery'], module, exports, require, window['swal'], window['wangEditor']);