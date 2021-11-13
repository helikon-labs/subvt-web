import gulp 		 from 'gulp'
import del           from 'del'
import dartSass      from 'sass'
import yargs 		 from 'yargs'
import { hideBin } 	 from 'yargs/helpers'
import webpack       from 'webpack'
import gulpif		 from 'gulp-if'
import gulpSass      from 'gulp-sass'
import newer 		 from 'gulp-newer'
import debug 		 from 'gulp-debug'
import rename 		 from 'gulp-rename'
import cheerio 		 from 'gulp-cheerio'
import browsersync   from 'browser-sync'
import autoprefixer  from 'gulp-autoprefixer'
import replace		 from 'gulp-replace'
import plumber 		 from 'gulp-plumber'
import imagemin      from 'gulp-imagemin'
import webpackStream from 'webpack-stream'
import mincss 		 from 'gulp-clean-css'
import sourcemaps 	 from 'gulp-sourcemaps'
import svg 			 from 'gulp-svg-sprite'
import include 		 from 'gulp-file-include'
import TerserPlugin  from 'terser-webpack-plugin'

const { src, dest, parallel, series, watch } = gulp
const paths = {
	views: {
		src: './src/views/**/*.html',
		dist: './dist/',
		watch: './src/views/**/*.html'
	},
	styles: {
		src: './src/styles/main.scss',
		dist: './dist/styles/',
		watch: './src/styles/**/*.scss'
	},
	scripts: {
		src: './src/js/index.js',
		dist: './dist/js/',
		watch: './src/js/**/*.js'
	},
	images: {
		src: './src/img/**/*.{png,jpg,jpeg,svg}',
		dist: './dist/img/',
		watch: './src/img/**/*.{png,jpg,jpeg,svg}'
	},
	sprites: {
		src: './src/img/svg/*.svg',
		dist: './dist/img/',
		watch: './src/img/svg/*.svg'
	},
	favicon: {
		src: './src/img/favicon/*',
		dist: './dist/img/'
	},
	fonts: {
		src: './src/fonts/**/*.{ttf,woff,eot,svg}',
		dist: './dist/fonts/'
	}
};
const argv = yargs(hideBin(process.argv)).argv,
	  production = !!argv.production,
	  sass = gulpSass(dartSass);

function serve() {
	browsersync.init({
		server: {
			baseDir: './dist/'
		},
		ghostMode: false,
		notify: false,
		// online: true,
		// tunnel: 'yousutename', // https://yousutename.loca.lt
	});

	watch(paths.views.watch, { usePolling: true }, views);
	watch(paths.styles.watch, { usePolling: true }, styles);
	watch(paths.scripts.watch, { usePolling: true }, scripts);
	watch(paths.images.watch, { usePolling: true }, images);
	watch(paths.sprites.watch, { usePolling: true }, sprites);
}

async function clean() {
	return del('dist/**/*', { force: true })
}

async function views() {
	return src(paths.views.src)
        .pipe(include({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulpif(production, replace('.css', '.min.css')))
        .pipe(gulpif(production, replace('.js', '.min.js')))
        .pipe(dest(paths.views.dist))
        .pipe(browsersync.stream());
}

function styles() {
	return src(paths.styles.src)
        .pipe(gulpif(!production, sourcemaps.init()))
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulpif(production, autoprefixer({
            cascade: false,
            grid: true
        })))
        .pipe(gulpif(production, mincss({
            compatibility: 'ie8', level: {
                1: {
                    specialComments: 0,
                    removeEmpty: true,
                    removeWhitespace: true
                },
                2: {
                    mergeMedia: true,
                    removeEmpty: true,
                    removeDuplicateFontRules: true,
                    removeDuplicateMediaBlocks: true,
                    removeDuplicateRules: true,
                    removeUnusedAtRules: false
                }
            }
        })))
        .pipe(gulpif(production, rename({
            suffix: '.min'
        })))
        .pipe(plumber.stop())
        .pipe(replace('img/', '../img/'))
        .pipe(gulpif(!production, sourcemaps.write('./maps/')))
        .pipe(dest(paths.styles.dist))
        .pipe(debug({
            'title': 'CSS files'
        }))
        .pipe(browsersync.stream());
}

function scripts() {
	return src(paths.scripts.src)
		.pipe(webpackStream({
			mode: production ? 'production' : 'development',
			performance: { hints: false },
			plugins: [
				new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery', 'window.jQuery': 'jquery' }),
			],
			entry: {
				main: './src/js/index.js',
			},
			output: {
				filename: '[name].js',
				chunkFilename: '[name].js',
				publicPath: '/'
			},
			module: {
				rules: [
					{
						test: /\.m?js$/,
						exclude: /(node_modules)/,
						use: {
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env'],
								plugins: ['babel-plugin-root-import']
							}
						}
					}
				]
			},
			optimization: {
				splitChunks: {
					cacheGroups: {
						vendor: {
							test: /node_modules/,
							chunks: 'initial',
							name: 'vendor',
							enforce: true
						}
					}
				},
				minimizer: [
					new TerserPlugin({
						terserOptions: { format: { comments: false } },
						extractComments: false
					})
				]
			},
		}), webpack)
		.pipe(gulpif(production, rename({
            suffix: '.min'
        })))
        .pipe(dest(paths.scripts.dist))
        .pipe(debug({
            'title': 'JS files'
        }))
        .pipe(browsersync.stream());
}

function images() {
	return src(paths.images.src)
		.pipe(newer(paths.images.dist))
		.pipe(gulpif(production, imagemin()))
        .pipe(dest(paths.images.dist))
        .pipe(debug({
            'title': 'Images'
        }))
        .pipe(browsersync.stream());
}

function sprites() {
	return src(paths.sprites.src)
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: { xmlMode: true }
		}))
		.pipe(svg({
			shape: {
				dimension: {
					maxWidth: 500,
					maxHeight: 500
				},
				spacing: {
					padding: 0
				}
			},
			mode: {
				stack: {
					sprite: '../sprite.svg'
				}
			}
		}))
		.pipe(dest(paths.sprites.dist))
		.pipe(debug({
			'title': 'Sprites'
		}))
		.on('end', browsersync.reload);
}

function favicon() {
	return src(paths.favicon.src)
		.pipe(dest(paths.favicon.dist))
		.pipe(debug({
			'title': 'Favicon'
		}));
}

function fonts() {
	return src(paths.fonts.src)
		.pipe(dest(paths.fonts.dist))
		.pipe(debug({
			'title': 'Fonts'
		}));
}

export { clean, views, styles, scripts, images, sprites, favicon, fonts }

export const development = series(clean,
    parallel([views, styles, scripts, images, sprites, favicon, fonts]), serve);

export const prod = series(clean,
    parallel([views, styles, scripts, images, sprites, favicon, fonts]));

export default development;
