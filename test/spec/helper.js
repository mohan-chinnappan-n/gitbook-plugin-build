'use strict';


const sinon = require('sinon');
const assert = require('assert');
const path = require('path');


/**
 * @test module:helper
 */
describe('module:helper', () => {
	const helperPath = '../../src/helper';
	let helper;
	let ctx;
	let t; // eslint-disable-line

	beforeEach(() => {
		delete require.cache[require.resolve(helperPath)];
		helper = require(helperPath); // eslint-disable-line
		ctx = {
			book: {
				resolve: sinon.stub()
			},
			log: {
				warn: {ln: sinon.stub()},
				error: {ln: sinon.stub()},
				info: {ln: sinon.stub()},
				debug: {ln: sinon.stub()}
			},
			options: {
				pluginsConfig: {
					build: sinon.stub()
				}
			}
		};

		helper.init(ctx);
	});

	it('returns Helper instance', () => {
		assert.equal(helper.constructor.name, 'Helper');
	});

	/**
	 * @test Helper
	 */
	describe('Helper', () => {
		/**
		 * @test module:helper~Helper#init
		 * @test module:helper~Helper#getSrc
		 * @test module:helper~Helper#config
		 * @test module:helper~Helper#log
		 * @test module:helper~Helper#summary
		 */
		t = describe('#init', () => {
			it('sets instance members', () => {
				assert.deepEqual(helper.getSrc, ctx.book.resolve);
				assert.deepEqual(helper.log, ctx.log);
				assert.deepEqual(helper.summary, []);
				assert.deepEqual(helper.config, ctx.options.pluginsConfig.build);
			});
		});

		/**
		 * @test module:helper~Helper#renderTemp
		 */
		t = describe('#renderTemp', () => {
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

				helper.getSrc = FilePath => FilePath;
				helper.config = {
					template: `${path.join(__dirname, '../resources/helper/renderTemp')}/`
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
				assert(helper.log.warn.ln.withArgs('plugin-build: no template found').calledOnce);
			});

			it('throw error if template path is folder', (done) => {
				helper.config.template += 'folder';
				try {
					helper.renderTemp(this.config);
					done('Should not pass');
				} catch (err) {
					assert(/Template path is not file: .*folder/.test(err.message));
					done();
				}
			});

			it('throw error on ejs fail', (done) => {
				helper.config.template += 'main_err';
				try {
					helper.renderTemp(this.config);
					done('Should not pass');
				} catch (err) {
					assert(/Template error: .*main_err.*NOT_EXIST is not defined.*/
						.test(err.message.split('\n').join(' '))
					);
					done();
				}
			});
		});

		/**
		 * @test module:helper~Helper#getOutput
		 */
		t = describe('#getOutput', () => {
			beforeEach(() => {
				helper.config.output = 'helper.config.output';
				this.return = sinon.stub();
				helper.getSrc = () => this.return;
			});
			it('returns full src path from relative path', () => {
				assert.equal(helper.getOutput(), this.return);
			});
		});

		/**
		 * @test module:helper~Helper#pandocCompile
		 */
		t = describe('#pandocCompile', () => {
			beforeEach(() => {
				helper.config = {
					format: 'markdown',
					opts: {},
					args: []
				};
			});

			it('returns compiled html from callback and logs', () =>
				helper.pandocCompile('<p>hello world</p>')
					.then((result) => {
						assert.equal(result, 'hello world\n');
						assert.deepEqual(helper.log.debug.ln.getCalls()[0].args, [
							'plugin-build(compile):', JSON.stringify({
								args: ['--standalone'].sort(),
								config: helper.config
							}, null, 2)
						]);
					})
			);

			it('filter config args and sort it', () => {
				helper.config.args = ['--standalone', '--standalone', '--verbose'];

				return helper.pandocCompile('<p>hello world</p>')
					.then(() => {
						assert.deepEqual(helper.log.debug.ln.getCalls()[0].args, [
							'plugin-build(compile):', JSON.stringify({
								args: ['--verbose', '--standalone'].sort(),
								config: helper.config
							}, null, 2)
						]);
					});
			});
		});
	});
});

