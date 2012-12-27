exports.create = create;
exports.saveContent = saveContent;
exports.saveSettings = saveSettings;
exports.saveTheme = saveTheme;
exports.read = read;
exports.readonly = readonly;
exports.readWithPages = readWithPages;
exports.hit = hit;
exports.remove = remove;
exports.exists = exists;

var Yi = require('../lib/yi')
  , db = require('./db')
  , Node = db.Node
  , Page = db.Page;

function create (data, callback) {
	var node = new Node({ 
		id: data.id,
		title: data.title,
		content: data.content, 
		size: data.content.length,
		format: data.format
	});
	
	node.save(function (err, node) {
		if (err) {
			// console.log('save node failed!');
			callback(err);
		} else {
			// console.log('save node successfully!');
			callback(null, node);
		}
	});
	
};

function saveContent (id, data, callback) {
	Node.update({ id: id }, {
			title: data.title,
			content: data.content,
			format: data.format,
			size: data.content.length,
			modified:Date.now()
		}, callback
	);
}

function saveSettings (_id, data, callback) {
	Node.update({ _id: _id }, {
			id: data.id,
			email: data.email,
			readPassword: data.readPassword,
			adminPassword: data.adminPassword,
			sort: data.sort
			// isFrozen: (data.isFrozen === 'on' ? true : false)
		}, callback
	);
}

function saveTheme (id, theme, callback) {
	Node.update({ id: id }, {
			backgroundColor: theme.backgroundColor,
			bgOfTitle: theme.bgOfTitle,
			fgOfTitle: theme.fgOfTitle,
			anchorInTitle: theme.anchorInTitle,
			bgOfContent: theme.bgOfContent,
			fgOfContent: theme.fgOfContent,
			anchorInContent: theme.anchorInContent,
			bgOfFoot: theme.bgOfFoot,
			fgOfFoot: theme.fgOfFoot,
			anchorInFoot: theme.anchorInFoot
		}, callback
	);
}

/*
 * @id node id
 * @isHit optional
 * @cb
 */
function read (id) {
	var isHit, callback;
	
	switch(arguments.length) {
		case 2:
			isHit = false;
			callback = arguments[1];
			break;
		case 3:
			isHit = arguments[1];
			callback = arguments[2];
			break;
		default:
			return;
	}
	
	Node
	.findOne({ id: id })
	.populate('_pages', 'id title')
	.exec(function (err, node) {
		if (err) {
			callback(err);
		} else if (!node) {
			db.node404(callback);
		} else {
			if (isHit) {
				node.hit++;
				node.save(function (err, node) {
					if (err) {
						callback(err);	
					} else {
						callback(null, node);
					}
				});
			} else {
				callback(null, node);
			}
		}
	});
	
};

function readonly (id, callback) {
	Node.findOne({ id: id }, function (err, node) {
		if (err) {
			callback(err);
		} else {
			callback(null, node);
		}
	});
}

function readWithPages (id, callback) {
	Node
	.findOne({ id: id })
	.populate('_pages', 'id title created')
	.exec(function (err, node) {
		if (err) {
			callback(err);
		} else {
			callback(null, node);
		}
	});
	
};

function hit (node) {
	Node.update({ _id: node._id }, { hit: node.hit + 1 });
}

function remove (id, callback) {
	// console.log('ready to remove node:' + id);
	Node.findOneAndRemove({id: id}, function (err, node) {
		if (err) {
			callback(err);
		} else if (!node) {
			db.node404(callback);
		} else {
			Page.where('_node', node._id).remove(function (err) {
				callback(err);
			});
		}
	});
	
};

function exists (id, callback) {
	// console.log('ready to remove node:' + id);
	Node.findOne({id: id}, function (err, node) {
		if (err) {
			callback(err);
		} else if (!node) {
			callback(null, false);
		} else {
			callback(null, true);
		}
	});
}

/*
// population is query item by item
exports.pages = function (node, callback) {
	Page
	.find({_node: node._id})
	.select('id title')
	.sort(node.sort == 0 ? { id: 1 } : { title: 1}),
	.limit(node.pageCount)
	.exec(function (err, pages) {
		if (err) {
			callback(err);
		} else if (!pages) {
			db.page404(callback);
		} else {
			callback(null, pages);
		}
	});
}
*/