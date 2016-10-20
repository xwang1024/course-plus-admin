var editor = UE.getEditor('editor');

//退格键保护
if (navigator.userAgent.indexOf('SE') >= 0) {//如果是搜狗浏览器
  document.addEventListener("keydown", confirmBack);
  document.addEventListener("keypress", confirmBack);
  function confirmBack(e) {
    e = e || window.event;
    var KeyID = e.keyCode;
    var obj = e.target || e.srcElement;
    var t = obj.type || obj.getAttribute('type');
    if(t=="password" || t=="text" || t=="textarea") return true;
    switch (KeyID) {
      case 8:
        var result = confirm("您确定要返回上一页吗？");
        e.returnValue = result;
        return result;
    }
  }
} else {
  window.onbeforeunload = function (event) {
    return "确定退出吗？您本次在图文素材中作出的修改将不会保存！";
  };
}

(function (window, document, $) {
  $(function () {
    'use strict';

    // 初始化标签选择器
    initTagSelect();
    bindCreateTag();

    // 更新分页器
    var refreshPagination = function(totalPages, startPage) {
      $('#pagination-container')
      .empty()
      .removeData("twbs-pagination")
      .unbind("page")
      .twbsPagination({
        first: '|<',
        prev: '<',
        next: '>',
        last: '>|',
        totalPages: totalPages,
        visiblePages: 3,
        startPage: startPage,
        onPageClick: function(event, page) {
          if(startPage != page) updateMediaList(page);
        }
      });
      $('ul.pagination').addClass('pagination-sm')
    }

    // 素材列表可绑定的动作
    var bindings = {
      insertImg: function() {
        var src = $(this).parents('.media').find('img').data('src');
        var mediaId = $(this).parents('.media').data('mediaId');
        var realWidth, realHeight, width;
        $("<img/>").attr("src", src).load(function() {
          realWidth = this.width;
          realHeight = this.height;
          var editorWidth = $('#editor').outerWidth()-40;
          var width = realWidth > editorWidth ? '100%' : realWidth;
          console.log(width)
          editor.execCommand('insertimage', {
            'src': src,
            'width': '100%',
            'media-id': mediaId
          });
        });
      },
      useAsCover: function() {
        var src = $(this).parents('.media').find('img').data('src');
        var id = $(this).parents('.media').find('img').data('id');
        $('#cover-container').html('<img src='+src+' style="max-width: 30%; max-height=150px;"/>')
        $('#cover-container').append('<input type="hidden" name="cover" value="'+id+'">')
      },
      previewAudio: function() {
        var src = $(this).data('src');
        $('#audio-player').attr('src', src);
      },
      insertAudio: function() {
        var src = $(this).data('src');
        var mediaId = $(this).parents('.media').data('mediaId');
        var str = '<div><audio media-id="'+mediaId+'" src="' + src + '" controls="controls" style="width:100%;"></audio></div><br/>';
        editor.execCommand('inserthtml', str);
      },
      previewVideo: function() {
        $('body').append($('#video-preview-tpl').html());
        var src = $(this).data('src');
        var isLocal = $(this).data('isLocal');
        $('#video-preview .modal-body').empty();
        if(isLocal) {
          $('#video-preview .modal-body').html('<video style="width:100%;height:360px;" controls><source src="'+src+'">浏览器不支持</video>');
        } else {
          $('#video-preview .modal-body').html('<iframe src="'+src+'" allowtransparency="true" allowfullscreen="true" allowfullscreenInteractive="true" scrolling="no" border="0" frameborder="0" style="width:100%;height:360px;"></iframe>');
        }
        $('#video-preview').modal({backdrop: 'static', keyboard: false});
        $('#video-preview').on('hidden.bs.modal', function () {
          $('#video-preview').remove();
        });
      },
      insertVideo: function() {
        var src = $(this).data('src');
        var mediaId = $(this).parents('.media').data('mediaId');
        var isLocal = $(this).data('isLocal');
        $('#video-preview .modal-body').empty();
        if(isLocal) {
          editor.execCommand('inserthtml', '<div><video media-id="'+mediaId+'" style="width:100%;" controls><source src="'+src+'">浏览器不支持</video></div><br/>');
        } else {
          editor.execCommand('inserthtml', '<div><iframe media-id="'+mediaId+'" src="'+src+'" allowtransparency="true" allowfullscreen="true" allowfullscreenInteractive="true" scrolling="no" border="0" frameborder="0" style="width:100%;"></iframe></div><br/>');
        }
      },
      insertQuestion: function() {
        var questionId = $(this).parents('.media').data('questionId');
        var title = $(this).parents('.media').find('[data-title]').data('title');
        var options = $(this).parents('.media').find('[data-options]').data('options');
        options = decodeURIComponent(options);
        console.log(options)
        options = JSON.parse(options);
        var optionHtml = '';
        for(var i in options) {
          optionHtml+= '<label class="checkbox c-checkbox c-checkbox-rounded">\
                          <input type="radio">\
                          <span class="fa fa-check"></span>\
                          '+options[i].no+'. '+options[i].content+'\
                        </label>'
        }

        $('#question-container').append('<div class="bg-gray-lighter ml p" data-question-id="'+questionId+'">\
            <a href="javascript:;" class="pull-right" onclick="$(this).parent().remove()">删除问题</a>\
            <h4>'+title+'</h4>\
            <fieldset class="pb0" style="margin-left: 35px;">\
              '+optionHtml+'\
            </fieldset>\
          </div>')
      }
    }

    // 获取素材type=[images|audio|video]
    function updateMediaList(page) {
      var type = $('.nav-tabs .active').attr('name');
      var pageSize = 10;
      var page = parseInt(page);
      var url = '/admin/api/media/'+type;
      if(type==='question') {
        url = '/admin/api/questions';
      }
      $.ajax({
        url: url,
        type: 'GET',
        data: {
          page: page,
          pageSize: pageSize,
          tags: $('[name=searchTags]').val()
        },
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
          console.log(data);
          if (data.error) {
            if (typeof data.error.message === 'object') {
              data.error.message = data.error.message.join('\n');
            }
            return swal('错误', data.error.message, 'error');
          }
          var dataField = 'media';
          if(type==='question') dataField = 'questions';
          $('.media-list').empty();
          if(data[dataField] && data[dataField].length) {
            if(type === 'audio') {
              $('.media-list').append('<audio id="audio-player" src="" style="width: 100%;" controls autoplay></audio>');
            }
            for (var i = 0; i < data[dataField].length; i++) {
              var item = data[dataField][i];
              var content = ''
              if(type === 'images') {
                content = '\
                <div class="media" data-media-id="'+item._id+'">\
                  <div class="media-left" style="width:100px;">\
                    <div class="img-thumbnail" style="width:100px; height:100px; text-align: center;">\
                      <img src="'+item.url+'" data-src="'+item._url+'" data-id="'+item._id+'" style="max-width:94px; max-height:94px;">\
                    </div>\
                  </div>\
                  <div class="media-body">\
                    <h4 class="media-heading">' + item.title + '</h4>\
                    <div>' + item.desc + '</div>\
                    <span class="label label-purple mr-sm">'+item.tags.join('</span><span class="label label-purple mr-sm">')+'</span><br/>\
                    <button class="btn btn-primary btn-xs mt-sm" data-binding="insertImg">插入正文</button>\
                    <button class="btn btn-primary btn-xs mt-sm" data-binding="useAsCover">作为封面</button>\
                  </div>\
                </div>\
                '
              }
              if(type === 'audio') {
                content = '\
                <div class="media" data-media-id="'+item._id+'">\
                  <div class="media-left" style="width:100px;">\
                    <button class="btn btn-green" style="width:100px; height:100px;" data-binding="previewAudio" data-src="'+item.url+'">\
                      <em class="fa fa-play-circle-o" style="font-size: 64px;"></em>\
                    </button>\
                  </div>\
                  <div class="media-body">\
                    <h4 class="media-heading">' + item.title + '</h4>\
                    <div>' + item.desc + '</div>\
                    <span class="label label-purple mr-sm">'+item.tags.join('</span><span class="label label-purple mr-sm">')+'</span><br/>\
                    <button class="btn btn-primary btn-xs mt-sm" data-binding="insertAudio" data-src="'+item.url+'">插入正文</button>\
                  </div>\
                </div>\
                '
              }
              if(type === 'video') {
                content = '\
                <div class="media" data-media-id="'+item._id+'">\
                  <div class="media-left" style="width:100px;">\
                    <button class="btn btn-purple" style="width:100px; height:100px;" data-binding="previewVideo" data-src="'+item.url+'" data-is-local="'+item.isLocal+'">\
                      <em class="fa fa-play-circle-o" style="font-size: 64px;"></em>\
                    </button>\
                  </div>\
                  <div class="media-body">\
                    <h4 class="media-heading">' + item.title + '</h4>\
                    <div>' + item.desc + '</div>\
                    <span class="label label-purple mr-sm">'+item.tags.join('</span><span class="label label-purple mr-sm">')+'</span><br/>\
                    <button class="btn btn-primary btn-xs mt-sm" data-binding="insertVideo" data-src="'+item.url+'" data-is-local="'+item.isLocal+'">插入正文</button>\
                  </div>\
                </div>\
                '
              }
              if(type === 'question') {
                var options = '';
                for(var j in item.options) {
                  options += item.options[j].no +'. '+ item.options[j].content + '<br/>';
                }
                content = '\
                <div class="media" data-question-id="'+item._id+'">\
                  <div class="media-body">\
                    <h4 class="media-heading" data-title="'+item.title+'">' + item.title + '</h4>\
                    <div class="text-muted ml" data-options="'+encodeURIComponent(JSON.stringify(item.options))+'"><small>' + options + '</small></div>\
                    <span class="label label-purple mr-sm">'+item.tags.join('</span><span class="label label-purple mr-sm">')+'</span><br/>\
                    <button class="btn btn-primary btn-xs mt-sm" data-binding="insertQuestion">添加到该文章</button>\
                  </div>\
                </div>\
                '
              }
              $('.media-list').append(content);

              // 绑定
              $('[data-binding]').each(function() {
                $(this).unbind().click(bindings[$(this).data('binding')]);
                $(this).removeAttr('data-binding');
              });
            }
          }
          // 生成分页器
          refreshPagination(Math.ceil(data.total/pageSize), page)
        }
      });
    }

    updateMediaList(1);

    $('[name=filterBtn]').click(function() {
      updateMediaList(1);
    });

    // 切换素材库标签
    $('.nav-tabs li').click(function() {
      $(this).addClass('active').siblings().removeClass('active');
      updateMediaList(1);
    });

    // 删除封面
    $('[name=removeCover]').click(function() {
      $('#cover-container').empty();
    });

    // 提交素材
    $('#article-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var body = {};
        $(this).find('input[name],textarea[name],select[name]').each(function() {
          body[$(this).attr('name')] = $(this).val();
        });
        body.content = editor.getContent();
        
        body.questions = [];
        $(this).find('[data-question-id]').each(function() {
          body.questions.push($(this).data('questionId'));
        })
        
        if(!body.tags) return alert('请选择标签');
        body.tags = body.tags.split(';');
        console.log(body);
        $.ajax({
          url: '/admin/api/media/articles',
          type: 'POST',
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
                  text : "图文素材已添加",
                  type : "success"
                },
                function () {
                  location='/admin/media/article';
                });
            }
          }
        });
      }
    });
    
    // 初始化编辑器的内容
    editor.addListener( 'ready', function() {
      editor.setContent($('#init-content').html());
    });

    // 修改素材
    $('#article-modify-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var body = {};
        $(this).find('input[name],textarea[name],select[name]').each(function() {
          body[$(this).attr('name')] = $(this).val();
        });
        body.content = editor.getContent();
        body.questions = [];
        $(this).find('[data-question-id]').each(function() {
          body.questions.push($(this).data('questionId'));
        })
        if(!body.tags) return alert('请选择标签');
        body.tags = body.tags.split(';');
        console.log(body);
        $.ajax({
          url: '/admin/api/media/articles/' + $('input[name=id]').val(),
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
                  text : "图文素材已修改",
                  type : "success"
                },
                function () {
                  location='/admin/media/article';
                });
            }
          }
        });
      }
    });
    
  });
})(window, document, window.jQuery);



function getContent() {
  console.log(editor.getContent());
  $('#previewContent').html(editor.getContent());
  initEditor(editor, editor.getContent());
}

function initEditor(editor, html) {
  editor.execCommand('cleardoc');
  if (html)
    editor.execCommand('inserthtml', str);
}