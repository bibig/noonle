

var Yi = require('../lib/yi');
var assert = require('assert');
var should = require('should');



describe('Testing Validator', function () {

	var validator = Yi.validator();
	var isValid = validator.isValid;
	
	it ('check initialization status', function () {
		validator.pass().should.be.ok;
		should.exist(validator.getErrors());
		should.not.exist(validator.getErrors('email'));
		validator.getErrors().should.eql({});
		validator.getErrorCount().should.equal(0);
	});
	
	it('check isEmail', function () {
		isValid.check('imnotemail', 'email|不是Email').isEmail();
		validator.getErrors('email').should.equal('不是Email');
		
	});
	
	it('check regex', function () {
		isValid.check('abcdefghijklmnopzrtsuvqxyz', 'name|非法').is(/^[a-z]+$/);
		isValid.check('imnotemail2', 'email2|不是Email').isEmail();
		validator.getErrorCount().should.equal(2);
		validator.pass().should.not.be.ok;
	});
	
});