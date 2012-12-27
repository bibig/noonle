exports.nodeHit = nodeHit
exports.pageHit = pageHit

var load = require('./load');

function nodeHit (req, res, next) {
	// console.log('ready to increment node hit');
	var Node = require('../models/node');
	Node.hit(load.fetch(req, 'node'));
	next();
}

function pageHit (req, res, next) {
	var Page = require('../models/page');
	Page.hit(load.fetch(req, 'page'));
	next();
}

