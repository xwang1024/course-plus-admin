'use strict';

(function(window, document, $, module, exports, require){
  function getSelect2Config(modelName) {
    return {
      placeholder: "请选择",
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
              var result = {
                id: row.id,
                text: `[${window['padLeft'](row.id, 6)}] ${row.name}`
              }
              return result;
            })
          };
        },
        cache: true
      }
    }
  }

  function initSelect2(modelName, initId, initText, container) {
    if(initId && initText) {
      console.log(initId, initText)
      $(`${(container||'')+' '}[name=${modelName}Id]`).html(`<option value="${initId}">[${window['padLeft'](initId,6)}] ${initText}</option>`);
      $(`${(container||'')+' '}[name=${modelName}Id]`).val(initId);
    }
    $(`[name=${modelName}Id]`).select2(getSelect2Config(modelName));
  }

  exports.init = initSelect2;

})(window, document, window['jQuery'], module, exports, require);