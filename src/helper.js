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

		/**
		 * Gitbook summary.
		 * @member module:helper~Helper#summary
		 */
		this.summary = [];
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
	 * @param config {Object} Should be in form `{summary: [{content: <String}]}`.
	 * @returns {String} Rendered content.
	 */
	renderTemp(config) {
		let content;
		let fileStat;
		const isTemp = {
			file: false,
			dir: false
		};

		try {
			fileStat = fs.statSync(this.config.template);

			isTemp.file = fileStat.isFile();
			isTemp.dir = fileStat.isDirectory();
		} catch (err) {
			// On template fail log error.
			this.log.warn.ln('plugin-build: no template found');
		}

		if (isTemp.file && !isTemp.dir) {
			// If template exist render with ejs.
			const rawContent = fs.readFileSync(this.getSrc(this.config.template), 'utf-8');

			try {
				content = ejs.render(rawContent, config);
			} catch (err) {
				// If template syntax is corrupted throw error.
				throw new Error(`Template error: ${this.config.template}\n${err.message}`);
			}
		} else if (isTemp.dir) {
			// If template is directory throw error.
			throw new Error(`Template path is not file: ${this.config.template}`);
		} else {
			// If template not exist create without templating.
			content = '';
			config.summary.forEach((article) => {
				content += `${article.content}\n`;
			});
		}

		// Returns content on the end.
		return content;
	}

	/**
	 * Get output file path.
	 * @returns {String}
	 */
	getOutput() {
		return this.getSrc(this.config.output);
	}

	/**
	 * Compile html string to output format.
	 * @param html
	 * @returns {Promise}
	 */
	pandocCompile(html) {
		// Add standalone flag to pandoc arguments.
		const args = this.config.args
			.concat(['--standalone'])
			.filter((v, i, a) => a.indexOf(v) === i)
			.sort();

		// Logs compile configuration.
		this.log.debug.ln('plugin-build(compile):', JSON.stringify({
			args,
			config: this.config
		}, null, 2));

		return new Promise((resolve, reject) => {
			// Compile html string.
			pdc(html,
				'html',
				this.config.format,
				args,
				this.config.opts,
				(err, result) => {
					if (err) reject(err);

					// Call callback with (err, result).
					resolve(result);
				});
		});
	}
}

module.exports = new Helper();
