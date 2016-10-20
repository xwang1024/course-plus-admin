'use strict';

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
      window.location.search.substring(1).split('&').map(x => {
        var sp = x.split('=');
        this.params[decodeURIComponent(sp[0])] = decodeURIComponent(sp[1]);
      });
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
    var s = [], pv;
    for(var k in this.params) {
      if((pv=this.params[k])==='' || typeof pv==='null' || typeof pv==='undefined') {
        delete this.params[k];
      }
      else {
        s.push(encodeURIComponent(k)+'='+encodeURIComponent(pv));
      }
    }
    return (s.length > 0) ? ('?' + s.join('&')) : "";
  }
}

module.exports = Query;
