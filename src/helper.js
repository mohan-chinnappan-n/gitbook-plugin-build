'use strict';

/**
 * @ignore
 */
const pdc = require('pdc');
const ejs = require('ejs');
const fs = require('fs');

/**
 * Module that hold all hard logic.
 *
 * @module helper
 */

/**
 * Holds most hard logic,
 * so that plugins methods can be
 * as clean as possible. Raps book instance.
 * @class Helper Main module class.
 */
class Helper {

	/**
	 * Helper constructor.
	 * @constructs Helper
	 */
	constructor() {
		/**
		 * Get absolute src path.
		 * @param path
		 * @member module:helper~Helper#getSrc
		 */
		this.getSrc = null;

		/**
		 * Main plugin configuration.
		 * @member module:helper~Helper#config
		 */
		this.config = null;

		/**
		 * Gitbook logger.
		 * @member module:helper~Helper#log
		 */
		this.log = null;
	}

	/**
	 * Init helper with plugin context.
	 * @param ctx {Object} `this` plugin object.
	 */
	init(ctx) {
		// Sets instance members.
		this.getSrc = ctx.book.resolve;
		this.log = ctx.log;
		this.config = ctx.options.pluginsConfig.build;
	}

	/**
	 * Get rendered template content.
	 * @param config {Object} Summary array of articles.
	 * @returns {String} Rendered content.
	 */
	renderTemp(config) {
		if (fs.existsSync(this.config.template)) {
			return ejs.render(
				fs.readFileSync(this.getSrc(this.config.template), 'utf-8'),
				config
			);
		} else {
			let content = '';
			config.summary.forEach((article) => {
				content += `${article.content}\n`;
			});
			return content;
		}
	}

	/**
	 * Get output file path.
	 * @returns {String}
	 */
	getOutput() {
		return this.getSrc(this.config.output.path);
	}

	/**
	 * Compile html string to output format.
	 * @param html {String} Html string format.
	 * @param cb {strCallback} Callback for compiled content.
	 */
	pandocCompile(html, cb) {
		const args = this.config.args
			.concat(['--standalone'])
			.filter((v, i, a) => a.indexOf(v) === i);

		pdc(html,
			'html',
			this.config.output.format,
			args,
			this.config.opts,
			(err, result) => {
				if (err) return cb(err);

				cb(null, result);
			});
	}
}

module.exports = new Helper();
