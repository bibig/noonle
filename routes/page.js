exports.read = read;
exports.create = create;
exports.save = saveCreate;
exports.update = saveEdit;
exports.set = saveSet;
exports.saveCss = saveCss;
exports.remove = remove;


var Yi = require('../lib/yi')
  // , sanitizer = require('sanitizer')
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
	
	switch (require('i18n').getLocale()) {
		case 'cn':
			moment.lang('zh-cn');
			break;		
	}
	
	res.render('desktop/page', { 
		title: page.title,
		isAdmin: authorize.isAdmin(req),
		page: {
			id: page.id,
			node: node,
			// hit: page.hit,
			// title: sanitizer.escape(page.title),
			// content: parser.parse(sanitizer.sanitize(page.content, function (u) { return u;})),
			title: page.title,
			content: parser.parse(page.content),
			// created: moment(page.created).format('LLL'),
			// modified: (page.created < page.modified ? moment(page.modified).calendar() : null),
			// modified: moment(node.modified).format('LLL'),
			modified: moment(page.modified).fromNow(),
			editCount: page.editCount,
			safeCss: page.safeCss
		},
		messages: req.flash('messages')
	});
	
}

function create (req, res) {
	// res.redirect('/' + load.fetch(req, 'node', 'id') + '/' + Yi.randomString(4));
	var id = load.fetch(req, 'node', 'pageCount') + 1;
	res.redirect('/' + load.fetch(req, 'node', 'id') + '/' + id);
}

function saveCreate (req, res) {
	var node = load.fetch(req, 'node');
	var data = req.body.entity;
	data['id'] = load.fetch(req, 'page', 'id');
	
	if (req.validator.pass()) {
		Page.create(node, data, function (err, page) {
			if (err) {
				console.log('save failed!');
			} else {
				req.flash('messages', {
					type: 'success', 
					title: __("Here's your new page"), 
					content: __('To change it, just press the edit button at the bottom of the page. Enjoy!')
				});
				res.redirect('/' + node.id + '/' + page.id);
			}
		});
	} else {
		form.page(req, res);
	}
	
}

function saveEdit (req, res, next) {
	// console.log(data);
	var page = load.fetch(req, 'page');
	var data = req.body.entity;
	
	function redirect () {
		res.redirect('/' + load.fetch(req, 'node', 'id') + '/' + page.id);
	}
	
	if (req.validator.pass()) {
		if (page.title != data.title || page.content != data.content || page.format != data.format) {
			data.editCount = page.editCount + 1;
			data.modified = Date.now();
		
			Page.saveContent(page._id, data, function (err) {
				if (err) {
					// console.log('save failed!');
					return next(err);
				} else {
					req.flash('messages', {
						type: 'success', 
						title: __("content edit successfully")
					});
					redirect();
				}
			});
		} else {
			redirect();
		}
	} else {
		form.page(req, res);
	}
}

function saveSet (req, res, next) {
	var node = load.fetch(req, 'node');
	var page = load.fetch(req, 'page');
	var data = req.body.page;
	var id = data.id;
	var isIdChanged = (page.id != id);
	var callback = function (err) {
		if (err) {
			next(err);
		} else {
			req.flash('messages', {
				type: 'success', 
				title: __("settings update successfully")
			});
			res.redirect('/' + node.id + '/' + id);
		}
	};
	var renderFormForInvalidId = function () {
		req.validator.addError('id', __('sorry, the id is occupied'));  // '此id已经被占用了'
		form.page(req, res); 
	};
	var saveCb = function () { 
		// console.log('im in saveCb'); 
		Page.saveSettings(page._id, data, callback);
	};
	
	if (req.validator.pass()) {
		if (isIdChanged) {
			validator.ifPageIdExistWhenChange(node._id, id, renderFormForInvalidId, saveCb, next);
		} else {
			saveCb();
		}
	} else {
		form.page(req, res);
	}
	
}

function saveCss (req, res, next) {
	var page = load.fetch(req, 'page');
	var nid = load.fetch(req, 'node', 'id');
	var extraCss = req.body.page.css;
	// console.log(extraCss);
	// console.log(style.css(extraCss));
	if (req.validator.pass()) {
		Page.saveExtraCss(page._id, extraCss, style.css(extraCss), function (err) {
			if (err) return next(err);
			req.flash('messages', {
				type: 'success', 
				title: __("css update successfully")
			});
			res.redirect('/' + nid + '/' + page.id);
		});
	} else {
		form.node(req, res);
	}
}

function remove (req, res, next) {
	var node = load.fetch(req, 'node');
	var page = load.fetch(req, 'page');
	Page.remove(node, page, function (err) {
		if (err) return next(err);
		req.flash('messages', {
			type: 'success', 
			title: __("page remove successfully")
		});
		res.redirect('/' + node.id);
	});
}