'use strict';

var express      = require('express');
var exphbs       = require('express-handlebars');
var session      = require('express-session');
var passport     = require('passport');
var Sequelize    = require('sequelize');
var path         = require('path');
var favicon      = require('serve-favicon');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');

var initRoutes = require('./lib/routes');
var initModels = require('./lib/models');
var initPassport = require('./lib/passport');
var config = require('./lib/config');

var app = express();
app.config = config;
var sequelize = new Sequelize(app.config.mysql.url);
app.db = sequelize;

// view engine setup
var hbs = exphbs.create({
  extname: ".hbs",
  defaultLayout: 'default',
  helpers: require('./lib/hbs_helper')(app)
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
morgan.token('username', (req) => (req.user ? req.user.username : 'unknown') );
app.use(morgan(':remote-addr :username :method :url HTTP/:http-version :status :res[content-length] - :response-time ms', {
  skip: (req, res) => (/(.*\.css$)|(.*\.js$)|(.*\.ico$)|(.*\.png$)|(.*\.woff$)|(.*\.woff2$)/.test(req.path))
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ resave: true, saveUninitialized: true, secret: config.cryptoKey }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

initModels(app, sequelize);
initPassport(app, passport);
app.use('/', initRoutes());

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  res.status(404);
  if(req.headers['content-type'] && req.headers['content-type'].indexOf('application/json')>=0) {
    var workflow = require('./lib/workflow')(req, res);
    workflow.outcome.error.message.push(err.message);
    workflow.emit('response');
    console.log(123);
  } else {
    res.render('error/404', {
      layout: 'single',
      message: err.message,
      error: {}
    });
  }
});

app.use(function(err, req, res, next) {
  console.log(err);
  console.log(err.stack);
  res.status(err.status || 500);
  if(req.headers['content-type'] && req.headers['content-type'].indexOf('application/json')>=0) {
    var workflow = require('./lib/workflow')(req, res);
    workflow.outcome.error.message.push(err.message);
    workflow.emit('response');
  } else {
    res.render('error/500', {
      layout: 'single',
      message: err.message,
      error: {}
    });
  }
});

module.exports = app;
