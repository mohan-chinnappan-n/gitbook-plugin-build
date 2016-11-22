'use strict';

process.argv = process.argv.concat(['--plugin-build']);

const assert = require('assert');
const sinon = require('sinon');
const index = require('../../src/index');
const helper = require('../../src/helper');

/**
 * @test module:index
 */
describe('index', () => {

	/**
	 * @test module:index~hooks.init
	 */
	describe('~hooks.init', () => {
		beforeEach(() => {
			this.init = sinon.stub(helper, 'init');
			this.article = sinon.stub();

			index.hooks.book = {
				summary: {
					walk: (cb) => cb(this.article)
				}
			};

			helper.summary = [];
			index.hooks.init();
		});

		afterEach(() => {
			this.init.restore();
		});

		it('should exist and is function', () => {
			assert.equal(typeof index.hooks.init, 'function');
		});

		it('inits helper', () => {
			assert(this.init.withArgs(index.hooks).calledOnce);
		});

		it('fills helper summary', () => {
			assert.deepEqual(helper.summary, [this.article]);
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
