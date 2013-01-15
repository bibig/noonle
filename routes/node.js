exports.index = index;
exports.read = read;
exports.create = create;
exports.save = saveCreate;
exports.update = saveEdit;
exports.set = saveSet;
exports.design = design;
exports.saveDesign = saveDesign;
exports.saveCss = saveCss;
exports.remove = remove;
exports.logout = logout;
// exports.test = test;

var Yi = require('../lib/yi')
  , Node = require('../models/node')
  , Theme = require('../models/theme')
  // , sanitizer = require('sanitizer')
  , form = require('../lib/form')
  , load = require('../lib/load')
  , style = require('../lib/style')
  , authorize = require('../lib/authorize')
  , validator = require('../lib/common_validator')
  , DEFAULT_CSS = 'body{background:#DBE5EB}.paper-title{background:#8c8c8c; color:#fff}.paper-title a{color:#fff}.paper-content {background: #fff; color:#333}.paper-catalog {background: #fff} .paper-catalog a{color:#666}.paper-foot{background-color: #F5F5F5; color: #999}.paper-foot a{color: #999}'
 
/**
 * create new `Node`.
 * will generate a random string as the new node id, then redirect to the node read url.
 * the random string should be promise to be a new one.
 * 8 length is a good choice. 
 */
function create (req, res) {
	//console.log('ready to create new node:' + id);
	res.redirect('/create/' + Yi.randomString(6));
}; 

/**
 *  define the default node for whole site.
 *  all contents in the site are driven by itself, even the first page.
 *  including `about` page, `doc` page, `help` page etc.
 */
function index (req, res, next) {
	res.redirect(load.rootId());
}

/**
 * render the node read page
 * after app.params() middlewares processed.
 * it's authorized and fetched the data from db.
 */
function read (req, res, next) {
	var parser;
	var node = load.fetch(req, 'node');
	// console.log('ready to read node: ' + node.id);
	// console.log(node);
	res.render('desktop/node', { 
		title: node.title,
		isAdmin: authorize.isAdmin(req),
		node: getNodeForRead(node),
		messages: req.flash('messages')
	});
}

function getNodeForRead (node) {
	var moment = require('moment');
	
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
	
	switch (require('i18n').getLocale()) {
		case 'zh':
			moment.lang('zh-cn');
			break;		
	}
	
	return {
		id: node.id,
		hit: node.hit,
		// title: sanitizer.escape(node.title),
		title: node.title,
		safeCss: node.safeCss,
		// content: parser.parse(sanitizer.sanitize(node.content, function (u) { return u;})),
		content: parser.parse(node.content),
		// created: moment(node.created).format('LL'),
		// modified: (node.created < node.modified ? moment(node.modified).calendar() : null),
		// modified: moment(node.modified).format('LLL'),
		modified: moment(node.modified).startOf('hour').fromNow(),
		pages: node._pages,
		pageCount: node.pageCount,
		editCount: node.editCount
	};
}


/**
 * save the new created node
 */
function saveCreate (req, res) {
	var data = req.body.entity;
	data['id'] = load.fetch(req, 'node', 'id');
	data['themeCss'] = DEFAULT_CSS;
	data['safeCss'] = style.css(DEFAULT_CSS);
	
	if (req.validator.pass()) {
		Node.create(data, function (err, node) {
			if (err) {
				console.log('save failed!');
			} else {
				// console.log(node);
				// That was easy!
				// Here's your new site. Be sure to bookmark it so you can find it again. To change it, just press the edit button at the bottom of the page. Enjoy!
				req.flash('messages', {
					type: 'success', 
					title: __("Here's your new node"), 
					content: __('Be sure to bookmark it so you can find it again. To change it, just press the edit button at the bottom of the page. Enjoy!')
				});
				res.redirect('/' + node.id);
			}
		});
	} else {
		form.node(req, res);
	}
}

/**
 * save node content after edit.
 */
function saveEdit (req, res, next) {
	var node = load.fetch(req, 'node');
	var data = req.body.entity;
	
	if (req.validator.pass()) {
		if (node.title != data.title || node.content != data.content || node.format != data.format) { // changed
			data.editCount = node.editCount + 1;
			data.modified = Date.now();
		
			Node.saveContent(node._id, data, function (err) {
				if (err) {
					next(err);
				} else {
					req.flash('messages', {
						type: 'success', 
						title: __("content edit successfully")
					});
					res.redirect('/' + node.id);
				}
			});
		} else {
			res.redirect('/' + node.id);
		}
	} else {
		form.node(req, res);
	}
}

/**
 * save the settings for node.
 * if node id changed, should ensure the new id does not exist.
 * if readPassword or adminPassword changed, the corresponding cookie will reset.
 * coz the author don't need authorize again.
 */
function saveSet (req, res, next) {
	var node = load.fetch(req, 'node');
	var data = req.body.node;
	var id = data.id;
	var isIdChanged = (node.id != id);
	var callback = function (err) {
		if (err) {
			next(err);
		} else {
			if (isIdChanged) { // the url changed
				authorize.clearReadCookie(res, node.id);
				authorize.clearAdminCookie(res, node.id);
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
			
			req.flash('messages', {
				type: 'success', 
				title: __("settings update successfully")
			});
			res.redirect('/' + id);
		}
	};
	
	function renderFormForInvalidId() {
		req.validator.addError('id', __('sorry, the id is occupied'));  // '此id已经被占用了'
		form.node(req, res); 
	}
	
	function saveCb () {
		Node.saveSettings(node._id, data, callback);
	}
	
	if (req.validator.pass()) {
		if (isIdChanged) {
			validator.ifNodeIdExistWhenChange(id, renderFormForInvalidId, saveCb);
		} else {
			saveCb();
		}
	} else {
		form.node(req, res);
	}
	
}


function saveCss (req, res, next) {
	var node = load.fetch(req, 'node');
	var extraCss = req.body.node.css;
	// console.log(req.body.node);
	if (req.validator.pass()) {
		Node.saveExtraCss(node._id, extraCss, style.css(node.themeCss + extraCss), function (err) {
			if (err) return next(err);
			req.flash('messages', {
				type: 'success', 
				title: __("css update successfully")
			});
			res.redirect('/' + node.id);
		});
	} else {
		form.node(req, res);
	}
}

function design (req, res, next) {
	var async = require('async');
	
	function getThemes (callback) {
		Theme.findAll(function (err, themes) {
			if (err) {
				callback(err);
			} else {
				// console.log('find themes!');
				// console.log(load.fetch(req, 'node'));
				form.csrf(req, res);
				callback(null, themes);
			}	
		});	
	}
	function getPatterns (callback) { 
		var local = './public/images/patterns';
		var fs = require('fs');
		fs.readdir(local, function (err, names) {
			if (err) {
				callback(err);
			} else {
				// console.log('find patterns');
				names.splice(0, 1)
				// console.log(names);
				callback(null, names);
			}
		});
	}
	async.parallel([getThemes, getPatterns], function (err, datas) {
		if (err) return next(err);
		
		res.render('desktop/design', {
			isAdmin: authorize.isAdmin(req),
			// current: style.json(req),
			title: __('design node'),
			themes: datas[0],
			patterns: datas[1],
			messages: [], // will include _nodeBox.jade, so it is necessary
			node: getNodeForRead(load.fetch(req, 'node'))
		});
	});
}

function saveDesign (req, res, next) {
	var node = load.fetch(req, 'node');
	var themeCss = req.body.css;
	Node.saveThemeCss(node._id, themeCss, style.css(themeCss + node.extraCss), function (err) {
		if (err) return next(err);
		res.redirect('/' + node.id);
	});
}

function remove (req, res, next) {
	var node = load.fetch(req, 'node');
	Node.remove(node, function (err) {
		if (err) return next(err);
		req.flash('messages', {
			type: 'success', 
			title: __("node remove successfully")
		});
		res.redirect('/');
	})
}

function logout (req, res, next) {
	var nid = load.fetch(req, 'node', 'id');
	authorize.clearAdminCookie(res, nid);
	req.flash('messages', {
		type: 'success', 
		title: __('logout safely')
	});
	res.redirect('/' + nid);
}
