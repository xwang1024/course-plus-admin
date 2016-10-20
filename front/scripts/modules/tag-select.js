(function(window, document, $, undefined){
  var newTags = [];
  window.initTagSelect = function(container) {
    (container) || (container = '');
    $(container + ' .tag-select').selectize({
      valueField: 'tag',
      labelField: 'tag',
      searchField: 'tag',
      delimiter: ';',
      plugins: ['remove_button'],
      create: false,
      load: function(query, callback) {
        if (!query.length) return callback();
        $.ajax({
          url: '/admin/api/media/tagHints',
          type: 'GET',
          dataType: 'json',
          data: {
            key: query
          },
          success: function(mediaTags) {
            $.ajax({
              url: '/admin/api/media/articles/tags',
              type: 'GET',
              dataType: 'json',
              data: {
                key: query
              },
              success: function(articleTags) {
                $.ajax({
                  url: '/admin/api/questions/tags',
                  type: 'GET',
                  dataType: 'json',
                  data: {
                    key: query
                  },
                  success: function(questionTags) {
                    var results = [];
                    var map = {};
                    var data = newTags.concat(mediaTags).concat(articleTags).concat(questionTags);
                    for(var i in data) {
                      if(map[data[i]]) continue;
                      map[data[i]] = true;
                      results.push({tag:data[i]})
                    }
                    callback(results);
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  window.bindCreateTag = function bindCreateTag() {
    $('.create-tag-btn').unbind().click(function() {
      var newTag = prompt('创建标签', '请输入标签名称');
      if(typeof newTag === 'undefined') return;
      if(newTags.indexOf(newTag) < 0) {
        newTags.push(newTag);
      }
    });
  }
})(window, document, window.jQuery);