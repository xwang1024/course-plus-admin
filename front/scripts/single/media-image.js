
(function (window, document, $) {
  $(function () {
    
    initTagSelect();

    function bindFilterImage() {
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
    
    function bindUploadImage() {
      $('[name=uploadImageBtn]').unbind().click(function() {

        $('body').append($('#image-upload-tpl').html());

        bindCreateTag();
        initTagSelect('#image-upload');
        $('#image-upload #image-upload-form').on('submit', function (e) {
          if (e.isDefaultPrevented()) {
          } else {
            e.preventDefault();
            var file = $('#image-upload-form [name=file]')[0].files[0];
            var title = $('#image-upload-form [name=title]').val();
            var description = $('#image-upload-form [name=description]').val();
            var tags = $('#image-upload-form [name=tags]').val();
            if(!tags) return alert('请至少选择一个标签');
            tags = tags.split(';')
            var formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('tags', tags);
            formData.append('file', file);
            loader.show();
            $.ajax({
              url : '/admin/api/media/images',
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
                    $('#image-upload').modal('hide');
                    location.reload();
                  });
              }
            });
          }
        });

        
        
        $('#image-upload').modal({backdrop: 'static', keyboard: false});
      });
    }

    function bindModifyImage() {
      $('[name=modifyImageBtn]').click(function(e) {
        $('body').append($('#image-modify-tpl').html());
        var id = $(this).parents('.media-box').data('id');
        var title = $(this).parents('.media-box').find('[name=title]').text();
        $('#image-modify [name=title]').val(title);
        var desc = $(this).parents('.media-box').find('[name=img]').attr('title');
        $('#image-modify [name=description]').val(desc);

        var initValue = $(this).parents('.media-box').find('[data-tags]').data('tags');
        $('#image-modify [name=tags]').val(initValue);
        initTagSelect('#image-modify');
        bindCreateTag();

        // 绑定修改操作
        $('#image-modify [name=submitModifyBtn]').unbind().click(function() {
          var body = {
            title: $('#image-modify [name=title]').val(),
            description: $('#image-modify [name=description]').val(),
            tags: $('#image-modify [name=tags]').val()
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
                    text : "图片素材已修改",
                    type : "success"
                  },
                  function () {
                    location.reload();
                  });
              }
            }
          });
        });
        $('#image-modify').modal({backdrop: 'static', keyboard: false});
      });
    }

    function bindRemoveImage() {
      $('[name=deleteImageBtn]').click(function(e) {
        var id = $(this).parents('.media-box').data('id');
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
    bindFilterImage();
    bindUploadImage();
    bindModifyImage();
    bindRemoveImage()
  });
})(window, document, window.jQuery);