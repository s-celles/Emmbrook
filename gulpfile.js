// Sass configuration
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');


gulp.task('sass', function () {
    gulp.src('*.scss')
        .pipe(sass())
        .pipe(gulp.dest(function (f) {
            return f.base;
        }));
});

gulp.task('default', ['sass'], function () {
    gulp.watch('*.scss', ['sass']);
});


// Basic usage 
gulp.task('scripts', function () {
    // Single entry point to browserify 
    gulp.src('assets/js/*.js', { read: false })
        .pipe(browserify({
            insertGlobals: true,
            debug: !gulp.env.production,
            extensions: ['.js']
        }))
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest('assets/js/'));
});