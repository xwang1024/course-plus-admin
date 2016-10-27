'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var select2 = require('component/common/select2');
  var Loader = require('component/common/loader');
  var ImgUploader = require('component/common/img_uploader');

  var uploader;
  var formData = {};
  $('[name=createBtn]').click(function(e) {
    $('body').append($('#create-tpl').html());
    bindSubmit();
    bindUpload();
    $('#create').on('hidden.bs.modal', function() {
      $('#create').remove();
    });
    select2.init('speciality');
    $('#create').modal({backdrop: 'static', keyboard: false});
  });

  function bindSubmit() {
    $('#course-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        formData = $(this).serializeArray().reduce(function(obj, item) {
          obj[item.name] = item.value;
          return obj;
        }, {});
        // 上传文件
        uploader.start();
      }
    });
  }

  function bindUpload() {
    uploader = new ImgUploader('cover', 150, 210, (key)=> {
      // 处理form信息
      formData['cover']        = key;
      formData['specialityId'] = parseInt(formData['specialityId']);
      
      $.ajax({
        url: '/api/course',
        type: 'POST',
        data: JSON.stringify(formData),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
          Loader.hide('#create');
          if(data.error) {
            if(typeof data.error.message === 'object') {
              data.error.message = data.error.message.join('\n');
            }
            return swal('错误', data.error.message, 'error');
          } else {
            swal({
                title : "成功",
                text : "课程上传成功",
                type : "success"
              },
              function () {
                location.reload();
              });
          }
        }
      });
    });
  }

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);