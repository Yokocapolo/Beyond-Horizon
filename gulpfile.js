//initalise modules
const { src, dest, watch, series, parallel } = require('gulp');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');

//file path variables
const files = {
  sassPath: 'sass/*.scss',
  jsPath: ['js/*.js', '!build/js/jquery-3.4.1.min.js'],
  htmlPath: '*.html',
  concatPath: ['build/css/*.css', '!build/css/maps/*', '!build/css/*.min.css'],
  imgPath: 'images/*'
}


//sass task

function sassTask(){
  return src(files.sassPath)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: "expanded"}).on('error', sass.logError))
    .pipe(postcss([ autoprefixer(), cssnano() ]))
    .pipe(sourcemaps.write('maps/'))
    .pipe(dest('build/css'))
    .pipe(browserSync.stream());
}



// DEBUGGING SASS RUN THIS

// function sassTask(){
//   return src(files.sassPath)
//     .pipe(sourcemaps.init())
//     .pipe(sass({outputStyle: "collapsed"}).on('error', sass.logError))
//     .pipe(postcss([ autoprefixer()]))
//     .pipe(sourcemaps.write('maps/'))
//     .pipe(dest('build/css'))
//     .pipe(browserSync.stream());
// }

//concat css

function concatTask(){
  return src(files.concatPath)
    .pipe(sourcemaps.init())
    .pipe(concat('style.min.css'))
    .pipe(sourcemaps.write('maps/'))
    .pipe(dest('build/css'))
    .pipe(browserSync.stream());
}


//js tak

function jsTask(){
  return src(files.jsPath)
    .pipe(babel({
            presets: ['@babel/env']
        }))
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(dest('build/js'))
    .pipe(browserSync.stream());
}

//image task

function imageTask(){
  return src(files.imgPath)
    .pipe(imagemin())
    .pipe(dest('build/images'))
    .pipe(browserSync.stream());
}

//cachbusting task

const cbString = new Date().getTime();

function cacheBustTask(){
  return src(['*.html'])
    .pipe(replace(/cb=\d+/g,  'cb=' + cbString))
    .pipe(dest('.'));
}

//watch task

function watchTask(){
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  watch(files.sassPath, sassTask);
  watch(files.concatPath).on('change', concatTask);
  watch(files.jsPath, jsTask).on('change', browserSync.reload);
  watch(files.htmlPath).on('change', browserSync.reload);
  watch(files.imgPath, imageTask).on('change', browserSync.reload);
}

//default taks

exports.default = series(
  parallel(sassTask, jsTask, imageTask, concatTask),

  //DEBUGGING SASS RUN THIS
  // parallel(sassTask, jsTask, imageTask),
  cacheBustTask,
  watchTask
);

exports.sass = sassTask;
exports.jsTask = jsTask;
// exports.concatTask = concatTask;
exports.imageTask = imageTask;
