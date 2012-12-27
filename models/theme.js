exports.add = add;
exports.removeAll = removeAll; 
exports.findAll = findAll;
exports.read = read;


var db = require('./db')
  , Theme = db.Theme;
  
function add (data, callback) {
	var theme = new Theme(data);
	
	theme.save( function (err) {
		if (err) {
			callback(err);	
		} else {
			callback();
		}
	});
};

function removeAll (callback) {
	Theme.remove({ id: { $gt: 0 }}).exec(callback);
}

function findAll (callback) {
	Theme
	  .find()
	  .limit(100)
	  .sort('id')
	  .exec(callback);
}

function read (id, callback) {
	Theme.findOne({ id: id }, function (err, theme) {
		if (err) {
			callback(err);
		} else {
			callback(null, theme);
		}
	});
}