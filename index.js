'use strict';

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const argv = require('yargs').argv;

const helper = require('./helper');

let summary = [];

module.exports = argv.pandoc !== true ? {} : {
	hooks: {
		init: function () {
			// Init helper
			helper.init(this);

			// Remove output dir
			helper.rmOutputDir();

			// Fill summary array.
			this.book.summary.walk((article) => {
                summary.push(article.path);
			});
		},
		finish: function () {
			const self = this;
			const outMainPath = helper.getOutputMain();

			// Construct main content
			let mainContent = summary.join('\n');

			// Write main file.
			this.log.debug('padoc(build main file):', outMainPath);
			fse.outputFile(outMainPath, mainContent, (err) => {
					if (err) return self.log.error(err.message);
					self.log.debug('pandoc(finish');
				}
			);
		},
		'page:before': function (page) {
			const self = this;

			helper.pandocCompile(page.path, (err, result) => {
				if (err) return self.log.error(err.message);

				helper.writeOutput(page.path, result);
			});
		}
	}
};
