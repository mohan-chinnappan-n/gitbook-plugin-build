'use strict';

const path = require('path');
const pdc = require('pdc');
const fse = require('fs-extra');
const fs = require('fs');
const merge = require('merge');
const argv = require('yargs').argv;

let outputPath;
let index = {
	summary: [],
	body: ''
};
let config = {
	"bin": "pandoc",
	"args": [],
	"opts": {},
	"output": {
		"path": "../build/book/latex",
		"format": "latex",
		"ext": ".tex",
		"index": "index.tex"
	}
};

/**
 * Get pandoc compiler type.
 * @param filePath
 * @returns {*}
 */
function getPandocType(filePath) {
	const fileObj = path.parse(filePath);
	return {
		'.md': 'markdown',
		'.adoc': 'asciidoc'
	}[fileObj.ext]
}

/**
 * Compile file from dir.
 * @param fromPath
 * @param config
 * @param cb (err,data)
 */
function pandocCompile(fromPath, config, cb) {

    config.type = getPandocType(fromPath);

	fs.readFile(fromPath, 'utf-8', (err, data) => {
		if (err) return cb(err);

		pdc(data, config.type, config.output.format, config.args || [], config.opts || {}, (err, result) => {
			if (err) return cb(err);

			cb(null, result);
		});
	});
}

module.exports = argv.pandoc !== true ? {} : {
	hooks: {
		init: function () {
			const self = this;

			// Set config with override
			config = merge.recursive(
				config,
				this.options.pluginsConfig.pandoc
			);

			// Set output path
			outputPath = this.book.resolve(config.output.path);

			// Remove output folder
			this.log.debug('pandoc(delete folder):', outputPath);
			fse.removeSync(outputPath);

			// Fill index object with summary file
			this.book.summary.walk((article) => {
				const articlePath = this.book.resolve(article.path);

				pandocCompile(articlePath, config, (err, result) => {
					if (err) return self.log.error(err.message);

					index.summary.push(article);
					index.body += result;

				});
			});
		},
		finish: function () {
			const self = this;

			// Write index file base on index object
			const indexPath = path.join(outputPath, config.output.index || 'index.tex');
			this.log.debug('padoc(build file):', path.join(config.output.path, indexPath));
			fse.outputFile(indexPath, index.body, (err) => {
					if (err) return self.log.error(err.message);
				}
			);
		},
		'page:before': function (page) {
			const self = this;
			const outObj = path.parse(
				path.join(outputPath, page.path)
			);

			this.log.debug('padoc(build file):', path.join(config.output.path, page.path.replace(outObj.ext, config.output.ext)));

			pandocCompile(page.rawPath, config, (err, result) => {
				if (err) return self.log.error(err.message);

				fse.mkdirp(outObj.dir, (err) => {
					if (err) return self.log.error(err.message);

					fse.outputFile(path.join(outObj.dir, `${outObj.name}${config.output.ext}`), result, (err) => {
						if (err) return self.log.error(err.message);
					});
				});
			});
		}
	}
};
