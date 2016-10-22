'use strict';

(function(window, document, $, module, exports, require){
  var Query = require('component/common/query');
  var query = new Query();
  
  $('#search-form').on('submit', function (e) {
    if (e.isDefaultPrevented()) {
    } else {
      e.preventDefault();
      var data = $(this).serializeArray().reduce(function(obj, item) {
        item.value && (obj[item.name] = item.value.replace(/%/g, ''));
        return obj;
      }, {});
      if(data.id) {
        data.id = parseInt(data.id)
      }
      if(data.name != '') {
        data.name = {
          $like: '%'+data.name+'%'
        }
      }
      query.set('filter', data);
      query.remove('page');
      var search = query.toString();
      window.location.search = search;
    }
  });

  $('#search-form').on('reset', function (e) {
    if (e.isDefaultPrevented()) {
    } else {
      e.preventDefault();
      query.remove('filter');
      query.remove('page');
      var search = query.toString();
      window.location.search = search;
    }
  });

})(window, document, window['jQuery'], module, exports, require);