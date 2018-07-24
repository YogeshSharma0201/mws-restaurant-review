var gulp = require('gulp');
var browserSync = require('browser-sync');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');

const server = browserSync.create();

gulp.task('serve', ['sass', 'js', 'sw', 'img', 'html'], function() {
  browserSync.init({
    server: {
      baseDir: "dist"
    },
    port: 3000,
    ui: {
      port: 3001,
    }
  });

  gulp.watch("app/scss/*.scss", ['sass']);
  gulp.watch("app/js/*js", ['js']);
  gulp.watch("app/*.html", ['html']);
  gulp.watch("app/sw.js", ['sw']);
  gulp.watch("app/img/*.jpg", ['img']);
  gulp.watch("dist/*.html").on('change', browserSync.reload);
});

gulp.task('sass', function() {
  return gulp.src("app/scss/*.scss")
    .pipe(sass())
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
});

gulp.task('js', function() {
  return gulp.src("app/js/*.js")
    .pipe(gulp.dest("dist/js"))
    .pipe(browserSync.stream());
});

gulp.task('html', function () {
  return gulp.src("app/*.html")
    .pipe(gulp.dest("dist"));
});

gulp.task('sw', function () {
  return gulp.src("app/sw.js")
    .pipe(gulp.dest("dist"));
});

gulp.task('img', function() {
  return gulp.src("app/img/*.*")
    .pipe(gulp.dest("dist/img"))
    .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
