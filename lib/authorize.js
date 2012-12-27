// exports.check = authorize;
exports.isAdmin = isAdmin;
exports.checkRoot = checkRoot;
exports.checkAdmin = checkAdmin;
exports.checkRead = checkRead;
// exports.submit = submit;
exports.submitForAdmin = submitForAdmin;
exports.submitForRead = submitForRead;
exports.submitForRoot = submitForRoot;

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
	};

function checkRoot (req, res, next) {
	if (isCookiePass(load.fetch(req, 'root', 'password'), getRootPasswordCookieValue(req))) {
		next();
	} else {
		form.adminAuthorize(req, res);
	}
}

/**
 *  check whether the visitor has admin authority 
 *  if does not, render form for authorizing.
 */
function checkAdmin (req, res, next) {
	// console.log('ready to checkAdmin:' + req.db.node.id);
	var password;
	var nid = load.fetch(req, 'node', 'id');
	var cookiePassword = getAdminPasswordCookieValue(req, nid);
	// console.log('now cookiePassword:' + cookiePassword);
	if (load.fetch(req, 'root')) {
		password = load.fetch(req, 'root', 'password');
	} else {
		password = load.fetch(req, 'node', 'adminPassword');
	}
	
	// console.log('password:' + password);
	if (isCookiePass(password, cookiePassword)) {
		return next();
	} else {
		form.rootAuthorize(req, res);
	}
}

function isCookiePass (realPassword, cookiePassword) {
	if (realPassword === '') return true; // not set password at all 
	if (encrypt(realPassword) === cookiePassword) return true; // matched
	return false;
}

/**
 * any root node id use the same cookie for admin password
 */
function getAdminPasswordCookieValue (req, id) {
	if (load.fetch(req, 'node', 'adminPassword') === '' && load.belongToRoot(id)) {
		return getRootPasswordCookieValue(req);
	} else {
		// console.log('cookie name:' + getSafeCookieName('w_' + id));
		return req.cookies[getSafeCookieName('w_' + id)];
	}
}

function getRootPasswordCookieValue (req) {
	return req.cookies[getSafeCookieName('w_' + load.rootId())];
}

/**
 * weak check, only check related cookie whether exist
 */
function isAdmin (req) {
	var node = load.fetch(req, 'node');
	return node.adminPassword === '' || getAdminPasswordCookieValue(req, node.id);
}

/**
 * check read authority
 */
function checkRead (req, res, next) {
	var node = load.fetch(req, 'node');
	var password = node.readPassword;
	// console.log('ready to checkRead:' + node.id);
	// console.log(encrypt(node.readPassword));
	// console.log(req.cookies['r_' + node.id]);
	if (isCookiePass(password, req.cookies[getSafeCookieName('r_' + node.id)])) {
		// console.log('readable');
		return next();
	} else {
		// console.log('cannot read');
		form.readAuthorize(req, res);
	}
	
}

function submitForRoot (req, res, next) {
	var from = req.body.from;
	var rootPassword = load.fetch(req, 'root', 'password');
	var password;
	
	if (!req.validator.pass()) {
		// console.log('form validate failed!');
		return form.rootAuthorize(req, res, from, req.validator.mapErrors('password'));
	}
	
	if (req.body.password === password) {
		// console.log('authorize pass, ready to save to cookie');
		saveRootCookie(res, password);
		// console.log('redirect to ' + from);
		res.redirect(from);
	} else {
		// console.log('authorize failed');
		form.rootAuthorize(req, res, from, '对不起，密码不符');
	}
}


function submitForAdmin (req, res, next) {
	var node = load.fetch(req, 'node');
	var from = req.body.from;
	var rootPassword = load.fetch(req, 'root', 'password');
	var password;
	var isRoot = false;
	
	if (rootPassword === false) {
		password = node.adminPassword;
	} else {
		password = rootPassword;
		isRoot = true;
	}
	
	if (!req.validator.pass()) {
		// console.log('form validate failed!');
		return form.adminAuthorize(req, res, from, req.validator.mapErrors('password'));
	}
	
	if (req.body.password === password) {
		// console.log('authorize pass, ready to save to cookie');
		saveAdminCookie(res, node.id, password, isRoot);
		// console.log('redirect to ' + from);
		res.redirect(from);
	} else {
		// console.log('authorize failed');
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
	
	if (password  === node['readPassword']) {
		// console.log('authorize pass, ready to save to cookie');
		saveReadCookie(res, node.id, password);
		// console.log('redirect to ' + from);
		res.redirect(from);
	} else {
		// console.log('authorize failed');
		form.readAuthorize(req, res, from, '对不起，密码不符');
	}
	
}

function getSafeCookieName (id) {
	return require('crypto').createHash('md5').update(id).digest('hex');
}

function encrypt (pass) {
	return require('crypto').createHmac('md5', 'salt.sugar.salt').update(pass).digest('hex');
}

function saveCookie (res, id, pass) {
	res.cookie(getSafeCookieName(id), encrypt(pass), cookieOptions);
}

function saveRootCookie (res, pass) {
	// console.log('ready to save root cookie');
	saveCookie(res, 'w_' + load.rootId(), pass);
}

function saveAdminCookie (res, id, pass, isRoot) {
	if (isRoot) {
		saveRootCookie(res, pass);
	} else {
		saveCookie(res, 'w_' + id, pass);
	}
}

function saveReadCookie (res, id, pass) {
	// console.log('ready to save read cookie');
	saveCookie(res, 'r_' + id, pass);
}

function clearAdminCookie (res, id) {
	res.clearCookie(getSafeCookieName('w_' + id));
}

function clearReadCookie (res, id) {
	res.clearCookie(getSafeCookieName('r_' + id));
}