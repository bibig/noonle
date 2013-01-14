exports.css = makeCss;

var whitelist = {
	'body': '*',
	'body#nav': false,
	'.paper': '*',
	'.paper-title': '*',
	'.paper-title.node-title': '*',
	'.node-title': '*',
	'.page-title': '*',
	'.paper-content': '*',
	'.paper-catalog': '*',
	'.paper-foot': '*'
};

function makeCss (str) {
	if (!str) return '';
	return require('./cssFilter').filter(str, whitelist, true);
}