'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');
  
  var avatarKey, iconKey;

  // 形象上传器
  var avatarUploader = Qiniu.uploader({
    runtimes: 'html5,flash,html4',
    browse_button: 'avatar-upload-btn',
    container: 'avatar-container',
    max_file_size: '100mb',
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
    auto_start: true,
    init: {
      BeforeUpload: function(up, file) {
        Loader.show();
      },
      FileUploaded: function(up, file, info) {
        var info = JSON.parse(info);
        avatarKey = info.key;
        $.ajax({
          type: 'get',
          url:  '/api/qiniu/downloadUrl',
          data: {key: avatarKey},
          success: function(resData) {
            var url = resData.downloadUrl;
            $('#avatar-preview').on('load', function() {
              Loader.hide();
            });
            $('#avatar-preview').attr('src', url);
            $('#avatar-preview').attr('src', url);
          }
        });
      },
      Error: function(up, err, errTip) {
        Loader.hide();
        alert(errTip);
      }
    }
  });

  // 头像上传器
  var iconUploader = Qiniu.uploader({
    runtimes: 'html5,flash,html4',
    browse_button: 'icon-upload-btn',
    container: 'icon-container',
    max_file_size: '100mb',
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
    auto_start: true,
    init: {
      BeforeUpload: function(up, file) {
        Loader.show();
      },
      FileUploaded: function(up, file, info) {
        var info = JSON.parse(info);
        iconKey = info.key;
        $.ajax({
          type: 'get',
          url:  '/api/qiniu/downloadUrl',
          data: {key: iconKey},
          success: function(resData) {
            var url = resData.downloadUrl;
            $('#icon-preview').on('load', function() {
              Loader.hide();
            });
            $('#icon-preview').attr('src', url);
            $('#icon-preview').attr('src', url);
          }
        });
      },
      Error: function(up, err, errTip) {
        Loader.hide();
        alert(errTip);
      }
    }
  });

  $('[name=submitAuthorBtn]').click(function() {
    $('[name=authorForm]').submit();
  })

  $('#author-form').on('submit', function (e) {
    if (e.isDefaultPrevented()) {
    } else {
      e.preventDefault();
      var data = $(this).serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
      }, {});
      data.avatar = avatarKey;
      data.icon   = iconKey;
      
      Loader.show();
      $.ajax({
        url: '/api/author',
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
                text : "作者创建成功",
                type : "success"
              },
              function () {
                window.location.href = '/author'
              });
          }
        }
      });
    }
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);