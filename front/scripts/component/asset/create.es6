'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');
  var uploader;
  var formData = {};
  $('[name=createBtn]').click(function(e) {
    $('body').append($('#create-tpl').html());
    bindSubmit();
    bindUpload();
    $('#create').on('hidden.bs.modal', function() {
      $('#create').remove();
    })
    $('#create').modal({backdrop: 'static', keyboard: false});
  });

  function bindSubmit() {
    $('#asset-form').on('submit', function (e) {
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
    uploader = Qiniu.uploader({
      runtimes: 'html5,flash,html4',
      browse_button: 'asset-upload-btn',
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
          {title : "图片文件", extensions: "jpg,jpeg,gif,png"},
          {title : "音频文件", extensions: "mp3,ogg"}
        ]
      },
      auto_start: false,
      init: {
        FilesAdded: function(up, files) {
          if(files.length === 0 ) {
            $('[name=uploadFilePath]').empty();
          } else {
            var fileName = files[0].name;
            $('[name=uploadFilePath]').text(fileName);
          }
        },
        BeforeUpload: function(up, file) {
          Loader.show('#create');
        },
        FileUploaded: function(up, file, info) {
          var info = JSON.parse(info);
          formData['key']  = info.key;
          formData['type'] = file.type.split('/')[0].toUpperCase();
          formData['ext']  = /^.*\.([^\.]*)$/.exec(file.name)[1];

          $.ajax({
            url: '/api/asset',
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
                    text : "素材上传成功",
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
  
  // var avatarKey, iconKey;

  

  // // 头像上传器
  // var iconUploader = Qiniu.uploader({
  //   runtimes: 'html5,flash,html4',
  //   browse_button: 'icon-upload-btn',
  //   container: 'icon-container',
  //   max_file_size: '100mb',
  //   flash_swf_url: '/static/js/plupload/Moxie.swf',
  //   dragdrop: false,
  //   chunk_size: '4mb',
  //   uptoken_url: '/api/qiniu/uptoken',
  //   unique_names: true,
  //   domain: QiniuConfig.domain,
  //   multi_selection: false,
  //   filters: {
  //     mime_types : [
  //       {title : "图片文件", extensions: "jpg,jpeg,gif,png"}
  //     ]
  //   },
  //   auto_start: true,
  //   init: {
  //     BeforeUpload: function(up, file) {
  //       Loader.show();
  //     },
  //     FileUploaded: function(up, file, info) {
  //       var info = JSON.parse(info);
  //       iconKey = info.key;
  //       $.ajax({
  //         type: 'get',
  //         url:  '/api/qiniu/downloadUrl',
  //         data: {key: iconKey},
  //         success: function(resData) {
  //           var url = resData.downloadUrl;
  //           $('#icon-preview').on('load', function() {
  //             Loader.hide();
  //           });
  //           $('#icon-preview').attr('src', url);
  //           $('#icon-preview').attr('src', url);
  //         }
  //       });
  //     },
  //     Error: function(up, err, errTip) {
  //       Loader.hide();
  //       alert(errTip);
  //     }
  //   }
  // });

  // $('[name=submitAuthorBtn]').click(function() {
  //   $('[name=authorForm]').submit();
  // })

  // $('#author-form').on('submit', function (e) {
  //   if (e.isDefaultPrevented()) {
  //   } else {
  //     e.preventDefault();
  //     var data = $(this).serializeArray().reduce(function(obj, item) {
  //       obj[item.name] = item.value;
  //       return obj;
  //     }, {});
  //     data.avatar = avatarKey;
  //     data.icon   = iconKey;
      
  //     Loader.show();
  //     $.ajax({
  //       url: '/api/author',
  //       type: 'POST',
  //       data: JSON.stringify(data),
  //       dataType: 'json',
  //       contentType: 'application/json',
  //       success: function (data) {
  //         Loader.hide();
  //         if(data.error) {
  //           if(typeof data.error.message === 'object') {
  //             data.error.message = data.error.message.join('\n');
  //           }
  //           return swal('错误', data.error.message, 'error');
  //         } else {
  //           swal({
  //               title : "成功",
  //               text : "作者创建成功",
  //               type : "success"
  //             },
  //             function () {
  //               window.location.href = '/author'
  //             });
  //         }
  //       }
  //     });
  //   }
  // });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);