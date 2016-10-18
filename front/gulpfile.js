var args = require('yargs').argv,
    path = require('path'),
    gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    gulpsync = $.sync(gulp),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    PluginError = $.util.PluginError;

// production mode (see build task)
var isProduction = false;
// styles sourcemaps
var useSourceMaps = false;

// ignore everything that begins with underscore
var hidden_files = '**/_*.*';
var ignored_files = '!' + hidden_files;

// MAIN PATHS
var paths = {
    app: '../public/',
    styles: 'less/',
    scripts: 'js/'
}

// VENDOR CONFIG
var vendor = {
    app: {
        source: require('./vendor.json'),
        dest: '../public/vendor'
    }
};

// SOURCES CONFIG
var source = {
    scripts: {
        app: [paths.scripts + 'app.init.js',
            paths.scripts + 'modules/*.js',
            paths.scripts + 'custom/**/*.js'
        ],
        single: paths.scripts + 'single/*.js'
    },
    styles: {
        app: [paths.styles + '*.*'],
        themes: [paths.styles + 'themes/*', ignored_files],
        watch: [paths.styles + '**/*', '!' + paths.styles + 'themes/*']
    },
    hbs: ['../views/*.*', '../views/**/*']
};

// BUILD TARGET CONFIG
var build = {
    scripts: {
        app: {
            main: 'app.js',
            dir: paths.app + 'js'
        },
        single: paths.app + 'js/single'
    },
    styles: {
        app: paths.app + 'css'
    }
};

// PLUGINS OPTIONS

var prettifyOpts = {
    indent_char: ' ',
    indent_size: 3,
    unformatted: ['a', 'sub', 'sup', 'b', 'i', 'u', 'pre', 'code']
};

var vendorUglifyOpts = {
    mangle: {
        except: ['$super'] // rickshaw requires this
    }
};

var cssnanoOpts = {
    safe: true,
    discardUnused: false, // no remove @font-face
    reduceIdents: false // no change on @keyframes names
}

//---------------
// TASKS
//---------------


// JS APP
gulp.task('scripts:app', function() {
    log('Building scripts..');
    // Minify and copy all JavaScript (except vendor scripts)
    return gulp.src(source.scripts.app)
        .pipe($.jsvalidate())
        .on('error', handleError)
        .pipe($.if(useSourceMaps, $.sourcemaps.init()))
        .pipe($.concat(build.scripts.app.main))
        .on("error", handleError)
        .pipe($.if(isProduction, $.uglify({
            preserveComments: 'some'
        })))
        .on("error", handleError)
        .pipe($.if(useSourceMaps, $.sourcemaps.write()))
        .pipe(gulp.dest(build.scripts.app.dir))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('hbs:change', function() {
    log('hbs change..');
    // Minify and copy all JavaScript (except vendor scripts)
    return gulp.src(source.hbs)
      .pipe(reload({
          stream: true
      }));
});

// VENDOR BUILD
// copy file from bower folder into the app vendor folder
gulp.task('vendor', function() {
    log('Copying vendor assets..');

    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src(vendor.app.source, {
            base: 'bower_components'
        })
        .pipe($.expectFile(vendor.app.source))
        .pipe(jsFilter)
        .pipe($.if(isProduction, $.uglify(vendorUglifyOpts)))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.if(isProduction, $.cssnano(cssnanoOpts)))
        .pipe(cssFilter.restore())
        .pipe(gulp.dest(vendor.app.dest));

});

// SCRIPTS DEMO
// copy file from single folder into the app folder
gulp.task('scripts:single', function() {

    return gulp.src(source.scripts.single)
        .pipe(gulp.dest(build.scripts.single))
        .pipe(reload({
            stream: true
        }));

});

// APP LESS
gulp.task('styles:app', function() {
    log('Building application styles..');
    return gulp.src(source.styles.app)
        .pipe($.if(useSourceMaps, $.sourcemaps.init()))
        .pipe($.less())
        .on("error", handleError)
        .pipe($.if(isProduction, $.cssnano(cssnanoOpts)))
        .pipe($.if(useSourceMaps, $.sourcemaps.write()))
        .pipe(gulp.dest(build.styles.app))
        .pipe(reload({
            stream: true
        }));
});

// LESS THEMES
gulp.task('styles:themes', function() {
    log('Building application theme styles..');
    return gulp.src(source.styles.themes)
        .pipe($.less())
        .on("error", handleError)
        .pipe(gulp.dest(build.styles.app))
        .pipe(reload({
            stream: true
        }));
});

//---------------
// WATCH
//---------------

// Rerun the task when a file changes
gulp.task('watch', function() {
    log('Watching source files..');

    gulp.watch(source.scripts.app, ['scripts:app']);
    gulp.watch(source.scripts.single, ['scripts:single']);
    gulp.watch(source.styles.watch, ['styles:app']);
    gulp.watch(source.styles.themes, ['styles:themes']);
    gulp.watch(source.hbs.source, ['hbs:change']);

});

// Serve files with auto reaload
gulp.task('browsersync', function() {
    log('Starting BrowserSync..');

    browserSync({
        notify: false,
        server: {
            baseDir: '..'
        }
    });

});

//---------------
// MAIN TASKS
//---------------

// build for production (no minify)
gulp.task('dev-build', gulpsync.sync([
    'vendor',
    'assets'
]));

// build for production (minify)
gulp.task('build', gulpsync.sync([
    'prod',
    'vendor',
    'assets'
]));

gulp.task('prod', function() {
    log('Starting production build...');
    isProduction = true;
});

// Server for development
gulp.task('serve', gulpsync.sync([
    'default',
    'browsersync'
]), done);

// Server for production
gulp.task('serve-prod', gulpsync.sync([
    'build',
    'browsersync'
]), done);

// build with sourcemaps (no minify)
gulp.task('sourcemaps', ['usesources', 'default']);
gulp.task('usesources', function() {
    useSourceMaps = true;
});

// default (no minify)
gulp.task('default', gulpsync.sync([
    'vendor',
    'assets',
    'watch'
]), done);

gulp.task('assets', [
    'scripts:app',
    'scripts:single',
    'styles:app',
    'styles:themes'
]);


/////////////////////

function done(){
  log('************');
  log('* All Done * You can start editing your code, BrowserSync will update your browser after any change..');
  log('************');
}

// Error handler
function handleError(err) {
    log(err.toString());
    this.emit('end');
}

// log to console using
function log(msg) {
    $.util.log($.util.colors.blue(msg));
}
