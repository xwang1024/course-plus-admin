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