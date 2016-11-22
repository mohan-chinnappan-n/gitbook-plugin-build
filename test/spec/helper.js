'use strict';

const sinon = require('sinon');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

/**
 * @test module:helper
 */
describe('module:helper', () => {
	/**
	 * @test Helper
	 */
	describe('Helper', () => {

		let helper;
		const helperPath = '../../src/helper';
		let ctx;

		beforeEach(() => {
			helper = require(helperPath);
			ctx = {
				book: {
					resolve: sinon.stub()
				},
				log: {
					warn: sinon.stub(),
					error: sinon.stub(),
					info: sinon.stub()
				},
				options: {
					pluginsConfig: {
						build: sinon.stub()
					}
				}
			};

			helper.init(ctx);
		});

		afterEach(() => {
			delete require.cache[require.resolve(helperPath)]
		});

		/**
		 * @test module:helper~Helper#init
		 * @test module:helper~Helper#getSrc
		 * @test module:helper~Helper#config
		 * @test module:helper~Helper#log
		 */
		describe('#init', () => {
			it('sets instance members', () => {
				assert.deepEqual(helper.getSrc, ctx.book.resolve);
				assert.deepEqual(helper.log, ctx.log);
				assert.deepEqual(helper.config, ctx.options.pluginsConfig.build);
			});
		});

		/**
		 * @test module:helper~Helper#renderTemp
		 */
		describe('#renderTemp', () => {
			beforeEach(() => {
				this.config = {
					summary: [
						{
							content: 'content0'
						},
						{
							content: 'content1'
						}
					]
				};

				helper.getSrc = (path) => path;
				helper.config = {
					template: path.join(__dirname, '../resources/helper/renderTemp') + '/'
				};
			});

			it('If template exist render with ejs', () => {
				helper.config.template += 'main_ok';
				assert.deepEqual(helper.renderTemp(this.config), JSON.stringify(this.config.summary));
			});

			it('If template not exist render without templating and log error', () => {
				const self = this;
				helper.config.template += 'NOT_EXIST';
				assert.equal(helper.renderTemp(this.config), (() => {
					let content = '';
					self.config.summary.forEach((article) => {
						content += `${article.content}\n`;
					});
					return content;
				})());
				assert(helper.log.warn.withArgs('plugin-build:', sinon.match.string).calledOnce);
				assert(/ENOENT: no such file or directory.*NOT_EXIST/.test(helper.log.warn.getCalls()[0].args[1]));
			});

			it('throw error if template path is folder', (done) => {
				helper.config.template += 'folder';
				try{
					helper.renderTemp(this.config);
					done('Should not pass');
				} catch (err){
					assert(/Template path is not file: .*folder/.test(err.message));
					done();
				}
			});
		});

		/**
		 * @test module:helper~Helper#getOutput
		 */
		describe('#getOutput', () => {

		});

		/**
		 * @test module:helper~Helper#pandocCompile
		 */
		describe('#pandocCompile', () => {

		});
	});
});

