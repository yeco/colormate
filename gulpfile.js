var gulp = require('gulp'),
    // this is an arbitrary object that loads all gulp plugins in package.json. 
    $ = require("gulp-load-plugins")(),
    open = require("gulp-open"),
    express = require('express'),
    path = require('path'),
    tinylr = require('tiny-lr'),
    app = express(),
    server = tinylr(),
    NwBuilder = require('node-webkit-builder'),
    runSequence = require('run-sequence'),
    size = require('gulp-size');

var config = {
    dist: "dist",
    src: "src",
    port: 1337

}

gulp.task('html', function() {
    return gulp.src("./src" + '/*.html')
        .pipe(size())
        .pipe(gulp.dest("./dist"))
});

gulp.task('compass', function() {
     gulp.src("./src/stylesheets/*.scss")
        .pipe($.plumber())
        .pipe($.compass({
            project: __dirname,
            css: "dist/stylesheets",
            sass: "src/stylesheets"
        }))
        .pipe(gulp.dest("./dist/stylesheets"))
        .pipe($.livereload(server));
});

gulp.task('js', function() {
    return gulp.src("./src" + '/scripts/*.js')
        .pipe($.plumber())
        .pipe($.browserify({
            debug: true
        }))
        // .pipe($.uglify())
        .pipe($.rename('app.js'))
        .pipe(gulp.dest("./dist" + '/scripts/'))
        .pipe($.livereload(server));
});

gulp.task('images', function() {
    return gulp.src("./src" + '/images/*')
        .pipe($.image())
        .pipe(gulp.dest("./dist" + '/images'))
});

gulp.task('templates', function() {
    return gulp.src("./src" + '/*.jade')
        .pipe($.plumber())
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest("./dist"))
        .pipe($.livereload(server));
});

gulp.task('express', function() {
    app.use(express.static(path.resolve("dist")));
    app.use(require('connect-livereload')());

    app.listen(1337);
    $.util.log('Listening on port: 1337');
});

gulp.task("serve", function() {
    var options = {
        url: "http://localhost:1337"
    };
    gulp.src("dist/index.html")
        .pipe($.open("", options));
});

gulp.task('watch', function() {
    server.listen(35729, function(err) {
        if (err) {
            return console.log(err);
        }
        gulp.watch("./src/stylesheets/*.scss", ['compass']);
        gulp.watch('./src/scripts/*.js', ['js']);
        gulp.watch('./src/*.html', ['html']);
        gulp.watch('./src/*.jade', ['templates']);

    });
});

gulp.task('pkg', function () {
    gulp.src('./src/package.json')
    .pipe(gulp.dest('./dist/'));
})

gulp.task("buildwk", function() {
 
    var nw = new NwBuilder({
        files: './dist/**/**', // use the glob format
        platforms: ['osx']
    });

    nw.build()
});
 

// Default Task
gulp.task('default', ['js', 'compass', 'images', 'html', 'express', 'watch', 'serve']);


gulp.task('build', function (callback) {
    runSequence(['js', 'compass', 'images', 'html', 'pkg'], 'buildwk', callback);
});