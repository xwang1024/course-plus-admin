'use strict';

(function(window, document, $, module, exports, require, swal, wangEditor){
  var Loader = require('component/common/loader');
  var select2 = require('component/common/select2');
  var editor = require('component/topic/editor');
  var id = $('[name=id]').val();

  select2.init('course');
  select2.init('author');

  $('[name=submitBtn]').click(function() {
    $('#topic-form').submit();
  })
  $('#topic-form').on('submit', function (e) {
    if (e.isDefaultPrevented()) {
    } else {
      e.preventDefault();
      var body = {};
      $(this).find('input[name],textarea[name],select[name]').each(function() {
        body[$(this).attr('name')] = $(this).val();
      });
      body['authorId'] = parseInt(body['authorId']);
      body['courseId'] = parseInt(body['courseId']);
      body['topicBody'] = {
        type: 'HTML',
        content: editor.$txt.html()
      }

      $.ajax({
        url: `/api/topic/${id}`,
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
                text : "知识点已修改",
                type : "success"
              },
              function () {
                window.location.href = '/topic';
              });
          }
        }
      });
    }
  });
})(window, document, window['jQuery'], module, exports, require, window['swal'], window['wangEditor']);