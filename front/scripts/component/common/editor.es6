'use strict';

(function(window, document, $, module, exports, require, swal, wangEditor){
  var Loader = require('component/common/loader');

  // 初始化编辑器
  var editor = new wangEditor('content-editor');
  editor.config.menus = [
    'undo', 'redo', '|',
    'bold', 'underline', 'italic', 'strikethrough', 'eraser', 'forecolor', 'bgcolor', '|',
    'quote', 'fontfamily', 'fontsize', 'head', 'unorderlist', 'orderlist', 'alignleft', 'aligncenter', 'alignright', '|',
    'link', 'unlink', 'table', 'insertcode', '|',
    'fullscreen', '|', 'source'
  ];
  editor.create();

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
      totalPages: totalPages || 1,
      visiblePages: 3,
      startPage: startPage || 1,
      onPageClick: function(event, page) {
        if(startPage != page) updateMediaList(page);
      }
    });
    $('ul.pagination').addClass('pagination-sm')
  }

  // 素材列表可绑定的动作
  var bindings = {
    insertAsset: function() {
      let src       = $(this).data('src');
      let id        = $(this).data('id');
      let key       = $(this).data('key');
      let assetType = $(this).data('assetType');
      console.log(src, key, assetType);
      if(assetType === 'IMAGE') {
        editor.$txt.append(`<p><img style="max-width:100%;" src="${src}" asset-id="${id}" data-key="${key}"><br></p>`);
      } else if(assetType === 'AUDIO') {
        editor.$txt.append(`<p><audio src="${src}" asset-id="${id}" data-key="${key}" controls style="min-width: 70%;"><span class="text-muted">抱歉！浏览器不支持，请使用chrome等支持html5的现代浏览器。</span></audio><br></p>`);
      }
    }
  }

  // 获取素材type=[images|audio|video]
  function updateMediaList(page) {
    var type = $('.nav-tabs .active').attr('name');
    var name = $('[name=assetName]').val() || undefined;
    var pageSize = 10;
    var url = '/api/asset';
    page = parseInt(page);
    $.ajax({
      url: url,
      type: 'GET',
      data: {
        filter: {
          type: type,
          name: name ? { $like: `%${name}%` } : undefined
        },
        page: page,
        pageSize: pageSize,
        tags: $('[name=searchTags]').val(),
        order: 'createdAt DESC',
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
        var content = "";
        if(data.result.length === 0) {
          content = `<p class="text-center">找不到素材</p>`;
        } else if(type === 'IMAGE') {
          data.result.forEach(function(item) {
            content += `
              <div class="media" data-media-id="${item.id}">
                <div class="media-left" style="width:100px;">
                  <div style="width:64px; height:64px; text-align: center;">
                    <img src="${item.thumbnailUrl}" data-key="${item.key}" data-id="${item.id}" style="max-width:64px; max-height:64px;">
                  </div>
                </div>
                <div class="media-body">
                  <p class="media-heading" style="width: 120px;" title="${item.name}">${item.name}</p>
                  <button class="btn btn-primary btn-xs mt-sm" data-binding="insertAsset" data-src="${item.url}" data-key="${item.key}" data-id="${item.id}" data-asset-type="${item.type}">插入正文</button>
                </div>
              </div>
            `
          });
        } else if(type === 'AUDIO') {
          data.result.forEach(function(item) {
            content += `
              <div class="media" data-media-id="${item.id}">
                <div class="media-left" style="width:64px;">
                  <div class="bg-purple text-center" style="width:64px; height:64px;" data-binding="previewAudio" data-src="${item.url}">
                    <em class="fa fa-file-audio-o" style="font-size: 32px; line-height: 64px;"></em>
                  </div>
                </div>
                <div class="media-body">
                  <p class="media-heading">${item.name}</p>
                  <button class="btn btn-primary btn-xs mt-sm" data-binding="insertAsset" data-src="${item.url}" data-key="${item.key}" data-id="${item.id}" data-asset-type="${item.type}">插入正文</button>
                </div>
              </div>
            `
          });
        }
        $('.media-list').html(content);
        // 绑定
        $('[data-binding]').each(function() {
          $(this).unbind().click(bindings[$(this).data('binding')]);
          $(this).removeAttr('data-binding');
        });
        // 生成分页器
        refreshPagination(data.pageCount, page)
      }
    });
  }

  updateMediaList(1);

  // 搜索按钮
  $('[name=filterBtn]').click(function() {
    updateMediaList(1);
  });
  $('[name=assetName]').keypress(function(e) {
    if(e.keyCode === 13) {
      updateMediaList(1);
    }
  });

  // 切换素材库标签
  $('.nav-tabs li').click(function() {
    $(this).addClass('active').siblings().removeClass('active');
    updateMediaList(1);
  });

  module.exports = editor;

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['wangEditor']);