'use strict';

/** *
  * LocalStorage模块, set, get, delete操作, 优先使用本地存储, 否则使用cookies, value参数可以为任何值
  * @author xwang1024@126.com
  */

var Cookies = require("components/common/cookies");

var LocalStorage = {
  _available: typeof window.localStorage != 'undefined' && typeof window.localStorage != null,
  set: function(c_name, value) {
    if(LocalStorage._available) {
      window.localStorage[c_name] = JSON.stringify(value);
    } else {
      var cookie = {};
      cookie[c_name] = value;
      var old = Cookies.get('_LocalStorage');
      if(old) {
        $.extend(old, cookie);
        Cookies.set('_LocalStorage', old, 1);
      } else {
        Cookies.set('_LocalStorage', cookie, 1);
      }
    }
  },
  get: function(c_name) {
    if(LocalStorage._available) {
      var result = window.localStorage[c_name];
      if(result) {
        return JSON.parse(result);
      } else {
        return result;
      }
      
    } else {
      var old = Cookies.get('_LocalStorage');
      if(old) {
        return old[c_name];
      } else {
        return undefined;
      }
    }
  },
  del: function(c_name) {
    if(LocalStorage._available) {
      delete window.localStorage[c_name];
    } else {
      var old = Cookies.get('_LocalStorage');
      if(old) {
        delete old[c_name];
        Cookies.set('_LocalStorage', old);
      }
    }
  }
}

module.exports = LocalStorage;