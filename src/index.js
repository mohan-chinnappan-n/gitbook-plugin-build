'use strict';

/**
 * @ignore
 */
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const helper = require('./helper');

const pluginBuildFlag = argv['plugin-build'];

/**
 * Module for defining gitbook plugin.
 * @module index
 */

module.exports = !pluginBuildFlag ? {} : {
	/**
	 * @member module:index~hooks
	 */
	hooks: {
		/**
		 * Gitbook hook on initilization.
		 * @memberOf module:index~hooks
		 */
		init: function () { // eslint-disable-line object-shorthand
			// Inits helper
			helper.init(this);

			// Check cli args for output format, and override on existance of string.
			if (typeof pluginBuildFlag === 'string' || pluginBuildFlag instanceof String) {
				helper.config.format = pluginBuildFlag;
			}

			// Fill summary array
			this.book.summary.walk((article) => {
				helper.summary.push(article);
			});
		},

		/**
		 * Gitbook hook on finishing.
		 * @memberOf module:index~hooks
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

					// Log action.
					self.log.info.ln('plugin-build(output):', helper.config.output);
				});
		},

		/**
		 * Gitbook hook for page. Function will be executed
		 * after markdown is processed with other plugins.
		 * @memberOf module:index~hooks
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
};
