'use strict';

exports.port = process.env.PORT || '3000';
exports.cryptoKey = 'o9fnne4ost7';
exports.loginAttempts = {
  forIp: 50,
  forIpAndUser: 7,
  logExpiration: '20m'
};
exports.mysql = {
  url: 'mysql://root@localhost:3306/course_plus',
  reset: false
};

exports.qiniu = {
  ACCESS_KEY: "",
  SECRET_KEY: "",
  domain: "",
  bucketName: ""
}

exports.ali = {
  AK_ID: "",
  AK_SECRET: "",
  DirectMail: {
    Host: 'https://dm.aliyuncs.com',
    AccountName: '',
    FromAlias: ''
  }
}