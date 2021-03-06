'use strict';

exports = module.exports = function(app, passport) {
  var LocalStrategy = require('passport-local').Strategy;
  var adminCache = {};

  passport.use(new LocalStrategy(
    function(username, password, done) {
      var conditions = {
        where: {
          username: username,
          enable: true
        }
      };
      app.model.Admin.findOne(conditions).then((admin) => {
        if (!admin) return done(null, false, { message: '该用户不存在' });
        app.model.Admin.validatePassword(password, admin.password, function(err, isValid) {
          if (err) return done(err);
          if (!isValid) return done(null, false, { message: '密码错误' });
          adminCache[admin.id] = admin;
          return done(null, admin);
        });
      });
    }
  ));

  passport.serializeUser(function(admin, done) {
    done(null, admin.id);
  });

  passport.deserializeUser(function(id, done) {
    done(null, adminCache[id]);
  });
};