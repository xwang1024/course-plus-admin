'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var select2 = require('component/common/select2');
  var Loader = require('component/common/loader');
  
  var id;
  var uploader;
  var fileReady = false;
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
        $('#modify [name=uploadFilePath]').text(data.result['cover']);
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
        if(fileReady) {
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
      }
    });
  }

  function bindUpload() {
    uploader = Qiniu.uploader({
      runtimes: 'html5,flash,html4',
      browse_button: 'cover-upload-btn',
      max_file_size: '30mb',
      flash_swf_url: '/static/js/plupload/Moxie.swf',
      dragdrop: false,
      chunk_size: '4mb',
      uptoken_url: '/api/qiniu/uptoken',
      unique_names: true,
      domain: QiniuConfig.domain,
      multi_selection: false,
      filters: {
        mime_types : [
          {title : "图片文件", extensions: "jpg,jpeg,gif,png"}
        ]
      },
      auto_start: false,
      init: {
        FilesAdded: function(up, files) {
          if(files.length === 0 ) {
            $('[name=uploadFilePath]').empty();
            fileReady = false;
          } else {
            var fileName = files[0].name;
            $('[name=uploadFilePath]').text(fileName);
            fileReady = true;
          }
        },
        BeforeUpload: function(up, file) {
          Loader.show('#create');
        },
        FileUploaded: function(up, file, info) {
          var info = JSON.parse(info);
          // 处理form信息
          formData['cover']        = info.key;
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
                    text : "专业修改成功",
                    type : "success"
                  },
                  function () {
                    location.reload();
                  });
              }
            }
          });
        },
        Error: function(up, err, errTip) {
          Loader.hide('#create');
          alert(errTip);
        }
      }
    });
  }

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);