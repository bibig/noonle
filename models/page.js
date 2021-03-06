exports.create = create;
exports.saveContent = saveContent;
exports.saveSettings = saveSettings;
exports.readonly = readonly;
exports.hit = hit;
exports.remove = remove;
exports.exists = exists;
exports.saveExtraCss = saveExtraCss;
exports.count = count;

var Yi = require('../lib/yi')
  , db = require('./db')
  , Node = db.Node
  , Page = db.Page;
  
function create (node, data, callback) {
	var page = new Page({
		id: data.id,
		title: data.title,
		content: data.content,
		size: data.content.length, 
		format: data.format,
		_node: node._id
	});
	
	page.save( function (err) {
		if (err) {
			callback(err);	
		} else {
			node.pageCount++;
			node.editCount++;
			node.modified = Date.now();
			node._pages.push(page._id);
			node.save(function (err) {
				if (err) {
					callback(err);
				} else {
					callback(null, page);
				}
			});
		}
	});
}

function saveContent (_id, data, callback) {
	Page.update({ _id: _id }, {
			title: data.title,
			content: data.content,
			size: data.content.length,
			format: data.format,
			editCount: data.editCount,
			modified: data.modified
		}, callback
	);
}

function saveSettings (_id, data, callback) {
	Page.update({ _id: _id }, { id: data.id }, callback);
}


/*
exports.read =  function (nid, pid, callback, _isHit) {
	var isHit = _isHit === undefined ?  true : _isHit;
	Page
	.findOne({ id: pid})
	.populate('_node', 'id title readPassword adminPassword')
	.exec(function (err, page) {
		if (err) {
			callback(err);
		} else if (!page) { // cannot find page
			Node.findOne( { id: nid}, function (err, node) {
				if (err) {
					callback(err);
				} else {
					if (!node) { // cannot find node
						db.node404(callback);
					} else {
						if ( node.isFrozen ) {
							db.node403(callback);
						} else {
							db.page404(callback);
						}
					}
				}
			});
			
		} else {
			if (isHit) {
				page.hit++;
				page.save( function (err, page) {
					if (err) {
						callback(err);	
					} else {
						callback(null, page);
					}
				});
			} else {
				callback(null, page);
			}
		}
	
	});
	
};
*/

function readonly (_node, id, callback) {
	Page.findOne({ _node: _node, id: id }, function (err, page) {
		if (err) {
			callback(err);
		} else {
			callback(null, page);
		}
	});
}

function hit (page) {
	// console.log('ready to hit page:' + page.hit);
	Page.update({ _id: page._id }, { hit: page.hit + 1 }, function (err, numberAffected, raw) {
		if (err) return console.error(err);
		// console.log('The number of updated documents was %d', numberAffected);
		// console.log('The raw response from Mongo was ', raw);
	});
}

function remove (node,  page, callback) {
	node._pages.splice(node._pages.indexOf(page._id), 1);
	node.pageCount--;
	node.editCount++;
	node.modified = Date.now();
	node.save(function(err) {
		if (err) {
			callback(err);
		} else {
			page.remove(function(err) {
				callback(err);
			});
		}
	});
}

function exists (_node, id, callback) {
	Page.findOne({_node: _node, id: id}, function (err, page) {
		if (err) {
			callback(err);
		} else if (!page) {
			callback(null, false);
		} else {
			callback(null, true);
		}
	});
}

function saveExtraCss (_id, extraCss, safeCss, callback) {
	Page.update({ _id: _id }, {extraCss: extraCss, safeCss: safeCss}, callback);
}

function count (callback) {
	Page.count({}, callback);
}
