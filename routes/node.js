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
		hasAdminPassword: (node.adminPassword !== ''),
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
	var fs = require('fs');
	
	fs.readdir('./public/images/patterns', function (err, names) {
		if (err) {
			next(err);
		} else {
			// console.log('find patterns');
			names.splice(0, 1)
			// console.log(names);
			form.csrf(req, res);
			res.render('desktop/design', {
				isAdmin: authorize.isAdmin(req),
				// current: style.json(req),
				title: __('design node'),
				// inspired by wufoo design
				templates: [["Gray","#eeeeee","#cccccc","#F5F5F5","#FFFFFF","#FFF7C0"],["Recycled Air","#cfdfc5","#bad4a9","#dde4de","#FFFFFF","#ecf1ea"],["Egg","#ffcc33","#ff9900","#F5F5F5","#FFFFFF","#FFF7C0"],["Orange","#ff6600","#ff9900","#F5F5F5","#ffffff","#FFF7C0"],["Light Green","#669900","#99cc00","#F5F5F5","#FFFFFF","#FFF7C0"],["Dark Green","#006600","#339900","#F5F5F5","#ffffff","#FFF7C0"],["Bluish","#336699","#6699cc","#F5F5F5","#FFFFFF","#FFF7C0"],["Indigo","#333366","#666699","#F5F5F5","#ffffff","#FFF7C0"],["Violet","#663366","#996699","#F5F5F5","#FFFFFF","#FFF7C0"],["Purple","#9933cc","#cc33ff","#F5F5F5","#FFFFFF","#FFF7C0"],["Pink","#ffccff","#ff66cc","#F5F5F5","#FFFFFF","#FFF7C0"],["Red","#990000","#cc0000","#F5F5F5","#FFFFFF","#FFF7C0"],["Ketchup","#af2d00","#cc3300","#F5F5F5","#FFFFFF","#FFF7C0"],["Mustard","#cc9900","#ffcc00","#F5F5F5","#FFFFFF","#FFF7C0"],["Chocolate","#663300","#996633","#F5F5F5","#FFFFFF","#FFF7C0"],["Graphite","#222222","#444444","#F5F5F5","#ffffff","#FFF7C0"],["Summer","#ffff99","#99cc66","#F5F5F5","#FFFFFF","#FFF7C0"],["Firenze","#b64926","#8e2800","#468966","#fff0a5","#ffb03b"],["Flower Shop","#90ad4b","#c9d787","#ff844b","#FFFFFF","#ffcc5c"],["Japanese Garden","#382513","#284907","#363942","#d8caa8","#5c832f"],["Cubicle Blue","#193441","#3e606f","#91aa9d","#fcfff5","#d1dbbd"],["Pistachio","#677e52","#b7ca79","#89725b","#f6e8b1","#b0cc99"],["Citrus","#f0e14c","#ffbb20","#e85305","#fff79f","#fa7b12"],["Sandy Beach","#002f2f","#046380","#a7a37e","#efecca","#e6e2af"],["Watermelon","#c9d787","#7d8a2e","#ff8598","#ffe4e1","#ffc0a9"],["Cheesecake","#f6e497","#bd8d46","#4c1b1b","#fcfae1","#b9121b"],["Granny Smith Apple","#cde855","#a7c520","#493f0b","#f5f6d4","#85db18"],["Ocean Sunset","#405952","#f54f29","#9c9b7a","#fff2df","#ff974f"],["Purple Dress","#31152b","#723147","#cc4452","#f9e4ad","#e6b098"],["Garden Pool","#7fc6bc","#4bb5c1","#96ca2d","#edf7f2","#b5e655"],["Marie Antoinette","#ffb6b8","#c44c51","#5f8ca3","#ffefb6","#a2b5bf"],["Herbs and Spice","#5a1f00","#d1570d","#477725","#fde792","#a9cc66"],["Robotron","#fe9c03","#969514","#4ea9a0","#ffffff","#fcde8e"],["Down to Earth","#3b563d","#706241","#423428","#fffbd4","#c7c282"],["Modern Office","#4f6373","#293845","#8f8164","#efeed1","#d9d7ac"],["Scandinavian Woodworks","#831111","#5b8261","#465d5f","#FFFFFF","#d8a554"],["Amber Waves","#91b166","#dd5200","#e49400","#efe38a","#ffc62d"],["Banana Flambe","#e2ad3b","#bf5c00","#901811","#efca68","#e2ad3b"],["Corn Roast","#789898","#3c6573","#b14d1c","#f9ebae","#e8b54d"],["Autumn an Empire","#822d1f","#4a6851","#97562e","#ffe382","#97995b"],["Sailboat","#243647","#c79d32","#7f0f0f","#f7f7ca","#547373"],["Candid","#3a301c","#3f7696","#808355","#eadea1","#cfc381"],["Baked","#853c1b","#4a2211","#cc9f58","#ffebb8","#d69057"],["Halow Summer","#901808","#444444","#d3d4aa","#fcfae6","#e7e9d1"],["Range Rover","#718a3d","#18212e","#444d45","#fffdb5","#aeafa4"],["Cupacabra","#d2e78f","#5e976e","#4e3e34","#fce99f","#dfcb7d"],["Artificial Growth","#cf6123","#c92c2c","#5c483a","#f1e9bb","#f3c363"],["Tree Viper","#a54a4d","#b2d45b","#ee7253","#faee96","#f2ce5a"],["Happy Holidays","#4e0805","#9e0522","#447622","#fff4d4","#b8c591"],["Christmas Wishes","#70822c","#851616","#447622","#ffe4b5","#d6ba74"],["Old Man Winter","#1c2742","#3c91c7","#5a9abe","#e0eefb","#95c5de"]],
				patterns: names,
				messages: [], // will include _nodeBox.jade, so it is necessary
				node: getNodeForRead(load.fetch(req, 'node'))
			});
		}
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
