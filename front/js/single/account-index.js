
(function (window, document, $) {
  $(function () {

    function bindCreate() {
      $('[name=createBtn]').click(function(e) {
        $('body').append($('#create-tpl').html());

        // 绑定创建操作
        $('#create #account-form').on('submit', function (e) {
          if (e.isDefaultPrevented()) {
          } else {
            e.preventDefault();
            var data = $(this).serializeArray().reduce(function(obj, item) {
              obj[item.name] = item.value;
              return obj;
            }, {});
            
            loader.show();
            $.ajax({
              url: '/admin/root/api/account',
              type: 'POST',
              data: JSON.stringify(data),
              dataType: 'json',
              contentType: 'application/json',
              success: function (data) {
                loader.hide();
                if(data.error) {
                  if(typeof data.error.message === 'object') {
                    data.error.message = data.error.message.join('\n');
                  }
                  return swal('错误', data.error.message, 'error');
                } else {
                  swal({
                      title : "成功",
                      text : "账号创建成功",
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
        $('#create').modal({backdrop: 'static', keyboard: false});
      });
    }

    function bindModify() {
      $('[name=modifyBtn]').click(function(e) {
        $('body').append($('#modify-tpl').html());
        var id = $(this).parents('tr').data('id');
        var username = $(this).parents('tr').find('[data-username]').data('username');
        $('#modify [name=username]').val(username);
        var role = $(this).parents('tr').find('[data-role]').data('role');
        $('#modify [name=role]').val(role);
        var isActive = $(this).parents('tr').find('[data-is-active]').data('isActive');
        $('#modify [name=isActive]').val(isActive);

        // 绑定修改操作
        $('#modify #account-form').on('submit', function (e) {
          if (e.isDefaultPrevented()) {
          } else {
            e.preventDefault();
            var data = $(this).serializeArray().reduce(function(obj, item) {
              obj[item.name] = item.value;
              return obj;
            }, {});
            if(data.password) {
              if(!confirm("确定要重置密码？")) {
                return;
              }
            }

            loader.show();
            $.ajax({
              url: '/admin/root/api/account/' + id,
              type: 'PUT',
              data: JSON.stringify(data),
              dataType: 'json',
              contentType: 'application/json',
              success: function (data) {
                loader.hide();
                if(data.error) {
                  if(typeof data.error.message === 'object') {
                    data.error.message = data.error.message.join('\n');
                  }
                  return swal('错误', data.error.message, 'error');
                } else {
                  swal({
                      title : "成功",
                      text : "账号修改成功",
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
        $('#modify').modal({backdrop: 'static', keyboard: false});
      });
    }

    function bindDelete() {
      $('[name=deleteBtn]').click(function(e) {
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
            loader.show();
            $.ajax({
              url: '/admin/root/api/account/'+id,
              type: 'DELETE',
              dataType: 'json',
              contentType: 'application/json',
              success: function (data) {
                loader.hide();
                if(data.error) {
                  if(typeof data.error.message === 'object') {
                    data.error.message = data.error.message.join('\n');
                  }
                  return swal('错误', data.error.message, 'error');
                } else {
                  swal({
                    title : "成功",
                    text : "该账号已删除",
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
    bindCreate();
    bindModify();
    bindDelete()
  });
})(window, document, window.jQuery);