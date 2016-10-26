'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig, mOxie){
  var Loader = require('component/common/loader');
  
  module.exports = function (name, width, height, callback) {
      var key, cropInfo, hasFile;
      var uploader = Qiniu.uploader({
        runtimes: 'html5',
        browse_button: `${name}-upload-btn`,
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
            var img = new mOxie.Image();
            img.onload = function() {
              $(`#${name}-upload-btn`).find(`.fa,.origin-preview`).hide();
              $(`.${name}-preview`).removeClass('hidden');
              Loader.hide();
              var dataUrl = this.getAsDataURL("image/jpeg", 100);

              $('body').append($('#crop-tpl').html());
              $('#crop .img-crop-preview').css({width: width, height: height});
              $('#crop').on('shown.bs.modal', function() {
                $('#crop #img-crop').attr('src', dataUrl);
                $('#crop #img-crop').cropper({
                  aspectRatio: width / height,
                  autoCropArea: 1,
                  preview: `.img-crop-preview,.${name}-preview`,
                  crop: function(e) {
                    cropInfo = {
                      width: e.width,
                      height: e.height,
                      x: e.x,
                      y: e.y,
                    }
                  }
                });
              })
              $('#crop').on('hidden.bs.modal', function() {
                $('#crop').remove();
              })
              $('#crop').modal({backdrop: 'static', keyboard: false});
            };
            img.onembedded = function() {
              this.destroy();
              var canvas = $(`#${name}-preview`).find('canvas')[0];
            };
            img.onerror = function() {
              this.destroy();
            };
            img.load(files[0].getSource());
            hasFile = true;
          },
          BeforeUpload: function(up, file) {
          },
          FileUploaded: function(up, file, info) {
            var info = JSON.parse(info);
            key = info.key;
            var fopArr = [{
              'fop': 'imageMogr2',
              'auto-orient': true,
              'strip': true,
              'crop': `!${cropInfo.width}x${cropInfo.height}a${cropInfo.x}a${cropInfo.y}`,
              'quality': 100,
              'format': 'png'
            }, {
              'fop': 'imageMogr2',
              'thumbnail': `${width}x${height}`,
              'quality': 100,
              'format': 'png'
            }]
            var link = Qiniu.pipeline(fopArr, key);
            key = key + '?' + link.split('?')[1];
            if(callback) callback(key);
          },
          Error: function(up, err, errTip) {
            Loader.hide();
            alert(errTip);
          }
        }
      });
      
      return {
        start: function() {
          uploader.start();
        },
        hasFile: function() {
          return hasFile;
        }
      };
    }

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig'], window['mOxie']);