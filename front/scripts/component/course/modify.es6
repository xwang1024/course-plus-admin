'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var select2 = require('component/common/select2');
  var Loader = require('component/common/loader');
  var ImgUploader = require('component/common/img_uploader');
  
  var id;
  var uploader;
  var formData = {};
  $('[name=modifyBtn]').click(function(e) {
    id = $(this).parents('tr').data('id');
    console.log('[Modify]', id);

    $('body').append($('#modify-tpl').html());

    // 获取数据
    Loader.show('#modify');
    $.ajax({
      url: `/api/course/${id}`,
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
        $('#modify #cover-upload-btn .origin-preview').attr("src", data.result['coverUrl']);
        if(data.result['specialityId']) {
          $.ajax({
            url: `/api/speciality/${data.result['specialityId']}`,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
              if(data.error) return;
              select2.init('speciality', data.result.id, data.result.name, '#modify');
            }
          });
        } else {
          select2.init('speciality');
        }
      }
    });

    bindSubmit();
    bindUpload();

    $('#modify').on('hidden.bs.modal', function() {
      $('#modify').remove();
    })
    $('#modify').modal({backdrop: 'static', keyboard: false});
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
        if(uploader.hasFile()) {
          uploader.start();
        } else {
          formData['specialityId'] = parseInt(formData['specialityId']);
          $.ajax({
            url: `/api/course/${id}`,
            type: 'PUT',
            data: JSON.stringify(formData),
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
                    text : "课程修改成功",
                    type : "success"
                  },
                  function () {
                    location.reload();
                  });
              }
            }
          });
        }
      }
    });
  }

  function bindUpload() {
    uploader = new ImgUploader('cover', 150, 210, (key)=> {
      console.log(key)
      formData['cover']        = key;
      formData['specialityId'] = parseInt(formData['specialityId']);
      
      $.ajax({
        url: `/api/course/${id}`,
        type: 'PUT',
        data: JSON.stringify(formData),
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
                text : "课程修改成功",
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