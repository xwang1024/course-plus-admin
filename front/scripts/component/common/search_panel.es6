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

  initSelect2('school');

  function getSelect2Config(modelName) {
    return {
      theme: "bootstrap",
      language: 'zh-CN',
      ajax: {
        url: `/api/${modelName}`,
        dataType: 'json',
        delay: 300,
        data: function (params) {
          var query = {};
          if(params.term) {
            query['filter'] = {
              name: {
                $like: `%${params.term}%`
              }
            }
          }
          query['page'] = params.page;
          return query;
        },
        processResults: function (data, params) {
          params.page = params.page || 1;

          return {
            results: data.result.map((row) => {
              return {
                id: row.id,
                text: row.name
              }
            })
          };
        },
        cache: true
      }
    }
  }

  function initSelect2(modelName) {
    if(!query.get('filter') || !query.get('filter')[`${modelName}Id`]) {
      console.log(123)
      $(`[name=${modelName}Id]`).select2(getSelect2Config(modelName));
    } else {
      var id = query.get('filter')[`${modelName}Id`];
      $.ajax({
        url: `/api/${modelName}/${id}`,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
          if(data.error) return;
          $(`[name=${modelName}Id]`).html(`<option name='${data.result.id}' selected>${data.result.name}</option>`);
          $(`[name=${modelName}Id]`).select2(getSelect2Config(modelName));
        }
      });
    }
  }

})(window, document, window['jQuery'], module, exports, require);