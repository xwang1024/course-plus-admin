'use strict';

(function(window, document, $, module, exports, require){
  var select2 = require('component/common/select2');
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
      if(data.name) {
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

  var modelNames = ['school', 'speciality', 'course'];

  modelNames.forEach((modelName) => {
    if($(`[name=${modelName}Id]`).length > 0) initSelect2(modelName);
  });

  function initSelect2(modelName) {
    if(!query.get('filter') || !query.get('filter')[`${modelName}Id`]) {
      select2.init(modelName);
    } else {
      var id = query.get('filter')[`${modelName}Id`];
      $.ajax({
        url: `/api/${modelName}/${id}`,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
          if(data.error) return;
          select2.init(modelName, data.result.id, data.result.name);
        }
      });
    }
  }
  

  

})(window, document, window['jQuery'], module, exports, require);