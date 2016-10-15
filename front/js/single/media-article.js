
(function (window, document, $) {
  $(function () {
    'use strict';

    // 初始化标签选择器
    initTagSelect();
    
    function bindPreviewArticle() {
      $('[name=previewBtn]').click(function() {
        var id = $(this).parents('tr').data('id');
        $('body').append($('.article-preview-tpl#'+id+'-preview').html());
        $('#'+id).modal({backdrop: 'static', keyboard: false});
      });
    }
    function bindFilterArticle() {
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

    function bindRemoveArticle() {
      $('[name=deleteArticleBtn]').unbind().click(function() {
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
              url: '/admin/api/media/articles/'+id,
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
    
    bindFilterArticle();
    bindPreviewArticle();
    bindRemoveArticle();

  });
})(window, document, window.jQuery);