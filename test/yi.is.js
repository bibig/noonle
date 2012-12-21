var assert = require('assert');
var Yi = require('../lib/yi');

describe('test YI.isXXX', function() {

	it('variable isUndefined without value ', function() {
		var v;
		assert.ok( Yi.isUndefined(v));
	});
	
	it('variable isNull without value', function() {
		var v;
		assert.ok( Yi.isNull(v));
	});
	
	it(' if variable = "", then v isNotNull', function() {
		var v = '';
		assert.ok( Yi.isNotNull(v));
	});
	
});