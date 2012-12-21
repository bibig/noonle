var assert = require('assert');
var Yi = require('../lib/yi');


describe('test Yi.randomString', function() {

	it('check length of string', function() {
		var ok = true;
		for (var i = 1; i <= 100; i++) {
			var rs = Yi.randomString(i);
			if (rs.length !== i) {
				ok = false;
				break;
			}
		}
		assert.ok(ok);
	});
	
	// chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	it('may generate the first char in 1000 times', function () {
		var ok = false;
		for (var i = 0; i <= 1000; i++) {
			var rs = Yi.randomString(8);
			if (rs.indexOf('0')) {
				ok = true;
				break;
			}
		}
		assert.ok(ok);
	});
	
	it('may generate the last char in 1000 times', function () {
		var ok = false;
		for (var i = 0; i <= 1000; i++) {
			var rs = Yi.randomString(8);
			if (rs.indexOf('z')) {
				ok = true;
				break;
			}
		}
		assert.ok(ok);
	});
	
	it('calling without param', function () {
		var rs = Yi.randomString();
		assert.ok(typeof rs === 'string');
	});
	
});
