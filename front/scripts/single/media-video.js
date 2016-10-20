
(function (window, document, $) {
  $(function () {
    
    initTagSelect();

    function bindPlayEvent() {
      $('.video-play-btn').unbind().click(function() {
        $('body').append($('#video-preview-tpl').html());
        var src = $(this).data('videoSrc');
        var isLocal = $(this).data('isLocal');
        if(isLocal) {
          $('#video-preview .modal-body').html('<video style="width:100%;height:360px;" controls><source src="'+src+'">浏览器不支持</video>');
        } else {
          $('#video-preview .modal-body').html('<iframe src="'+src+'" allowtransparency="true" allowfullscreen="true" allowfullscreenInteractive="true" scrolling="no" border="0" frameborder="0" style="width:100%;height:360px;"></iframe>');
        }
        $('#video-preview').modal({backdrop: 'static', keyboard: false});
        $('#video-preview').on('hidden.bs.modal', function () {
          $('#video-preview').remove();
        });
      });
    }

    function bindFilterVideo() {
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

    function bindModifyVideo() {
      $('[name=modifyVideoBtn]').click(function(e) {
        $('body').append($('#video-modify-tpl').html());
        var id = $(this).parents('tr').data('id');
        var title = $(this).parents('tr').find('[name=title]').text();
        $('#video-modify [name=title]').val(title);
        var desc = $(this).parents('tr').find('[name=title]').attr('title');
        $('#video-modify [name=description]').val(desc);

        var initValue = $(this).parents('tr').find('[data-tags]').data('tags');
        $('#video-modify [name=tags]').val(initValue);
        initTagSelect('#video-modify');
        bindCreateTag();

        // 绑定修改操作
        $('#video-modify [name=submitModifyBtn]').unbind().click(function() {
          var body = {
            title: $('#video-modify [name=title]').val(),
            description: $('#video-modify [name=description]').val(),
            tags: $('#video-modify [name=tags]').val()
          }
          if(!body.tags) return alert('请至少选择一个标签');
          body.tags = body.tags.split(';')
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
                    text : "视频素材已修改",
                    type : "success"
                  },
                  function () {
                    location.reload();
                  });
              }
            }
          });
        });
        $('#video-modify').modal({backdrop: 'static', keyboard: false});
      });
    }

    function bindRemoveVideo() {
      $('[name=deleteVideoBtn]').unbind().click(function() {
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
    bindFilterVideo();
    bindModifyVideo();
    bindRemoveVideo();
  });
})(window, document, window.jQuery);