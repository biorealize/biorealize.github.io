import gulp from 'gulp'
import sass from 'gulp-ruby-sass'
import minifyCSS from 'gulp-clean-css'
import concat from 'gulp-concat'
import uglify from 'gulp-uglify'
import livereload from 'gulp-livereload'
import jshint from 'gulp-jshint'
import sourcemaps from 'gulp-sourcemaps'
import stylish from 'jshint-stylish'
import babel from 'gulp-babel'

gulp.task('sass', (done) => {
	return sass('sass/main.sass')
        .on('error', sass.logError)
		.pipe(concat('main.css'))
		.pipe(gulp.dest('css'))
		.pipe(minifyCSS())
		.pipe(concat('main.min.css'))
		.pipe(livereload())
		.pipe(gulp.dest('css'))
	done()
})

//JSMINIFY + CONCAT
gulp.task('scripts', (done) => {
	gulp.src(['javascript/*.js', '!javascript/custom.min.js', ])
		.pipe(babel({presets: ['@babel/env']}))
		.pipe(sourcemaps.init())
		.pipe(concat('custom.min.js'))
		.pipe(uglify())
		.on('error', swallowError)
		.pipe(sourcemaps.write('maps'))
		.pipe(livereload())
		.pipe(gulp.dest('javascript'))
	done()
})

gulp.task('lint', (done) => {
	gulp
		.src(['javascript/*.js', '!javascript/custom.min.js', ])
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
	done()
})

gulp.task('reload', (done) => {
	gulp
		.src(['*.php', '*.html', ])
		.pipe(livereload())
	done()
})

gulp.task('watch', () => {
	livereload.listen(34477)
    gulp.watch(['sass/**/*.sass', 'sass/**/*.scss'], gulp.series('sass'))
	gulp.watch(['javascript/*.js', '!javascript/custom.min.js', ], gulp.series('scripts', 'lint'))
	gulp.watch(['*.php', '*.html' ], gulp.series('reload'))
})


gulp.task('default', gulp.parallel('sass', 'scripts', 'lint', 'watch'))

var swallowError = error => {
	console.log(error.toString());
	this.emit('end');
}