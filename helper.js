'use strict';

const merge = require('merge');
const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');
const pdc = require('pdc');
const assert = require('assert');
const ejs = require('ejs');

class Helper {

	constructor() {
		this._srcResolve = null;
		this.config = null;
		this.log = null;
	}

	init(ctx) {
		// Set labels
		this._srcResolve = ctx.book.resolve;
		this.log = ctx.log;
		this.config = merge.recursive({
			"bin": "pandoc",
			"args": [],
			"opts": {},
			"templates": {
				"main": "_layouts/main.tex",
				"content": "_layouts/content.tex"
			},
			"output": {
				"path": "../build/book/latex",
				"format": "latex",
				"ext": ".tex",
				"main": "main"
			}
		}, ctx.options.pluginsConfig.pandoc);

		// Test labels
		const re = new RegExp("^[a-zA-Z-._d,s]+$");
		assert(re.test(this.config.output.main), `pandoc.output.main: does not match pattern "${re.source}"`);
	}

	renderTemp(name, config) {
		return ejs.render(
			fs.readFileSync(this.getSrc(this.config.templates[name]), 'utf-8'),
			config
		)
	}

	getRelOutput(...paths) {
		return this.getOutput(...paths).replace(`${this.getOutput()}/`, '');
	}

	getOutput(...paths) {
		const fileObj = path.parse(
			this.getSrc(this.config.output.path, ...paths)
		);
		return `${fileObj.dir}/${fileObj.name}${fileObj.ext ? this.config.output.ext : ''}`;
	}

	getSrc(...paths) {
		return this._srcResolve(
			path.join(...paths)
		);
	}

	getMainFile() {
		return `./${this.config.output.main}${this.config.output.ext}`;
	}

	writeOutput(filePath, content) {
		const self = this;
		const outputPath = this.getOutput(filePath);

		this.log.debug('padoc(build file):', outputPath);

		fse.mkdirp(path.parse(outputPath).dir, (err) => {
			if (err) return self.log.error(err.message);

			fse.outputFile(outputPath, content, (err) => {
				if (err) return self.log.error(err.message);
			});
		});
	}

	rmOutputDir() {
		this.log.debug('pandoc(delete dir):', this.getOutput());
		fse.removeSync(this.getOutput());
	}

	pandocCompile(string, srcLang, cb) {
		pdc(string,
			srcLang,
			this.config.output.format,
			this.config.args,
			this.config.opts,
			(err, result) => {
				if (err) return cb(err);

				cb(null, result);
			});
	}

}

module.exports = new Helper();
