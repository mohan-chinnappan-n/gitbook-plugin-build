'use strict';

const fs = require('fs');
const pdc = require('pdc');
const ejs = require('ejs');
const merge = require('merge');
const pac = require('../package.json');

/**
 * Module that hold all hard logic.
 *
 * @module helper
 */

/**
 * Callback for returning string.
 *
 * @callback returnString
 * @param content {String} Returned content.
 */

/**
 * Constructor. Wraps book instance.
 *
 * @class Helper class which holds most hard logic,
 * so that plugins methods can be
 * as clean as possible.
 */
class Helper {

	/**
	 * Helper constructor.
	 */
	constructor() {
		this.getSrc = null;
		this.config = null;
		this.log = null;
	}

	/**
	 * Init helper with plugin context.
	 * @param ctx {Object} `this` plugin object.
	 */
	init(ctx) {
		// Set labels
		this.getSrc = ctx.book.resolve;
		this.log = ctx.log;
		this.config = merge.recursive(
			pac.gitbook,
			ctx.options.pluginsConfig.build
		);
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
	 * @param html {String} Html string.
	 * @param {returnString} Callback for compiled content.
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
