module.exports = function () {
	var mongoose = require('mongoose')
	  , conn = mongoose.createConnection('mongodb://localhost/jishi')
	  , ThemeSchema = mongoose.Schema({
	  		id: Number,
	  		name: String,
	  		backgroundColor: { type: String, default: '' }, 
			backgroundImage: { type: String, default: '' }, 
			backgroundRepeat: { type: String, default: '' }, 
			backgroundPosition: { type: String, default: '' }, 
			backgroundAttachment: { type: String, default: '' },  // scroll, fixed
			
			bgOfTitle: { type: String, default: 'green' },
			fgOfTitle: { type: String, default: '#fff' },
			anchorInTitle: { type: String, default: '#fff' },
			
			bgOfContent: { type: String, default: '#fff' },
			fgOfContent: { type: String, default: '' },
			anchorInContent: { type: String, default: '' },
			
			bgOfFoot: { type: String, default: '' },
			fgOfFoot: { type: String, default: '' },
			anchorInFoot: { type: String, default: '' }
	  })
	  , NodeSchema = mongoose.Schema({
			id: String,
			title: String,
			content: String,
			email: { type: String, default: ''},
			readPassword: { type: String, default: ''},
			adminPassword: { type: String, default: ''},
			// isFrozen: { type: Boolean, default: false }, 
			sort: { type: Number, default: 0 }, // pages sort way. 0: order by created , 1: order by page id, 2: order by page title
			hit: { type: Number, default: 0 },
			format: { type: Number, default: 0 },
			_pages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Page' }],
			pageCount: { type:Number, default: 0 },
			size: { type:Number, default: 0 },
			css: { type: String, default: '' },
			/*
			backgroundColor: { type: String, default: '' }, 
			backgroundImage: { type: String, default: '' }, 
			backgroundRepeat: { type: String, default: '' }, 
			backgroundPosition: { type: String, default: '' }, 
			backgroundAttachment: { type: String, default: '' },  // scroll, fixed
			
			bgOfTitle: { type: String, default: 'green' },
			fgOfTitle: { type: String, default: '#fff' },
			anchorInTitle: { type: String, default: '#fff' },
			
			bgOfContent: { type: String, default: '#fff' },
			fgOfContent: { type: String, default: '#000' },
			anchorInContent: { type: String, default: 'blue' },
			
			bgOfFoot: { type: String, default: '#ccc' },
			fgOfFoot: { type: String, default: '#999' },
			anchorInFoot: { type: String, default: '#222' },
			
			extraCss: { type: String, default: '' }, 
			*/
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
		Theme: conn.model('Theme', ThemeSchema),
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
		/*node403: function (callback, node) {
			var err = new Error('the node is frozen!');
			err.code = 'node403';
			callback(err, node);
		},*/
		page404: function (callback) {
			var err = new Error('no data found');
			err.code = 'page404';
			callback(err);
		},
	};
}();