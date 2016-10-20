
(function(window, document, $, undefined){

  var URL = window.URL || window.webkitURL;
  $(function () {
    'use strict';

    initTagSelect();
    
    bindCreateTag();

    $('[name=embedPreviewBtn]').click(function() {
      var embedCode = $('[name=embedCode]').val();
      if(!embedCode) return alert('请粘贴或输入外链通用代码');
      if(!$(embedCode)[0]) return alert('代码错误，无法解析到iframe标签');
      var tagName = $(embedCode)[0].tagName;
      if(!tagName) return alert('代码错误，无法解析到iframe标签');
      tagName = tagName.toLowerCase();
      if(tagName !== 'iframe') return alert('代码错误，无法解析到iframe标签');
      var src = $(embedCode).attr('src');
      $('#choose-type').hide();
      $('#preview').show();
      $('.video-player-container').html('<iframe src="'+src+'" allowtransparency="true" allowfullscreen="true" allowfullscreenInteractive="true" scrolling="no" border="0" frameborder="0" style="width:100%;height:400px;"></iframe>');
      
      $('#video-upload-form').on('submit', function (e) {
        if (e.isDefaultPrevented()) {
        } else {
          e.preventDefault();
          var body = {
            title: $('#video-upload-form [name=title]').val(),
            description: $('#video-upload-form [name=description]').val(),
            src: src,
            tags: $('#video-upload-form [name=tags]').val()
          }
          if(!body.tags) return alert('请至少选择一个标签');
          body.tags = body.tags.split(';')
          $.ajax({
            url : '/admin/api/media/videoRemote',
            type : 'POST',
            data : JSON.stringify(body),
            dataType: 'json',
            contentType: 'application/json',
            success : function(data) {
              console.log(data);
              if (data.error) {
                if (typeof data.error.message === 'object') {
                  data.error.message = data.error.message.join('\n');
                }
                return swal('错误', data.error.message, 'error');
              }
              swal({
                  title : "素材上传成功",
                  type : "success"
                },
                function () {
                  location='/admin/media/video'
                });
            }
          });
        }
      });
    });

    $('[name=uploadPreviewBtn]').click(function() {
      var file = $('input[name=file]')[0].files[0];
      if(!file) return alert('请选择文件');
      var type = file.type;
      var size = file.size;
      if(size > 30*1024*1024) {
        return alert('文件大小不可超过30MB');
      }
      var $video = $('<video controls style="width: 100%"></video>');
      var canPlay = $video[0].canPlayType(type);
      if (canPlay === '') canPlay = false;
      if(!canPlay) return alert('不支持此种格式的视频');

      var fileURL = URL.createObjectURL(file);
      $video.append('src', '<source src="'+fileURL+'" type="'+type+'">');

      console.log(file, fileURL);
      $('#choose-type').hide();
      $('#preview').show();
      $('.video-player-container').html($video);


      $('#video-upload-form').on('submit', function (e) {
        if (e.isDefaultPrevented()) {
        } else {
          e.preventDefault();
          var title = $('#video-upload-form [name=title]').val();
          var description = $('#video-upload-form [name=description]').val();
          var src = src;
          var tags = $('#video-upload-form [name=tags]').val();
          if(!tags) return alert('请至少选择一个标签');
          tags = tags.split(';')
          var formData = new FormData();
          formData.append('title', title);
          formData.append('description', description);
          formData.append('tags', tags);
          formData.append('file', file);
          loader.show();
          $.ajax({
            url : '/admin/api/media/video',
            type : 'POST',
            data : formData,
            dataType: 'json',
            processData: false,
            contentType: false,
            success : function(data) {
              loader.hide();
              console.log(data);
              if (data.error) {
                if (typeof data.error.message === 'object') {
                  data.error.message = data.error.message.join('\n');
                }
                return swal('错误', data.error.message, 'error');
              }
              swal({
                  title : "素材上传成功",
                  type : "success"
                },
                function () {
                  $('#audio-upload').modal('hide');
                  location.reload();
                });
            }
          });
        }
      });
    })

    $('[name=cancelBtn]').click(function() {
      $('.video-player-container').html('');
      $('#choose-type').show();
      $('#preview').hide();
    });
    
  });
})(window, document, window.jQuery);
