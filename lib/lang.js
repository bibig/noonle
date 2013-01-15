exports.autoset = setLang;

var i18n = require("i18n");

function setLang (req, res, next) {
	// console.log(req.locales[0].split('-')[0]);
    i18n.setLocale(req.locales[0].split('-')[0]);
    next();
}