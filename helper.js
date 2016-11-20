'use strict';

const merge = require('merge');
const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');
const pdc = require('pdc');

class Helper {

	static getPandocType(filePath) {
		const fileObj = path.parse(filePath);
		return {
			'.md': 'markdown',
			'.adoc': 'asciidoc'
		}[fileObj.ext]
	}

	constructor() {
		this._srcResolve = null;
		this.config = null;
		this.log = null;
	}

	init(ctx) {
		this._srcResolve = ctx.book.resolve;
		this.log = ctx.log;
		this.config = merge.recursive({
			"bin": "pandoc",
			"args": [],
			"opts": {},
			"output": {
				"path": "../build/book/latex",
				"format": "latex",
				"ext": ".tex",
				"main": "main"
			}
		}, ctx.options.pluginsConfig.pandoc);
	}

	getOutput(...paths) {
		const fileObj = path.parse(
			this.getSrc(this.config.output.path, ...paths)
		);
		return `${fileObj.dir}/${fileObj.name}${fileObj.ext}`;
	}

	getSrc(...paths) {
		return this._srcResolve(
			path.join(...paths)
		);
	}

	getOutputMain() {
		return this.getOutput(`${this.config.output.main}.${this.config.output.ext}`);
	}

	writeOutput(filePath, content) {
		const self = this;

		const fileObj = path.parse(filePath);

		this.log.debug('padoc(build file):', this.getOutput(filePath));
		fse.mkdirp(filePath, (err) => {
			if (err) return self.log.error(err.message);

			fse.outputFile(self.getOutput(fileObj.dir, `${fileObj.name}${this.config.output.ext}`), content, (err) => {
				if (err) return self.log.error(err.message);
			});
		});
	}

	rmOutputDir() {
		this.log.debug('pandoc(delete dir):', this.getOutput());
		fse.removeSync(this.getOutput());
	}

	/**
	 * Compile file.
	 * @param filePath relative path from src
	 * @param cb
	 */
	pandocCompile(filePath, cb) {

		const fromPath = this.getSrc(filePath);

		fs.readFile(fromPath, 'utf-8', (err, data) => {
			if (err) return cb(err);

			pdc(data,
				Helper.getPandocType(fromPath),
				this.config.output.format,
				this.config.args,
				this.config.opts,
				(err, result) => {
					if (err) return cb(err);

					cb(null, result);
				});
		});
	}

}

module.exports = new Helper();
