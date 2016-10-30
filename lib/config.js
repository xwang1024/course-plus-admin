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
  ACCESS_KEY: "hdZdapjcdEK2vbVKTo--ETEciepTc9Eqs12BKS7T",
  SECRET_KEY: "QpWXhhBKo9tayM45xb-2oLaMyOqB4k8cyA4dfOCX",
  domain: "ofjhruj62.bkt.clouddn.com",
  bucketName: "course-plus"
}

exports.ali = {
  AK_ID: "LTAIMff5UBBkmAtN",
  AK_SECRET: "HGQJZtoYCqIBUoeCu1A2Gkt0Moya2o",
  DirectMail: {
    Host: 'https://dm.aliyuncs.com',
    AccountName: 'i@xwang1024.me',
    FromAlias: 'Course+'
  }
}