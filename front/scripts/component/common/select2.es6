'use strict';

(function(window, document, $, module, exports, require){
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

  function initSelect2(modelName, initId, initText) {
    if(initId && initText) {
      $(`[name=${modelName}Id]`).html(`<option name='${initId}' selected>${initText}</option>`);
    }
    $(`[name=${modelName}Id]`).select2(getSelect2Config(modelName));
  }

  exports.init = initSelect2;

})(window, document, window['jQuery'], module, exports, require);