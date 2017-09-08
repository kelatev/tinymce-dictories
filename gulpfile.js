var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    connect = require('gulp-connect');

var paths = './src/*.js';
var paths_lang = './src/langs/*.js';

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('connect', function() {
    connect.server({
        root: ['examples', 'src'],
        port: 9000,
        livereload: true
    });
    console.log('Server listening on http://localhost:9000');
});

gulp.task('scripts', function() {
    gulp.src(paths)
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(uglify())
        .pipe(concat('plugin.min.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(connect.reload());
});
gulp.task('langs', function() {
    gulp.src(paths_lang)
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(uglify())
        .pipe(gulp.dest('./dist/langs/'))
        .pipe(connect.reload());
});

gulp.task('watch', function() {
    gulp.watch(paths, ['scripts', 'langs']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['connect', 'watch', 'scripts', 'langs']);