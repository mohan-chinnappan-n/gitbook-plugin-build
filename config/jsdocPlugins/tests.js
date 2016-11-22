/*
 eslint-disable no-var, import/no-extraneous-dependencies,
 object-shorthand, func-names, vars-on-top,
 prefer-arrow-callback, prefer-template,
 no-restricted-syntax, guard-for-in, no-loop-func
 */

'use strict';

var fs = require('fs');
var path = require('path');
var logger = require('jsdoc/util/logger'); // eslint-disable-line import/no-unresolved

/**
 * @overview Generate specification list from source code inline comments.
 * @module plugins/tests
 * @author Uros Jarc <https://github.com/urosjarc>
 */

var allDoclets = {};
var testDoclets = {};

exports.handlers = {
	newDoclet: function (e) {
		var meta = e.doclet.meta;
		var description = e.doclet.description;

		if (typeof description === 'string' && meta.path && meta.filename) {
			allDoclets[e.doclet.longname] = e;
		}
	},

	parseComplete: function () {
		var testDescription;
		var meta;
		var e;
		var fileContent;
		var srcString;
		var srcArr;
		var description;
		var errorMsg = [];
		var testKeys = Object.keys(testDoclets);

		// Add descriptions
		for (var i in testDoclets) {
			testDescription = [];
			meta = testDoclets[i].meta;
			e = allDoclets[i];

			// Set sourceString
			fileContent = fs.readFileSync(
				path.join(meta.path || '.', meta.filename),
				'utf-8'
			);

			// Set sourceLines
			srcString = '';
			for (var j = meta.range[0]; j < meta.range[1]; j += 1) {
				srcString += fileContent[j];
			}

			srcArr = srcString.split('\n');
			for (var k in srcArr) {
				if (/^\s*it\s*\(/.test(srcArr[k])) {
					testDescription.push(
						srcArr[k]
							.replace(/^\s*it\s*\(\s*('|")/, '')
							.replace(/('|")\s*,\s*.*$/, '')
					);
				}
			}

			// Set new description if commentsArr is full
			description = '\n<b>Tests:</b>\n<ol>\n';
			testDescription.forEach(function (test) {
				description += '<li>' + test + '</li>\n';
			});
			description += '</ol>';

			try {
				e.doclet.description = description;
			} catch (err) {
				throw new Error(JSON.stringify(meta, null, 4));
			}
		}

		// Test coverage
		Object.keys(allDoclets).forEach(function (name) {
			if (testKeys.indexOf(name) === -1) {
				errorMsg.push(' > ' + name);
			}
		});

		if (errorMsg.length > 0) {
			logger.error('Test missing on:\n' + errorMsg.join('\n'));
		}
	}
};

exports.defineTags = function (dictionary) {
	dictionary.defineTag('test', {
		mustHaveValue: true,
		onTagged: function (doclet, tag) {
			testDoclets[tag.value] = doclet;
		}
	});
};
