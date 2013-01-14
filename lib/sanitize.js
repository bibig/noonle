exports.safe = safe;

var sanitize = require('validator').sanitize;

function safe (req, res, next) {
	if (!req.body) return next();
	if (!req.body.entity) return next();
	
	var inputs = ['title', 'content'];
	inputs.forEach(function (input) {
		req.body.entity[input] = sanitize(req.body.entity[input]).xss();
	});
	
	next();
}