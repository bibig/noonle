var assert = require('assert');
var should = require('should');
var Node = require('../models/node');
var node;

describe('Testing Node Model', function () {

	describe('Creating a new node', function(){
		
		it('should save without error', function(done){
			Node.create({ id: 'test123', title: 'test', content: '中文', format: 0 }, function (err, n) {
				if (err) throw err;
				node = n;
				done();        
			});
		});
		
		it('should have a title',function () {
			node.should.have.property('title', 'test');
		});
		
		it('should have a content',function () {
			node.should.have.property('content', '中文');
		});
		
		it('should have a id',function () {
			node.should.have.property('id', 'test123');
		});
		
		it('should have created',function () {
			node.should.have.property('created');
		});
		
		it('should have modified',function () {
			node.should.have.property('modified');
		});
		
		it('should have pageCount',function () {
			node.should.have.property('pageCount', 0);
		});
		
		it('should have _pages',function () {
			node.should.have.property('_pages');
			node._pages.length.should.equal(0);
		});
		
		it('should have hit count', function () {
			node.should.have.property('hit', 0);
		});
		
		it('should have size', function () {
			node.should.have.property('size', 2);
		});
		
		it('should have a format',function () {
			node.should.have.property('format', 0);
		});
		
	});
	
	describe('read node', function () {
		it('should increment hit by 1 when read it', function (done) {
			// console.log('node.id:' + node.id);
			Node.read(node.id, true, function (err, n) {
				n.hit.should.eql(1);
				done();
			});
		
		});
	});
	
	describe('edit node', function () {
		it('should save without error', function (done) {
			var data = {
				title: 'hello again',
				content: node.content,
				format: 0
			};
			
			Node.saveContent(node.id, data, function (err) {
				Node.read(node.id, function (err, n) {
					n.title.should.eql(data.title);
					done();
				});
			});
		});
	});
	
	describe('set node', function () {
		it('should save without error', function (done) {
			var data = {
				id: 'test1234',
				email: 'abc@abc.com',
				readPassword: '111',
				adminPassword: '123'
			};
			
			Node.saveSettings(node._id, data, function (err) {
				Node.read(data.id, function (err, n) {
					n.id.should.eql(data.id);
					n.email.should.eql(data.email);
					n.readPassword.should.eql(data.readPassword);
					n.adminPassword.should.eql(data.adminPassword);
					done();
				});
			});
		});
	});
	
	
	describe('check after set node', function () {
		it('old id should not exist', function (done) {
			Node.exists(node.id, function (err, yesOrNo) {
				yesOrNo.should.be.false;
				done();
			});
		});
	});
	
	describe('remove node', function () {
		it('should remove without error', function(done){
			node.remove(function (err, n) {
				if (err) throw err;
				done();
			});
		});
	});
	
});

