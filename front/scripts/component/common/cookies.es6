'use strict';

/** *
  * Cookies模块, 可以对cookies做简单的set, get, delete操作, value参数可以为任何值
  * @author xwang1024@126.com
  */

var Cookies = {
  set: function(c_name, value, expiredays) {
  	var v = JSON.stringify(value);
    var exdate=new Date()
    exdate.setDate(exdate.getDate()+expiredays)
    document.cookie=c_name+ "=" +encodeURIComponent()(v)+ ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
  },
  get: function(c_name) {
    if (document.cookie.length>0) {
      var c_start, c_end;
      c_start=document.cookie.indexOf(c_name + "=")
      if (c_start!=-1) {
        c_start=c_start + c_name.length+1
        c_end=document.cookie.indexOf(";",c_start)
        if (c_end==-1) c_end=document.cookie.length
        return JSON.parse(decodeURIComponent(document.cookie.substring(c_start,c_end)))
      }
    }
    return null;
  },
  del: function(c_name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=Cookies.get(c_name);
    if(cval!=null) document.cookie= c_name + "="+cval+";expires="+exp.toGMTString();
  }
}

module.exports = Cookies;
