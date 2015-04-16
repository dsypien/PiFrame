var gulp = require('gulp');

gulp.task('default', 
	['build']
);

gulp.task('build', 
	['clean', 'lint', 'compile-dist']
);

gulp.task('clean', function(){
	var del = require('del');

	del.sync(['./dev/build/**/*']);
});

gulp.task('lint', function(){
	var jshint = require('gulp-jshint');

	gulp.src(['./dev/js/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('compile', function(){
	var browserify = require('gulp-browserify'),
        concat = require('gulp-concat');

    
});

gulp.task('compile-dist', function(){
	var browserify = require('gulp-browserify'),
        concat = require('gulp-concat'),
        stripDebug = require('gulp-strip-debug'),
		uglify = require('gulp-uglify');

	gulp.src(['./dev/js/main.js'])
	    .pipe(browserify({
            debug: false
        }))
        .pipe(concat('bundled.js'))
		.pipe(uglify())
		.pipe(stripDebug())
		.pipe(gulp.dest('./dev/build/js'));

});