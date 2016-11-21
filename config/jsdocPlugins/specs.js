'use strict';

var path = require('path');
var fs = require('fs');

/**
 * @overview Generate specification list from source code inline comments.
 * @module plugins/specs
 * @author Uros Jarc <https://github.com/urosjarc>
 */

exports.handlers = {
	newDoclet: function (e) {
		var meta = e.doclet.meta;
		var description = e.doclet.description;
		var sourceString = '';
		var sourceLines = [];
		var commentsArr = [];
		var fileContent;

		if (typeof description === 'string' && meta.path && meta.filename) {
			// Set sourceString
			fileContent = fs.readFileSync(
				path.join(meta.path || '.', meta.filename),
				'utf-8'
			);

			// Set sourceLines
			for (var i = meta.range[0]; i < meta.range[1]; i += 1) {
				sourceString += fileContent[i];
			}
			sourceLines = sourceString.split('\n');

			// Set commentsArr
			sourceLines.forEach(function (sourceLine) {
				if (sourceLine.indexOf('//') !== -1) {
					commentsArr.push(sourceLine.split('//')[1]);
				}
			});

			// Set new description if commentsArr is full
			if (commentsArr.length > 0) {
				description += '\n<b>Specs:</b>\n<ol>\n';
				for (var k = 0; k < commentsArr.length; k += 1) {
					description += '<li>' + commentsArr[k] + '</li>\n';
				}
				description += '</ol>';
			}

			e.doclet.description = description; // eslint-disable-line no-param-reassign
		}
	}
};
