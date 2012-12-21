var assert = require('assert');
var should = require('should');
var db = require('../models/db');
var Node = require('../models/node');
var Page = require('../models/page');
var node;
var page;

describe('Testing Page Model', function () {
	
	it('create node for test', function (done) {
		console.log('ready to create node');
		Node.create({ id: 'nodeid', title: 'im node', content: 'node content', format: 0 }, function (err, n) {
			if (err) throw err;
			node = n;
			done();
		});
	});
	
	it('should save without error', function (done){
		Page.create({ id: 'pageid', title: 'im page', content: 'page content', format: 0, nid: node.id }, function (err, p) {
			if (err) throw err;
			page = p;
			done();        
		});
    });
    
    
    it('should have a title',function () {
	  	page.should.have.property('title', 'im page');
	});
	
	it('should have a content',function () {
	  	page.should.have.property('content', 'page content');
	});
	
	it('should have a id',function () {
	  	page.should.have.property('id', 'pageid');
	});
	
	it('should have a _node',function () {
	  	page.should.have.property('_node');
	});
	
	it('page._node should be correct',function () {
		assert.ok(page._node instanceof require('mongoose').Types.ObjectId);
		assert.ok(node._id instanceof require('mongoose').Types.ObjectId);
		page._node.should.eql(node._id);
	});
	
	
	it('should have created',function () {
	  	page.should.have.property('created');
	});
	
	it('should have modified',function () {
	  	page.should.have.property('modified');
	});
	
	it('should have hit count', function () {
		page.should.have.property('hit', 0);
	});
	
	it('should have a format',function () {
	  	node.should.have.property('format', 0);
	});
    
    it('find the node for test', function (done) {
		db.Node.findById(page._node, function (err, n) {
			if (err) throw err;
			node = n;
			done();
		});
	});
    
    it('node should increment pageCount', function () {
    	node.pageCount.should.equal(1);
    });

	it('node should include the page._id', function () {
		node._pages.indexOf(page._id).should.not.equal(-1);
    });
		
	it('remove test page', function(done) {
		console.log(node._id);
		console.log('ready to remove page');
		Page.remove(page, function (err, n) {
			if (err) throw err;
			done();
		});
	});

	 it('find the node again', function (done) {
		db.Node.findById(page._node, function (err, n) {
			if (err) throw err;
			node = n;
			done();
		});
	});
    
    
    it('node should decrement pageCount', function () {
    	node.pageCount.should.equal(0);
    });

	it('node should delete the page._id', function () {
		node._pages.indexOf(page._id).should.equal(-1);
    });
    
    it('create pages again for next test', function (done){
		Page.create({ id: 'pageid1', title: 'im page', content: 'page content', format: 0, nid: node.id }, function (err, p) {
			if (err) throw err;
			done();        
		});
    });

    it('create pages again for next test', function (done){
		Page.create({ id: 'pageid2', title: 'im page', content: 'page content', format: 0, nid: node.id }, function (err, p) {
			if (err) throw err;
			done();        
		});
    });

    it('create pages again for next test', function (done){
		Page.create({ id: 'pageid3', title: 'im page', content: 'page content', format: 0, nid: node.id }, function (err, p) {
			if (err) throw err;
			done();        
		});
    });
	
	it('remove test node', function(done) {
		console.log('ready to remove the node');
		Node.remove(node.id, function (err) {
			if (err) throw err;
			done();
		});
	});
	
	it('the node must be deleted', function (done) {
		db.Node.count({_id: node._id}, function (err, count) {
			console.log('count over');
			if (err) throw err;
			count.should.equal(0);
			done();
		});
	});
	
	it('should delete all pages when delete the node', function (done) {
		console.log('now node._id:' + node._id);
		db.Page.count({_node: node._id}, function (err, count) {
			console.log('count over');
			if (err) throw err;
			count.should.equal(0);
			done();
		});
	});
	
	
});