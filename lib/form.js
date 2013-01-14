exports.node = renderNodeForm;
exports.page = renderPageForm;
exports.login = renderAdminAuthorizeFormInActive;
exports.adminAuthorize = renderAdminAuthorizeForm;
exports.readAuthorize = renderReadAuthorizeForm;
exports.rootAuthorize = renderRootAuthorizeForm;
exports.csrf = csrf;

var yi = require('./yi');
var load = require('./load');

function csrf(req, res, next) {
	res.locals.token = req.session._csrf;
	if (yi.isFunction(next)) {
		next();
	}
}

function getNodeFormData (req) {
	var route = req.route;
	switch (route.path) {
		case '/create/:_nid':
		case '/edit/:w_nid':
			if (route.method == 'get') {
				return load.fetch(req, 'node');
			} else {
				return req.body.entity;
			}
		case '/set/:w_nid':
		case '/css/:w_nid':
			if (route.method == 'get') {
				// console.log('getNodeFormData');
				// console.log(load.fetch(req, 'node'));
				return load.fetch(req, 'node');
			} else {
				return req.body.node;
			}
	}
	return null;
}

function getNodeFormName (req) {
	switch (req.route.path) {
		case '/create/:_nid':
			return 'desktop/forms/create_node';
		case '/edit/:w_nid':
			return 'desktop/forms/edit_node';
		case '/set/:w_nid':
			return 'desktop/forms/set_node';
		case '/css/:w_nid':
			return 'desktop/forms/css_node';
	}
}

function getFormErrors (req, isStack) {
	var empty = isStack ? null : {};
	if (req.route.method !== 'post') return empty;
	if (!req.validator) return empty;
	
	return req.validator.getErrorCount() ?  ( isStack ? req.validator.getErrors() : req.validator.mapErrors()) : empty;
}


function getNodeFormErrors (req) {
	var isStack = true;
	switch (req.route.path) {
		case '/set/:w_nid':
			isStack = false;
			break;
	}
	return getFormErrors(req, isStack);
}


function getNodeFormTitle (req) {
	var route = req.route;
	switch (route.path) {
		case '/create/:_nid':
			return __('create node');
		case '/edit/:w_nid':
			return __('edit node');
		case '/set/:w_nid':
			return __('node settings');
		case '/css/:w_nid':
			return __('add node css');
	}
	return null;
}

function renderNodeForm (req, res) {
	csrf(req, res);
	// console.log(req.flash('info'));
	res.render(getNodeFormName(req), {
		title: getNodeFormTitle(req),
		nid: load.fetch(req, 'node', 'id'),
		node: getNodeFormData(req),
		siteUrl: req.protocol + '//' + req.host + '/',
		errors: getNodeFormErrors(req)
	});
};

function getPageFormData (req) {
	var route = req.route;
	switch (route.path) {
		case '/create/:w_nid/:_pid':
		case '/edit/:w_nid/:pid':
			if (route.method == 'get') {
				return load.fetch(req, 'page');
			} else {
				return req.body.entity;
			}
		case '/set/:w_nid/:pid':
		case '/css/:w_nid/:pid':
			if (route.method == 'get') {
				return load.fetch(req, 'page');
			} else {
				return req.body.page;
			}
	}
	return null;
}

function getPageFormName (req) {
	switch (req.route.path) {
		case '/create/:w_nid/:_pid':
			return 'desktop/forms/create_page';
		case '/edit/:w_nid/:pid':
			return 'desktop/forms/edit_page';
		case '/set/:w_nid/:pid':
			return 'desktop/forms/set_page';
		case '/css/:w_nid/:pid':
			return 'desktop/forms/css_page';
	}
}


function getPageFormErrors (req) {
	var isStack = true;
	switch (req.route.path) {
		case '/set/:w_nid/:pid':
			isStack = false;
			break;
	}
	return getFormErrors(req, isStack);
}

function getPageFormTitle (req) {
	var route = req.route;
	switch (route.path) {
		case '/create/:w_nid/:_pid':
			return __('create page');
		case '/edit/:w_nid/:pid':
			return __('edit page');
		case '/set/:w_nid/:pid':
			return __('page settings');
	}
	return null;
}

function renderPageForm (req, res) {
	// console.log('render page form, errors is');
	// console.log(getPageFormErrors(req));
	var nid = load.fetch(req, 'node', 'id'); 
	csrf(req, res);
	res.render(getPageFormName(req), { 
		title: getPageFormTitle(req),
		nid: nid,
		pid: load.fetch(req, 'page', 'id'),
		node: load.fetch(req, 'node'),
		page: getPageFormData(req),
		nodeUrl: '/' + nid + '/',
		errors: getPageFormErrors(req)
	});
}

function renderAdminAuthorizeFormInActive (req, res) {
	// console.log('im in renderAdminAuthorizeFormInActive');
	var nid = load.fetch(req, 'node', 'id');
	csrf(req, res);
	res.render('desktop/forms/admin_authorize', {
		title: __('admin authorize'),
		id: nid,
		tip: load.fetch(req, 'node', 'adminPasswordTip'),
		from: '/' + nid,
		errors: null
	});
}

// passive mode
function renderAdminAuthorizeForm (req, res, from, errors) {
	// console.log('im in renderAdminAuthorizeForm');
	// console.log(errors || getFormErrors(req, true));
	csrf(req, res);
	res.render('desktop/forms/admin_authorize', {
		title: __('admin authorize'),
		id: load.fetch(req, 'node', 'id'),
		tip: load.fetch(req, 'node', 'adminPasswordTip'),
		from: from || req.path,
		errors: errors || getFormErrors(req, true)
	});
}

function renderRootAuthorizeForm (req, res, from, errors) {
	// console.log('im in renderRootAuthorizeForm');
	csrf(req, res);
	res.render('desktop/forms/root_authorize', {
		title: __('root authorize'),
		tip: null,
		from: from || req.path,
		errors: errors || getFormErrors(req, true)
	});
}

function renderReadAuthorizeForm (req, res, from, errors) {
	csrf(req, res);
	res.render('desktop/forms/read_authorize', {
		title: __('read authorize'),
		id: load.fetch(req, 'node', 'id'),
		tip: load.fetch(req, 'node', 'readPasswordTip'),
		from: from || req.path,
		errors: errors || getFormErrors(req, true)
	});
}