'use strict';

const tester = require('gitbook-tester');
const path = require('path');
const fs = require('fs');
const sinon = require('sinon');
const assert = require('assert');
const shell = require('gulp-shell');

/**
 * @test module:index_hooks
 */
describe('gitbook-plugin-build', () => {

	const root = path.join(__dirname);
	const gitbook = path.join(__dirname,'../resources/gitbook');

	before((done) => {
		process.chdir(gitbook);

		shell.task([[
			'rm node_modules _book -rf',
			'npm install'
		].join(' && ')])(done);
	});

	after((done) => {
		shell.task([[
			'rm node_modules _book -rf',
		].join(' && ')])((err) => {
			process.chdir(root);
			done(err);
		});
	});

	it('should not create file on no flag', (done) => {
		shell.task([[
			'npm run book-build --debug',
			'[ ! -f _book/main.tex ]'
		].join(' && ')])(done);
	});

	it('should create file on flag', (done) => {
		shell.task([[
			'npm run book-plugin-build',
			'[ -f _book/main.tex ]'
		].join(' && ')])(done);
	});
});
