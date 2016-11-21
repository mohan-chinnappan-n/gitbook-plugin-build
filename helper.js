'use strict';

const merge = require('merge');
const fs = require('fs');
const path = require('path');
const pdc = require('pdc');
const assert = require('assert');
const ejs = require('ejs');

class Helper {

	constructor() {
		this.getSrc = null;
		this.config = null;
		this.log = null;
	}

	init(ctx) {
		// Set labels
		this.getSrc = ctx.book.resolve;
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
				"path": "../build/book/latex/main.tex",
				"format": "latex"
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

	getOutput() {
		const fileObj = path.parse(
			this.getSrc(this.config.output.path)
		);
		return `${fileObj.dir}/${fileObj.name}${fileObj.ext ? this.config.output.ext : ''}`;
	}

	pandocCompile(string, cb) {
		const args = this.config.args
			.concat(['--standalone'])
			.filter((v, i, a) => a.indexOf(v) === i);

		pdc(string,
			'html',
			this.config.output.format,
			args,
			this.config.opts,
			(err, result) => {
				if (err) return cb(err);

				cb(null, result);
			});
	}
}

module.exports = new Helper();
