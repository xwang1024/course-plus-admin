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
      url: `/api/author/${id}`,
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

        $('#detail [name]').each(function() {
          var name = $(this).attr('name');
          if(data.result[name]) {
            $(this).text(data.result[name]);
          }
        });
        $('#detail #avatar-img').attr('src', data.result.avatarUrl);
        $('#detail #icon-img').attr('src', data.result.iconUrl);
        // $('#detail [name=resourceDl]').attr('src', data.result.resourceUrl);
      }
    });

    $('#detail').on('hidden.bs.modal', function() {
      $('#detail').remove();
    })
    $('#detail').modal({backdrop: 'static', keyboard: false, size: 'lg'});
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);