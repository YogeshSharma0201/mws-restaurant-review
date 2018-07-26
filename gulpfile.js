const gulp = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify-es').default;
const cleanCSS = require('gulp-clean-css');
var inlinesource = require('gulp-inline-source');
var nodemon = require('gulp-nodemon');
var gzip = require('gulp-gzip');
var concat = require('gulp-concat');

const server = browserSync.create();

gulp.task('serve', ['sass', 'index_js', 'restaurant_js', 'sw', 'img', 'leaflet_images', 'html', 'postHtml', 'nodemon'],  function() {
  browserSync.init({
    proxy: "http://localhost:5000",
    port: 3000,
    ui: {
      port: 3001,
    }
  });

  gulp.watch("app/scss/**/*.scss", ['sass']);
  gulp.watch("app/js/**/*js", ['index_js', 'restaurant_js']);
  gulp.watch("app/*.html", ['html', 'postHtml']);
  gulp.watch(["app/sw.js", "app/manifest.json"], ['sw']);
  gulp.watch("app/img/*.jpg", ['img']);
  gulp.watch("dist/*.html").on('change', browserSync.reload);
});

gulp.task('nodemon', ['sass', 'index_js', 'restaurant_js', 'sw', 'img', 'leaflet_images', 'html', 'postHtml'], function (cb) {

  var started = false;

  return nodemon({
    script: 'server.js',
    ignore: [
      'gulpfile.js',
      'node_modules/'
    ]
  }).on('start', function () {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    if (!started) {
      cb();
      started = true;
    }
  }).on('restart', function () {
    setTimeout(function () {
      browserSync.reload({ stream: false });
    }, 1000);
  });
});

gulp.task('sass', function() {
  return gulp.src("app/scss/main.scss")
    .pipe(sass())
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gzip({ append: true }))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
});

gulp.task('index_js', function() {
  return gulp.src(["app/js/index/*.js", "app/js/utils/*.js"])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gzip({ append: true }))
    .pipe(gulp.dest("dist/js"))
    .pipe(browserSync.stream());
});

gulp.task('restaurant_js', function() {
  return gulp.src(["app/js/restaurant_info/*.js", "app/js/utils/*.js"])
    .pipe(concat('restaurant.js'))
    .pipe(uglify())
    .pipe(gzip({ append: true }))
    .pipe(gulp.dest("dist/js"))
    .pipe(browserSync.stream());
});

gulp.task('html', function () {
  return gulp.src("app/*.html")
    .pipe(gulp.dest("dist"));
});

gulp.task('postHtml', ['html'], function () {
  return gulp.src("dist/*.html")
    // .pipe(inlinesource())
    .pipe(gulp.dest("dist"));
});

gulp.task('sw', function () {
  return gulp.src(["app/sw.js", "app/manifest.json"])
    .pipe(gulp.dest("dist"));
});

gulp.task('img', function() {
  return gulp.src("app/img/*.*")
    .pipe(gulp.dest("dist/img"))
    .pipe(browserSync.stream());
});

gulp.task('leaflet_images', function() {
  return gulp.src("app/scss/leaflet_images/*.*")
    .pipe(gulp.dest("dist/css/images"))
    .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
