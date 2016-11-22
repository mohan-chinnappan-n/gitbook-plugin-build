'use strict';

const tester = require('gitbook-tester');
const path = require('path');
const fs = require('fs');

/**
 * @test module:index
 */
describe('gitbook-plugin-build', () => {

	const pluginPath = path.join(__dirname, '../..');

	beforeEach(() => {
		this.write = sinon.stub(fs,'writeFileSync');
	});

	afterEach(() => {
		this.write.restore();
	});

	it('should compile standalone latex by default', (done) => {
		tester.builder()
			.withContent('# Header')
			.withLocalPlugin(pluginPath)
			.create()
			.then(function (result) {
				expect(result.get('second.html').content).toEqual('<p>Second page content</p>');
			})
			.fin(done)
			.done();
	});
});
