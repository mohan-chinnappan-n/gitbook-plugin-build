'use strict';

const path = require('path');
const fs = require('fs');
const argv = require('yargs').argv;
const merge = require('merge');
const fse = require('fs-extra');

const helper = require('./helper');

let summary = [];

module.exports = argv.pandoc !== true ? {} : {
	hooks: {
		init: function () {
			// Init helper
			helper.init(this);

			// Fill summary array.
			this.book.summary.walk((article) => {
				summary.push( article );
			});
		},
		finish: function () {
			const self = this;
			const outputPath = helper.getOutput(
				helper.getMainFile()
			);

			// Write main file.
			this.log.debug('padoc(build main file):', outputPath);

			fse.mkdirp(path.parse(outputPath).dir, (err) => {
				if (err) return self.log.error(err.message);

				helper.config.args.push('--standalone');
				helper.pandocCompile(helper.renderTemp('main',{summary: summary}), (err, compiledContent) => {
					if (err) return self.log.error(err.message);

					fse.outputFile(outputPath, compiledContent, (err) => {
						if (err) return self.log.error(err.message);
					});
				});
			});
		},
		page: function (page) {
			summary.forEach((article, i, array) => {
				if(article.path == page.path){
                    array[i].content = page.content;
				}
			});
			return page;
		}
	}
};
