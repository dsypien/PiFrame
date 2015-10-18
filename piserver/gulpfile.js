var gulp = require('gulp');

gulp.task('default', 
	['build']
);

gulp.task('build', 
	['clean', 'lint', 'compile']
);

gulp.task('build-dist', 
	['clean', 'lint', 'compile-dist']
);

gulp.task('clean', function(){
	var del = require('del');
	del.sync(['./public/css/*', './public/js/*', './public/images/*']);
});

gulp.task('lint', function(){
	var jshint = require('gulp-jshint');

	gulp.src(['./public/js/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('compile', function(){
	var concat = require('gulp-concat');
	gulp.src(['./components/js/*.js'])
		.pipe(concat('main.js'))
		.pipe(gulp.dest('./public/js'));

	gulp.src(['./components/css/*.css'])
		.pipe(concat('style.css'))
		.pipe(gulp.dest('./public/css'));

	gulp.src(['./components/images/*'])
		.pipe(gulp.dest('./public/images/'));

	gulp.src(['./components/*'])
		.pipe(gulp.dest('./public/'));
});

gulp.task('compile-dist', function(){
	var concat = require('gulp-concat'),
        stripDebug = require('gulp-strip-debug'),
		uglify = require('gulp-uglify'),
		minify = require('gulp-minify-css'),
		imageOp = require('gulp-image-optimization');

	gulp.src(['./components/js/main.js'])
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(stripDebug())
		.pipe(gulp.dest('./public/js'));

	gulp.src(['./components/css/style.css'])
		.pipe(concat('style.css'))
		.pipe(minify())
		.pipe(gulp.dest('./public/css'));

	gulp.src(['./components/images/*'])
		.pipe(gulp.dest('./public/images/'));

	gulp.src(['./components/images/*.ico'])
		.pipe(gulp.dest('./public/images/'));

});