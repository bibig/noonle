exports.root = loadRoot;
exports.nodeWithPages = loadNodeWithPages;
exports.newNode = loadNewNode;
exports.nodeOrNewNode = loadNodeOrNewNode;
exports.node = loadNode;
exports.page = loadPage;
exports.newPage = loadNewPage;
exports.fetch = fetch;
exports.rootId = getRootId;
exports.belongToRoot = belongToRoot;
// exports.fetchNode = fetchNode;
// exports.fetchPage = fetchPage;
// exports.fetchRoot = fetchRoot;

// exist middleware
var Node = require('../models/node');
var Page = require('../models/page');
var rootMaxLength = 5;

function getRootId () {
	return 'hello';
}


function loadData (req, key, value) {
	if ( ! req.db ) {
		req.db = {};
	}
	// console.log('ready to load ' + key);
	// console.log(value);
	
	req.db[key] = value;
}

function fetch (req, name, key) {
	if (!req.db) return false;
	if (!req.db[name]) return false;
	return key ? req.db[name][key] : req.db[name];
}


function loadNodeWithPages (req, res, next, nid) {
	// console.log('ready to load node with pages:' + nid);
	Node.readWithPages(nid, function (err, node) {
		if (err) {
			// console.log('load node failed!');
			next(err);
		} else if (!node) {
			res.redirect('/create/' + nid);
		} else {
			loadData(req, 'node', node);
			return next();
		}
	});
	
};

function getNewNode (id) {
	return {id: id, title: id, content: '', adminPassword: ''};
}

function loadNodeOrNewNode (req, res, next, nid) {
	// console.log('loadNodeOrNewNode:' + nid);
	Node.readonly(nid, function (err, node) {
		if (err) {
			next(err);
		} else if (!node) { 
			loadData(req, 'node', getNewNode(nid));
			next();
		} else {
			loadData(req, 'node', node);
			return next();
		}
	});
}

function belongToRoot (id) {
	return id.length <= rootMaxLength;
}

function loadRoot (req, res, next, nid) {
	if (belongToRoot(nid)) {
		Node.readonly(getRootId(), function (err, node) {
			if (err) {
				next(err);
			} else if (!node) {
				res.redirect('/' + nid);
			} else {
				loadData(req, 'root', {password: node.adminPassword});
				next();
			}
		});
	} else {
		next();
	}
}

function loadNewNode (req, res, next, nid) {
	// console.log('load new node');
	Node.exists(nid, function (err, yesOrNo) {
		if (err) {
			next(err);
		} else if (!yesOrNo){
			loadData(req, 'node', getNewNode(nid));
			return next();	
		} else {
			res.redirect('/' + nid);
		}
	});
	
}

function loadNode (req, res, next, nid) {
	
	Node.readonly(nid, function (err, node) {
		if (err) {
			next(err);
		} else if (!node) { 
			res.redirect('/create/' + nid);
		} else {
			loadData(req, 'node', node);
			return next();
		}
	});
	
};

function loadPage (req, res, next, pid) {
	var node = fetch(req, 'node');
	// console.log('load page:' + pid);
	Page.readonly(node._id, pid, function (err, page) {
		if (err) {
			next(err);
		} else if (!page) {
			res.redirect('/create/' + node.id + '/' + pid);
		} else {
			loadData(req, 'page', page);
			return next();
		}
	});
};

function loadNewPage (req, res, next, pid) {
	// console.log('load new page');
	var node = fetch(req, 'node'); 
	
	Page.exists(node._id, pid, function (err, yesOrNo) {
		if (err) {
			next(err);
		} else if (!yesOrNo){
			loadData(req, 'page', {id: pid, title: '', content: ''});
			return next();	
		} else {
			res.redirect('/' + node.id + '/' + pid);
		}
	});
	
}






