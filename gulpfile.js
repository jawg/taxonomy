const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const gulp = require('gulp');
const riot = require('gulp-riot');
const uglify = require('uglify-es');
const minifier = require('gulp-uglify/composer')(uglify);
const merge = require('stream-series');
const bundleSrc = [
  'node_modules/webfontloader/webfontloader.js',
  'node_modules/color-operations-ui/src/scripts/color-converter.js',
  'src/scripts/taxonomy.js'
];
const bundleRiotSrc = [
  'node_modules/riot/riot.min.js',
  'node_modules/webfontloader/webfontloader.js',
  'node_modules/color-operations-ui/src/scripts/color-converter.js',
  'src/scripts/taxonomy.js'
];

const bundle = (sources, destination) => {
  return merge(gulp.src(sources), gulp.src('src/tags/*.riot').pipe(riot()))
    .pipe(minifier())
    .pipe(concat(destination))
    .pipe(gulp.dest('dist/'));
}

gulp.task('clean', () => {
  return del(['dist']);
});

gulp.task('bundle', () => {
  return bundle(bundleSrc, 'taxonomy-bundle.js');
});

gulp.task('bundle+riot', () => {
  return bundle(bundleRiotSrc, 'taxonomy-bundle+riot.js');
});

gulp.task('styles', () => {
  return gulp.src(['src/*.css'])
    .pipe(concat('style.css'))
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('sources', gulp.parallel(['bundle', 'bundle+riot', 'styles'], (done) => {
  done();
}));

gulp.task('build', gulp.series(['clean', 'sources'], (done) => {
  done()
}));