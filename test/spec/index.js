'use strict';

process.argv = process.argv.concat(['--plugin-build']);

const assert = require('assert');
const sinon = require('sinon');
const mkdirp = require('mkdirp');
const fs = require('fs');
const index = require('../../src/index');
const helper = require('../../src/helper');
const path = require('path');

/**
 * @test module:index_hooks
 */
describe('index', () => {

	let t;

	before(() => {
		helper.config = {
			output: 'helper/config/output'
		}

	});

	/**
	 * @test module:index_hooks~init
	 */
	t = describe('hooks~init', () => {
		beforeEach(() => {
			this.init = sinon.stub(helper, 'init');
			this.article = sinon.stub();

			index.hooks.log = {info: sinon.stub()};
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
	 * @test module:index_hooks~finish
	 */
	t = describe('hooks~finish', () => {

		beforeEach(() => {
			this.fullOutputPath = 'some/dir/and/helper/getOutput';
			helper.summary = ['summary'];

			this.mkdir = sinon.stub(mkdirp, 'sync');
			this.writeFileSync = sinon.stub(fs, 'writeFileSync');
			this.pandocCompile = sinon.stub(helper, 'pandocCompile')
				.returns(Promise.resolve('compiledContent'));
			this.getOutput = sinon.stub(helper, 'getOutput')
				.returns(this.fullOutputPath);
			this.renderTemp = sinon.stub(helper, 'renderTemp', (obj) => {
				return JSON.stringify(obj);
			});
			index.hooks.log = {info: sinon.stub()};
		});

		afterEach(() => {
			this.mkdir.restore();
			this.writeFileSync.restore();
			this.pandocCompile.restore();
			this.getOutput.restore();
			this.renderTemp.restore();
		});

		it('create output dir', () => {
			const self = this;
			return index.hooks.finish()
				.then(() => {
					assert(self.mkdir.withArgs(path.parse(this.fullOutputPath).dir).calledOnce);
				});
		});

		it('call pandoc compile with rendered template', () => {
			const self = this;
			return index.hooks.finish()
				.then(() => {
					assert(self.pandocCompile.withArgs(JSON.stringify({summary: helper.summary})).calledOnce);
				});
		});

		it('writes compiled content to output path', () => {
			const self = this;
			return index.hooks.finish()
				.then(() => {
					assert(self.writeFileSync.withArgs(this.fullOutputPath, 'compiledContent').calledOnce);
				});
		});

		it('logs at the end', () => {
			return index.hooks.finish()
				.then(() => {
					assert(index.hooks.log.info.withArgs('plugin-build(output):', helper.config.output).calledOnce);
				});
		});
	});

	/**
	 * @test module:index_hooks~page
	 */
	t = describe('hooks~page', () => {
		beforeEach(() => {
			helper.summary = [{
				path: 'summary.path0'
			}, {
				path: 'summary.path1'
			}, {
				path: 'summary.path2'
			}];

			this.return0 = index.hooks.page({
				path: 'summary.path0',
				content: 'content.path0'
			});
			this.return1 = index.hooks.page({
				path: 'summary.path0',
				content: 'content.path0'
			});
			index.hooks.page({
				path: 'summary.path1',
				content: 'content.path1'
			});
			index.hooks.page({
				path: 'summary.path2',
				content: 'content.path2'
			});
		});

		it('should return always the same', () => {
			assert.deepEqual(this.return0, this.return1);
		});

		it('should fill helper summary with content', () => {
			assert.deepEqual(helper.summary, [
				{
					"content": "content.path0",
					"path": "summary.path0"
				},
				{
					"content": "content.path1",
					"path": "summary.path1"
				},
				{
					"content": "content.path2",
					"path": "summary.path2"
				}
			]);
		});
	});
});
