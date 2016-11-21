'use strict';

const path = require('path');
const argv = require('yargs').argv;
const mkdirp = require('mkdirp');
const fs = require('fs');

const helper = require('./helper');
const pac = require('../package.json');

const summary = [];

module.exports = argv['plugin-build'] !== true ? {} : {
	hooks: {
		init: function () { // eslint-disable-line object-shorthand
			// Init helper
			helper.init(this);

			// Fill summary array
			this.book.summary.walk((article) => {
				summary.push(article);
			});
		},
		finish: function () { // eslint-disable-line object-shorthand
			const self = this;
			const outputPath = helper.getOutput();

			// Create output dir
			mkdirp(path.parse(outputPath).dir, (mkdirpErr) => {
				if (mkdirpErr) return self.log.error(mkdirpErr.message);

				// Compile rendered main file
				helper.pandocCompile(helper.renderTemp({summary}), (pandocErr, content) => {
					if (pandocErr) return self.log.error(pandocErr.message);

					// Write file to outputpath
					fs.writeFile(outputPath, content, (fsErr) => {
						if (fsErr) return self.log.error(fsErr.message);

						// Log action
						this.log.info(`plugin-build(${pac.version}) output:`, helper.config.output.path);
					});
				});
			});
		},
		page: function (page) { // eslint-disable-line object-shorthand
			// Fill summary with compiled page content
			summary.forEach((article, i, array) => {
				if (article.path === page.path) {
					array[i].content = page.content;
				}
			});

			return page;
		}
	}
};
