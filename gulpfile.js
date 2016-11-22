/* eslint-disable global-require, import/no-dynamic-require */

'use strict';

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const browserSync = require('browser-sync');

const gulp = require('gulp-help')(require('gulp'));
const excludeGitignore = require('gulp-exclude-gitignore');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const nsp = require('gulp-nsp');
const plumber = require('gulp-plumber');
const checkDeps = require('gulp-check-deps');
const eslint = require('gulp-eslint');
const shell = require('gulp-shell');
const ghPages = require('gulp-gh-pages');
const jsdoc = require('gulp-jsdoc3');
const codacy = require('gulp-codacy');

const mkdocsConfig = './config/mkdocs.yml';
const jsdocConfig = './config/jsdoc.json';
const checkDepConfig = './config/checkDep.json';
const codacyConfig = './config/codacy.json';
const changelogConfig = './config/changelog.json';

/**
 * NPM TEST
 */

gulp.task('test:spec', 'Run integration/unit tests.', ['test:pre'], (cb) => {
	let mochaErr;

	gulp.src([
		'test/spec/**/*.js'
	]).pipe(plumber())
		.pipe(mocha({
			reporter: 'spec'
		}))
		.on('error', function (err) {
			mochaErr = err;
		})
		.pipe(istanbul.writeReports({
			dir: './build/coverage',
			reportOpts: {dir: './build/coverage'}
		}))
		.on('end', function () {
			cb(mochaErr);
		});
});

gulp.task('coverage', false, () => {
	if (process.env.CI) {
		const config = require(codacyConfig);

		return gulp
			.src(['build/coverage/lcov.info'], {read: false})
			.pipe(codacy(config));
	}
});

gulp.task('test:e2e', 'Run integration/unit tests.', (cb) => {
	let mochaErr;

	gulp.src([
		'test/e2e/**/*.js'
	]).pipe(plumber())
		.pipe(mocha({
			reporter: 'spec',
			timeout: 20000
		}))
		.on('error', (err) => {
			mochaErr = err;
		})
		.on('end', () => {
			cb(mochaErr);
		});
});

gulp.task('lint', 'Lint *.js project files.', () => {
	const source = [
		'**/*.js'
	];

	return gulp.src(source)
		.pipe(excludeGitignore())
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('test:docs', 'Test project documentations.', ['inchjs'], () => {
	const docs = require('./docs.json'); // eslint-disable-line import/no-unresolved
	const errors = [];
	docs.objects.forEach((object) => {
		if (object.undocumented === true) {
			errors.push(` > ${object.longname} in ${path.join(object.meta.path, object.meta.filename)}`);
		}
	});
	if (errors.length > 0) {
		console.error(`Objects undocumented...\n${errors.join('\n')}\n`); // Todo: Document all elements!
		// throw new Error(`Objects undocumented...\n${errors.join('\n')}\n`);
	} else {
		console.log('\n > Documentations tests all pass!\n');
	}
});

gulp.task('jsdoc', false, (cb) => {
	const config = require(jsdocConfig);

	gulp.src([
		'./test/spec/**/*.js',
		'./src/**/*.js',
		'docs/documentation.md'
	], {read: false})
		.pipe(jsdoc(config, cb));
});

gulp.task('test:dep', 'Test project dependencies for deprecation.', () => {
	const config = require(checkDepConfig);
	return gulp.src('package.json')
		.pipe(checkDeps(config));
});

gulp.task('prepublish', false, ['nsp'], () => {
	const mkdocs = yaml.safeLoad(fs.readFileSync(mkdocsConfig, 'utf8'));
	mkdocs.extra.version = require('./package.json').version;
	console.log(`\n > Package version: ${mkdocs.extra.version}\n`);
	fs.writeFileSync(mkdocsConfig, yaml.safeDump(mkdocs));
});

/**
 * DEPENDENCIES
 */

gulp.task('test:pre', false, () => {
	const source = 'src/**/*.js';

	return gulp.src([
		source
	])
		.pipe(excludeGitignore())
		.pipe(istanbul({
			includeUntested: true
		}))
		.pipe(istanbul.hookRequire());
});

gulp.task('nsp', 'Run node security checks.', (cb) => {
	nsp({package: path.resolve('package.json')}, cb);
});

gulp.task('inchjs', false, shell.task([
	'./node_modules/.bin/inchjs --all --pedantic'
]));

/**
 * UTILITY
 */

gulp.task('changelog', 'Update docs changelog file.', (cb) => {
	let command = 'github_changelog_generator';
	const config = require(changelogConfig);
	Object.keys(config).forEach((key) => {
		command += ` --${key} ${config[key]}`;
	});
	shell.task([command])(cb);
});

gulp.task('docs', 'Build project documentation.', ['mkdocs', 'jsdoc']);

gulp.task('mkdocs', false, shell.task([
	`mkdocs build --strict --clean --quiet --config-file ${mkdocsConfig}`
]));

gulp.task('gh-pages', 'Upload documentation to github pages.', ['docs'], () => {
	const output = 'build/gh-pages';
	return gulp.src('build/docs/**/*')
		.pipe(ghPages({
			cacheDir: output
		}));
});

gulp.task('serve', 'Build, serve documentation and reload on docs change.', ['docs'], () => {
	browserSync.init({
		server: {baseDir: 'build/docs'}
	});

	return gulp.watch([
		'generators/**/*.js',
		'lib/**/*.js',
		'docs/**/*',
		'config/mkdocs.yml'
	], ['docs', function () {
		browserSync.reload();
	}]);
});
