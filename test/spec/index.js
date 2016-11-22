'use strict';

const assert = require('assert');
const sinon = require('sinon');

/**
 * @test module:index
 */
describe('index', () => {

	const indexPath = '../../src/index';
	const helperPath = '../../src/helper';
	const argv = process.argv;
	let index;
	let helper;

	beforeEach(() => {
		// Delete catche.
		delete require.cache[require.resolve(indexPath)];
		delete require.cache[require.resolve(helperPath)];
		delete require.cache[require.resolve('yargs')];

		// Setup cli arguments.
		process.argv = argv.concat(['--plugin-build']);
		index = require(indexPath); // eslint-disable-line

		helper = require(helperPath);
		this.helperInit = sinon.stub(helper, 'init');
	});

	afterEach(() => {
		this.helperInit.restore();
	});

	it('should return blank object if no flag in argv', () => {
		// Delete catche.
		delete require.cache[require.resolve(indexPath)];
		delete require.cache[require.resolve('yargs')];

		// Setup cli arguments.
		process.argv = [];
		index = require(indexPath); // eslint-disable-line

		assert.deepEqual(index, {});
	});

	/**
	 * @test module:index~hooks.init
	 */
	describe('~hooks.init', () => {
		beforeEach(() => {
			let article = 0;
			index.hooks.init.prototype.book = {
				summary : {
					walk: (cb) => cb(article++)
				}
			};
			index.hooks.init();
		});

		it('should exist and is function', () => {
			assert.equal(typeof index.hooks.init, 'function');
		});

		it('inits helper', () => {
			assert(this.helperInit.withArgs(index.hooks).calledOnce);
		});

		it('fills helper summary', () => {
			assert.equal(helper.summary.sort(),[]);
		});
	});

	/**
	 * @test module:index~hooks.finish
	 */
	describe('~hooks.finish', () => {

	});

	/**
	 * @test module:index~hooks.page
	 */
	describe('~hooks.page', () => {

	});
});
