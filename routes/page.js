exports.read = read;
exports.create = create;
exports.save = saveCreate;
exports.update = saveEdit;
exports.set = saveSet;


var Yi = require('../lib/yi')
  , sanitizer = require('sanitizer')
  , load = require('../lib/load')
  , form = require('../lib/form')
  , style = require('../lib/style')
  , authorize = require('../lib/authorize')
  , validator = require('../lib/common_validator')
  , Page = require('../models/page');

function read (req, res, next) {

	var node = load.fetch(req, 'node');
	var page = load.fetch(req, 'page');
	var moment = require('moment');
	var parser;
	
	// console.log('node.format:' + node.format);
	switch (page.format) { 
		case 1: //marked
			// console.log('ready using marked');
			parser = require("marked");
			break;
		default: // bbcode
			// console.log('ready using bbcode');
			parser = require("bbcode");
			break;
	}
	
	moment.lang('zh-cn');
	res.render('layouts/default/page', { 
		title: page.title,
		isAdmin: authorize.isAdmin(req),
		design: style.css(req),
		page: {
			id: page.id,
			node: node,
			hit: page.hit,
			title: sanitizer.escape(page.title),
			content: parser.parse(sanitizer.sanitize(page.content, function (u) { return u;})),
			created: moment(page.created).format('LLL'),
			modified: (page.created < page.modified ? moment(page.modified).calendar() : null)
		}
	});
	
};

function create (req, res) {
	// res.redirect('/' + load.fetch(req, 'node', 'id') + '/' + Yi.randomString(4));
	var id = load.fetch(req, 'node', 'pageCount') + 1;
	res.redirect('/' + load.fetch(req, 'node', 'id') + '/' + id);
};

function saveCreate (req, res) {
	var node = load.fetch(req, 'node');
	var data = req.body.entity;
	data['id'] = load.fetch(req, 'page', 'id');
	
	if (req.validator.pass()) {
		Page.create(node, data, function (err, page) {
			if (err) {
				console.log('save failed!');
			} else {
				res.redirect('/' + node.id + '/' + page.id);
			}
		});
	} else {
		form.page(req, res);
	}
	
};

function saveEdit (req, res) {
	// console.log(data);
	if (req.validator.pass()) {
		Page.saveContent(load.fetch(req, 'page', '_id'), req.body.entity, function (err) {
			if (err) {
				console.log('save failed!');
			} else {
				res.redirect('/' + load.fetch(req, 'node', 'id') + '/' + load.fetch(req, 'page', 'id'));
			}
		});
	} else {
		form.page(req, res);
	}
};

function saveSet (req, res, next) {
	var nid = load.fetch(req, 'node', 'id');
	var srcId = load.fetch(req, 'page', 'id');
	var data = req.body.page;
	var id = data.id;
	var isIdChanged = (srcId != id);
	var callback = function (err) {
		console.log('im in saveSettings callback'); 
		if (err) {
			next(err);
		} else {
			res.redirect('/' + nid + '/' + id);
		}
	};
	var renderFormForInvalidId = function () { 
		req.validator.addError('id', '此id已经被占用了');
		form.page(req, res); 
	};
	var saveCb = function () { 
		// console.log('im in saveCb'); 
		Page.saveSettings(data._id, data, callback);
	};
	
	if (req.validator.pass()) {
		if (isIdChanged) {
			validator.ifPageIdExistWhenChange(data._id, id, renderFormForInvalidId, saveCb);
		} else {
			saveCb();
		}
	} else {
		form.page(req, res);
	}
	
};