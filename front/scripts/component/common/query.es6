'use strict';

(function(window, document, $, module, exports, require){
  var qs = require('component/common/qs');

  /**
   * url_search管理组件，该组件对于url的操作会累积
   * @author xwang1024@126.com
   */
  class Query {
    constructor(empty) {
      this.init(empty);
    }

    init(empty) {
      this.params = {};
      if(!empty && window.location.search) {
        var decodedStr = decodeURIComponent(window.location.search).replace(/^\?/, '');
        this.params = qs.parse(decodedStr);
      }
      return this;
    }

    get(k) {
      return this.params[k];
    }

    set(k, v) {
      this.params[k] = v;
      return this;
    }

    remove(k) {
      delete this.params[k];
      return this;
    }

    empty() {
      this.params = {};
      return this;
    }

    toString() {
      return qs.stringify(this.params);
    }
  }

  module.exports = Query;

})(window, document, window['jQuery'], module, exports, require);