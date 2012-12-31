var assert = require('assert');
var should = require('should');
var css = require('../lib/cssFilter');


describe('test filters', function() {

	it('normal selector check', function() {
		var cssStr = 'body{color:#fff;background:#000}';
		var checked = css.filter(cssStr, {'body' : '*'}, true);
		checked.should.equal('body{color:#fff;background:#000}');
	});
	
	it('son selector check', function() {
		var cssStr = 'body valid-son{color:#fff;  background:#000}';
		var checked = css.filter(cssStr, {'body valid-son' : '*' }, true);
		checked.should.equal('body valid-son{color:#fff;background:#000}');
	});
	
	it('`body, body xxx` check', function() {
		var cssStr = 'body, body xxx{color:#fff; background:#000}';
		var checked = css.filter(cssStr, {'body' : '*', 'body xxx' : false}, true);
		checked.should.equal('body{color:#fff;background:#000}');
	});
	
	
	it('property check', function() {
		var cssStr = 'body, body xxx{color:#fff; background:#000; font-size: 12em; font-weight: bold;}';
		var checked = css.filter(cssStr, {'body' : 'font, color' }, true);
		checked.should.equal('body{color:#fff;font-size:12em;font-weight:bold}body xxx{color:#fff;font-size:12em;font-weight:bold}');
	});
	
});
