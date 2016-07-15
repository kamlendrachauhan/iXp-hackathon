'use strict';

//loading all the dev plugins into gulp
var gulp = require('gulp'),
jshint = require('gulp-jshint'),
stylish = require('jshint-stylish'),
cleancss = require('gulp-clean-css'),
uglify = require('gulp-uglify'),
usemin = require('gulp-usemin'),
htmlmin = require('gulp-htmlmin'),
imagemin = require('gulp-imagemin'),
rename = require('gulp-rename'),
notify = require('gulp-notify'),
cache = require('gulp-cache'),
rev = require('gulp-rev'),
changed = require('gulp-changed'),
browserSync = require('browser-sync').create(),
del = require('del'),
reload = browserSync.reload,
gulpngannonate = require('gulp-ng-annotate'),
merge = require('merge-stream');

var runsequence = require('run-sequence').use(gulp);

//Gulp JS Hint task - JS Hint must run synchronously before clean, so if there is any error it has to stop right there
gulp.task('jshint', function(){
  return gulp.src('./js/**/*.js')
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter(stylish));
});

//Gulp Imagemin task
gulp.task('imagemin', function(){
  return gulp.src('./images/**/*')
  .pipe(imagemin({
    optimizationLevel: 3,
    progressive: true,
    interlaced: true
  }))
  .pipe(gulp.dest('./../server/public/images/'))
  .pipe(notify({
    message: 'All Images Optimized',
    onLast: true
  }));
});

//Gulp clean up - mustn't happen asynchronously, so I'm not returning a stream
gulp.task('clean', ['jshint'], function(){
  return del(['./../server/public'], {force: true});
});

//Gulp usemin task - second method as described in the docs
gulp.task('usemin', function(){
  return gulp.src(['./index.html', './views/**/*.html'])
  .pipe(usemin({
    css: [function() {return cleancss({
      keepSpecialComments: 0
    });},rev, 'concat'],
    // with uglify
    // js: [gulpngannonate, function() {
    //   return uglify({
    //     mangle: true
    //   });}, rev, 'concat'],
    //no uglify - for debugging purposes
    js: [gulpngannonate, rev, 'concat'],
      html: [ function() {return htmlmin({
        collapseWhitespace: true
      });}]
    }))
    .pipe(gulp.dest('./../server/public/'));
  });

  //Gulp copy fonts task - add new font-dependencies here
  gulp.task('copyfonts', function(){
    //bootstrap fonts
    var bootstrap_stream = gulp.src('./bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eot,svg}*').pipe(gulp.dest('./../server/public/fonts'));
    // var fontawesome_stream = gulp.src('./bower_components/font-awesome/fonts/**/*.{ttf,woff,eot,svg}*').pipe(gulp.dest('./dist/fonts'));
    var custom_stream = gulp.src('./fonts/**/*.{ttf,woff,eot,svg}*').pipe(gulp.dest('./../server/public/fonts'));
    // return merge(bootstrap_stream, fontawesome_stream);
    return bootstrap_stream;
  });

  //browser-sync
  gulp.task('browser-sync', ['default'], function(cb){
    browserSync.init({
      server: {
        baseDir: "./../server/public"
        , index: "index.html"
      }
    });
    cb();
  });

  //Gulp watch task - needs browser-sync pre-req because watch enforces reload
  gulp.task('watch', ['browser-sync'], function(){
    //watching javascript, css and html files and run usemin on change and reload browser to load new changes
    gulp.watch('{./js/**/*.js,./css/**/*.css,./index.html,./views/**/*.html,./bower_components/bootstrap/dist/**/*.{css,map,eot,svg,ttf,woff,woff2,js}}', ['update-distribution-usemin', reload]);
    //watching image files and run imagemin on change and reload browser to load new changes
    gulp.watch('./images/**/*', ['imagemin', reload]);
  });

  //build-distribution task
  gulp.task('build-distribution', ['usemin', 'imagemin', 'copyfonts']);

  //the default task
  gulp.task('default', function(cb){
    runsequence('clean','build-distribution',cb);
  });

  //update-distribution-usemin
  gulp.task('update-distribution-usemin', ['jshint'], function(cb){
    runsequence('usemin', cb);
  });
