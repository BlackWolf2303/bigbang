/*
  Dutchwebworks Gulp boilerplate, dec. 2016
*/


/**********************************************************************
1. Load all Gulp dependency NPM packages listed in `package.json`
**********************************************************************/

var gulp = require('gulp'),
  pug = require('gulp-pug'),
  copy = require('gulp-contrib-copy'),
  dest = require('gulp-dest'),
  tap = require('gulp-tap'),
  clean = require('gulp-contrib-clean'),
  minify = require('gulp-minify'),
  uglify = require('gulp-uglify'),
  precss = require('precss'),
  concat = require('gulp-concat'),
  cssnano = require('cssnano'),
  bundles = require('./bundle.config.json'),
  cssnext = require('postcss-cssnext'),
  postcss = require('gulp-postcss'),
  sass = require('gulp-sass'),
  atImport = require('postcss-easy-import'),
  browserSync = require('browser-sync').create(),
  browserify = require('browserify'),
  babelify = require('babelify'),
  // source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),

  reload = browserSync.reload,
  src = './src',
  dist = './public',
  config = {
    htmlDest: dist,
    postcssPath: src + '/assets/postcss',
    scssPath: src + '/assets/scss',
    cssDest: dist + '/assets/css',
    jsPathSrc: src + '/assets/js',
    jsPathDest: dist + '/assets/js',
    imgPathSrc: src + '/assets/images',
    imgPathDest: dist + '/assets/images',
    fontPathSrc: src + '/assets/fonts',
    fontPathDest: dist + '/assets/fonts',
  };

/**********************************************************************
3. Configure Gulp tasks
**********************************************************************/

/* POSTCSS compile with sourcemap
-------------------------------------------------------------------- */

gulp.task('postcss', function () {
  const plugins = [ atImport(), cssnext(), precss()];
  if (process.env.ENVIRONMENT === 'production') {
    plugins.push(cssnano());
  }
  return gulp.src([
    `${config.postcssPath}/*.postcss`,
    `!${config.postcssPath}/_*.postcss`,
    `${config.scssPath}/*.scss`,
    `${config.scssPath}/**/*.scss`,
  ]).pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(dest(config.cssDest, {ext: '.css'}))
    .pipe(gulp.dest('./'));
});


/* Compile Pug templates
-------------------------------------------------------------------- */

gulp.task('pug', function buildHTML() {
  return gulp.src([ `${src}/**/*.pug`, `!${src}/**/_*/*.pug` ])
    .pipe(pug({ pretty: process.env.ENVIRONMENT === 'production' }))
    .pipe(gulp.dest(config.htmlDest));
});

/* Copy simple html files to dist
-------------------------------------------------------------------- */
gulp.task('html', function buildHTML() {
  return gulp.src([ `${src}/**/*.html` ])
    .pipe(gulp.dest(config.htmlDest));
});

/* Bundle Assets
-------------------------------------------------------------------- */

gulp.task('vendors', function() {
  return gulp.src(bundles.scripts)
    .pipe(concat('vendor.js'))
    .pipe(minify())
    .pipe(gulp.dest(config.jsPathDest));
});

gulp.task('scripts', function() {

  const stream = gulp.src([
      'node_modules/babel-polyfill/dist/polyfill.min.js',
      config.jsPathSrc + '/main.js'
    ], {read: false})
    .pipe(tap(function (file) {
      file.contents = browserify(file.path, {debug: false})
        .transform(babelify, { presets: ['@babel/preset-env'] })
        .bundle();
    }))
    .pipe(buffer());
    if (process.env.ENVIRONMENT === 'production') {
      return stream.pipe(uglify()).pipe(gulp.dest(config.jsPathDest));
    }
    return stream.pipe(gulp.dest(config.jsPathDest));
});
/* Run a proxy server
-------------------------------------------------------------------- */

gulp.task('browser-sync', function() {
  browserSync.init({ server: { baseDir: dist } });
});

/* Cleanup the Sass generated --sourcemap *.map.css files
-------------------------------------------------------------------- */

gulp.task('clean', function(){
  gulp.src([`${dist}/assets`, `${dist}/*.html`], {read: false}).pipe(clean());
});

/* Copy
-------------------------------------------------------------------- */
gulp.task('copy', function(){
  gulp.src([
    config.imgPathSrc + '/**/*.{gif,jpg,png,svg}'
  ])
    .pipe(copy())
    .pipe(gulp.dest(config.imgPathDest));

  gulp.src([
    config.fontPathSrc + '/**/*.*',
  ])
    .pipe(copy())
    .pipe(gulp.dest(config.fontPathDest));
});

/**********************************************************************
4. Registered Gulp tasks
**********************************************************************/

gulp.task('build', ['clean'], function(){
  gulp.start('pug');
  gulp.start('html');
  gulp.start('vendors');
  gulp.start('scripts');
  gulp.start('postcss');
  gulp.start('copy');
});

gulp.task('serve', ['build', 'browser-sync'], function(){
  gulp.watch(src + '/**/*.pug', ['pug']);
  gulp.watch(src + '/**/*.html', ['html']);
  gulp.watch(config.jsPathSrc + '/*.js', ['scripts']);
  gulp.watch(config.scssPath + '/**/*.scss', ['postcss']).on('change', reload);
  gulp.watch([dist + '/*.html', config.jsPathDest + '/*.js', config.cssDest + '/*.css']).on('change', reload);
});

gulp.task('default', ['build']);
