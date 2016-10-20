'use strict';

(function(window, document, $, module, exports, require){
  var Query = require('component/common/query');
  var query = new Query();

  var pageCount = $('#pagination-container').data('pageCount');
  var page = $('#pagination-container').data('page');
  $('#pagination-container').twbsPagination({
    first: '首页',
    prev: '上一页',
    next: '下一页',
    last: '尾页',
    totalPages: pageCount || 1,
    visiblePages: 5,
    startPage: page || 1,
    onPageClick: function (event, page) {
      if(!query.get('page') && page==1) return;
      if(query.get('page') == page+'') return;
      query.set('page', page)
      window.location.search = query.toString();
    }
  });
})(window, document, window['jQuery'], module, exports, require);