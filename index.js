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
                	merge.recursive( article,{
                		path :
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
				helper.renderTemp("main", {summary})
			);
		},
		'page:before': function (page) {
			const self = this;

			helper.pandocCompileFile(page.path, (err, content) => {
				if (err) return self.log.error(err.message);

				helper.writeOutput(
					page.path,
					helper.renderTemp("content", {content})
				);
			});
		}
	}
};
