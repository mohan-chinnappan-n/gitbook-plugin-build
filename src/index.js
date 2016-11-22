'use strict';

/**
 * @ignore
 */
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const helper = require('./helper');
const pac = require('../package.json');

/**
 * Module for defining gitbook plugin.
 *
 * @module index
 */

module.exports = argv['plugin-build'] !== true ? {} : {
	hooks: {
		/**
		 * Gitbook hook on initilization.
		 */
		init: function () { // eslint-disable-line object-shorthand
			// Inits helper
			helper.init(this);

			// Fill summary array
			this.book.summary.walk((article) => {
				helper.summary.push(article);
			});
		},

		/**
		 * Gitbook hook on finishing.
		 * @returns {Promise}
		 */
		finish: function () { // eslint-disable-line object-shorthand
			const self = this;
			const outputPath = helper.getOutput();

			// Render template.
			const rawContent = helper.renderTemp({summary: helper.summary});

			// Create output dir.
			mkdirp.sync(path.parse(outputPath).dir);

			// Compile rendered main file
			return helper.pandocCompile(rawContent)
				.then((compiledContent) => {
					// Write file to output dir.
					fs.writeFileSync(outputPath, compiledContent);
				}).then(() => {
					// Log action.
					self.log.info('plugin-build(output):', helper.config.output);
				});
		},

		/**
		 * Gitbook hook for page. Function will be executed
		 * after markdown is processed with other plugins.
		 * @param page
		 * @returns {page} The same as page parameter.
		 */
		page: function (page) { // eslint-disable-line object-shorthand
			// Fill summary with compiled page content
			helper.summary.forEach((article, i, array) => {
				if (article.path === page.path) {
					array[i].content = page.content;
				}
			});

			// Returns unchanged page.
			return page;
		}
	}
}
;
