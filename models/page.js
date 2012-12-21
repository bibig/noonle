exports.create = create;
exports.saveContent = saveContent;
exports.saveSettings = saveSettings;
exports.readonly = readonly;
exports.hit = hit;
exports.remove = remove;
exports.exists = exists;


var Yi = require('../lib/yi')
  , db = require('./db')
  , Node = db.Node
  , Page = db.Page;
  
function create (node, data, callback) {
	page = new Page({
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
};

function saveContent (data, callback) {
	Page.update({ _id: data._id }, {
			title: data.title,
			content: data.content,
			size: data.content.length,
			format: data.format,
			modified:Date.now()
		}, callback
	);
}

function saveSettings (data, callback) {
	Page.update({ _id: data._id }, { id: data.id }, callback);
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

function hit (page, callback) {
	page.hit++;
	page.save(function (err) {
		if (err) {
			callback(err);	
		} else {
			callback(null);
		}
	});
};

function remove (page, callback) {

	Node.findOne({'_id' : page._node },  function (err, node) {
		if (err) {
			callback(err);
		} else {
			node._pages.splice(node._pages.indexOf(page._id), 1);
			node.pageCount--;
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
	});

};

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
