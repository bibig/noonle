exports.css = makeCss;


var load = require('./load');
var css = require('./cssFilter');
var whitelist = {
	'body': '*',
	'.paper': '*'
};

function makeCss (req) {
	var customizeCss = load.fetch(req, 'node', 'css');
	console.log('after filter');
	console.log(css.filter(customizeCss, whitelist, true));
	return customizeCss ? css.filter(customizeCss, whitelist, true) : '';
}


function getImageCssValue (v) {
	if (!v) { return null;}
	
	if (v.match(/\//i)) {
		return 'url(' +  v + ')';
	} else {
		return 'url(/asserts/images/patterns/' + v + ')';
	}
}

/*
function makeJson (req) {
	var node = load.fetch(req, 'node')
	  , current = {};
	['backgroundImage', 'backgroundRepeat', 'backgroundPosition', 'backgroundAttachment', 'backgroundColor', 'bgOfTitle', 'bgOfContent', 'bgOfFoot', 'fgOfTitle', 'fgOfContent', 'fgOfFoot', 'anchorInTitle', 'anchorInContent', 'anchorInFoot']
	.forEach(function (one) {
		current[one] = node[one];
	});
	
	return JSON.stringify(current);
	
}
*/

function cssBlock (key, value) {
	if (!value) return '';
	return key + '{' + value + '}';
}

function cssItem (key, value) {
	if (!value) return '';
	return key + ':' + value + ';';
}
