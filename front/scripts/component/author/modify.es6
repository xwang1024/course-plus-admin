'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig, mOxie){
  var Loader = require('component/common/loader');
  
  var avatarReady, iconReady, resourceReady;
  var avatarKey, iconKey, resourceKey;

  // 形象上传器
  var avatarUploader = Qiniu.uploader({
    runtimes: 'html5,flash,html4',
    browse_button: 'avatar-upload-btn',
    container: 'avatar-container',
    max_file_size: '5mb',
    dragdrop: false,
    chunk_size: '4mb',
    uptoken_url: '/api/qiniu/uptoken',
    unique_names: true,
    domain: QiniuConfig.domain,
    multi_selection: false,
    filters: {
      mime_types : [
        {title : "图片文件", extensions: "jpg,jpeg,png"}
      ]
    },
    auto_start: false,
    init: {
      FilesAdded: function(up, files) {
        Loader.show();
        var file = files[0];
        var img = new mOxie.Image();
        img.onload = function() {
          $('#avatar-upload-btn').find('.fa').hide();
          $('#avatar-upload-btn').find('canvas').remove();
          $('#avatar-upload-btn').find('img').remove();
          this.embed($('#avatar-preview').get(0));
          Loader.hide();
        };
        img.onembedded = function() {
          this.destroy();
        };
        img.onerror = function() {
          this.destroy();
        };
        img.load(file.getSource());
        avatarReady = true;
      },
      BeforeUpload: function(up, file) {
      },
      FileUploaded: function(up, file, info) {
        var info = JSON.parse(info);
        avatarKey = info.key;
        if(iconReady) iconUploader.start();
        else if(resourceReady) resourceUploader.start();
        else $('#author-form').submit();
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
    max_file_size: '5mb',
    flash_swf_url: '/static/js/plupload/Moxie.swf',
    dragdrop: false,
    chunk_size: '4mb',
    uptoken_url: '/api/qiniu/uptoken',
    unique_names: true,
    domain: QiniuConfig.domain,
    multi_selection: false,
    filters: {
      mime_types : [
        {title : "图片文件", extensions: "jpg,jpeg,png"}
      ]
    },
    auto_start: false,
    init: {
      FilesAdded: function(up, files) {
        Loader.show();
        var file = files[0];
        var img = new mOxie.Image();
        img.onload = function() {
          $('#icon-upload-btn').find('.fa').hide();
          $('#icon-upload-btn').find('canvas').remove();
          $('#icon-upload-btn').find('img').remove();
          this.embed($('#icon-preview').get(0), {
            width: 64,
            height: 64,
            crop: false
          });
          Loader.hide();
        };
        img.onembedded = function() {
          this.destroy();
        };
        img.onerror = function() {
          this.destroy();
        };
        img.load(file.getSource());
        iconReady = true;
      },
      BeforeUpload: function(up, file) {
      },
      FileUploaded: function(up, file, info) {
        var info = JSON.parse(info);
        iconKey = info.key;
        if(resourceReady) resourceUploader.start();
        else $('#author-form').submit();
      },
      Error: function(up, err, errTip) {
        Loader.hide();
        alert(errTip);
      }
    }
  });

  // 资料上传器
  var resourceUploader = Qiniu.uploader({
    runtimes: 'html5,flash,html4',
    browse_button: 'resource-upload-btn',
    max_file_size: '30mb',
    flash_swf_url: '/static/js/plupload/Moxie.swf',
    dragdrop: false,
    chunk_size: '4mb',
    uptoken_url: '/api/qiniu/uptoken',
    unique_names: true,
    domain: QiniuConfig.domain,
    multi_selection: false,
    auto_start: false,
    init: {
      FilesAdded: function(up, files) {
        if(files.length === 0 ) {
          $('[name=uploadFilePath]').empty();
        } else {
          var fileName = files[0].name;
          $('[name=uploadFilePath]').text(fileName);
        }
        resourceReady = true;
      },
      BeforeUpload: function(up, file) {
      },
      FileUploaded: function(up, file, info) {
        var info = JSON.parse(info);
        resourceKey = info.key;
        $('#author-form').submit();
      },
      Error: function(up, err, errTip) {
        Loader.hide();
        alert(errTip);
      }
    }
  });

  $('[name=submitAuthorBtn]').click(function() {
    // 上传形象 -> 上传头像 -> 上传资料 -> 提交表单
    Loader.show();
    if(avatarReady) avatarUploader.start();
    else if(iconReady) iconUploader.start();
    else if(resourceReady) resourceUploader.start();
    else $('#author-form').submit();
  })

  $('#author-form').on('submit', function (e) {
    if (e.isDefaultPrevented()) {
    } else {
      e.preventDefault();
      var data = $(this).serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
      }, {});
      data.avatar        = avatarKey;
      data.icon          = iconKey;
      data.resourceKey   = resourceKey;
      
      var id = $('[name=id]').val();
      $.ajax({
        url: '/api/author/' + id,
        type: 'PUT',
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
                text : "作者修改成功",
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

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig'], window['mOxie']);