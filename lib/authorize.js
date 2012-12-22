// exports.check = authorize;
exports.isAdmin = isAdmin;
exports.checkAdmin = checkAdmin;
exports.checkRead = checkRead;
// exports.submit = submit;
exports.submitForAdmin = submitForAdmin;
exports.submitForRead = submitForRead;

exports.saveAdminCookie = saveAdminCookie;
exports.saveReadCookie = saveReadCookie;
exports.clearAdminCookie = clearAdminCookie;
exports.clearReadCookie = clearReadCookie;

var Node = require('../models/node')
  , form = require('./form')
  , load = require('./load')
  , cookieOptions = {
		httpOnly:true, 
		maxAge: 1000 * 3600 * 24 * 365
		// signed: true
	};

/*
function authorize (req, res, next) {
	checkRead(req, res, next);
	checkAdmin(req, res, next);
}
*/

function checkAdmin (req, res, next) {
	// console.log('ready to checkAdmin:' + req.db.node.id);
	var password;
	var nid = load.fetch(req, 'node', 'id');
	var cookiePassword = getAdminPasswordCookieValue(req, nid);
	
	
	if (load.fetch(req, 'root')) {
		password = load.fetch(req, 'root', 'password');
	} else {
		password = load.fetch(req, 'node', 'adminPassword');
	}
	
	console.log('password:' + password);
	if ( password == ''  || encrypt(password) == cookiePassword) {
		return next();
	} else {
		form.adminAuthorize(req, res);
	}
}

function getAdminPasswordCookieName(id) {
	return load.belongToRoot(id) ? load.rootId() : id;
}

function getAdminPasswordCookieValue (req, id) {
	return req.cookies['w_' + getAdminPasswordCookieName(id)];
}

// weak check, only check related cookie whether exist
function isAdmin (req) {
	var node = load.fetch(req, 'node');
	return node.adminPassword == '' || getAdminPasswordCookieValue(req, node.id);
}


function checkRead (req, res, next) {
	var node = load.fetch(req, 'node');
	var password = node.readPassword;
	// console.log('ready to checkRead:' + node.id);
	// console.log(encrypt(node.readPassword));
	// console.log(req.cookies['r_' + node.id]);
	if (password == '' || encrypt(password) == req.cookies['r_' + node.id]) {
		// console.log('readable');
		return next();
	} else {
		// console.log('cannot read');
		form.readAuthorize(req, res);
	}
	
}

function submitForAdmin (req, res, next) {
	var node = load.fetch(req, 'node');
	var from = req.body.from;
	var password = req.body.password;
	var srcPassword = load.fetch(req, 'root', 'password') || node.adminPassword;
	
	if (!req.validator.pass()) {
		console.log('form validate failed!');
		return form.adminAuthorize(req, res, from, req.validator.mapErrors('password'));
	}
	
	if (password  == srcPassword) {
		console.log('authorize pass, ready to save to cookie');
		saveAdminCookie(res, node.id, password);
		console.log('redirect to ' + from);
		res.redirect(from);
	} else {
		console.log('authorize failed');
		form.adminAuthorize(req, res, from, '对不起，密码不符');
	}
}

function submitForRead (req, res, next) {
	var node = load.fetch(req, 'node');
	var from = req.body.from;
	var password = req.body.password;
	
	if (!req.validator.pass()) {
		return form.readAuthorize(req, res, from, req.validator.mapErrors('password'));
	}
	
	if (password  == node['readPassword']) {
		// console.log('authorize pass, ready to save to cookie');
		saveReadCookie(res, node.id, password);
		// console.log('redirect to ' + from);
		res.redirect(from);
	} else {
		// console.log('authorize failed');
		form.readAuthorize(req, res, from, '对不起，密码不符');
	}
	
}


function encrypt (pass) {
	return require('crypto').createHmac('md5', 'salt.sugar.salt').update(pass).digest('hex');
}

function saveAdminCookie (res, id, pass) {
	console.log('ready to save admin cookie');
	res.cookie('w_' + getAdminPasswordCookieName(id), encrypt(pass), cookieOptions); 
}

function saveReadCookie (res, id, pass) {
	console.log('ready to save read cookie');
	res.cookie('r_' + id, encrypt(pass), cookieOptions); 
}

function clearAdminCookie (res, id) {
	res.clearCookie('w_' + id);
}

function clearReadCookie (res, id) {
	res.clearCookie('r_' + id);
}