exports.nodeHit = nodeHit
exports.pageHit = pageHit

var load = require('./load');

function nodeHit (req, res, next) {
	// console.log('ready to increment node hit');
	var Node = require('../models/node');
	var node = load.fetch(req, 'node');
	if ( node ) {
		// console.log('find!');
		Node.hit(node, function (err) {
			if (err) {
				next(err);
			} else {
				// req.db.node.hit++;
				// console.log('hit! go to next');
				next();
			}
		});
	} else {
		// console.log('no node found! go to next');
		next();
	}
}

function pageHit (req, res, next) {
	var Page = require('../models/page');
	var page = load.fetch(req, 'page');
	
	if ( page ) {
		Page.hit(page, function (err) {
			if (err) {
				next(err);
			} else {
				// req.db.page.hit++;
				next();
			}
		});
	}
}

