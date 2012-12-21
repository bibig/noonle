exports.index = index;
exports.read = read;
exports.create = create;
exports.save = saveCreate;
exports.update = saveEdit;
exports.set = saveSet;
// exports.test = test;

var Yi = require('../lib/yi')
  , Node = require('../models/node')
  , sanitizer = require('sanitizer')
  , form = require('../lib/form')
  , load = require('../lib/load')
  , authorize = require('../lib/authorize')
  , validator = require('../lib/common_validator');
 
 
/**
 * create new `Node`.
 * will generate a random string as the new node id, then redirect to the node read url.
 * the random string should be promise to be a new one.
 * 8 length is a good choice. 
 */
function create (req, res) {
	//console.log('ready to create new node:' + id);
	res.redirect('/create/' + Yi.randomString(8));
}; 

/**
 *  define the default node for whole site.
 *  all contents in the site are driven by itself, even the first page.
 *  including `about` page, `doc` page, `help` page etc.
 */
function index (req, res, next) {
	res.redirect('/index');
}

/**
 * render the node read page
 * after app.params() middlewares processed.
 * it's authorized and fetched the data from db.
 */
function read (req, res, next) {
	var moment = require('moment');
	var parser;
	var node = load.fetch(req, 'node');
	// console.log('ready to read node: ' + node.id);
	// console.log(node);
	switch (node.format) { 
		case 1: //marked
			// console.log('ready using marked');
			parser = require("marked");
			break;
		default: // bbcode
			// console.log('ready using bbcode');
			parser = require("bbcode");
			break;
	}
	moment.lang('zh-CN');
	res.render('layouts/default/node', { 
		title: node.title,
		isAdmin: authorize.isAdmin(req),
		node: {
			id: node.id,
			hit: node.hit,
			isFrozen: node.isFrozen,
			title: sanitizer.escape(node.title),
			content: parser.parse(sanitizer.sanitize(node.content, function (u) { return u;})),
			created: moment(node.created).format('LLL'),
			modified: (node.created < node.modified ? moment(node.modified).calendar() : null),
			pages: node._pages
		}
	});
	
};

/**
 * save the new created node
 */
function saveCreate (req, res) {
	var data = req.body.entity;
	data['id'] = load.fetch(req, 'node', 'id');
	if (req.validator.pass()) {
		Node.create(data, function (err, node) {
			if (err) {
				console.log('save failed!');
			} else {
				res.redirect('/' + node.id);
			}
		});
	} else {
		form.node(req, res);
	}
};

/**
 * save node content after edit.
 */
function saveEdit (req, res, next) {
	var id = load.fetch(req, 'node', 'id');
	if (req.validator.pass()) {
		Node.saveContent(id, req.body.entity, function (err) {
			if (err) {
				next(err);
			} else {
				res.redirect('/' + id);
			}
		});
	} else {
		form.node(req, res);
	}
};

/**
 * save the settings for node.
 * if node id changed, should ensure the new id does not exist.
 * if readPassword or adminPassword changed, the corresponding cookie will reset.
 * coz the author don't need authorize again.
 */
function saveSet (req, res, next) {
	var srcId = load.fetch(req, 'node', 'id');
	var data = req.body.node;
	var id = data.id;
	var isIdChanged = (srcId != id);
	var callback = function (err) {
		if (err) {
			next(err);
		} else {
			if (isIdChanged) { // the url changed
				authorize.clearReadCookie(res, srcId);
				authorize.clearAdminCookie(res, srcId);
			}

			if ( data.readPassword != '') {
				authorize.saveReadCookie(res, id, data.readPassword);
			} else {
				authorize.clearReadCookie(res, id);
			}
			
			if ( data.adminPassword != '') {
				authorize.saveAdminCookie(res, id, data.adminPassword);
			} else {
				authorize.clearAdminCookie(res, id);
			}
			
			res.redirect('/' + id);
		}
	};
	var renderFormForInvalidId = function () { 
		req.validator.addError('id', '此id已经被占用了');
		form.node(req, res); 
	};
	
	var saveCb = function () { 
		Node.saveSettings(data._id, data, callback);
	};
	
	
	if (req.validator.pass()) {
		if (isIdChanged) {
			validator.ifNodeIdExistWhenChange(id, renderFormForInvalidId, saveCb);
		} else {
			saveCb();
		}
	} else {
		form.node(req, res);
	}
	
};
