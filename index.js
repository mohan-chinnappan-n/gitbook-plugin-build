'use strict';

const path = require('path');
const argv = require('yargs').argv;
const mkdirp = require('mkdirp');
const fs = require('fs');

const helper = require('./helper');

let summary = [];

module.exports = argv.pandoc !== true ? {} : {
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

			// Log action
			this.log.debug('padoc(build main file):', outputPath);

			// Create output dir
			mkdirp(path.parse(outputPath).dir, (err) => {
				if (err) return self.log.error(err.message);

				// Compile rendered main file
				helper.pandocCompile(helper.renderTemp('main',{summary: summary}), (err, content) => {
					if (err) return self.log.error(err.message);

					// Write file to outputpath
					fs.writeFile(outputPath, content, (err) => {
						if (err) return self.log.error(err.message);
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
