
const _     = require('lodash');
const qiniu = require('qiniu');

module.exports = exports = function(app) {
  return {
    inject: function (name) {
      var blocks  = this._blocks;
      var content = blocks && blocks[name];
      return content ? content.join('\n') : null;
    },
    block: function (name, options) {
      var blocks = this._blocks || (this._blocks = {});
      var block  = blocks[name] || (blocks[name] = []);
      block.push(options.fn(this));
    },
    json: function() {
      return JSON.stringify({
        _TITLE_:  this._TITLE_,
        _USER_:   this._USER_,
        _DATA_:   this._DATA_,
        _PARAMS_: this._PARAMS_,
        _QUERY_:  this._QUERY_,
        _PATH_:   this._PATH_
      }).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    stringify: function(object) {
      return encodeURIComponent(JSON.stringify(object));
    },
    equals: function(a, b, options) {
      if ((a != null ? a.toString() : void 0) === (b != null ? b.toString() : void 0)) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    lt: function(a, b, options) {
      if (a < b) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    lte: function(a, b, options) {
      if (a <= b) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    gt: function(a, b, options) {
      if (a > b) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    gte: function(a, b, options) {
      if (a >= b) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    startsWith: function(a, b, options) {
      if ((a != null ? a.toString() : 'undefined').indexOf(b != null ? b.toString() : 'undefined') === 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    plus: function(a1, a2) {
      return a1+a2;
    },
    join: function(arr, s) {
      if(!arr || !arr.length || !arr.join) return "-";
      var newArr = arr.map((x)=>((x+'').replace(/</g, "&lt;").replace(/>/g, "&gt;")));
      return newArr.join(s);
    },
    percent: function(a1, a2) {
      return Math.ceil(a1 / a2 * 100)
    },
    date: function(date, format) {
      if(!date) return `-`;
      if(typeof date === 'number' && (date+'').length === 10) {
        date = date * 1000;
      }
      var date = new Date(date);
      if(isNaN(date.getTime())) return `<span class="text-muted">时间错误</span>`;
      var dateFormat = function(date, fmt) {
        var hours = date.getHours();
        var o = {
          "M+" : date.getMonth()+1,                                         //月份
          "d+" : date.getDate(),                                            //日
          "h+" : hours>12?hours%12:hours,                                   //小时(12)
          "H+" : hours,                                                     //小时(24)
          "m+" : date.getMinutes(),                                         //分
          "s+" : date.getSeconds(),                                         //秒
          "q+" : Math.floor((date.getMonth()+3)/3),                         //季度
          "S"  : date.getMilliseconds()                                     //毫秒
        };
        if(/(y+)/.test(fmt))
          fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
          if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
      }
      return dateFormat(date, format);
    },
    noEnter: function(s) {
      return s.replace(/[\r\n]/g, "");
    },
    padLeft: function(str, num) {
      str = str+'';
      var pad = '00000000000000000';
      return pad.substring(0, num - str.length) + str;
    },
    qiniuFile: function(key) {
      if(!key) return "";
      var config = app.config;
      qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
      qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

      var url = `http://${config.qiniu.domain}/${key}`;
      var policy = new qiniu.rs.GetPolicy();
      var downloadUrl = policy.makeRequest(url);
      return downloadUrl;
    },
    translate: function(enumString) {
      var map = {
        AUDIO: '音频',
        IMAGE: '图片',
        HTML:  'Html',
        MARKDOWN: 'Markdown',
        NOT_SENT:  '未回答',
        SUCCESS: '回答成功',
        FAILED: '送信失败',
        SU: '管理员',
        OP: '运营人员'
      }
      if(!enumString) return "";
      if(!map[enumString]) return enumString;
      return map[enumString];
    },
    likeQuery: function(obj) {
      if(!obj || !obj['$like']) return obj;
      return obj['$like'].replace(/%/g, '');
    },
    price: function(price, type, noComma) {
      var formatedPrice, roundedPrice;
      if (!price) {
        return price;
      }
      if (type === 1) {
        formatedPrice = price / 100;
        roundedPrice = parseInt(price / 100);
      } else {
        formatedPrice = (price / 100).toFixed(2);
        roundedPrice = parseInt(price / 100).toFixed(2);
      }
      var result = formatedPrice == roundedPrice? roundedPrice : formatedPrice;
      if(noComma) {
        return result;
      }
      var parts = result.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
  }
}
