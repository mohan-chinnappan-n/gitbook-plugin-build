'use strict';

const path = require('path');
const fs = require('fs');
const argv = require('yargs').argv;
const merge = require('merge');

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
				summary.push(
					merge.recursive(article, {
						srcPath: article.path,
						path: helper.getRelOutput(article.path)
					})
				)
			});
		},
		finish: function () {
			const self = this;
			const mainPath = helper.getMainFile();

			// Write main file.
			this.log.debug('padoc(build main file):', mainPath);

			helper.writeOutput(
				mainPath,
				helper.renderTemp("main", {summary: summary})
			);
		},
		page: function (page) {
			const self = this;

			helper.pandocCompile(page.content, 'html', (err, content) => {
				if (err) return self.log.error(err.message);

				helper.writeOutput(
					page.path,
					helper.renderTemp("content", {content})
				);
			});

			return page;
		}
	}
};
