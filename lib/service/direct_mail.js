'use strict';

const request = require('request');
const crypto  = require('crypto');
const uuid    = require('node-uuid');

class DirectMail {
  constructor(config) {
    this.AK_ID          = config.ali.AK_ID;
    this.AK_SECRET      = config.ali.AK_SECRET;
    this.Host           = config.ali.DirectMail.Host;
    this.AccountName    = config.ali.DirectMail.AccountName;
    this.FromAlias      = config.ali.DirectMail.FromAlias;
  }

  singleSend(targetEmail, title, content) {
    let vm = this;
    return new Promise((resolve, reject) => {
      var query = {
        Format: 'json',
        Version: '2015-11-23',
        SignatureMethod: 'HMAC-SHA1',
        SignatureNonce: uuid.v4(),
        SignatureVersion: '1.0',
        AccessKeyId: vm.AK_ID,
        Timestamp: (new Date()).toISOString(),
        Action: 'SingleSendMail',
        AccountName: vm.AccountName,
        ReplyToAddress: true,
        AddressType: 0,
        ToAddress: targetEmail,
        FromAlias: vm.FromAlias,
        Subject: title,
        HtmlBody: content
      }
      console.log('[DirectMail]', targetEmail, title);
      query.Signature = vm.genSign(query);
      request.get({
        url: vm.Host,
        qs: query
      }, (err, response, body) => {
        if(err) {
          reject(err);
        } else {
          var json;
          try {
            json = JSON.parse(body);
          } catch (e) {
            reject(e);
          }
          resolve(json);
        }
      });
    });
  }

  genSign(query) {
    let vm = this;
    let orderedQueryArr = Object.keys(query).sort().map((k) => {
      return encodeURIComponent(k) + '=' + encodeURIComponent(query[k]);
    });
    let canonicalizedQueryStr = orderedQueryArr.join('&');
    let strToSign = 'GET' + '&' + encodeURIComponent('/') + '&' + encodeURIComponent(canonicalizedQueryStr);
    let hash = crypto.createHmac('sha1', vm.AK_SECRET+'&').update(strToSign).digest('base64');
    return hash;
  }
}

module.exports = DirectMail;