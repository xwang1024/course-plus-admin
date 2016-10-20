'use strict';

(function(window, document, $, module, exports, require, Qiniu, QiniuConfig){
  var avatarKey, avatarCrop;

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
        initAvatarEditModal();
      },
      FileUploaded: function(up, file, info) {
        var info = JSON.parse(info);
        avatarKey = info.key;
        initAvatarCropper();
      },
      Error: function(up, err, errTip) {
        alert(errTip);
      }
    }
  });

  function initAvatarEditModal() {
    $('body').append($('#edit-avatar-tpl').html());
    $('#edit-avatar [name=submitBtn]').click(function() {
      console.log('crop');
      cropAvatarImage();
    });
    $('#edit-avatar').on('hidden.bs.modal', function (e) {
      $('#edit-avatar').remove();
    });
    $('#edit-avatar').modal({backdrop: 'static', keyboard: false});
  }

  function initAvatarCropper() {
    $.ajax({
      type: 'get',
      url:  '/api/qiniu/downloadUrl',
      data: {key: avatarKey},
      success: function(resData) {
        console.log(resData);
        var url = resData.downloadUrl;
        $('[name=avatarImg]').on('load', function() {
          $('#edit-avatar').find('.whirl').removeClass('whirl traditional');
          $('[name=avatarImg]').cropper({
            aspectRatio: 4 / 5,
            autoCropArea: 1,
            preview: "#avatar-preview-container",
            crop: function(e) {
              avatarCrop = e;
            }
          });
        });
        $('[name=avatarImg]').attr('src', url);
        $('[name=avatarPreviewImg]').attr('src', url);
      }
    });
  }

  function cropAvatarImage() {
    var fopArr = [{
      'fop': 'imageMogr2',
      'auto-orient': true,
      'strip': true,
      'crop': `!${avatarCrop.width}x${avatarCrop.height}a${avatarCrop.x}a${avatarCrop.y}`,
      'format': 'png'
    },{
      'fop': 'imageMogr2',
      'auto-orient': true,
      'strip': true,
      'thumbnail': '320x400',
      'format': 'png'
    }];
    var imgLink = Qiniu.pipeline(fopArr, avatarKey);
    console.log(imgLink);
  }

})(window, document, window['jQuery'], module, exports, require, window['Qiniu'], window['QiniuConfig']);