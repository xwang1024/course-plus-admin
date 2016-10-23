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
      url: `/api/topic/${id}`,
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
        $('#detail').find('.modal-title').text(data.result.name);
        $('#detail').find('.modal-body').html(data.result.topicBody.content);
      }
    });

    $('#detail').on('hidden.bs.modal', function() {
      $('#detail').remove();
    })
    $('#detail').modal({backdrop: 'static', keyboard: false, size: 'lg'});
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);