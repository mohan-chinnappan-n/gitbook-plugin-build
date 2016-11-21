'use strict';

const path = require('path');
const argv = require('yargs').argv;
const mkdirp = require('mkdirp');
const fs = require('fs');

const helper = require('./helper');
const pac = require('../package.json');

let summary = [];

module.exports = argv['plugin-build'] !== true ? {} : {
	hooks: {
		init: function () {
			// Init helper
			helper.init(this);

			// Fill summary array
			this.book.summary.walk((article) => {
				summary.push( article );
			});
		},
		finish: function () {
			const self = this;
			const outputPath = helper.getOutput();

			// Create output dir
			mkdirp(path.parse(outputPath).dir, (err) => {
				if (err) return self.log.error(err.message);

				// Compile rendered main file
				helper.pandocCompile(helper.renderTemp({summary: summary}), (err, content) => {
					if (err) return self.log.error(err.message);

					// Write file to outputpath
					fs.writeFile(outputPath, content, (err) => {
						if (err) return self.log.error(err.message);

						// Log action
						this.log.info(`plugin-build(${pac.version}) output:`, helper.config.output.path);
					});
				});
			});
		},
		page: function (page) {
			// Fill summary with compiled page content
			summary.forEach((article, i, array) => {
				if(article.path == page.path){
                    array[i].content = page.content;
				}
			});

			return page;
		}
	}
};
