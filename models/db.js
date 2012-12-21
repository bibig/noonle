
module.exports = function () {
	var mongoose = require('mongoose')
	  , conn = mongoose.createConnection('mongodb://localhost/jishi')
	  , NodeSchema = mongoose.Schema({
			id: String,
			title: String,
			content: String,
			email: { type: String, default: ''},
			readPassword: { type: String, default: ''},
			adminPassword: { type: String, default: ''},
			isFrozen: { type: Boolean, default: false }, 
			sort: { type: Number, default: 0 }, // pages sort way. 0: order by created , 1: order by page id, 2: order by page title
			style: { type: Number, default: 0 }, 
			background: { type: String, default: '' }, 
			hit: { type: Number, default: 0 },
			format: { type: Number, default: 0 },
			_pages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Page' }],
			pageCount: { type:Number, default: 0 },
			size: { type:Number, default: 0 },
			created: { type: Date, default: Date.now },
			modified: { type: Date, default: Date.now }
		})
	  , PageSchema = mongoose.Schema({
			id: String,
			title: String,
			content: String,
			style: { type: Number, default: 0 }, 
			background: { type: String, default: '' }, 
			// email: String,
			// password: String,
			// sn: Number, // serial number
			hit: { type:Number, default: 0 },
			format: { type:Number, default: 0 },
			size: { type:Number, default: 0 },
			_node: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
			created: { type: Date, default: Date.now },
			modified: { type: Date, default: Date.now }
		});
	
	return {
		conn: conn,
		Node: conn.model('Node', NodeSchema),
		Page: conn.model('Page', PageSchema),
		e404: function (callback) {
			var err = new Error('no data found');
			err.code = 'd404';
			callback(err);
		},
		node404: function (callback) {
			var err = new Error('no data found');
			err.code = 'node404';
			callback(err);
		},
		node403: function (callback, node) {
			var err = new Error('the node is frozen!');
			err.code = 'node403';
			callback(err, node);
		},
		page404: function (callback) {
			var err = new Error('no data found');
			err.code = 'page404';
			callback(err);
		},
	};
}();