const gulp = require('gulp');
const runSequence = require('run-sequence');

// Default task to be run with `gulp`
gulp.task('default', ['dev'], () => {
	gulp.watch('src/css/**/*.styl', ['css-dev']);
	gulp.watch('src/html/**/*.hbs', ['html-dev']);
	gulp.watch(['src/js/**/*', '!src/js/critical.js'], ['js-dev']);
	gulp.watch('src/assets/**/*', ['assets-dev']);
	gulp.watch('template-data/*.json', ['html-dev']);
});

gulp.task('dev', () => {
	runSequence(
		'clean-dev',
		'css-dev',
		'js-dev',
		'assets-dev',
		'html-dev',
		'browser-sync'
	);
});
