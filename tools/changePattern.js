var fs = require('fs');
var path = '../public/images/patterns';

function getPatterns (callback) {
	fs.readdir(path, function (err, names) {
		if (err) {
			// callback(err);
		} else {
			// console.log('find patterns');
			names.splice(0, 1)
			// console.log(names);
			names.forEach(callback);
		}
	});
}

function changeName (file) {
	var name = file.split('_');
	var order;
	
	switch (name[0]) {
		case 'd':
			order = '50';
			break;
		case 'f':
			order = '40';
			break;
		case 't':
			order = '10';
			break;
		case 'g':
			order = '20';
			break;
		case 'w':
			order = '30';
			break;
		case 'z':
			order = '60';
			break;
		default:
			order = name[0];
			break;
	}
	console.log(file + ' => ' + order + '_' + name[1]);
	fs.rename(path + '/' + file, path + '/' + order + '_' + name[1]);
}

getPatterns(changeName);