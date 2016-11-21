'use strict';

const merge = require('merge');
const fs = require('fs');
const path = require('path');
const pdc = require('pdc');
const assert = require('assert');
const ejs = require('ejs');
const defaultConfig = require('./config.json');

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
		this.config = merge.recursive( defaultConfig, ctx.options.pluginsConfig.pandoc );

		// Test labels
		const re = new RegExp("^[a-zA-Z-._d,s]+$");
		assert(re.test(this.config.output.main), `pandoc.output.main: does not match pattern "${re.source}"`);
	}

	renderTemp(config) {
        if (fs.existsSync(this.config.template)) {
            return ejs.render(
                fs.readFileSync(this.getSrc(this.config.template), 'utf-8'),
                config
            )
        } else {
            let content = '';
            config.summary.forEach((article) => {
                content += `${article.content}\n`;
            });
            return content;
        }
	}

	getOutput() {
		return this.getSrc(this.config.output.path);
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
