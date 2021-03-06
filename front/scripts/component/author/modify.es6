'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig, mOxie){
  var Loader = require('component/common/loader');
  var ImgUploader = require('component/common/img_uploader');
  
  var resourceReady;
  var avatarKey, iconKey, attachmentKey, ext;

  var avatarUploader = new ImgUploader('avatar', 170, 215, (key) => {
    avatarKey = key;
    if(iconUploader.hasFile()) iconUploader.start();
    else if(resourceReady) resourceUploader.start();
    else $('#author-form').submit();
  });

  var iconUploader = new ImgUploader('icon', 64, 64, (key) => {
    iconKey = key;
    if(resourceReady) resourceUploader.start();
    else $('#author-form').submit();
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
        attachmentKey = info.key;
        ext = /^.*\.([^\.]*)$/.exec(file.name)[1];
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
    if(avatarUploader.hasFile()) avatarUploader.start();
    else if(iconUploader.hasFile()) iconUploader.start();
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
      data.avatar      = avatarKey;
      data.icon        = iconKey;
      data.contactCost = data.contactCost ? Math.round(parseInt(data.contactCost)*100) : 0;
      data.attachment = {
        name: data.name+'的资料',
        ext: ext,
        key: attachmentKey,
        cost: data.attachmentCost ? Math.round(parseInt(data.attachmentCost)*100) : 0
      };
      if(data.contactCost<0) {
        data.contactCost = 0;
      }
      if(data.contactCost > 100000000) {
        data.contactCost = 100000000;
      }
      

      if(data.attachment.cost<0) {
        data.attachment.cost = 0;
      }
      if(data.attachment.cost > 100000000) {
        data.attachment.cost = 100000000;
      }
      
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