exports.node = renderNodeForm;
exports.page = renderPageForm;
exports.adminAuthorize = renderAdminAuthorizeForm;
exports.readAuthorize = renderReadAuthorizeForm;
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
			return 'forms/create_node';
		case '/edit/:w_nid':
			return 'forms/edit_node';
		case '/set/:w_nid':
			return 'forms/set_node';
	}
}

function getNodeFormErrors (req) {
	switch (req.route.method) {
		case 'get':
			return {};
		case 'post':
			return req.validator.mapErrors();
	}
	return null;
}

function getNodeFormTitle (req) {
	var route = req.route;
	switch (route.path) {
		case '/create/:_nid':
			return 'create node';
		case '/edit/:w_nid':
			return 'edit node';
		case '/set/:w_nid':
			return 'set node';
	}
	return null;
}

function renderNodeForm (req, res) {
	var errors = getNodeFormErrors(req);
	// console.log(errors);
	// console.log('noErorr:' + yi.isEmpty(errors));
	csrf(req, res);
	// console.log(req.flash('info'));
	res.render(getNodeFormName(req), {
		title: getNodeFormTitle(req),
		node: getNodeFormData(req),
		errors: errors,
		noError: yi.isEmpty(errors)
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
			return 'forms/create_page';
		case '/edit/:w_nid/:pid':
			return 'forms/edit_page';
		case '/set/:w_nid/:pid':
			return 'forms/set_page';
	}
}

function getPageFormErrors (req) {
	switch (req.route.method) {
		case 'get':
			return {};
		case 'post':
			return req.validator.mapErrors();
	}
	return null;
}

function getPageFormTitle (req) {
	var route = req.route;
	switch (route.path) {
		case '/create/:w_nid/:_pid':
			return 'create page';
		case '/edit/:w_nid/:pid':
			return 'edit page';
		case '/set/:w_nid/:pid':
			return 'set page';
	}
	return null;
}

function renderPageForm (req, res) {
	// console.log('render page form, errors is');
	// console.log(getPageFormErrors(req));
	var errors = getPageFormErrors(req);
	csrf(req, res);
	res.render(getPageFormName(req), { 
		title: getPageFormTitle(req),
		nid: load.fetch(req, 'node', 'id'),
		page: getPageFormData(req), 
		errors: errors,
		noError: yi.isEmpty(errors)
	});
}


function renderAdminAuthorizeForm (req, res, from , error) {
	csrf(req, res);
	res.render('forms/admin_authorize', {
		title: 'admin authorize',
		id: load.fetch(req, 'node', 'id'),
		from: from || req.path,
		error: error
	});
}

function renderReadAuthorizeForm (req, res, from, error) {
	csrf(req, res);
	res.render('forms/read_authorize', {
		title: 'read authorize',
		id: load.fetch(req, 'node', 'id'),
		from: from || req.path,
		error: error
	});
}