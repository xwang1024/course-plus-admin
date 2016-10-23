'use strict';
var resource = require('./resources.json');

var gulp        = require('gulp'),
    $           = require('gulp-load-plugins')(),
    runSequence = require('run-sequence'),
    del         = require('del');

var isProduction = false;
var assetTasks = [];

gulp.task('views', (callback) => {
  log('Copying views...');
  gulp.src('views/**/*.hbs')
    .pipe(gulp.dest('../views/'))
    .on('end', () => {
      setTimeout(function() {
        $.livereload.reload();
      }, 1500);
      callback();
    });
});

// compile script
if(resource.script) {
  for(var k in resource.script) {
    (function(destFile, sources) {
      gulp.task(`script:${destFile}`, (callback) => {
        var jsFilter = $.filter('**/*.js', {restore: true});
        var es6Filter = $.filter('**/*.es6', {restore: true});
        log(`Compiling script ${destFile}...`);
        gulp.src(sources)
          .pipe(es6Filter)
          .pipe($.eslint({
            rules: { 'strict': 2 },
            globals: [ 'jQuery', '$' ],
            envs: ["browser", "node", "es6"],
            ecmaVersion: 6,
            ecmaFeatures: { "modules": true, "jsx": true }
          }))
          .pipe($.eslint.format())
          .pipe($.eslint.failAfterError())
          .on('error', handleError)
          .pipe($.babel({ presets: ['es2015'] }))
          .on('error', handleError)
          .pipe($.wrapper({
            header: function(file) {
              var moduleName = file.path.replace(__dirname, '').replace('\\scripts\\', '').replace('/scripts/', '').replace(/(\.js)|(\.es6)$/, '').replace(/\\/g,'/');
              return 'this.require.define({"'+moduleName+'":function(exports, require, module){\n';
            },
            footer: '\n}});'
          }))
          .pipe(es6Filter.restore)
          .pipe(jsFilter)
          .pipe($.jsvalidate())
          .on('error', handleError)
          .pipe(jsFilter.restore)
          .pipe($.if( isProduction, $.uglify() ))
          .pipe($.concat(destFile))
          .pipe($.if(isProduction, $.md5Plus(10, '../views/partials/scripts.hbs')))
          .pipe(gulp.dest('../public/js/'))
          .pipe($.livereload())
          .on('end', callback);
      });
      assetTasks.push(`script:${k}`);
    })(k, resource.script[k]);
  }
} else {
  log('There is no script attribute in resource.json');
}

var cssnanoOpts = {
  safe: true,
  discardUnused: false, // not remove @font-face
  reduceIdents: false // not change on @keyframes names
}
// compile style
if(resource.style) {
  for(var k in resource.style) {
    ((k) => {
      gulp.task(`style:${k}`, (callback) => {
        log(`Compiling style ${k}...`);
        gulp.src(resource.style[k])
          .pipe($.less())
          .on("error", handleError)
          .pipe($.if(isProduction, $.cssnano(cssnanoOpts)))
          .pipe($.if(isProduction, $.md5Plus(10, '../views/partials/head.hbs')))
          .pipe(gulp.dest('../public/css/'))
          .pipe($.livereload())
          .on('end', callback);
      });
      assetTasks.push(`style:${k}`);
    })(k);
  }
} else {
  log('There is no style attribute in resource.json');
}

// copy vendor
gulp.task('vendors', (callback) => {
  log('Copying vendors...');
  gulp.src(resource.vendor, {base: 'bower_components'})
    .pipe($.expectFile(resource.vendor))
    .pipe(gulp.dest('../public/vendor'))
    .on('end', callback);
});

gulp.task('clean', (callback) => {
  var delPaths = [ '../views/' ,'../public/css/', '../public/js/', '../public/vendor/' ];
  log(`Cleaning: ${delPaths.join(', ')}`);
  del(delPaths, {force: true});
  log(`Done!`);
  callback();
});

gulp.task('build-dev', (callback) => {
  runSequence('views', 'vendors', assetTasks, function() {
    finishLog('Dev build done!');
    callback();
  });
});

gulp.task('build-release', (callback) => {
  isProduction = true;
  runSequence('views', 'vendors', assetTasks, function() {
    finishLog('Release build done!');
    callback();
  });
});

gulp.task('watch', function() {
  $.livereload.listen();

  gulp.watch(['views/**/*.hbs'], ['views']);
  if(resource.script) {
    for(var k in resource.script) {
      gulp.watch(resource.script[k], [`script:${k}`]);
    }
  }
  if(resource.style) {
    var styleTasks = [];
    for(var k in resource.style) {
      styleTasks.push(`style:${k}`);
    }
    gulp.watch('less/**/*.less', styleTasks);
  }
});

gulp.task('default', (callback) => {
  runSequence('views', 'vendors', assetTasks, 'watch', function() {
    finishLog('Dev build done. Starting watch and LiveReload...');
  });
});

// Error handler
function handleError(err) {
  log(err.toString());
  this.emit('end');
}

// log to console using 
function log(msg) {
  $.util.log( $.util.colors.blue( msg ) );  
}

function pLog(msg) {
  return $.print(()=>( $.util.colors.blue( msg )) );
}

function finishLog(msg) {
  log(`******************`);
  log(`* IT'S HIGH NOON * ${msg}`);
  log(`******************`);
}