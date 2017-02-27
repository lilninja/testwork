var gulp = require('gulp'),
    gutil = require('gulp-util'),
    svgSprite = require('gulp-svg-sprite'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleancss = require('gulp-cleancss'),
    rename = require('gulp-rename'),
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    gulpIf = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    newer = require('gulp-newer'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    fileinclude = require('gulp-file-include'),
    gulpRemoveHtml = require('gulp-remove-html'),
    notify = require("gulp-notify");

var isDev = !process.env.NODE_ENV || process.env.NODE_ENV == 'dev';

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'dist'
        },
        notify: false
    });
});

gulp.task('sass', function() {
  console.log('----------  SASS');
    return gulp.src('app/sass/**/*.sass')
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(sass().on("error", notify.onError()))
        .pipe(postcss([
          autoprefixer({browsers: ['last 15 version']}),
      ]))
        .pipe(gulpIf(!isDev, cleancss()))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('js', function (callback) {
console.log('----------  JS');
    return gulp.src('app/js/*.js')
      .pipe(gulpIf(isDev, sourcemaps.init()))
      .pipe(concat('main.min.js'))
      .pipe(gulpIf(!isDev, uglify()))
      .on('error', notify.onError(function(err){
        return {
          title: 'Javascript uglify error',
          message: err.message
        }
      }))
      .pipe(gulpIf(isDev, sourcemaps.write('.')))
      .pipe(gulp.dest('dist/js'));

});

gulp.task('libs', function() {
  console.log('----------  JS libs');
    return gulp.src('app/js/libs/*.js')
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('libscss', function() {
    console.log('----------  CSS libs');
    return gulp.src('app/css/*.css')
        .pipe(concat('libs.min.css'))
        .pipe(uglify())
        .pipe(gulp.dest('app/css'));
})

gulp.task('imagemin', function() {
  console.log('---------- images');
    return gulp.src('app/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false,
                cleanupIDs: false
            }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('svgsprite', function() {
  console.log('---------- SVG sprite');
  return gulp.src('**/*.svg', {cwd: 'app/img/icons'})
    .pipe(svgSprite({
      "sprite": "sprite.svg",
      "svg": {
          "xmlDeclaration": false,
          "doctypeDeclaration": false,
          "dimensionAttributes": false
      },
      "mode": {
          symbol: {
            dest:"",
            sprite: "sprite.svg"
          }
      }
})).on('error', function(error){ console.log(error); })
    .pipe(gulp.dest('dist/img'))
});

gulp.task('html', function() {
  console.log('---------- copy HTML');
  return gulp.src(['app/*.html'])
        .pipe(gulpRemoveHtml())
        .pipe(gulp.dest('dist'));
});

gulp.task('removedist', function() {
    return del('dist');
});


gulp.task('fonts', function () {
  console.log('---------- copy fonts');
  return gulp.src('app/fonts/*.{ttf,woff,woff2,eot,svg}',{since: gulp.lastRun('fonts')})
    .pipe(newer('dist/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('build', gulp.series(
  'removedist',
  gulp.parallel('sass', 'imagemin', 'js', 'libs', 'fonts'),
  'html'
));

gulp.task('watch', gulp.series('build', function() {
  browserSync.init({
   server: 'dist',
  });
  gulp.watch('app/sass/**/*.*', gulp.series('sass'));
  console.log('---------- watch sass');
  gulp.watch('app/*.html', gulp.series('html', reloader));
  console.log('---------- watch html');
  gulp.watch('app/js/**/*.js', gulp.series('js', reloader));
  console.log('---------- watch js');
  gulp.watch('app/fonts/*.{ttf,woff,woff2,eot,svg}', gulp.series('fonts', reloader));
  console.log('---------- watch fonts');
}));

gulp.task('clearcache', function() {
    return cache.clearAll();
});

gulp.task('default', gulp.parallel('watch'));

function reloader(done) {
  browserSync.reload();
  done();
}
