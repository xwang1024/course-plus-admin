'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var select2 = require('component/common/select2');
  var Loader = require('component/common/loader');

  $('[name=detailBtn]').click(function(e) {
    var id = $(this).parents('tr').data('id');
    console.log('[Detail]', id);

    $('body').append($('#detail-tpl').html());

    // 获取数据
    Loader.show('#detail');
    $.ajax({
      url: `/api/question/${id}`,
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        Loader.hide('#detail');
        if(data.error) {
          if(typeof data.error.message === 'object') {
            data.error.message = data.error.message.join('\n');
          }
          return swal('错误', data.error.message, 'error');
        }
        // 获取数据
        $.ajax({
          url: `/api/author/${data.result.topic.authorId}`,
          type: 'GET',
          dataType: 'json',
          success: function (authorData) {
            Loader.hide('#detail');
            if(authorData.error) {
              if(typeof authorData.error.message === 'object') {
                authorData.error.message = authorData.error.message.join('\n');
              }
              return swal('错误', authorData.error.message, 'error');
            }
            data.result.topic.author = authorData.result;
            
            $('#detail [name]').each(function() {
              var name = $(this).attr('name');
              if(name.indexOf('user.') === 0) {
                let subAttr = name.split('.')[1];
                $(this).text(data.result.user[subAttr]);
              } else if(name.indexOf('topic.author.') === 0) {
                let subAttr = name.split('.')[2];
                $(this).text(data.result.topic.author[subAttr]);
              } else if(name.indexOf('topic.') === 0) {
                let subAttr = name.split('.')[1];
                $(this).text(data.result.topic[subAttr]);
              } else if(data.result[name]) {
                $(this).text(data.result[name]);
              }
            });
            if(data.result.replyContent) {
              $('#detail #reply-content-preview').html(data.result.replyContent);
            } else {
              $('#detail #reply-content-preview').html('<span class="text-muted">没有回复正文</span>');
            }
            $('#detail #avatar-img').attr('src', data.result.topic.author.avatarUrl);
          }
        });
      }
    });

    $('#detail').on('hidden.bs.modal', function() {
      $('#detail').remove();
    })
    $('#detail').modal({backdrop: 'static', keyboard: false, size: 'lg'});
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);