
(function (window, document, $) {
  $(function () {
    
    initTagSelect();

    function bindFilterQuestion() {
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
    
    function bindAddRadioQuestion() {
      $('[name=addRadioBtn]').unbind().click(function() {

        $('body').append($('#add-radio-tpl').html());

        bindCreateTag();
        initTagSelect('#add-radio');
        $('#add-radio #question-form').on('submit', function (e) {
          if (e.isDefaultPrevented()) {
          } else {
            e.preventDefault();
            var title = $(this).find('[name=title]').val();
            var options = $(this).find('[name=options]').val();
            var allowSeePercent = $(this).find('[name=allowSeePercent]').val();
            var tags = $(this).find('[name=tags]').val();
            if(!tags) return alert('请至少选择一个标签');
            tags = tags.split(';')
            options = options.replace(/;+/g, ';').replace(/;$/g, '').split(';');
            for(var i in options) {
              options[i] = {
                no: (parseInt(i)+1)+'',
                content: options[i]
              }
            }
            
            $.ajax({
              url: '/admin/api/questions',
              type: 'POST',
              data: JSON.stringify({
                type: 'radio',
                title: title,
                options: options,
                allowSeePercent: allowSeePercent=='true',
                tags: tags
              }),
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
                      text : "单选问题添加成功",
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

        
        
        $('#add-radio').modal({backdrop: 'static', keyboard: false});
      });
    }

    function bindModifyQuestion() {
      $('[name=modifyQuestionBtn]').click(function(e) {
        $('body').append($('#question-modify-tpl').html());
        var id = $(this).parents('tr').data('id');
        var title = $(this).parents('tr').find('[name=title]').text();
        $('#question-modify [name=title]').val(title);
        var options = $(this).parents('tr').find('[data-options]').data('options');
        $('#question-modify [name=options]').val(options);
        var allowSeePercent = $(this).parents('tr').find('[data-allow-see-percent]').data('allowSeePercent')+'';
        $('#question-modify [name=allowSeePercent]').val(allowSeePercent);

        var initValue = $(this).parents('tr').find('[data-tags]').data('tags');
        $('#question-modify [name=tags]').val(initValue);
         console.log(initValue);
        initTagSelect('#question-modify');
        bindCreateTag();

        // 绑定修改操作
        $('#question-modify #question-form').on('submit', function (e) {
          if (e.isDefaultPrevented()) {
          } else {
             e.preventDefault();
            var title = $(this).find('[name=title]').val();
            var options = $(this).find('[name=options]').val();
            var allowSeePercent = $(this).find('[name=allowSeePercent]').val();
            var tags = $(this).find('[name=tags]').val();
            if(!tags) return alert('请至少选择一个标签');
            tags = tags.split(';')
            options = options.replace(/;+/g, ';').replace(/;$/g, '').split(';');
            for(var i in options) {
              options[i] = {
                no: (parseInt(i)+1)+'',
                content: options[i]
              }
            }
            
            $.ajax({
              url: '/admin/api/questions/' + id,
              type: 'PUT',
              data: JSON.stringify({
                type: 'radio',
                title: title,
                options: options,
                allowSeePercent: allowSeePercent=='true',
                tags: tags
              }),
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
                      text : "单选问题修改成功",
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
        $('#question-modify').modal({backdrop: 'static', keyboard: false});
      });
    }

    function bindRemoveQuestion() {
      $('[name=deleteQuestionBtn]').click(function(e) {
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
              url: '/admin/api/questions/'+id,
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
                      text : "该问题已删除",
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
    bindFilterQuestion();
    bindAddRadioQuestion();
    bindModifyQuestion();
    bindRemoveQuestion()
  });
})(window, document, window.jQuery);