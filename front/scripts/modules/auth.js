(function(window, document, $){
  $(function () {
    'use strict';

    $('#sign-in-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var data = $(this).serializeArray().reduce(function(obj, item) {
          obj[item.name] = item.value;
          return obj;
        }, {});
        console.log(data);
        loader.show();
        $.ajax({
          url:'/signIn',
          method:'POST',
          data: JSON.stringify(data),
          dataType: 'json',
          contentType: 'application/json;charset=utf-8',
          success: function(data) {
            loader.hide();
            if(data.error) {
              if(typeof data.error.message === 'object') {
                $('.alert-container').empty();
                $('.alert-container').append('<div class="alert alert-danger" role="alert">'+data.error.message.join('<br/>')+'</div>');
              }
            } else {
              location.reload();
            }
          },
          error: function(data) {
            console.log('error', data);
          }
        });
      }
    });

    $('#sign-up-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var data = $(this).serializeArray().reduce(function(obj, item) {
          obj[item.name] = item.value;
          return obj;
        }, {});
        if(data.password !== data.password1) return alert("两次输入的密码不一致");
        loader.show();
        $.ajax({
          url:'/signUp',
          method:'POST',
          data: JSON.stringify(data),
          dataType: 'json',
          contentType: 'application/json;charset=utf-8',
          success: function(data) {
            loader.hide();
            if(data.error) {
              if(typeof data.error.message === 'object') {
                $('.alert-container').empty();
                $('.alert-container').append('<div class="alert alert-danger" role="alert">'+data.error.message.join('<br/>')+'</div>');
              }
            } else {
              swal({
                title : "成功",
                text : "您的注册申请已经提交，请等待管理员审核",
                type : "success"
              },
              function () {
                location.href="/signIn"
              });
            }
          },
          error: function(data) {
            console.log('error', data);
          }
        });
      }
    });
    
  });
})(window, document, window.jQuery);
