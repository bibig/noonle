var assert = require('assert');
var Yi = require('../lib/yi');

describe('test left() and right() of string', function() {

	it('check left(str, i)', function() {
		var s = 'hello,world';
		assert.equal(Yi.left(s, 5), 'hello');
	});
	
	it('check left(str, -i)', function() {
		var s = 'hello,world';
		assert.equal(Yi.left(s, -5), 'world');
	});

	it('check right(str, i)', function() {
		var s = 'hello,world';
		assert.equal(Yi.right(s, 5), 'world');
	});
	
	it('check right(str, -i)', function() {
		var s = 'hello,world';
		assert.equal(Yi.right(s, -5), 'hello');
	});

});