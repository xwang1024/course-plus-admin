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
  ACCESS_KEY: "yWrPcgLpkuqKQeL0FH1sYr8jJTTqF6aS5unIlXGN",
  SECRET_KEY: "_cleIwO0d1OARv1pVLMvkIpd-Eq9ELy5o5UvN225",
  domain: "ofcmexmic.bkt.clouddn.com",
  bucketName: "course-plus"
}