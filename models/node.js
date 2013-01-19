exports.create = create;
exports.saveContent = saveContent;
exports.saveSettings = saveSettings;
exports.saveThemeCss = saveThemeCss;
exports.saveExtraCss = saveExtraCss;
exports.read = read;
exports.readonly = readonly;
exports.readWithPages = readWithPages;
exports.hit = hit;
exports.remove = remove;
exports.exists = exists;
exports.count = count;
exports.all = all;

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
		format: data.format,
		themeCss: data.themeCss,
		safeCss: data.safeCss,
		created: Date.now()
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
	
}

function saveContent (_id, data, callback) {
	Node.update({ _id: _id }, {
			title: data.title,
			content: data.content,
			format: data.format,
			size: data.content.length,
			editCount: data.editCount,
			modified: data.modified
		}, callback
	);
}

function saveSettings (_id, data, callback) {
	Node.update({ _id: _id }, {
			id: data.id,
			email: data.email,
			readPassword: data.readPassword,
			readPasswordTip: data.readPasswordTip,
			adminPassword: data.adminPassword,
			adminPasswordTip: data.adminPasswordTip,
			sort: data.sort,
			sortDirection: data.sortDirection
			// isFrozen: (data.isFrozen === 'on' ? true : false)
		}, callback
	);
}

function saveThemeCss (_id, themeCss, safeCss, callback) {
	Node.update({ _id: _id }, {themeCss: themeCss, safeCss: safeCss}, callback);
}

function saveExtraCss (_id, extraCss, safeCss, callback) {
	Node.update({ _id: _id }, {extraCss: extraCss, safeCss: safeCss}, callback);
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
	
}

function readonly (id, callback) {
	Node.findOne({ id: id }, function (err, node) {
		if (err) {
			callback(err);
		} else {
			callback(null, node);
		}
	});
}

function readWithPages (id, callback, isDetailed) {
	var columns = isDetailed ? '' : 'id title created';
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
}

function hit (node) {
	// console.log('ready to hit node:' + node);
	Node.update({ _id: node._id }, { hit: (node.hit + 1) }, function (err, numberAffected, raw) {
		if (err) return console.error(err);
		// console.log('The number of updated documents was %d', numberAffected);
		// console.log('The raw response from Mongo was ', raw);
	});
}

function remove (node, callback) {
	// console.log('ready to remove node:' + id);
	var waste = new db.Wastebin({ 
		id: node.id,
		email: node.email,
		json: JSON.stringify(node),
		created: Date.now()
	});
	console.log(waste);
	waste.save(function (err) {
		if (err) {
			// console.log('move node into waste failed!');
			callback(err);
		} else {
			// console.log('nove node into waste successfully!');
			Page.where('_node', node._id).remove();
			Node.where('_id', node._id).remove();
			callback();
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

function count (callback) {
	Node.count({}, callback);
}

function all (callback, page, limit) {
	var query = Node.find();
	limit = limit || 50;
	
	query
		.select('id title pageCount adminPassword readPassword email size hit created modified')
		.sort('-modified')
		.skip((page-1) * limit)
		.limit(limit)
		.exec(callback);
}