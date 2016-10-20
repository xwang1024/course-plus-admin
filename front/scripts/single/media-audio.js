
(function (window, document, $) {
  $(function () {
    initTagSelect();

    function bindPlayEvent() {
      $('.audio-play-btn').unbind().click(function() {
        var src = $(this).data('audioSrc');
        $('#audio-player').attr('src', src)
      });
    }

    function bindFilterAudio() {
      $('[name=filterBtn]').unbind().click(function() {
        var tags = $('[name=searchTags]').val();
        var search = location.search;
        var map = {};
        if(search) {
          search = search.slice(1).split('&');
          for(var i in search){
            var k = search[i].split('=')[0];
            var v = search[i].split('=')[1];
            map[k] = v;
          }
        }
        if(!tags) {
          delete map['tags'];
        } else {
          map['tags'] = tags;
        }
        var newSearch = [];
        for(var k in map) {
          newSearch.push(encodeURIComponent(k)+'='+encodeURIComponent(map[k]));
        }
        if(newSearch.length > 0) {
          location.search = '?' + newSearch.join('&');
        } else {
          location.search = "";
        }
      });
    }
    
    function bindUploadAudio() {
      $('[name=uploadAudioBtn]').unbind().click(function() {
        $('body').append($('#audio-upload-tpl').html());

        bindCreateTag();
        initTagSelect('#audio-upload');
        $('#audio-upload [name=file]').on('change', function() {
          var file = $('input[type=file]')[0].files[0];
          if(!file) return alert('请选择文件');
          var type = file.type;
          var size = file.size;
          if(size > 30*1024*1024) {
            return alert('文件大小不可超过30MB');
          }
          var $audio = $('#audio-preview');
          var canPlay = $audio[0].canPlayType(type);
          if (canPlay === '') canPlay = false;
          if(!canPlay) return alert('不支持此种格式的音频');

          var fileURL = URL.createObjectURL(file);
          console.log(file, fileURL);
          $audio.attr('src',fileURL);
        });
        $('#audio-upload-form').on('submit', function (e) {
          if (e.isDefaultPrevented()) {
          } else {
            e.preventDefault();
            var file = $('#audio-upload-form [name=file]')[0].files[0];
            var title = $('#audio-upload-form [name=title]').val();
            var description = $('#audio-upload-form [name=description]').val();
            var tags = $('#audio-upload-form [name=tags]').val();
            if(!tags) return alert('请至少选择一个标签');
            tags = tags.split(';');
            var formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('tags', tags);
            formData.append('file', file);
            loader.show();
            $.ajax({
              url : '/admin/api/media/audio',
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
        
        $('#audio-upload').modal({backdrop: 'static', keyboard: false});
      });
    }

    function bindModifyAudio() {
      $('[name=modifyAudioBtn]').click(function(e) {
        $('body').append($('#audio-modify-tpl').html());
        var id = $(this).parents('tr').data('id');
        var title = $(this).parents('tr').find('[name=title]').text();
        $('#audio-modify [name=title]').val(title);
        var desc = $(this).parents('tr').find('[name=title]').attr('title');
        $('#audio-modify [name=description]').val(desc);

        var initValue = $(this).parents('tr').find('[data-tags]').data('tags');
        $('#audio-modify [name=tags]').val(initValue);
        initTagSelect('#audio-modify');
        bindCreateTag();

        // 绑定修改操作
        $('#audio-modify [name=submitModifyBtn]').unbind().click(function() {
          var body = {
            title: $('#audio-modify [name=title]').val(),
            description: $('#audio-modify [name=description]').val(),
            tags: $('#audio-modify [name=tags]').val()
          }
          if(!body.tags)  return alert('请至少选择一个标签');
          body.tags = body.tags.split(';');
          console.log(body)
          $.ajax({
            url: '/admin/api/media/'+id,
            type: 'PUT',
            data: JSON.stringify(body),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
              if(data.error) {
                if(typeof data.error.message === 'object') {
                  data.error.message = data.error.message.join('\n');
                }
                return swal('错误', data.error.message, 'error');
              } else {
                swal({
                    title : "成功",
                    text : "音频素材已修改",
                    type : "success"
                  },
                  function () {
                    location.reload();
                  });
              }
            }
          });
        });
        $('#audio-modify').modal({backdrop: 'static', keyboard: false});
      });
    }

    function bindRemoveAudio() {
      $('[name=deleteAudioBtn]').unbind().click(function() {
        var id = $(this).parents('tr').data('id');
        swal({
          title : '确定删除？',
          text : '该操作无法撤销，请谨慎操作',
          type : "warning",
          showCancelButton : true,
          confirmButtonText : "确定删除",
          cancelButtonText : "取消",
          closeOnConfirm : false
        }, function (isConfirm) {
          if (isConfirm) {
            $.ajax({
              url: '/admin/api/media/'+id,
              type: 'DELETE',
              dataType: 'json',
              contentType: 'application/json',
              success: function (data) {
                if(data.error) {
                  if(typeof data.error.message === 'object') {
                    data.error.message = data.error.message.join('\n');
                  }
                  return swal('错误', data.error.message, 'error');
                } else {
                  swal({
                      title : "成功",
                      text : "该素材已删除",
                      type : "success"
                    },
                    function () {
                      location.reload();
                    });
                }
              }
            });
          }
        });
      });
    }

    bindPlayEvent();
    bindFilterAudio();
    bindUploadAudio();
    bindModifyAudio();
    bindRemoveAudio()
  });
})(window, document, window.jQuery);